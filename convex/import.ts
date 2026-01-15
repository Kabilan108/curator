import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation } from "./_generated/server";
import { requireAuthUserId } from "./lib/auth";
import {
  GLICKO_DEFAULT_RATING,
  GLICKO_DEFAULT_RD,
  GLICKO_DEFAULT_VOLATILITY,
} from "./lib/constants";
import { malScoreToRating, malStatusToWatchStatus } from "./lib/malUtils";
import { updateStatsOnLibraryChange } from "./stats";

export const importMalItem = mutation({
  args: {
    malId: v.number(),
    anilistId: v.optional(v.number()),
    type: v.union(v.literal("ANIME"), v.literal("MANGA")),
    title: v.string(),
    titleEnglish: v.optional(v.string()),
    coverImage: v.string(),
    genres: v.array(v.string()),
    malScore: v.optional(v.number()),
    malStatus: v.string(),
    episodes: v.optional(v.number()),
    chapters: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUserId(ctx);

    const existingByMal = await ctx.db
      .query("mediaItems")
      .withIndex("by_mal_id", (q) => q.eq("malId", args.malId))
      .first();

    let mediaItemId: Id<"mediaItems">;

    if (existingByMal) {
      mediaItemId = existingByMal._id;
    } else {
      mediaItemId = await ctx.db.insert("mediaItems", {
        anilistId: args.anilistId ?? args.malId * -1,
        malId: args.malId,
        type: args.type,
        title: args.title,
        titleEnglish: args.titleEnglish,
        coverImage: args.coverImage,
        genres: args.genres,
        tags: [],
        episodes: args.episodes,
        chapters: args.chapters,
      });
    }

    const existingInLibrary = await ctx.db
      .query("userLibrary")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("mediaItemId"), mediaItemId))
      .first();

    if (existingInLibrary) {
      return { skipped: true, mediaItemId };
    }

    const now = Date.now();
    const rating = malScoreToRating(args.malScore ?? null);
    const watchStatus = malStatusToWatchStatus(args.malStatus);

    await ctx.db.insert("userLibrary", {
      userId,
      mediaItemId,
      mediaTitle: args.titleEnglish ?? args.title,
      mediaCoverImage: args.coverImage,
      mediaBannerImage: undefined,
      mediaType: args.type,
      mediaGenres: args.genres,
      rating,
      rd: GLICKO_DEFAULT_RD,
      volatility: GLICKO_DEFAULT_VOLATILITY,
      comparisonCount: 0,
      totalWins: 0,
      totalLosses: 0,
      totalTies: 0,
      customTags: [],
      watchStatus,
      addedAt: now,
      updatedAt: now,
    });

    await updateStatsOnLibraryChange(
      ctx,
      userId,
      args.type,
      GLICKO_DEFAULT_RD,
      "add",
    );

    return { skipped: false, mediaItemId, rating };
  },
});

export const getImportStats = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuthUserId(ctx);

    const libraryItems = await ctx.db
      .query("userLibrary")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const mediaItems = await ctx.db.query("mediaItems").collect();

    return {
      totalLibraryItems: libraryItems.length,
      totalMediaItems: mediaItems.length,
    };
  },
});

export const clearAllData = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuthUserId(ctx);

    const comparisons = await ctx.db
      .query("comparisons")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const comparison of comparisons) {
      await ctx.db.delete(comparison._id);
    }

    const comparisonPairs = await ctx.db
      .query("comparisonPairs")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const pair of comparisonPairs) {
      await ctx.db.delete(pair._id);
    }

    const libraryItems = await ctx.db
      .query("userLibrary")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const item of libraryItems) {
      await ctx.db.delete(item._id);
    }

    const stats = await ctx.db
      .query("userStats")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (stats) {
      await ctx.db.patch(stats._id, {
        totalComparisons: 0,
        tieCount: 0,
        animeCount: 0,
        mangaCount: 0,
        rankedAnimeCount: 0,
        rankedMangaCount: 0,
        currentStreak: 0,
        last7Days: [],
        updatedAt: Date.now(),
      });
    }

    return {
      deletedComparisons: comparisons.length,
      deletedComparisonPairs: comparisonPairs.length,
      deletedLibraryItems: libraryItems.length,
    };
  },
});

export const resetRankings = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuthUserId(ctx);

    const comparisons = await ctx.db
      .query("comparisons")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const comparison of comparisons) {
      await ctx.db.delete(comparison._id);
    }

    const comparisonPairs = await ctx.db
      .query("comparisonPairs")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const pair of comparisonPairs) {
      await ctx.db.delete(pair._id);
    }

    const libraryItems = await ctx.db
      .query("userLibrary")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const item of libraryItems) {
      await ctx.db.patch(item._id, {
        rating: GLICKO_DEFAULT_RATING,
        rd: GLICKO_DEFAULT_RD,
        volatility: GLICKO_DEFAULT_VOLATILITY,
        comparisonCount: 0,
        totalWins: 0,
        totalLosses: 0,
        totalTies: 0,
        lastComparedAt: undefined,
        nextComparisonDue: undefined,
        needsReranking: undefined,
      });
    }

    const stats = await ctx.db
      .query("userStats")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (stats) {
      await ctx.db.patch(stats._id, {
        totalComparisons: 0,
        tieCount: 0,
        rankedAnimeCount: 0,
        rankedMangaCount: 0,
        currentStreak: 0,
        longestStreak: 0,
        last7Days: [],
        updatedAt: Date.now(),
      });
    }

    return {
      clearedComparisons: comparisons.length,
      clearedPairs: comparisonPairs.length,
      resetItems: libraryItems.length,
    };
  },
});

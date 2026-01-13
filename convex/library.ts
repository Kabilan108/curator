import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId, requireAuthUserId } from "./lib/auth";
import {
  GLICKO_DEFAULT_RATING,
  GLICKO_DEFAULT_RD,
  GLICKO_DEFAULT_VOLATILITY,
} from "./lib/constants";
import { updateStatsOnLibraryChange } from "./stats";

export const getAnilistIds = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const libraryItems = await ctx.db
      .query("userLibrary")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const anilistIds = await Promise.all(
      libraryItems.map(async (item) => {
        const media = await ctx.db.get(item.mediaItemId);
        return media?.anilistId ?? null;
      }),
    );

    return anilistIds.filter((id): id is number => id !== null);
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const libraryItems = await ctx.db
      .query("userLibrary")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return libraryItems;
  },
});

export const getByRating = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const libraryItems = await ctx.db
      .query("userLibrary")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return libraryItems.sort((a, b) => b.rating - a.rating);
  },
});

export const getByRatingPaginated = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { page: [], isDone: true, continueCursor: "" };
    }

    const results = await ctx.db
      .query("userLibrary")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .paginate(args.paginationOpts);

    return results;
  },
});

export const getById = query({
  args: { id: v.id("userLibrary") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const item = await ctx.db.get(args.id);
    if (!item || item.userId !== userId) return null;

    return item;
  },
});

export const getByIdWithDetails = query({
  args: { id: v.id("userLibrary") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const libraryItem = await ctx.db.get(args.id);
    if (!libraryItem || libraryItem.userId !== userId) return null;

    const mediaItem = await ctx.db.get(libraryItem.mediaItemId);
    if (!mediaItem) return null;

    return {
      ...libraryItem,
      media: mediaItem,
    };
  },
});

export const addToLibrary = mutation({
  args: {
    mediaItemId: v.id("mediaItems"),
    watchStatus: v.union(
      v.literal("COMPLETED"),
      v.literal("WATCHING"),
      v.literal("PLAN_TO_WATCH"),
      v.literal("DROPPED"),
      v.literal("ON_HOLD"),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUserId(ctx);

    const existing = await ctx.db
      .query("userLibrary")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("mediaItemId"), args.mediaItemId))
      .first();

    if (existing) {
      throw new Error("Item already in library");
    }

    const media = await ctx.db.get(args.mediaItemId);
    if (!media) {
      throw new Error("Media item not found");
    }

    const now = Date.now();
    const id = await ctx.db.insert("userLibrary", {
      userId,
      mediaItemId: args.mediaItemId,
      mediaTitle: media.titleEnglish || media.title,
      mediaCoverImage: media.coverImage,
      mediaBannerImage: media.bannerImage,
      mediaType: media.type,
      mediaGenres: media.genres,
      rating: GLICKO_DEFAULT_RATING,
      rd: GLICKO_DEFAULT_RD,
      volatility: GLICKO_DEFAULT_VOLATILITY,
      comparisonCount: 0,
      totalWins: 0,
      totalLosses: 0,
      totalTies: 0,
      customTags: [],
      watchStatus: args.watchStatus,
      addedAt: now,
      updatedAt: now,
    });

    await updateStatsOnLibraryChange(ctx, userId, media.type, GLICKO_DEFAULT_RD, "add");

    return id;
  },
});

export const removeFromLibrary = mutation({
  args: { id: v.id("userLibrary") },
  handler: async (ctx, args) => {
    const userId = await requireAuthUserId(ctx);

    const item = await ctx.db.get(args.id);
    if (!item || item.userId !== userId) {
      throw new Error("Item not found or not authorized");
    }

    await updateStatsOnLibraryChange(ctx, userId, item.mediaType, item.rd, "remove");
    await ctx.db.delete(args.id);
  },
});

export const updateLibraryItem = mutation({
  args: {
    id: v.id("userLibrary"),
    watchStatus: v.optional(
      v.union(
        v.literal("COMPLETED"),
        v.literal("WATCHING"),
        v.literal("PLAN_TO_WATCH"),
        v.literal("DROPPED"),
        v.literal("ON_HOLD"),
      ),
    ),
    userNotes: v.optional(v.string()),
    customTags: v.optional(v.array(v.string())),
    customTitle: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthUserId(ctx);

    const { id, watchStatus, ...otherUpdates } = args;
    const item = await ctx.db.get(id);

    if (!item || item.userId !== userId) {
      throw new Error("Item not found or not authorized");
    }

    const updates: Record<string, unknown> = {
      ...otherUpdates,
      updatedAt: Date.now(),
    };

    if (watchStatus !== undefined) {
      updates.watchStatus = watchStatus;

      if (watchStatus === "COMPLETED" && item?.watchStatus !== "COMPLETED") {
        updates.needsReranking = true;
      }
    }

    await ctx.db.patch(id, updates);
  },
});

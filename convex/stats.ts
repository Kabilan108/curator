import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import { getAuthUserId, requireAuthUserId } from "./lib/auth";
import { DAYS_MS, RD_CONFIDENCE_THRESHOLD } from "./lib/constants";

function getMidnight(timestamp: number): number {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

async function getStatsForUser(ctx: QueryCtx | MutationCtx, userId: string) {
  return await ctx.db
    .query("userStats")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();
}

export const getAggregatedStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return {
        totalComparisons: 0,
        todayComparisons: 0,
        streak: 0,
        longestStreak: 0,
        streakDays: [],
        animeCount: 0,
        mangaCount: 0,
        totalItems: 0,
        last7Days: [],
        tieCount: 0,
        rankedAnimeCount: 0,
        rankedMangaCount: 0,
      };
    }

    const stats = await getStatsForUser(ctx, userId);

    const today = getMidnight(Date.now());
    const todayEntry = stats?.last7Days.find((d) => d.date === today);
    const todayComparisons = todayEntry?.count ?? 0;

    const last7Days: { day: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today - i * DAYS_MS);
      const dayStart = getMidnight(date.getTime());
      const entry = stats?.last7Days.find((d) => d.date === dayStart);
      const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
      last7Days.push({ day: dayName, count: entry?.count ?? 0 });
    }

    const animeCount = stats?.animeCount ?? 0;
    const mangaCount = stats?.mangaCount ?? 0;

    return {
      totalComparisons: stats?.totalComparisons ?? 0,
      todayComparisons,
      streak: stats?.currentStreak ?? 0,
      longestStreak: stats?.longestStreak ?? 0,
      streakDays: [],
      animeCount,
      mangaCount,
      totalItems: animeCount + mangaCount,
      last7Days,
      tieCount: stats?.tieCount ?? 0,
      rankedAnimeCount: stats?.rankedAnimeCount ?? 0,
      rankedMangaCount: stats?.rankedMangaCount ?? 0,
    };
  },
});

export const getOrInitializeStats = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuthUserId(ctx);

    const existing = await getStatsForUser(ctx, userId);
    if (existing) {
      return existing;
    }

    const now = Date.now();
    const id = await ctx.db.insert("userStats", {
      userId,
      totalComparisons: 0,
      tieCount: 0,
      animeCount: 0,
      mangaCount: 0,
      rankedAnimeCount: 0,
      rankedMangaCount: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastComparisonDate: undefined,
      last7Days: [],
      updatedAt: now,
    });

    return await ctx.db.get(id);
  },
});

export async function updateStatsAfterComparison(
  ctx: MutationCtx,
  userId: string,
  isTie: boolean,
) {
  const now = Date.now();
  const today = getMidnight(now);

  const stats = await getStatsForUser(ctx, userId);

  if (!stats) {
    await ctx.db.insert("userStats", {
      userId,
      totalComparisons: 1,
      tieCount: isTie ? 1 : 0,
      animeCount: 0,
      mangaCount: 0,
      rankedAnimeCount: 0,
      rankedMangaCount: 0,
      currentStreak: 1,
      longestStreak: 1,
      lastComparisonDate: today,
      last7Days: [{ date: today, count: 1 }],
      updatedAt: now,
    });
    return;
  }

  let newStreak = stats.currentStreak;
  let newLongestStreak = stats.longestStreak;

  if (stats.lastComparisonDate === today) {
    // Same day, streak unchanged
  } else if (stats.lastComparisonDate === today - DAYS_MS) {
    newStreak = stats.currentStreak + 1;
    newLongestStreak = Math.max(newLongestStreak, newStreak);
  } else if (stats.lastComparisonDate === undefined) {
    newStreak = 1;
    newLongestStreak = Math.max(newLongestStreak, 1);
  } else if (stats.lastComparisonDate < today - DAYS_MS) {
    newStreak = 1;
  }

  let newLast7Days = [...stats.last7Days];
  const todayIndex = newLast7Days.findIndex((d) => d.date === today);

  if (todayIndex >= 0) {
    newLast7Days[todayIndex] = {
      ...newLast7Days[todayIndex],
      count: newLast7Days[todayIndex].count + 1,
    };
  } else {
    newLast7Days.push({ date: today, count: 1 });
  }

  const sevenDaysAgo = today - 7 * DAYS_MS;
  newLast7Days = newLast7Days.filter((d) => d.date >= sevenDaysAgo);
  newLast7Days.sort((a, b) => a.date - b.date);

  await ctx.db.patch(stats._id, {
    totalComparisons: stats.totalComparisons + 1,
    tieCount: isTie ? stats.tieCount + 1 : stats.tieCount,
    currentStreak: newStreak,
    longestStreak: newLongestStreak,
    lastComparisonDate: today,
    last7Days: newLast7Days,
    updatedAt: now,
  });
}

export async function updateStatsOnLibraryChange(
  ctx: MutationCtx,
  userId: string,
  mediaType: "ANIME" | "MANGA",
  rd: number,
  action: "add" | "remove",
): Promise<void> {
  const stats = await getStatsForUser(ctx, userId);
  const now = Date.now();
  const isRanked = rd <= RD_CONFIDENCE_THRESHOLD;
  const delta = action === "add" ? 1 : -1;

  if (!stats) {
    if (action === "remove") return;

    await ctx.db.insert("userStats", {
      userId,
      totalComparisons: 0,
      tieCount: 0,
      animeCount: mediaType === "ANIME" ? 1 : 0,
      mangaCount: mediaType === "MANGA" ? 1 : 0,
      rankedAnimeCount: mediaType === "ANIME" && isRanked ? 1 : 0,
      rankedMangaCount: mediaType === "MANGA" && isRanked ? 1 : 0,
      currentStreak: 0,
      longestStreak: 0,
      lastComparisonDate: undefined,
      last7Days: [],
      updatedAt: now,
    });
    return;
  }

  const updates: Record<string, number> = { updatedAt: now };

  if (mediaType === "ANIME") {
    updates.animeCount = Math.max(0, (stats.animeCount ?? 0) + delta);
    if (isRanked) {
      updates.rankedAnimeCount = Math.max(
        0,
        (stats.rankedAnimeCount ?? 0) + delta,
      );
    }
  } else {
    updates.mangaCount = Math.max(0, (stats.mangaCount ?? 0) + delta);
    if (isRanked) {
      updates.rankedMangaCount = Math.max(
        0,
        (stats.rankedMangaCount ?? 0) + delta,
      );
    }
  }

  await ctx.db.patch(stats._id, updates);
}

export async function updateRankedCount(
  ctx: MutationCtx,
  userId: string,
  mediaType: "ANIME" | "MANGA",
  wasRanked: boolean,
  isNowRanked: boolean,
): Promise<void> {
  if (wasRanked === isNowRanked) return;

  const stats = await getStatsForUser(ctx, userId);
  if (!stats) return;

  const delta = isNowRanked ? 1 : -1;
  const field = mediaType === "ANIME" ? "rankedAnimeCount" : "rankedMangaCount";
  const currentValue =
    mediaType === "ANIME"
      ? (stats.rankedAnimeCount ?? 0)
      : (stats.rankedMangaCount ?? 0);

  await ctx.db.patch(stats._id, {
    [field]: Math.max(0, currentValue + delta),
    updatedAt: Date.now(),
  });
}

export const getTopItems = query({
  args: {
    mediaType: v.optional(v.union(v.literal("ANIME"), v.literal("MANGA"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const limit = args.limit ?? 10;

    let filtered: Doc<"userLibrary">[];
    if (args.mediaType) {
      const mediaType = args.mediaType;
      filtered = await ctx.db
        .query("userLibrary")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .filter((q) => q.eq(q.field("mediaType"), mediaType))
        .collect();
      filtered.sort((a, b) => b.rating - a.rating);
    } else {
      filtered = await ctx.db
        .query("userLibrary")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();
      filtered.sort((a, b) => b.rating - a.rating);
    }

    const total = filtered.length;

    return filtered.slice(0, limit).map((item, index) => {
      const rank = index + 1;
      const percentile = total > 1 ? ((total - rank) / (total - 1)) * 100 : 50;
      const score = Math.round((percentile / 10) * 10) / 10;

      return {
        rank,
        title: item.mediaTitle,
        coverImage: item.mediaCoverImage,
        type: item.mediaType,
        rating: item.rating,
        rd: item.rd,
        percentileScore: score,
        comparisonCount: item.comparisonCount,
      };
    });
  },
});

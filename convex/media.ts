import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create or update a media item from AniList data
export const upsertMediaItem = mutation({
  args: {
    anilistId: v.number(),
    malId: v.optional(v.number()),
    type: v.union(v.literal("ANIME"), v.literal("MANGA")),
    title: v.string(),
    titleEnglish: v.optional(v.string()),
    titleJapanese: v.optional(v.string()),
    description: v.optional(v.string()),
    coverImage: v.string(),
    bannerImage: v.optional(v.string()),
    genres: v.array(v.string()),
    tags: v.array(v.string()),
    format: v.optional(v.string()),
    status: v.optional(v.string()),
    episodes: v.optional(v.number()),
    chapters: v.optional(v.number()),
    averageScore: v.optional(v.number()),
    popularity: v.optional(v.number()),
    startDate: v.optional(
      v.object({
        year: v.optional(v.number()),
        month: v.optional(v.number()),
        day: v.optional(v.number()),
      })
    ),
    endDate: v.optional(
      v.object({
        year: v.optional(v.number()),
        month: v.optional(v.number()),
        day: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Check if media item already exists
    const existing = await ctx.db
      .query("mediaItems")
      .withIndex("by_anilist_id", (q) => q.eq("anilistId", args.anilistId))
      .first();

    if (existing) {
      // Update existing item
      await ctx.db.patch(existing._id, args);
      return existing._id;
    } else {
      // Create new item
      const id = await ctx.db.insert("mediaItems", args);
      return id;
    }
  },
});

// Get media item by AniList ID
export const getByAnilistId = query({
  args: { anilistId: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("mediaItems")
      .withIndex("by_anilist_id", (q) => q.eq("anilistId", args.anilistId))
      .first();
  },
});

// Get media item by ID
export const getById = query({
  args: { id: v.id("mediaItems") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

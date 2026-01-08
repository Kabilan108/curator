import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Calculate new Elo ratings
function calculateElo(
  winnerRating: number,
  loserRating: number,
  winnerComparisons: number,
  loserComparisons: number
): { winnerNew: number; loserNew: number } {
  // K-factor decreases as items get more comparisons (more confidence)
  // Start high (40) for new items, decrease to 16 for well-established ratings
  const winnerK = Math.max(16, 40 - winnerComparisons * 2);
  const loserK = Math.max(16, 40 - loserComparisons * 2);

  // Expected scores
  const expectedWinner =
    1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
  const expectedLoser =
    1 / (1 + Math.pow(10, (winnerRating - loserRating) / 400));

  // New ratings
  const winnerNew = Math.round(winnerRating + winnerK * (1 - expectedWinner));
  const loserNew = Math.round(loserRating + loserK * (0 - expectedLoser));

  return { winnerNew, loserNew };
}

// Get two random items for comparison
export const getRandomPair = query({
  args: {},
  handler: async (ctx) => {
    const allItems = await ctx.db.query("userLibrary").collect();

    if (allItems.length < 2) {
      return null; // Not enough items to compare
    }

    // Get two random items
    const shuffled = allItems.sort(() => Math.random() - 0.5);
    const item1 = shuffled[0];
    const item2 = shuffled[1];

    // Fetch media details
    const media1 = await ctx.db.get(item1.mediaItemId);
    const media2 = await ctx.db.get(item2.mediaItemId);

    return {
      item1: { ...item1, media: media1 },
      item2: { ...item2, media: media2 },
    };
  },
});

// Record a comparison and update Elo ratings
export const recordComparison = mutation({
  args: {
    winnerId: v.id("userLibrary"),
    loserId: v.id("userLibrary"),
  },
  handler: async (ctx, args) => {
    // Fetch both items
    const winner = await ctx.db.get(args.winnerId);
    const loser = await ctx.db.get(args.loserId);

    if (!winner || !loser) {
      throw new Error("One or both items not found");
    }

    // Calculate new Elo ratings
    const { winnerNew, loserNew } = calculateElo(
      winner.eloRating,
      loser.eloRating,
      winner.comparisonCount,
      loser.comparisonCount
    );

    // Update both items
    await ctx.db.patch(args.winnerId, {
      eloRating: winnerNew,
      comparisonCount: winner.comparisonCount + 1,
      updatedAt: Date.now(),
    });

    await ctx.db.patch(args.loserId, {
      eloRating: loserNew,
      comparisonCount: loser.comparisonCount + 1,
      updatedAt: Date.now(),
    });

    // Record the comparison
    await ctx.db.insert("comparisons", {
      winnerId: args.winnerId,
      loserId: args.loserId,
      createdAt: Date.now(),
    });

    return { winnerNew, loserNew };
  },
});

// Get comparison history
export const getHistory = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    const comparisons = await ctx.db
      .query("comparisons")
      .withIndex("by_created_at")
      .order("desc")
      .take(limit);

    // Fetch details for each comparison
    const history = await Promise.all(
      comparisons.map(async (comp) => {
        const winner = await ctx.db.get(comp.winnerId);
        const loser = await ctx.db.get(comp.loserId);

        const winnerMedia = winner
          ? await ctx.db.get(winner.mediaItemId)
          : null;
        const loserMedia = loser ? await ctx.db.get(loser.mediaItemId) : null;

        return {
          ...comp,
          winner: winner ? { ...winner, media: winnerMedia } : null,
          loser: loser ? { ...loser, media: loserMedia } : null,
        };
      })
    );

    return history;
  },
});

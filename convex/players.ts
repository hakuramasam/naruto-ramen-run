import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get or create player profile for current user
export const getOrCreatePlayer = mutation({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if player exists
    const existing = await ctx.db
      .query("players")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      return existing;
    }

    // Create new player
    const now = Date.now();
    const playerId = await ctx.db.insert("players", {
      userId,
      username: args.username,
      walletAddress: undefined,
      highestScore: 0,
      totalGamesPlayed: 0,
      createdAt: now,
      updatedAt: now,
    });

    return await ctx.db.get(playerId);
  },
});

// Get current player profile
export const getCurrentPlayer = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("players")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
  },
});

// Update wallet address
export const updateWallet = mutation({
  args: { walletAddress: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const player = await ctx.db
      .query("players")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!player) throw new Error("Player not found");

    await ctx.db.patch(player._id, {
      walletAddress: args.walletAddress,
      updatedAt: Date.now(),
    });
  },
});

// Submit game score
export const submitScore = mutation({
  args: {
    score: v.number(),
    obstaclesAvoided: v.number(),
    distanceTraveled: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const player = await ctx.db
      .query("players")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!player) throw new Error("Player not found");

    // Create game session
    await ctx.db.insert("gameSessions", {
      playerId: player._id,
      userId,
      score: args.score,
      obstaclesAvoided: args.obstaclesAvoided,
      distanceTraveled: args.distanceTraveled,
      playedAt: Date.now(),
    });

    // Update player stats
    const updates: { highestScore?: number; totalGamesPlayed: number; updatedAt: number } = {
      totalGamesPlayed: player.totalGamesPlayed + 1,
      updatedAt: Date.now(),
    };

    if (args.score > player.highestScore) {
      updates.highestScore = args.score;
    }

    await ctx.db.patch(player._id, updates);

    return {
      newHighScore: args.score > player.highestScore,
      previousHighScore: player.highestScore,
    };
  },
});

// Get leaderboard (top 15 players)
export const getLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    const players = await ctx.db
      .query("players")
      .withIndex("by_highest_score")
      .order("desc")
      .take(15);

    return players.map((player, index) => ({
      rank: index + 1,
      username: player.username,
      highestScore: player.highestScore,
      totalGamesPlayed: player.totalGamesPlayed,
      hasWallet: !!player.walletAddress,
      walletAddress: player.walletAddress,
    }));
  },
});

// Get player's rank
export const getPlayerRank = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const player = await ctx.db
      .query("players")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!player) return null;

    // Count players with higher scores
    const higherScorePlayers = await ctx.db
      .query("players")
      .withIndex("by_highest_score")
      .filter((q) => q.gt(q.field("highestScore"), player.highestScore))
      .collect();

    return {
      rank: higherScorePlayers.length + 1,
      highestScore: player.highestScore,
      isTop15: higherScorePlayers.length < 15,
    };
  },
});

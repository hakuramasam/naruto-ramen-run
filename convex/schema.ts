import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  // Player profiles with wallet addresses for token airdrops
  players: defineTable({
    userId: v.id("users"),
    username: v.string(),
    walletAddress: v.optional(v.string()),
    highestScore: v.number(),
    totalGamesPlayed: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_highest_score", ["highestScore"])
    .index("by_wallet", ["walletAddress"]),

  // Game sessions to track individual plays
  gameSessions: defineTable({
    playerId: v.id("players"),
    userId: v.id("users"),
    score: v.number(),
    obstaclesAvoided: v.number(),
    distanceTraveled: v.number(),
    playedAt: v.number(),
  })
    .index("by_player", ["playerId"])
    .index("by_user", ["userId"])
    .index("by_score", ["score"]),
});

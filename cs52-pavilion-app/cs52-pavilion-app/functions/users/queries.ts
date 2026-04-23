/**
 * convex/functions/users/queries.ts
 * ───────────────────────────────────
 * Read-only queries for user data.
 */

import { query } from "convex/_generated/server";
import { v } from "convex/values";

/**
 * Get a single user by their database ID.
 * Returns null if not found (lets frontend handle missing users gracefully).
 */
export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db.get(userId);
  },
});

/**
 * Look up a user by email address.
 * Useful for "add member by email" flows.
 */
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
  },
});

/**
 * Fetch multiple users by their IDs in one query.
 * Useful for rendering a conversation member list.
 */
export const getUsersByIds = query({
  args: { userIds: v.array(v.id("users")) },
  handler: async (ctx, { userIds }) => {
    const users = await Promise.all(userIds.map((id) => ctx.db.get(id)));
    // Filter out any nulls (deleted users)
    return users.filter(Boolean);
  },
});

/**
 * Return all users — useful for admin views or member search.
 * TODO: Add pagination and a search index before using in production at scale.
 */
export const listAllUsers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").order("asc").collect();
  },
});

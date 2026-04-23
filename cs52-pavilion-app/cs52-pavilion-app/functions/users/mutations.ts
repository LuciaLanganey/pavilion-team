/**
 * convex/functions/users/mutations.ts
 * ─────────────────────────────────────
 * Mutations for creating and updating users.
 *
 * 📌 TEAMMATE NOTE:
 *   In a real app, `createOrUpdateUser` is typically called from an
 *   auth webhook (e.g. Clerk's onUserCreated webhook) or automatically
 *   via a Convex Auth callback — not directly from the client.
 *   For now it's exposed as a public mutation for prototyping.
 */

import { mutation } from "convex/_generated/server";
import { v } from "convex/values";
import { now } from "../../lib/helpers";

/**
 * Create a new user, or update their name/avatar if they already exist.
 * Upserts on email so it's safe to call on every login.
 *
 * TODO: Move this into an internal mutation called from your auth webhook.
 */
export const createOrUpdateUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    avatarUrl: v.optional(v.string()),
    // ⚠️  PLACEHOLDER: pass real token identifier from Convex Auth
    tokenIdentifier: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (existing) {
      // Update mutable fields on subsequent logins
      await ctx.db.patch(existing._id, {
        name: args.name,
        avatarUrl: args.avatarUrl,
        tokenIdentifier: args.tokenIdentifier,
        lastSeenAt: now(),
      });
      return existing._id;
    }

    // First-time user creation
    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      avatarUrl: args.avatarUrl,
      tokenIdentifier: args.tokenIdentifier,
      createdAt: now(),
      lastSeenAt: now(),
    });

    return userId;
  },
});

/**
 * Update the current user's display name or avatar.
 * TODO: Replace hardcoded userId arg with getCurrentUser() once auth is live.
 */
export const updateProfile = mutation({
  args: {
    // ⚠️  PLACEHOLDER: remove userId arg and derive from auth context instead
    userId: v.id("users"),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;

    // Strip undefined keys so we don't accidentally overwrite with undefined
    const patch: Record<string, unknown> = {};
    if (updates.name !== undefined) patch.name = updates.name;
    if (updates.avatarUrl !== undefined) patch.avatarUrl = updates.avatarUrl;

    await ctx.db.patch(userId, patch);
  },
});

/**
 * Record that the user was just seen (for "online" presence indicators).
 * Call this from the frontend periodically or on focus.
 *
 * TODO: Replace userId arg with auth-derived user once auth is live.
 */
export const updateLastSeen = mutation({
  args: {
    userId: v.id("users"), // ⚠️  PLACEHOLDER: derive from auth
  },
  handler: async (ctx, { userId }) => {
    await ctx.db.patch(userId, { lastSeenAt: now() });
  },
});

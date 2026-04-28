import { mutation } from "../../_generated/server";
import { v } from "convex/values";
import { now } from "../../lib/helpers";

export const createOrUpdateUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    avatarUrl: v.optional(v.string()),
    tokenIdentifier: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        avatarUrl: args.avatarUrl,
        tokenIdentifier: args.tokenIdentifier,
        lastSeenAt: now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      avatarUrl: args.avatarUrl,
      tokenIdentifier: args.tokenIdentifier,
      createdAt: now(),
      lastSeenAt: now(),
    });
  },
});

export const updateProfile = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;
    const patch: Record<string, unknown> = {};
    if (updates.name !== undefined) patch.name = updates.name;
    if (updates.avatarUrl !== undefined) patch.avatarUrl = updates.avatarUrl;
    await ctx.db.patch(userId, patch);
  },
});

export const updateLastSeen = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    await ctx.db.patch(userId, { lastSeenAt: now() });
  },
});

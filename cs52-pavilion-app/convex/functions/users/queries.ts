import { query } from "../../_generated/server";
import { v } from "convex/values";

export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db.get(userId);
  },
});

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
  },
});

export const getUsersByIds = query({
  args: { userIds: v.array(v.id("users")) },
  handler: async (ctx, { userIds }) => {
    const users = await Promise.all(userIds.map((id) => ctx.db.get(id)));
    return users.filter(Boolean);
  },
});

export const listAllUsers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").order("asc").collect();
  },
});

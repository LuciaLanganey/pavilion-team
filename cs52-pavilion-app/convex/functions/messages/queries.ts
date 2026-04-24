import { query } from "../../_generated/server";
import { v } from "convex/values";
import { MESSAGE_PAGE_SIZE } from "../../lib/helpers";

export const listMessages = query({
  args: {
    conversationId: v.id("conversations"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { conversationId, limit }) => {
    const cap = Math.min(limit ?? MESSAGE_PAGE_SIZE, MESSAGE_PAGE_SIZE);
    const batch = await ctx.db
      .query("messages")
      .withIndex("by_conversationId_and_createdAt", (q) =>
        q.eq("conversationId", conversationId),
      )
      .order("desc")
      .take(cap);
    return batch.reverse();
  },
});

export const getReadState = query({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, { conversationId, userId }) => {
    return await ctx.db
      .query("messageReads")
      .withIndex("by_conversationId_and_userId", (q) =>
        q.eq("conversationId", conversationId).eq("userId", userId),
      )
      .unique();
  },
});

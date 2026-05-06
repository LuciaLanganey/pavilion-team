import { query } from "../../_generated/server";
import { v } from "convex/values";
import { MESSAGE_PAGE_SIZE } from "../../lib/helpers";

// Maximum messages returned in a single export (safety cap)
const EXPORT_MAX = 1000;

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

/**
 * Fetch all messages for a conversation for PDF export.
 * Capped at EXPORT_MAX for safety; returns in chronological order.
 *
 * TODO: Once auth is wired up, verify that the requesting user is a member
 * of this conversation before returning messages.
 */
export const exportMessages = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, { conversationId }) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_conversationId_and_createdAt", (q) =>
        q.eq("conversationId", conversationId),
      )
      .order("asc")
      .take(EXPORT_MAX);
  },
});

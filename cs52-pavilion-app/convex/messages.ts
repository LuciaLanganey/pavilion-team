import { mutationGeneric as mutation, queryGeneric as query } from "convex/server";
import { v } from "convex/values";

export const getClientConversations = query({
  args: { clientId: v.string() },
  handler: async (ctx, { clientId }) => {
    return await ctx.db
      .query("conversations")
      .withIndex("by_client_last_message", (q) => q.eq("clientId", clientId))
      .order("desc")
      .collect();
  },
});

export const getVendorConversations = query({
  args: { vendorId: v.string() },
  handler: async (ctx, { vendorId }) => {
    return await ctx.db
      .query("conversations")
      .withIndex("by_vendor_last_message", (q) => q.eq("vendorId", vendorId))
      .order("desc")
      .collect();
  },
});

export const getMessages = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, { conversationId }) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", conversationId),
      )
      .order("asc")
      .collect();
  },
});

export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    senderId: v.string(),
    body: v.string(),
  },
  handler: async (ctx, { conversationId, senderId, body }) => {
    const now = Date.now();

    await ctx.db.insert("messages", {
      conversationId,
      senderId,
      body,
      createdAt: now,
    });

    await ctx.db.patch(conversationId, { lastMessageAt: now });
  },
});

export const startConversation = mutation({
  args: {
    clientId: v.string(),
    vendorId: v.string(),
  },
  handler: async (ctx, { clientId, vendorId }) => {
    const existing = await ctx.db
      .query("conversations")
      .withIndex("by_client_vendor", (q) => q.eq("clientId", clientId))
      .filter((q) => q.eq(q.field("vendorId"), vendorId))
      .first();

    if (existing) {
      return existing._id;
    }

    const now = Date.now();
    return await ctx.db.insert("conversations", {
      clientId,
      vendorId,
      lastMessageAt: now,
      createdAt: now,
    });
  },
});

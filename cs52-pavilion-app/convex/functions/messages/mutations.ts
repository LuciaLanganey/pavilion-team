import { mutation } from "../../_generated/server";
import { v } from "convex/values";
import { now, requireConversationMember } from "../../lib/helpers";

function previewFromContent(content: string, max = 80): string {
  const t = content.trim().replace(/\s+/g, " ");
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
}

export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    content: v.string(),
    contentType: v.union(
      v.literal("text"),
      v.literal("image"),
      v.literal("file"),
      v.literal("system"),
    ),
  },
  handler: async (ctx, args) => {
    await requireConversationMember(ctx, args.conversationId, args.senderId);

    const sender = await ctx.db.get(args.senderId);
    const t = now();

    await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: args.senderId,
      content: args.content,
      contentType: args.contentType,
      createdAt: t,
      isDeleted: false,
    });

    const preview = sender
      ? `${sender.name}: ${previewFromContent(args.content)}`
      : previewFromContent(args.content);

    await ctx.db.patch(args.conversationId, {
      lastMessageAt: t,
      lastMessagePreview: preview,
    });
  },
});

export const markConversationRead = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    lastReadMessageId: v.optional(v.id("messages")),
  },
  handler: async (ctx, { conversationId, userId, lastReadMessageId }) => {
    await requireConversationMember(ctx, conversationId, userId);

    const t = now();
    const existing = await ctx.db
      .query("messageReads")
      .withIndex("by_conversationId_and_userId", (q) =>
        q.eq("conversationId", conversationId).eq("userId", userId),
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        lastReadMessageId,
        lastReadAt: t,
      });
    } else {
      await ctx.db.insert("messageReads", {
        conversationId,
        userId,
        lastReadMessageId,
        lastReadAt: t,
      });
    }
  },
});

export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
    requesterId: v.id("users"),
  },
  handler: async (ctx, { messageId, requesterId }) => {
    const msg = await ctx.db.get(messageId);
    if (!msg) return;
    if (msg.senderId !== requesterId) {
      throw new Error("Only the author can delete this message.");
    }
    await ctx.db.patch(messageId, { isDeleted: true });
  },
});

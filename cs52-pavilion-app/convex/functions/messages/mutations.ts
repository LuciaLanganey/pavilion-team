import { mutation, internalMutation } from "../../_generated/server";
import { v } from "convex/values";
import { internal } from "../../_generated/api";
import { now, requireConversationMember } from "../../lib/helpers";

function previewFromContent(content: string, max = 80): string {
  const t = content.trim().replace(/\s+/g, " ");
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
}

// ── Public mutations ──────────────────────────────────────────────────────────

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
      source: "app",
    });

    const preview = sender
      ? `${sender.name}: ${previewFromContent(args.content)}`
      : previewFromContent(args.content);

    await ctx.db.patch(args.conversationId, {
      lastMessageAt: t,
      lastMessagePreview: preview,
    });

    // Schedule email notifications asynchronously so a provider failure never
    // blocks the message send.
    // TODO: Ensure EMAIL_PROVIDER, EMAIL_FROM, EMAIL_REPLY_DOMAIN, APP_BASE_URL
    // are set in Convex dashboard → Project Settings → Environment Variables.
    await ctx.scheduler.runAfter(
      0,
      internal.functions.notifications.emailNotifications.notifyRecipients,
      {
        conversationId: args.conversationId,
        senderId: args.senderId,
        messageContent: args.content,
        contentType: args.contentType,
      },
    );
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
      await ctx.db.patch(existing._id, { lastReadMessageId, lastReadAt: t });
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

// ── Internal mutations (inbound email sync) ───────────────────────────────────

/**
 * Insert a message received via inbound email.
 * Called from the HTTP webhook action after the sender and conversation are
 * verified. Never exposed to the public API.
 *
 * Returns true on success, null if the message is a duplicate or the sender
 * is no longer a member.
 */
export const receiveEmailMessage = internalMutation({
  args: {
    conversationId: v.id("conversations"),
    senderUserId: v.id("users"),
    emailFrom: v.string(),
    content: v.string(),
    emailMessageId: v.string(),
    receivedAt: v.number(),
  },
  handler: async (ctx, args) => {
    // Idempotency guard — skip if we already stored this email
    const dup = await ctx.db
      .query("messages")
      .withIndex("by_emailMessageId", (q) =>
        q.eq("emailMessageId", args.emailMessageId),
      )
      .unique();
    if (dup) return null;

    // Confirm sender is still a member of this conversation
    const membership = await ctx.db
      .query("conversationMembers")
      .withIndex("by_userId_and_conversationId", (q) =>
        q
          .eq("userId", args.senderUserId)
          .eq("conversationId", args.conversationId),
      )
      .unique();
    if (!membership) return null;

    const sender = await ctx.db.get(args.senderUserId);
    const t = args.receivedAt;

    await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: args.senderUserId,
      content: args.content,
      contentType: "text",
      createdAt: t,
      isDeleted: false,
      source: "email",
      senderEmail: args.emailFrom,
      emailMessageId: args.emailMessageId,
    });

    const preview = sender
      ? `${sender.name}: ${previewFromContent(args.content)}`
      : previewFromContent(args.content);

    await ctx.db.patch(args.conversationId, {
      lastMessageAt: t,
      lastMessagePreview: preview,
    });

    return true;
  },
});

/**
 * Log an inbound email that could not be routed into a conversation.
 * Provides an audit trail for security review.
 */
export const logRejectedEmail = internalMutation({
  args: {
    fromEmail: v.string(),
    toAddress: v.string(),
    subject: v.string(),
    reason: v.string(),
    rawThreadId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("rejectedEmails", {
      receivedAt: now(),
      fromEmail: args.fromEmail,
      toAddress: args.toAddress,
      subject: args.subject,
      reason: args.reason,
      rawThreadId: args.rawThreadId,
    });
  },
});

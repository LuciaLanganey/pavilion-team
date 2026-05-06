import { query } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";

export const listConversationsForUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const memberships = await ctx.db
      .query("conversationMembers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const rows: Array<{
      _id: Id<"conversations">;
      displayName: string;
      lastMessagePreview?: string;
      lastMessageAt?: number;
      isGroup: boolean;
      title?: string;
    }> = [];

    for (const m of memberships) {
      const conv = await ctx.db.get(m.conversationId);
      if (!conv) continue;

      let displayName: string;
      if (conv.isGroup) {
        displayName = conv.title ?? "Group chat";
      } else {
        const members = await ctx.db
          .query("conversationMembers")
          .withIndex("by_conversationId", (q) =>
            q.eq("conversationId", conv._id),
          )
          .collect();
        const other = members.find((x) => x.userId !== userId);
        if (other) {
          const otherUser = await ctx.db.get(other.userId);
          displayName = otherUser?.name ?? "Direct message";
        } else {
          displayName = "Direct message";
        }
      }

      rows.push({
        _id: conv._id,
        displayName,
        lastMessagePreview: conv.lastMessagePreview,
        lastMessageAt: conv.lastMessageAt,
        isGroup: conv.isGroup,
        title: conv.title,
      });
    }

    rows.sort((a, b) => (b.lastMessageAt ?? 0) - (a.lastMessageAt ?? 0));
    return rows;
  },
});

export const getConversation = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, { conversationId }) => {
    return await ctx.db.get(conversationId);
  },
});

export const getConversationMembers = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, { conversationId }) => {
    const members = await ctx.db
      .query("conversationMembers")
      .withIndex("by_conversationId", (q) =>
        q.eq("conversationId", conversationId),
      )
      .collect();

    return await Promise.all(
      members.map(async (member) => ({
        ...member,
        user: await ctx.db.get(member.userId),
      })),
    );
  },
});

/**
 * Fetch full conversation thread for PDF export
 * 
 * Returns all messages, members, and metadata needed to generate a PDF transcript
 */
export const getConversationForExport = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, { conversationId }) => {
    const conversation = await ctx.db.get(conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // Fetch all members
    const members = await ctx.db
      .query("conversationMembers")
      .withIndex("by_conversationId", (q) => q.eq("conversationId", conversationId))
      .collect();

    // Fetch all messages (all of them for export, not just first page)
    const allMessages = await ctx.db
      .query("messages")
      .withIndex("by_conversationId_and_createdAt", (q) =>
        q.eq("conversationId", conversationId),
      )
      .order("asc")
      .collect();

    // Enrich messages with sender info
    const enrichedMessages = await Promise.all(
      allMessages.map(async (msg) => {
        let sender = null;
        if (msg.senderId) {
          sender = await ctx.db.get(msg.senderId);
        }

        return {
          ...msg,
          senderName: sender?.name || msg.senderEmail || "Unknown",
          senderEmail: msg.senderEmail || sender?.email,
        };
      }),
    );

    // Fetch user info for members
    const enrichedMembers = await Promise.all(
      members.map(async (member) => {
        const user = await ctx.db.get(member.userId);
        return {
          userId: member.userId,
          name: user?.name || "Unknown",
          email: user?.email,
        };
      }),
    );

    return {
      conversation,
      members: enrichedMembers,
      messages: enrichedMessages,
    };
  },
});

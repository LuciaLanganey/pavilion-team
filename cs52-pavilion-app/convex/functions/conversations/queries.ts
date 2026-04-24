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

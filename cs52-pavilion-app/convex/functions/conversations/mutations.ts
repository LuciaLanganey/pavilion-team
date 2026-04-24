import { mutation, MutationCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { now } from "../../lib/helpers";

async function findExistingDm(
  ctx: MutationCtx,
  userIdA: Id<"users">,
  userIdB: Id<"users">,
): Promise<Id<"conversations"> | null> {
  const memberships = await ctx.db
    .query("conversationMembers")
    .withIndex("by_userId", (q) => q.eq("userId", userIdA))
    .collect();

  for (const m of memberships) {
    const conv = await ctx.db.get(m.conversationId);
    if (!conv || conv.isGroup) continue;

    const members = await ctx.db
      .query("conversationMembers")
      .withIndex("by_conversationId", (q) => q.eq("conversationId", conv._id))
      .collect();

    const ids = new Set(members.map((x) => x.userId));
    if (ids.size === 2 && ids.has(userIdA) && ids.has(userIdB)) {
      return conv._id;
    }
  }
  return null;
}

export const createDirectMessage = mutation({
  args: {
    creatorUserId: v.id("users"),
    otherUserId: v.id("users"),
  },
  handler: async (ctx, { creatorUserId, otherUserId }) => {
    if (creatorUserId === otherUserId) {
      throw new Error("Cannot start a DM with yourself.");
    }

    const existing = await findExistingDm(ctx, creatorUserId, otherUserId);
    if (existing) return existing;

    const t = now();
    const conversationId = await ctx.db.insert("conversations", {
      isGroup: false,
      createdBy: creatorUserId,
      createdAt: t,
      lastMessageAt: t,
    });

    await ctx.db.insert("conversationMembers", {
      conversationId,
      userId: creatorUserId,
      joinedAt: t,
      role: "admin",
    });
    await ctx.db.insert("conversationMembers", {
      conversationId,
      userId: otherUserId,
      joinedAt: t,
      role: "member",
    });

    return conversationId;
  },
});

export const createGroupConversation = mutation({
  args: {
    creatorUserId: v.id("users"),
    title: v.string(),
    memberUserIds: v.array(v.id("users")),
  },
  handler: async (ctx, { creatorUserId, title, memberUserIds }) => {
    const t = now();
    const uniqueMembers = Array.from(new Set([creatorUserId, ...memberUserIds]));

    const conversationId = await ctx.db.insert("conversations", {
      title,
      isGroup: true,
      createdBy: creatorUserId,
      createdAt: t,
      lastMessageAt: t,
    });

    for (const userId of uniqueMembers) {
      await ctx.db.insert("conversationMembers", {
        conversationId,
        userId,
        joinedAt: t,
        role: userId === creatorUserId ? "admin" : "member",
      });
    }

    return conversationId;
  },
});

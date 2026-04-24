import { mutation } from "./_generated/server";

/**
 * Idempotent demo data for local Convex. Run:
 *   npx convex run seed:seedDemoData
 */
export const seedDemoData = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "alice@example.com"))
      .unique();
    if (existing) {
      return { skipped: true as const, message: "Demo data already present." };
    }

    const timestamp = Date.now();

    const aliceId = await ctx.db.insert("users", {
      name: "Alice Chen",
      email: "alice@example.com",
      createdAt: timestamp - 86400000 * 7,
      lastSeenAt: timestamp - 60000,
    });

    const bobId = await ctx.db.insert("users", {
      name: "Bob Martinez",
      email: "bob@example.com",
      createdAt: timestamp - 86400000 * 5,
      lastSeenAt: timestamp - 3600000,
    });

    const carolId = await ctx.db.insert("users", {
      name: "Carol Kim",
      email: "carol@example.com",
      createdAt: timestamp - 86400000 * 3,
      lastSeenAt: timestamp - 7200000,
    });

    const dmId = await ctx.db.insert("conversations", {
      isGroup: false,
      createdBy: aliceId,
      createdAt: timestamp - 86400000 * 2,
      lastMessageAt: timestamp - 300000,
      lastMessagePreview: "Sounds good, see you then!",
    });

    await ctx.db.insert("conversationMembers", {
      conversationId: dmId,
      userId: aliceId,
      joinedAt: timestamp - 86400000 * 2,
      role: "admin",
    });
    await ctx.db.insert("conversationMembers", {
      conversationId: dmId,
      userId: bobId,
      joinedAt: timestamp - 86400000 * 2,
      role: "member",
    });

    const dm1 = await ctx.db.insert("messages", {
      conversationId: dmId,
      senderId: aliceId,
      content: "Hey Bob! Are you free for a call tomorrow at 2pm?",
      contentType: "text",
      createdAt: timestamp - 86400000,
      isDeleted: false,
    });
    const dm2 = await ctx.db.insert("messages", {
      conversationId: dmId,
      senderId: bobId,
      content: "Yes, that works for me! What do you want to discuss?",
      contentType: "text",
      createdAt: timestamp - 82800000,
      isDeleted: false,
    });
    const dm3 = await ctx.db.insert("messages", {
      conversationId: dmId,
      senderId: aliceId,
      content: "The new feature rollout. I'll send you the doc beforehand.",
      contentType: "text",
      createdAt: timestamp - 79200000,
      isDeleted: false,
    });
    await ctx.db.insert("messages", {
      conversationId: dmId,
      senderId: bobId,
      content: "Sounds good, see you then!",
      contentType: "text",
      createdAt: timestamp - 300000,
      isDeleted: false,
    });

    void dm1;
    void dm2;

    await ctx.db.insert("messageReads", {
      conversationId: dmId,
      userId: aliceId,
      lastReadMessageId: dm3,
      lastReadAt: timestamp - 79000000,
    });

    const groupId = await ctx.db.insert("conversations", {
      title: "Product Team",
      isGroup: true,
      createdBy: aliceId,
      createdAt: timestamp - 86400000 * 4,
      lastMessageAt: timestamp - 1800000,
      lastMessagePreview: "Carol: I'll have the designs ready by EOD",
    });

    await ctx.db.insert("conversationMembers", {
      conversationId: groupId,
      userId: aliceId,
      joinedAt: timestamp - 86400000 * 4,
      role: "admin",
    });
    await ctx.db.insert("conversationMembers", {
      conversationId: groupId,
      userId: bobId,
      joinedAt: timestamp - 86400000 * 4,
      role: "member",
    });
    await ctx.db.insert("conversationMembers", {
      conversationId: groupId,
      userId: carolId,
      joinedAt: timestamp - 86400000 * 3,
      role: "member",
    });

    await ctx.db.insert("messages", {
      conversationId: groupId,
      senderId: aliceId,
      content: "Welcome to the Product Team channel!",
      contentType: "text",
      createdAt: timestamp - 86400000 * 4,
      isDeleted: false,
    });
    await ctx.db.insert("messages", {
      conversationId: groupId,
      senderId: bobId,
      content: "Thanks Alice! Excited to be here.",
      contentType: "text",
      createdAt: timestamp - 86400000 * 3,
      isDeleted: false,
    });
    await ctx.db.insert("messages", {
      conversationId: groupId,
      senderId: carolId,
      content: "I'll have the designs ready by EOD",
      contentType: "text",
      createdAt: timestamp - 1800000,
      isDeleted: false,
    });

    return {
      skipped: false as const,
      aliceId,
      bobId,
      carolId,
      dmId,
      groupId,
    };
  },
});

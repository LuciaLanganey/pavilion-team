/**
 * convex/seed.ts
 * ──────────────
 * Development seed data. Run this once to populate your local Convex dev
 * database with realistic test users and conversations.
 *
 * How to run:
 *   npx convex run seed:seedDemoData
 *
 * ⚠️  DO NOT run this in production — it creates fake users and conversations.
 * Delete this file or gate it behind a NODE_ENV check before deploying.
 *
 * 📌 TEAMMATE NOTE:
 *   This is just for local development convenience. The data it creates
 *   matches the schema exactly, so it's also a good reference for what
 *   valid data looks like for each table.
 */

import { internalMutation } from "convex/_generated/server";
import { v } from "convex/values";

export const seedDemoData = internalMutation({
  args: {},
  handler: async (ctx) => {
    const timestamp = Date.now();

    // ── Create demo users ──────────────────────────────────────────────────
    const aliceId = await ctx.db.insert("users", {
      name: "Alice Chen",
      email: "alice@example.com",
      avatarUrl: undefined,
      createdAt: timestamp - 86400000 * 7,
      lastSeenAt: timestamp - 60000,
    });

    const bobId = await ctx.db.insert("users", {
      name: "Bob Martinez",
      email: "bob@example.com",
      avatarUrl: undefined,
      createdAt: timestamp - 86400000 * 5,
      lastSeenAt: timestamp - 3600000,
    });

    const carolId = await ctx.db.insert("users", {
      name: "Carol Kim",
      email: "carol@example.com",
      avatarUrl: undefined,
      createdAt: timestamp - 86400000 * 3,
      lastSeenAt: timestamp - 7200000,
    });

    // ── Create a DM conversation: Alice ↔ Bob ─────────────────────────────
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

    // Seed DM messages
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

    // Seed read state: Alice has read everything in the DM
    await ctx.db.insert("messageReads", {
      conversationId: dmId,
      userId: aliceId,
      lastReadMessageId: dm3,
      lastReadAt: timestamp - 79000000,
    });

    // ── Create a group conversation ────────────────────────────────────────
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

    // Seed group messages
    await ctx.db.insert("messages", {
      conversationId: groupId,
      senderId: aliceId,
      content: "Welcome to the Product Team channel! 🎉",
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

    console.log("✅ Seed data created successfully.");
    console.log(`   Users: alice=${aliceId}, bob=${bobId}, carol=${carolId}`);
    console.log(`   Conversations: dm=${dmId}, group=${groupId}`);

    return { aliceId, bobId, carolId, dmId, groupId };
  },
});

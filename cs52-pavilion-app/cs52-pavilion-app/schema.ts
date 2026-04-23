/**
 * schema.ts
 * ---------
 * Convex database schema for the messaging/chat product.
 *
 * Tables defined here:
 *   users              — app users (synced from auth provider or created manually)
 *   conversations      — a chat thread between 2+ users
 *   conversationMembers — join table: which users belong to which conversation
 *   messages           — individual messages inside a conversation
 *   messageReads       — tracks who has read up to which message (read receipts)
 *   attachments        — optional file attachments linked to messages
 *
 * 📌 TEAMMATE NOTE:
 *   - All IDs use Convex's built-in `Id<"tableName">` type — never store raw strings as IDs.
 *   - Indexes are defined here. Add new ones here (not in query files) when you need them.
 *   - `v.optional(...)` means the field can be omitted entirely (undefined), not just null.
 */

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ─── Users ────────────────────────────────────────────────────────────────
  // Represents a person who can send and receive messages.
  // TODO: When auth is wired up, populate `tokenIdentifier` from Convex Auth
  //       and use it to look up the current user in every function.
  users: defineTable({
    name: v.string(),
    email: v.string(),
    avatarUrl: v.optional(v.string()),   // profile picture URL (e.g. from OAuth)
    // ⚠️  PLACEHOLDER: replace with real Convex Auth token identifier
    tokenIdentifier: v.optional(v.string()),
    createdAt: v.number(),               // Unix ms timestamp
    lastSeenAt: v.optional(v.number()),  // for "online" indicators
  })
    .index("by_email", ["email"])
    .index("by_token", ["tokenIdentifier"]),

  // ─── Conversations ────────────────────────────────────────────────────────
  // A conversation is a named thread. Direct messages are a 2-person
  // conversation with no title; group chats have a title.
  conversations: defineTable({
    title: v.optional(v.string()),       // null for DMs, set for group chats
    isGroup: v.boolean(),
    createdBy: v.id("users"),
    createdAt: v.number(),
    lastMessageAt: v.optional(v.number()), // used to sort sidebar conversation list
    lastMessagePreview: v.optional(v.string()), // e.g. "Sarah: Hey, are you free?"
  })
    .index("by_createdBy", ["createdBy"])
    .index("by_lastMessageAt", ["lastMessageAt"]),

  // ─── Conversation Members ─────────────────────────────────────────────────
  // Join table: one row per (user, conversation) pair.
  // Query "all conversations for user X" using the by_userId index.
  // Query "all members of conversation Y" using the by_conversationId index.
  conversationMembers: defineTable({
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    joinedAt: v.number(),
    role: v.union(v.literal("admin"), v.literal("member")), // extend as needed
  })
    .index("by_conversationId", ["conversationId"])
    .index("by_userId", ["userId"])
    .index("by_userId_and_conversationId", ["userId", "conversationId"]),

  // ─── Messages ─────────────────────────────────────────────────────────────
  // Individual messages. Ordered by `createdAt` within a conversation.
  // TODO: add support for edited/deleted messages when needed.
  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    content: v.string(),                 // message body text
    contentType: v.union(
      v.literal("text"),
      v.literal("image"),
      v.literal("file"),
      v.literal("system"),              // e.g. "Alice joined the conversation"
    ),
    attachmentId: v.optional(v.id("attachments")),
    createdAt: v.number(),
    editedAt: v.optional(v.number()),
    isDeleted: v.boolean(),             // soft-delete flag
  })
    .index("by_conversationId", ["conversationId"])
    .index("by_conversationId_and_createdAt", ["conversationId", "createdAt"])
    .index("by_senderId", ["senderId"]),

  // ─── Message Reads ────────────────────────────────────────────────────────
  // Tracks read state per user per conversation.
  // `lastReadMessageId` = the newest message the user has seen in that conversation.
  // "Unread count" = messages in conversation with createdAt > lastReadAt.
  messageReads: defineTable({
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    lastReadMessageId: v.optional(v.id("messages")),
    lastReadAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_conversationId_and_userId", ["conversationId", "userId"]),

  // ─── Attachments (optional) ───────────────────────────────────────────────
  // Stores metadata for file uploads. Actual file bytes live in Convex Storage.
  // TODO: wire up Convex file storage (generateUploadUrl / getUrl) to populate storageId.
  attachments: defineTable({
    messageId: v.optional(v.id("messages")), // linked after message is created
    uploadedBy: v.id("users"),
    storageId: v.string(),               // Convex Storage ID (from generateUploadUrl flow)
    fileName: v.string(),
    mimeType: v.string(),
    sizeBytes: v.number(),
    createdAt: v.number(),
  })
    .index("by_messageId", ["messageId"])
    .index("by_uploadedBy", ["uploadedBy"]),
});

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    avatarUrl: v.optional(v.string()),
    tokenIdentifier: v.optional(v.string()),
    createdAt: v.number(),
    lastSeenAt: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_token", ["tokenIdentifier"]),

  conversations: defineTable({
    title: v.optional(v.string()),
    isGroup: v.boolean(),
    createdBy: v.id("users"),
    createdAt: v.number(),
    lastMessageAt: v.optional(v.number()),
    lastMessagePreview: v.optional(v.string()),
  })
    .index("by_createdBy", ["createdBy"])
    .index("by_lastMessageAt", ["lastMessageAt"]),

  conversationMembers: defineTable({
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    joinedAt: v.number(),
    role: v.union(v.literal("admin"), v.literal("member")),
  })
    .index("by_conversationId", ["conversationId"])
    .index("by_userId", ["userId"])
    .index("by_userId_and_conversationId", ["userId", "conversationId"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    content: v.string(),
    contentType: v.union(
      v.literal("text"),
      v.literal("image"),
      v.literal("file"),
      v.literal("system"),
    ),
    attachmentId: v.optional(v.id("attachments")),
    createdAt: v.number(),
    editedAt: v.optional(v.number()),
    isDeleted: v.boolean(),
  })
    .index("by_conversationId", ["conversationId"])
    .index("by_conversationId_and_createdAt", ["conversationId", "createdAt"])
    .index("by_senderId", ["senderId"]),

  messageReads: defineTable({
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    lastReadMessageId: v.optional(v.id("messages")),
    lastReadAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_conversationId_and_userId", ["conversationId", "userId"]),

  attachments: defineTable({
    messageId: v.optional(v.id("messages")),
    uploadedBy: v.id("users"),
    storageId: v.string(),
    fileName: v.string(),
    mimeType: v.string(),
    sizeBytes: v.number(),
    createdAt: v.number(),
  })
    .index("by_messageId", ["messageId"])
    .index("by_uploadedBy", ["uploadedBy"]),
});

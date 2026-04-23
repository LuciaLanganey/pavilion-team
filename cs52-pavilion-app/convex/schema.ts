import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  conversations: defineTable({
    clientId: v.string(),
    vendorId: v.string(),
    lastMessageAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_client_vendor", ["clientId", "vendorId"])
    .index("by_client_last_message", ["clientId", "lastMessageAt"])
    .index("by_vendor_last_message", ["vendorId", "lastMessageAt"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.string(),
    body: v.string(),
    createdAt: v.number(),
  }).index("by_conversation", ["conversationId", "createdAt"]),
});

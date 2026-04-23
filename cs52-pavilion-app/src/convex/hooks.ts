/**
 * src/convex/hooks.ts
 * ────────────────────
 * Typed hooks that wrap Convex's useQuery / useMutation.
 * Import these in your React components instead of calling the API directly.
 *
 * Why this layer?
 *   - Keeps component files clean (no raw `api.functions.messages.queries...` paths)
 *   - Single place to add loading/error handling patterns
 *   - Easy to mock in tests later
 *
 * 📌 FRONTEND DEV NOTE:
 *   All hooks that need a userId are placeholders until auth is live.
 *   Once auth is wired up, remove userId params — the backend will
 *   derive the current user from the auth token automatically.
 */

import { useQuery, useMutation } from "convex/react";
import { api } from "../../cs52-pavilion-app/_generated/api";
import { Id } from "../../cs52-pavilion-app/_generated/dataModel";

// ─── User hooks ───────────────────────────────────────────────────────────────

/** Get a user by ID. Returns undefined while loading, null if not found. */
export function useUser(userId: Id<"users"> | undefined) {
  return useQuery(
    api.functions.users.queries.getUser,
    userId ? { userId } : "skip"
  );
}

/** Create or update a user (call on login/signup). */
export function useCreateOrUpdateUser() {
  return useMutation(api.functions.users.mutations.createOrUpdateUser);
}

// ─── Conversation hooks ───────────────────────────────────────────────────────

/**
 * List all conversations for a user — drives the sidebar.
 * Re-runs automatically when any conversation changes (real-time).
 *
 * TODO: Replace userId param with no param once auth is implemented —
 *       the backend will use the auth token to identify the user.
 */
export function useConversations(userId: Id<"users"> | undefined) {
  return useQuery(
    api.functions.conversations.queries.listConversationsForUser,
    userId ? { userId } : "skip"
  );
}

/** Get a single conversation. */
export function useConversation(conversationId: Id<"conversations"> | undefined) {
  return useQuery(
    api.functions.conversations.queries.getConversation,
    conversationId ? { conversationId } : "skip"
  );
}

/** Get all members of a conversation. */
export function useConversationMembers(conversationId: Id<"conversations"> | undefined) {
  return useQuery(
    api.functions.conversations.queries.getConversationMembers,
    conversationId ? { conversationId } : "skip"
  );
}

/** Start a DM conversation with another user. */
export function useCreateDirectMessage() {
  return useMutation(api.functions.conversations.mutations.createDirectMessage);
}

/** Create a group conversation. */
export function useCreateGroupConversation() {
  return useMutation(api.functions.conversations.mutations.createGroupConversation);
}

// ─── Message hooks ────────────────────────────────────────────────────────────

/**
 * Subscribe to messages in a conversation — drives the chat thread.
 * Convex will push updates in real-time as new messages arrive.
 * No polling or websocket setup needed.
 */
export function useMessages(
  conversationId: Id<"conversations"> | undefined,
  limit?: number
) {
  return useQuery(
    api.functions.messages.queries.listMessages,
    conversationId ? { conversationId, limit } : "skip"
  );
}

/** Send a message. Returns a function to call with message args. */
export function useSendMessage() {
  return useMutation(api.functions.messages.mutations.sendMessage);
}

/** Mark a conversation as read up to a specific message. */
export function useMarkRead() {
  return useMutation(api.functions.messages.mutations.markConversationRead);
}

/** Delete a message (soft delete). */
export function useDeleteMessage() {
  return useMutation(api.functions.messages.mutations.deleteMessage);
}

/** Get read state for the current user in a conversation. */
export function useReadState(
  conversationId: Id<"conversations"> | undefined,
  userId: Id<"users"> | undefined
) {
  return useQuery(
    api.functions.messages.queries.getReadState,
    conversationId && userId ? { conversationId, userId } : "skip"
  );
}

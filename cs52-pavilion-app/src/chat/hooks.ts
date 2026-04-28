import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export function useUser(userId: Id<"users"> | undefined) {
  return useQuery(
    api.functions.users.queries.getUser,
    userId ? { userId } : "skip",
  );
}

export function useCreateOrUpdateUser() {
  return useMutation(api.functions.users.mutations.createOrUpdateUser);
}

export function useConversations(userId: Id<"users"> | undefined) {
  return useQuery(
    api.functions.conversations.queries.listConversationsForUser,
    userId ? { userId } : "skip",
  );
}

export function useConversation(
  conversationId: Id<"conversations"> | undefined,
) {
  return useQuery(
    api.functions.conversations.queries.getConversation,
    conversationId ? { conversationId } : "skip",
  );
}

export function useConversationMembers(
  conversationId: Id<"conversations"> | undefined,
) {
  return useQuery(
    api.functions.conversations.queries.getConversationMembers,
    conversationId ? { conversationId } : "skip",
  );
}

export function useCreateDirectMessage() {
  return useMutation(
    api.functions.conversations.mutations.createDirectMessage,
  );
}

export function useCreateGroupConversation() {
  return useMutation(
    api.functions.conversations.mutations.createGroupConversation,
  );
}

export function useMessages(
  conversationId: Id<"conversations"> | undefined,
  limit?: number,
) {
  return useQuery(
    api.functions.messages.queries.listMessages,
    conversationId ? { conversationId, limit } : "skip",
  );
}

export function useSendMessage() {
  return useMutation(api.functions.messages.mutations.sendMessage);
}

export function useMarkRead() {
  return useMutation(api.functions.messages.mutations.markConversationRead);
}

export function useDeleteMessage() {
  return useMutation(api.functions.messages.mutations.deleteMessage);
}

export function useReadState(
  conversationId: Id<"conversations"> | undefined,
  userId: Id<"users"> | undefined,
) {
  return useQuery(
    api.functions.messages.queries.getReadState,
    conversationId && userId ? { conversationId, userId } : "skip",
  );
}

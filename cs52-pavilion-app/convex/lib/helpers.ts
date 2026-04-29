import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

export async function getCurrentUser(
  _ctx: QueryCtx | MutationCtx,
): Promise<never> {
  throw new Error(
    "getCurrentUser is not implemented. Wire up Convex Auth and replace this function body.",
  );
}

export async function requireCurrentUserId(
  ctx: QueryCtx | MutationCtx,
): Promise<Id<"users">> {
  return await getCurrentUser(ctx);
}

export async function requireConversationMember(
  ctx: QueryCtx | MutationCtx,
  conversationId: Id<"conversations">,
  userId: Id<"users">,
) {
  const membership = await ctx.db
    .query("conversationMembers")
    .withIndex("by_userId_and_conversationId", (q) =>
      q.eq("userId", userId).eq("conversationId", conversationId),
    )
    .unique();

  if (!membership) {
    throw new Error("Access denied: user is not a member of this conversation.");
  }
  return membership;
}

export function now(): number {
  return Date.now();
}

export const MESSAGE_PAGE_SIZE = 50;

/**
 * Generate a URL-safe thread ID for email reply routing.
 * Uses btoa (available in Convex V8 runtime and browsers) instead of Buffer.
 */
export function generateThreadId(conversationId: Id<"conversations">): string {
  return btoa(conversationId)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

/**
 * Decode a thread ID back to a conversation ID string.
 */
export function decodeThreadId(threadId: string): string {
  const b64 = threadId.replace(/-/g, "+").replace(/_/g, "/");
  const mod = b64.length % 4;
  const padded = mod === 0 ? b64 : b64 + "=".repeat(4 - mod);
  return atob(padded);
}

/**
 * Extract thread ID from email reply address or subject line
 * Supports formats:
 * - replies+THREAD_ID@domain.com
 * - Subject line: [thread:THREAD_ID] or [THREAD_ID]
 */
export function extractThreadIdFromEmail(email: string): string | null {
  // Try to extract from email address (replies+THREAD_ID@domain.com)
  const emailMatch = email.match(/\+([a-zA-Z0-9_-]+)@/);
  if (emailMatch && emailMatch[1]) {
    return emailMatch[1];
  }
  return null;
}

export function extractThreadIdFromSubject(subject: string): string | null {
  // Try to extract from subject line: [thread:THREAD_ID] or [THREAD_ID]
  const threadMatch = subject.match(/\[thread:([a-zA-Z0-9_-]+)\]/);
  if (threadMatch && threadMatch[1]) {
    return threadMatch[1];
  }

  const simpleMatch = subject.match(/\[([a-zA-Z0-9_-]{20,})\]/);
  if (simpleMatch && simpleMatch[1]) {
    return simpleMatch[1];
  }

  return null;
}

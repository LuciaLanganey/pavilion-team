/**
 * convex/lib/helpers.ts
 * ─────────────────────
 * Shared utility functions used by queries and mutations.
 * Put reusable logic here — keep individual function files thin.
 *
 * 📌 TEAMMATE NOTE:
 *   Auth helpers live here too. Right now they return a hardcoded
 *   placeholder user ID. Replace `getCurrentUser` with real auth
 *   once Convex Auth (or Clerk/Auth0) is wired up.
 */

import { QueryCtx, MutationCtx } from "convex/_generated/server";
import { Id } from "convex/_generated/dataModel";

// ─── Auth helpers ─────────────────────────────────────────────────────────────

/**
 * Returns the currently authenticated user document.
 *
 * ⚠️  PLACEHOLDER: This currently throws — real auth must be added.
 * Replace the body with Convex Auth lookup, e.g.:
 *
 *   const identity = await ctx.auth.getUserIdentity();
 *   if (!identity) throw new Error("Not authenticated");
 *   const user = await ctx.db
 *     .query("users")
 *     .withIndex("by_token", q => q.eq("tokenIdentifier", identity.tokenIdentifier))
 *     .unique();
 *   if (!user) throw new Error("User not found");
 *   return user;
 */
export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  // TODO: replace with real auth
  throw new Error(
    "getCurrentUser is not implemented. Wire up Convex Auth and replace this function body."
  );
}

/**
 * Returns the currently authenticated user ID, or throws.
 * Convenience wrapper around getCurrentUser.
 */
export async function requireCurrentUserId(
  ctx: QueryCtx | MutationCtx
): Promise<Id<"users">> {
  const user = await getCurrentUser(ctx);
  return (user as any)._id;
}

// ─── Permission helpers ───────────────────────────────────────────────────────

/**
 * Throws if the given user is NOT a member of the given conversation.
 * Call this at the top of any function that accesses conversation data.
 */
export async function requireConversationMember(
  ctx: QueryCtx | MutationCtx,
  conversationId: Id<"conversations">,
  userId: Id<"users">
) {
  const membership = await ctx.db
    .query("conversationMembers")
    .withIndex("by_userId_and_conversationId", (q) =>
      q.eq("userId", userId).eq("conversationId", conversationId)
    )
    .unique();

  if (!membership) {
    throw new Error("Access denied: user is not a member of this conversation.");
  }
  return membership;
}

// ─── Timestamp helper ─────────────────────────────────────────────────────────

/** Returns current Unix timestamp in milliseconds. */
export function now(): number {
  return Date.now();
}

// ─── Pagination helper ────────────────────────────────────────────────────────

/** Default page size for paginated message queries. */
export const MESSAGE_PAGE_SIZE = 50;

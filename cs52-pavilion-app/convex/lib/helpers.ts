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

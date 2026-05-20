import { mutation } from "../../_generated/server";
import { v } from "convex/values";
import { now } from "../../lib/helpers";

const userPreferencesArgs = v.optional(
  v.object({
    theme: v.optional(
      v.union(v.literal("light"), v.literal("dark"), v.literal("system")),
    ),
    emailNotifications: v.optional(v.boolean()),
  }),
);

function pickUserProfilePatch(
  args: Record<string, unknown>,
): Record<string, unknown> {
  const keys = [
    "avatarUrl",
    "role",
    "location",
    "bio",
    "phone",
    "website",
    "responseTime",
    "preferences",
    "vendorId",
  ] as const;
  const patch: Record<string, unknown> = {};
  for (const key of keys) {
    if (args[key] !== undefined) patch[key] = args[key];
  }
  return patch;
}

export const createOrUpdateUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    avatarUrl: v.optional(v.string()),
    tokenIdentifier: v.optional(v.string()),
    role: v.optional(v.string()),
    location: v.optional(v.string()),
    bio: v.optional(v.string()),
    phone: v.optional(v.string()),
    website: v.optional(v.string()),
    responseTime: v.optional(v.string()),
    preferences: userPreferencesArgs,
    vendorId: v.optional(v.id("vendors")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    const profilePatch = pickUserProfilePatch(args as Record<string, unknown>);

    if (existing) {
      const patch: Record<string, unknown> = {
        name: args.name,
        lastSeenAt: now(),
        ...profilePatch,
      };
      if (args.tokenIdentifier !== undefined) {
        patch.tokenIdentifier = args.tokenIdentifier;
      }
      await ctx.db.patch(existing._id, patch);
      return existing._id;
    }

    return await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      ...(args.tokenIdentifier !== undefined && {
        tokenIdentifier: args.tokenIdentifier,
      }),
      createdAt: now(),
      lastSeenAt: now(),
      ...profilePatch,
    });
  },
});

export const updateProfile = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    role: v.optional(v.string()),
    location: v.optional(v.string()),
    bio: v.optional(v.string()),
    phone: v.optional(v.string()),
    website: v.optional(v.string()),
    responseTime: v.optional(v.string()),
    preferences: userPreferencesArgs,
    vendorId: v.optional(v.id("vendors")),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;
    const patch: Record<string, unknown> = {};
    if (updates.name !== undefined) patch.name = updates.name;
    Object.assign(patch, pickUserProfilePatch(updates as Record<string, unknown>));
    await ctx.db.patch(userId, patch);
  },
});

/** Assign or unassign a vendor company for a vendor-role user. */
export const assignVendor = mutation({
  args: {
    userId: v.id("users"),
    vendorId: v.union(v.id("vendors"), v.null()),
  },
  handler: async (ctx, { userId, vendorId }) => {
    const user = await ctx.db.get(userId);
    if (user === null) throw new Error(`User ${userId} not found`);
    await ctx.db.patch(userId, { vendorId: vendorId ?? undefined });
  },
});

export const updateLastSeen = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    await ctx.db.patch(userId, { lastSeenAt: now() });
  },
});

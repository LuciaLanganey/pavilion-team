import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { DEMO_PEOPLE } from "./lib/demoPeople";

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("people").collect();
  },
});

export const getById = query({
  args: { id: v.id("people") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    return await ctx.db
      .query("people")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("people").first();
    if (existing !== null) return { inserted: 0 as const };
    for (const person of DEMO_PEOPLE) {
      await ctx.db.insert("people", person);
    }
    return { inserted: DEMO_PEOPLE.length };
  },
});

export const clearAndReseed = mutation({
  args: {},
  handler: async (ctx) => {
    const allPeople = await ctx.db.query("people").collect();
    for (const person of allPeople) {
      await ctx.db.delete(person._id);
    }
    for (const person of DEMO_PEOPLE) {
      await ctx.db.insert("people", person);
    }
    return { inserted: DEMO_PEOPLE.length };
  },
});

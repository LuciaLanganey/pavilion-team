import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

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

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("people").collect();
    if (existing.length > 0) return;
    const fakePeople = [
      { name: "Larry Mar", email: "larry.mar@imperialdade.com", phone: "(408) 555-0192", website: "https://imperialdade.com", role: "Sales Representative", bio: "Larry specializes in janitorial and sanitation supplies with 8 years of experience.", location: "San Jose, CA", avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg", company: "Imperial Bag & Paper Co LLC" },
      { name: "Sarah Chen", email: "sarah.chen@imperialdade.com", phone: "(408) 555-0147", website: "https://imperialdade.com", role: "Account Manager", bio: "Sarah manages key accounts across the Bay Area, focusing on foodservice packaging.", location: "San Jose, CA", avatarUrl: "https://randomuser.me/api/portraits/women/44.jpg", company: "Imperial Bag & Paper Co LLC" },
      { name: "Marcus Johnson", email: "marcus.johnson@imperialdade.com", phone: "(408) 555-0183", website: "https://imperialdade.com", role: "Regional Director", bio: "Marcus oversees distribution partnerships across Northern California.", location: "San Francisco, CA", avatarUrl: "https://randomuser.me/api/portraits/men/67.jpg", company: "Imperial Bag & Paper Co LLC" },
      { name: "Priya Patel", email: "priya.patel@imperialdade.com", phone: "(408) 555-0261", website: "https://imperialdade.com", role: "Product Specialist", bio: "Priya focuses on medical housekeeping and healthcare-grade cleaning products.", location: "San Jose, CA", avatarUrl: "https://randomuser.me/api/portraits/women/68.jpg", company: "Imperial Bag & Paper Co LLC" },
    ];
    for (const person of fakePeople) {
      await ctx.db.insert("people", person);
    }
  },
});

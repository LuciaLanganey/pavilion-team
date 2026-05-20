import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const DEMO_VENDORS = [
  {
    name: "Office Depot",
    slug: "office-depot",
    activeContractCount: 142,
    location: "Boca Raton, FL (nationwide fulfillment)",
    specialties: [
      "Office supplies",
      "School supplies",
      "Technology",
      "Furniture",
      "Facilities maintenance",
    ],
    description:
      "National retailer with cooperative purchasing programs for education and public sector, including classroom essentials, printers, and workspace furniture.",
    responseTimeSummary: "Typically responds within 1 business day",
    offersGovernmentPricing: true,
  },
  {
    name: "Global Industrial",
    slug: "global-industrial",
    activeContractCount: 89,
    location: "Port Washington, NY",
    specialties: [
      "Material handling",
      "Storage and shelving",
      "Safety equipment",
      "Maintenance and repair",
      "Janitorial supplies",
    ],
    description:
      "Industrial supply partner focused on warehouses, schools, and municipal facilities with volume pricing on MRO and safety categories.",
    responseTimeSummary: "Usually within 24–48 hours",
    offersGovernmentPricing: true,
  },
  {
    name: "Demco",
    slug: "demco",
    activeContractCount: 56,
    location: "Madison, WI",
    specialties: [
      "Library supplies",
      "School supplies",
      "STEM and makerspace",
      "Learning furniture",
      "Early childhood",
    ],
    description:
      "Education-focused supplier serving libraries and K–12 with curriculum support, learning environments, and literacy programs.",
    responseTimeSummary: "Often same-day on active bids",
    offersGovernmentPricing: true,
  },
];

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("vendors").collect();
  },
});

export const getById = query({
  args: { id: v.id("vendors") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("vendors")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});

/** Clears vendor rows and inserts demo data (fixes legacy URL-shaped rows too). */
export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("vendors").collect();
    for (const doc of existing) {
      await ctx.db.delete(doc._id);
    }
    for (const row of DEMO_VENDORS) {
      await ctx.db.insert("vendors", row);
    }
  },
});

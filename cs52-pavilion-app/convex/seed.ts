import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { DEMO_PEOPLE } from "./lib/demoPeople";

function avatarUrlFor(name: string) {
  const seed = encodeURIComponent(name);
  return `https://api.dicebear.com/7.x/avataa/svg?seed=${seed}`;
}

function demoProfileForUser(args: { name: string; variant: number; userRole?: "vendor" | "buyer" }) {
  const { name, variant, userRole } = args;
  const roles = [
    "Government Contracts Manager",
    "Public Sector Sales Lead",
    "RFP Specialist",
    "Cloud Solutions Architect",
    "Senior Estimator",
    "Logistics Coordinator",
    "Cybersecurity Consultant",
    "Supply Chain Director",
    "Strategic Sourcing Manager",
    "Trade Compliance Officer",
    "Digital Transformation Lead",
    "Bulk Purchasing Coordinator",
  ];
  const cities = [
    "Sacramento, CA",
    "Washington, DC",
    "Austin, TX",
    "San Francisco, CA",
    "Sacramento, CA",
    "Los Angeles, CA",
    "San Francisco, CA",
    "Chicago, IL",
    "New York, NY",
    "Seattle, WA",
    "Denver, CO",
    "Phoenix, AZ",
  ];
  const firstName = name.split(" ")[0];
  const bios = [
    "Managing state and local government contracts and compliance.",
    "Helping agencies find the right solutions through competitive bidding.",
    "Specialist in responding to RFPs and navigating procurement portals.",
    `${firstName} designs secure cloud environments for state agencies and municipalities.`,
    `${firstName} specializes in cost estimation and bidding for municipal infrastructure projects.`,
    `${firstName} ensures timely delivery of emergency medical supplies to county hospitals.`,
    `${firstName} helps local governments implement zero-trust security architectures and compliance.`,
    `${firstName} specializes in logistics and supply chain optimization for large-scale vendors.`,
    `${firstName} focuses on strategic sourcing and vendor relationship management.`,
    `${firstName} manages trade compliance and cross-border procurement operations.`,
    `${firstName} oversees digital transformation initiatives for public sector procurement.`,
    `${firstName} coordinates bulk purchasing and distribution for municipal agencies.`,
  ];
  let phone: string | undefined = undefined;
  if (name === "Shrey") phone = "6692844460";
  if (name === "Tara") phone = "9162185896";
  if (name === "Isha") phone = "4109883883";
  if (name === "Jess") phone = "6505099069";

  const responseTimes = [
    "Usually within 1 hour",
    "Within a few hours",
    "Same day",
  ];
  const themes = ["light", "dark", "system"] as const;
  const i = variant % roles.length;
  const slug = name.replace(/\s+/g, "-").toLowerCase();

  const baseProfile = {
    avatarUrl: avatarUrlFor(name),
    role: roles[i],
    location: cities[i],
    bio: bios[i],
    ...(phone ? { phone } : {}),
    website: `https://pavilion.example/u/${slug}`,
    responseTime: responseTimes[i],
    preferences: {
      theme: themes[i],
      emailNotifications: i !== 1,
    },
  };

  if (userRole === "vendor") {
    const companyNames = [
      "GovTech Solutions Inc.",
      "BuildRight Construction Corp.",
      "MedSupply Government Division",
    ];
    const companyDescriptions = [
      "Providing modern IT infrastructure and cloud software solutions for local governments.",
      "Specializing in large-scale public works and infrastructure construction projects.",
      "Supplying state health departments with critical medical and emergency equipment.",
    ];
    return {
      ...baseProfile,
      companyName: companyNames[i],
      companyDescription: companyDescriptions[i],
    };
  }

  return baseProfile;
}

/**
 * Fills profile columns on existing users. Skips users who already have `phone`
 * set unless `overwrite` is true. Run:
 *   npx convex run seed:backfillUserProfiles
 *   npx convex run seed:backfillUserProfiles '{"overwrite":true}'
 */
export const backfillUserProfiles = mutation({
  args: { overwrite: v.optional(v.boolean()) },
  handler: async (ctx, { overwrite }) => {
    const users = await ctx.db.query("users").collect();
    let patched = 0;
    for (let i = 0; i < users.length; i++) {
      const u = users[i];
      if (!overwrite && u.phone !== undefined) continue;
      const profile = demoProfileForUser({
        name: u.name,
        variant: i,
        userRole: u.userRole as "vendor" | "buyer",
      });
      await ctx.db.patch(u._id, profile);
      patched++;
    }
    return { patched, total: users.length };
  },
});

/**
 * Idempotent demo data for local Convex. Run:
 *   npx convex run seed:seedDemoData
 */
export const seedDemoData = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "ssanand@stanford.edu"))
      .unique();
    if (existing) {
      let peopleInserted = 0;
      if ((await ctx.db.query("people").first()) === null) {
        for (const person of DEMO_PEOPLE) {
          await ctx.db.insert("people", person);
          peopleInserted++;
        }
      }
      return {
        skipped: true as const,
        message: "Demo data already present.",
        peopleInserted,
      };
    }

    const timestamp = Date.now();

    const aliceId = await ctx.db.insert("users", {
      name: "Shrey",
      email: "ssanand@stanford.edu",
      createdAt: timestamp - 86400000 * 7,
      lastSeenAt: timestamp - 60000,
      username: "shrey",
      userRole: "vendor",
      ...demoProfileForUser({ name: "Shrey", variant: 0, userRole: "vendor" }),
    });

    const bobId = await ctx.db.insert("users", {
      name: "Tara",
      email: "taralyn@stanford.edu",
      createdAt: timestamp - 86400000 * 5,
      lastSeenAt: timestamp - 3600000,
      username: "tara",
      userRole: "buyer",
      ...demoProfileForUser({ name: "Tara", variant: 1, userRole: "buyer" }),
    });

    const carolId = await ctx.db.insert("users", {
      name: "Isha",
      email: "ishaanb@stanford.edu",
      createdAt: timestamp - 86400000 * 3,
      lastSeenAt: timestamp - 7200000,
      username: "isha",
      userRole: "buyer",
      ...demoProfileForUser({ name: "Isha", variant: 2, userRole: "buyer" }),
    });

    const jessId = await ctx.db.insert("users", {
      name: "Jess",
      email: "jessicawjsu5@stanford.edu",
      createdAt: timestamp - 86400000 * 2,
      lastSeenAt: timestamp - 3600000,
      username: "jess",
      userRole: "vendor",
      ...demoProfileForUser({ name: "Jess", variant: 3, userRole: "vendor" }),
    });

    const dmId = await ctx.db.insert("conversations", {
      isGroup: false,
      createdBy: aliceId,
      createdAt: timestamp - 86400000 * 2,
      lastMessageAt: timestamp - 300000,
      lastMessagePreview: "Sounds good, see you then!",
    });

    await ctx.db.insert("conversationMembers", {
      conversationId: dmId,
      userId: aliceId,
      joinedAt: timestamp - 86400000 * 2,
      role: "admin",
    });
    await ctx.db.insert("conversationMembers", {
      conversationId: dmId,
      userId: bobId,
      joinedAt: timestamp - 86400000 * 2,
      role: "member",
    });

    const dm1 = await ctx.db.insert("messages", {
      conversationId: dmId,
      senderId: aliceId,
      content: "Hey Tara! Are you free for a call tomorrow at 2pm?",
      contentType: "text",
      createdAt: timestamp - 86400000,
      isDeleted: false,
    });
    const dm2 = await ctx.db.insert("messages", {
      conversationId: dmId,
      senderId: bobId,
      content: "Yes, that works for me! What do you want to discuss?",
      contentType: "text",
      createdAt: timestamp - 82800000,
      isDeleted: false,
    });
    const dm3 = await ctx.db.insert("messages", {
      conversationId: dmId,
      senderId: aliceId,
      content: "The new feature rollout. I'll send you the doc beforehand.",
      contentType: "text",
      createdAt: timestamp - 79200000,
      isDeleted: false,
    });
    await ctx.db.insert("messages", {
      conversationId: dmId,
      senderId: bobId,
      content: "Sounds good, see you then!",
      contentType: "text",
      createdAt: timestamp - 300000,
      isDeleted: false,
    });

    void dm1;
    void dm2;

    await ctx.db.insert("messageReads", {
      conversationId: dmId,
      userId: aliceId,
      lastReadMessageId: dm3,
      lastReadAt: timestamp - 79000000,
    });

    const groupId = await ctx.db.insert("conversations", {
      title: "Product Team",
      isGroup: true,
      createdBy: aliceId,
      createdAt: timestamp - 86400000 * 4,
      lastMessageAt: timestamp - 1800000,
      lastMessagePreview: "Isha: I'll have the designs ready by EOD",
    });

    await ctx.db.insert("conversationMembers", {
      conversationId: groupId,
      userId: aliceId,
      joinedAt: timestamp - 86400000 * 4,
      role: "admin",
    });
    await ctx.db.insert("conversationMembers", {
      conversationId: groupId,
      userId: bobId,
      joinedAt: timestamp - 86400000 * 4,
      role: "member",
    });
    await ctx.db.insert("conversationMembers", {
      conversationId: groupId,
      userId: carolId,
      joinedAt: timestamp - 86400000 * 3,
      role: "member",
    });

    await ctx.db.insert("messages", {
      conversationId: groupId,
      senderId: aliceId,
      content: "Welcome to the Product Team channel!",
      contentType: "text",
      createdAt: timestamp - 86400000 * 4,
      isDeleted: false,
    });
    await ctx.db.insert("messages", {
      conversationId: groupId,
      senderId: bobId,
      content: "Thanks Shrey! Excited to be here.",
      contentType: "text",
      createdAt: timestamp - 86400000 * 3,
      isDeleted: false,
    });
    await ctx.db.insert("messages", {
      conversationId: groupId,
      senderId: carolId,
      content: "I'll have the designs ready by EOD",
      contentType: "text",
      createdAt: timestamp - 1800000,
      isDeleted: false,
    });

    let peopleInserted = 0;
    if ((await ctx.db.query("people").first()) === null) {
      for (const person of DEMO_PEOPLE) {
        await ctx.db.insert("people", person);
        peopleInserted++;
      }
    }

    return {
      skipped: false as const,
      aliceId,
      bobId,
      carolId,
      dmId,
      groupId,
      peopleInserted,
    };
  },
});

export const seedExtraUsers = mutation({
  args: {},
  handler: async (ctx) => {
    const timestamp = Date.now();
    const extraUsers = [
      {
        name: "Jordan Blake",
        email: "jordan.blake@supplyhub.com",
        createdAt: timestamp - 86400000 * 10,
        lastSeenAt: timestamp - 3600000,
        username: "jordan_blake",
        userRole: "vendor" as const,
        ...demoProfileForUser({ name: "Jordan Blake", variant: 7, userRole: "vendor" }),
        avatarUrl: "https://randomuser.me/api/portraits/men/11.jpg",
      },
      {
        name: "Aisha Okonkwo",
        email: "aisha.okonkwo@marketbridge.io",
        createdAt: timestamp - 86400000 * 8,
        lastSeenAt: timestamp - 7200000,
        username: "aisha_okw",
        userRole: "buyer" as const,
        ...demoProfileForUser({ name: "Aisha Okonkwo", variant: 8, userRole: "buyer" }),
        avatarUrl: "https://randomuser.me/api/portraits/women/23.jpg",
      },
      {
        name: "Derek Nguyen",
        email: "derek.nguyen@tradeflow.com",
        createdAt: timestamp - 86400000 * 6,
        lastSeenAt: timestamp - 1800000,
        username: "dereknguyen92",
        userRole: "vendor" as const,
        ...demoProfileForUser({ name: "Derek Nguyen", variant: 9, userRole: "vendor" }),
        avatarUrl: "https://randomuser.me/api/portraits/men/45.jpg",
      },
      {
        name: "Sofia Reyes",
        email: "sofia.reyes@shopcraft.co",
        createdAt: timestamp - 86400000 * 4,
        lastSeenAt: timestamp - 600000,
        username: "sofia_crafts",
        userRole: "buyer" as const,
        ...demoProfileForUser({ name: "Sofia Reyes", variant: 10, userRole: "buyer" }),
        avatarUrl: "https://randomuser.me/api/portraits/women/55.jpg",
      },
      {
        name: "Eli Thornton",
        email: "eli.thornton@bulkdirect.net",
        createdAt: timestamp - 86400000 * 2,
        lastSeenAt: timestamp - 900000,
        username: "eli_thornton",
        userRole: "vendor" as const,
        ...demoProfileForUser({ name: "Eli Thornton", variant: 11, userRole: "vendor" }),
        avatarUrl: "https://randomuser.me/api/portraits/men/78.jpg",
      },
      {
        name: "Daniel Kim",
        email: "dkim@govtechsolutions.com",
        createdAt: timestamp - 86400000 * 1,
        lastSeenAt: timestamp - 300000,
        username: "daniel_kim",
        userRole: "vendor" as const,
        ...demoProfileForUser({ name: "Daniel Kim", variant: 3, userRole: "vendor" }),
      },
      {
        name: "Elena Rodriguez",
        email: "erodriguez@buildrightcorp.com",
        createdAt: timestamp - 86400000 * 1.5,
        lastSeenAt: timestamp - 400000,
        username: "elena_rodriguez",
        userRole: "vendor" as const,
        ...demoProfileForUser({ name: "Elena Rodriguez", variant: 4, userRole: "vendor" }),
      },
      {
        name: "Michael Chang",
        email: "mchang@medsupplygov.com",
        createdAt: timestamp - 86400000 * 2.5,
        lastSeenAt: timestamp - 500000,
        username: "michael_chang",
        userRole: "vendor" as const,
        ...demoProfileForUser({ name: "Michael Chang", variant: 5, userRole: "vendor" }),
      },
      {
        name: "Rachel Foster",
        email: "rfoster@govtechsolutions.com",
        createdAt: timestamp - 86400000 * 3.5,
        lastSeenAt: timestamp - 600000,
        username: "rachel_foster",
        userRole: "vendor" as const,
        ...demoProfileForUser({ name: "Rachel Foster", variant: 6, userRole: "vendor" }),
      },
    ];

    const inserted: string[] = [];
    for (const user of extraUsers) {
      const exists = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", user.email))
        .unique();
      if (!exists) {
        await ctx.db.insert("users", user);
        inserted.push(user.email);
      }
    }
    return { inserted };
  },
});

export const clearAndReseedExtraUsers = mutation({
  args: {},
  handler: async (ctx) => {
    const allUsers = await ctx.db.query("users").collect();
    // Keep Alice, Bob, Carol, delete the rest to reseed cleanly
    const keepEmails = ["ssanand@stanford.edu", "taralyn@stanford.edu", "ishaanb@stanford.edu", "jessicawjsu5@stanford.edu"];
    for (const user of allUsers) {
      if (!keepEmails.includes(user.email)) {
        await ctx.db.delete(user._id);
      }
    }
    
    // Also clear the people table to reseed it cleanly
    const allPeople = await ctx.db.query("people").collect();
    for (const person of allPeople) {
      await ctx.db.delete(person._id);
    }
    for (const person of DEMO_PEOPLE) {
      await ctx.db.insert("people", person);
    }
    
    // Now call the logic from seedExtraUsers
    const timestamp = Date.now();
    const extraUsers = [
      {
        name: "Jordan Blake",
        email: "jordan.blake@supplyhub.com",
        createdAt: timestamp - 86400000 * 10,
        lastSeenAt: timestamp - 3600000,
        username: "jordan_blake",
        userRole: "vendor" as const,
        ...demoProfileForUser({ name: "Jordan Blake", variant: 7, userRole: "vendor" }),
        avatarUrl: "https://randomuser.me/api/portraits/men/11.jpg",
      },
      {
        name: "Aisha Okonkwo",
        email: "aisha.okonkwo@marketbridge.io",
        createdAt: timestamp - 86400000 * 8,
        lastSeenAt: timestamp - 7200000,
        username: "aisha_okw",
        userRole: "buyer" as const,
        ...demoProfileForUser({ name: "Aisha Okonkwo", variant: 8, userRole: "buyer" }),
        avatarUrl: "https://randomuser.me/api/portraits/women/23.jpg",
      },
      {
        name: "Derek Nguyen",
        email: "derek.nguyen@tradeflow.com",
        createdAt: timestamp - 86400000 * 6,
        lastSeenAt: timestamp - 1800000,
        username: "dereknguyen92",
        userRole: "vendor" as const,
        ...demoProfileForUser({ name: "Derek Nguyen", variant: 9, userRole: "vendor" }),
        avatarUrl: "https://randomuser.me/api/portraits/men/45.jpg",
      },
      {
        name: "Sofia Reyes",
        email: "sofia.reyes@shopcraft.co",
        createdAt: timestamp - 86400000 * 4,
        lastSeenAt: timestamp - 600000,
        username: "sofia_crafts",
        userRole: "buyer" as const,
        ...demoProfileForUser({ name: "Sofia Reyes", variant: 10, userRole: "buyer" }),
        avatarUrl: "https://randomuser.me/api/portraits/women/55.jpg",
      },
      {
        name: "Eli Thornton",
        email: "eli.thornton@bulkdirect.net",
        createdAt: timestamp - 86400000 * 2,
        lastSeenAt: timestamp - 900000,
        username: "eli_thornton",
        userRole: "vendor" as const,
        ...demoProfileForUser({ name: "Eli Thornton", variant: 11, userRole: "vendor" }),
        avatarUrl: "https://randomuser.me/api/portraits/men/78.jpg",
      },
      {
        name: "Daniel Kim",
        email: "dkim@govtechsolutions.com",
        createdAt: timestamp - 86400000 * 1,
        lastSeenAt: timestamp - 300000,
        username: "daniel_kim",
        userRole: "vendor" as const,
        ...demoProfileForUser({ name: "Daniel Kim", variant: 3, userRole: "vendor" }),
      },
      {
        name: "Elena Rodriguez",
        email: "erodriguez@buildrightcorp.com",
        createdAt: timestamp - 86400000 * 1.5,
        lastSeenAt: timestamp - 400000,
        username: "elena_rodriguez",
        userRole: "vendor" as const,
        ...demoProfileForUser({ name: "Elena Rodriguez", variant: 4, userRole: "vendor" }),
      },
      {
        name: "Michael Chang",
        email: "mchang@medsupplygov.com",
        createdAt: timestamp - 86400000 * 2.5,
        lastSeenAt: timestamp - 500000,
        username: "michael_chang",
        userRole: "vendor" as const,
        ...demoProfileForUser({ name: "Michael Chang", variant: 5, userRole: "vendor" }),
      },
      {
        name: "Rachel Foster",
        email: "rfoster@govtechsolutions.com",
        createdAt: timestamp - 86400000 * 3.5,
        lastSeenAt: timestamp - 600000,
        username: "rachel_foster",
        userRole: "vendor" as const,
        ...demoProfileForUser({ name: "Rachel Foster", variant: 6, userRole: "vendor" }),
      },
    ];

    const inserted: string[] = [];
    for (const user of extraUsers) {
      await ctx.db.insert("users", user);
      inserted.push(user.email);
    }
    return { inserted };
  },
});
export const clearAll = mutation({
  args: {},
  handler: async (ctx) => {
    for (const table of ["users", "people", "conversations", "conversationMembers", "messages", "messageReads"] as const) {
      const items = await ctx.db.query(table).collect();
      for (const item of items) {
        await ctx.db.delete(item._id);
      }
    }
  }
});

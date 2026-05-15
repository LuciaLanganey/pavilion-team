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
  ];
  const cities = [
    "Sacramento, CA",
    "Washington, DC",
    "Austin, TX",
  ];
  const bios = [
    "Managing state and local government contracts and compliance.",
    "Helping agencies find the right solutions through competitive bidding.",
    "Specialist in responding to RFPs and navigating procurement portals.",
  ];
  const phones = ["+1 (415) 555-0101", "+1 (512) 555-0142", "+1 (206) 555-0198"];
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
    phone: phones[i],
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
      .withIndex("by_email", (q) => q.eq("email", "alice@example.com"))
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
      name: "Alice Chen",
      email: "alice@example.com",
      createdAt: timestamp - 86400000 * 7,
      lastSeenAt: timestamp - 60000,
      username: "alice_chen",
      userRole: "vendor",
      ...demoProfileForUser({ name: "Alice Chen", variant: 0, userRole: "vendor" }),
    });

    const bobId = await ctx.db.insert("users", {
      name: "Bob Martinez",
      email: "bob@example.com",
      createdAt: timestamp - 86400000 * 5,
      lastSeenAt: timestamp - 3600000,
      username: "bob_martinez",
      userRole: "buyer",
      ...demoProfileForUser({ name: "Bob Martinez", variant: 1, userRole: "buyer" }),
    });

    const carolId = await ctx.db.insert("users", {
      name: "Carol Kim",
      email: "carol@example.com",
      createdAt: timestamp - 86400000 * 3,
      lastSeenAt: timestamp - 7200000,
      username: "carol_kim",
      userRole: "buyer",
      ...demoProfileForUser({ name: "Carol Kim", variant: 2, userRole: "buyer" }),
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
      content: "Hey Bob! Are you free for a call tomorrow at 2pm?",
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
      lastMessagePreview: "Carol: I'll have the designs ready by EOD",
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
      content: "Thanks Alice! Excited to be here.",
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
        avatarUrl: "https://randomuser.me/api/portraits/men/11.jpg",
        createdAt: timestamp - 86400000 * 10,
        lastSeenAt: timestamp - 3600000,
        username: "jordan_blake",
        userRole: "vendor" as const,
      },
      {
        name: "Aisha Okonkwo",
        email: "aisha.okonkwo@marketbridge.io",
        avatarUrl: "https://randomuser.me/api/portraits/women/23.jpg",
        createdAt: timestamp - 86400000 * 8,
        lastSeenAt: timestamp - 7200000,
        username: "aisha_okw",
        userRole: "buyer" as const,
      },
      {
        name: "Derek Nguyen",
        email: "derek.nguyen@tradeflow.com",
        avatarUrl: "https://randomuser.me/api/portraits/men/45.jpg",
        createdAt: timestamp - 86400000 * 6,
        lastSeenAt: timestamp - 1800000,
        username: "dereknguyen92",
        userRole: "vendor" as const,
      },
      {
        name: "Sofia Reyes",
        email: "sofia.reyes@shopcraft.co",
        avatarUrl: "https://randomuser.me/api/portraits/women/55.jpg",
        createdAt: timestamp - 86400000 * 4,
        lastSeenAt: timestamp - 600000,
        username: "sofia_crafts",
        userRole: "buyer" as const,
      },
      {
        name: "Eli Thornton",
        email: "eli.thornton@bulkdirect.net",
        avatarUrl: "https://randomuser.me/api/portraits/men/78.jpg",
        createdAt: timestamp - 86400000 * 2,
        lastSeenAt: timestamp - 900000,
        username: "eli_thornton",
        userRole: "vendor" as const,
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

export const migrateSellerToBuyer = mutation({
  args: {},
  handler: async (ctx) => {
    const allUsers = await ctx.db.query("users").collect();
    let patched = 0;
    for (const user of allUsers) {
      if ((user.userRole as string) === "seller") {
        await ctx.db.patch(user._id, { userRole: "buyer" });
        patched++;
      }
    }
    return { patched };
  },
});

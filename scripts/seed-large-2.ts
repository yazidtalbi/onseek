import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { config } from "dotenv";
import { resolve } from "node:path";

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const users = [
  { email: "nadia@onseek.co", username: "nadia_crafts", displayName: "Nadia Fontaine", bio: "Handmade jewellery designer always on the hunt." },
  { email: "omar@onseek.co", username: "omar_vintage", displayName: "Omar Benali", bio: "Vintage electronics and hi-fi audio obsessive." },
  { email: "priya@onseek.co", username: "priya_textiles", displayName: "Priya Sharma", bio: "Textile researcher and slow-fashion advocate." },
  { email: "felix@onseek.co", username: "felix_records", displayName: "Félix Morin", bio: "Vinyl collector since 1998. Jazz and soul only." },
  { email: "yuki@onseek.co", username: "yuki_ceramics", displayName: "Yuki Tanaka", bio: "Studio potter looking for rare kiln equipment." },
  { email: "rafael@onseek.co", username: "rafael_bikes", displayName: "Rafael Costa", bio: "Cycling enthusiast restoring classic road bikes." },
  { email: "amara@onseek.co", username: "amara_beauty", displayName: "Amara Diallo", bio: "Skincare formulator and indie beauty buyer." },
  { email: "theo@onseek.co", username: "theo_watches", displayName: "Théo Leclerc", bio: "Independent watchmaker fascinated by horology." },
  { email: "kate@onseek.co", username: "kate_plants", displayName: "Kate Nowak", bio: "Plant parent with 200+ species at home." },
  { email: "sven@onseek.co", username: "sven_woodwork", displayName: "Sven Eriksson", bio: "Furniture restorer and hand-tool woodworker." },
  { email: "ines@onseek.co", username: "ines_fashion", displayName: "Inès Beaumont", bio: "Stylist hunting for deadstock fabric and archive pieces." },
  { email: "leo@onseek.co", username: "leo_gaming", displayName: "Leo Marchetti", bio: "Retro games and console modder based in Milan." },
  { email: "zara@onseek.co", username: "zara_cook", displayName: "Zara Ahmed", bio: "Home chef obsessed with authentic ingredients." },
  { email: "hugo@onseek.co", username: "hugo_photo", displayName: "Hugo Dupont", bio: "Film photographer and darkroom enthusiast." },
  { email: "mia@onseek.co", username: "mia_jewelry", displayName: "Mia Kowalski", bio: "Goldsmith looking for rare gemstones and tools." },
];

const requestTemplates = [
  // Music & Audio
  { title: "Technics SL-1200 MK2 Turntable", country: "Japan", budget_max: 900, category: "Tech", prefs: ["Fully working", "Original dust cover"], deals: ["Scratched platter", "Broken tonearm"], condition: "Used" },
  { title: "Stax SR-009 Electrostatic Headphones", country: "Japan", budget_max: 3500, category: "Tech", prefs: ["With original case"], condition: "Used" },
  { title: "Fender Jazz Bass 1965 Original", country: "USA", budget_max: 15000, category: "Collectibles", prefs: ["Matching headstock", "Original pickups"], deals: ["Refin", "Non-original neck"], condition: "Used" },

  // Photography
  { title: "Leica M3 Double Stroke", country: "Germany", budget_max: 1800, category: "Tech", prefs: ["Clean viewfinder", "Working meter"], deals: ["Haze on lens", "Brassing"], condition: "Used" },
  { title: "Hasselblad 500C/M with 80mm Planar", country: "Sweden", budget_max: 2200, category: "Tech", prefs: ["Recent CLA", "Film back included"], condition: "Used" },
  { title: "Darkroom enlarger Durst M670", category: "Tech", budget_max: 350, prefs: ["All lenses included", "Working light head"], condition: "Used" },

  // Cycling
  { title: "Colnago C40 Carbon Road Bike", country: "Italy", budget_max: 3000, category: "Sports", prefs: ["Size 54 or 56", "Campagnolo groupset"], deals: ["Cracked carbon", "Repainted"], condition: "Used" },
  { title: "Brooks B17 Leather Saddle NOS", budget_max: 120, category: "Sports", prefs: ["Honey colour", "Never mounted"], condition: "New" },
  { title: "Campagnolo Record 10-speed groupset", budget_max: 400, category: "Sports", prefs: ["Complete set", "Minimal wear"], condition: "Used" },

  // Ceramics & Craft
  { title: "Skutt KM-1227 Kiln", country: "USA", budget_max: 2000, category: "Home & Living", prefs: ["Working elements", "Digital controller"], condition: "Used" },
  { title: "Japanese Shino glazed tea bowl Chawan", country: "Japan", budget_max: 500, category: "Collectibles", prefs: ["Signed by artist", "With box"], condition: "Used" },
  { title: "Wheel-thrown porcelain dinner set", category: "Home & Living", budget_max: 300, prefs: ["6-person", "Matte glaze"], condition: "New" },

  // Watches
  { title: "Omega Speedmaster Professional Pre-Moon", country: "Switzerland", budget_max: 6000, category: "Collectibles", prefs: ["Calibre 321", "Tropical dial"], deals: ["Polished case", "Non-original bracelet"], condition: "Used" },
  { title: "Rolex Datejust 1601 1970s", country: "Switzerland", budget_max: 8000, category: "Collectibles", prefs: ["Original dial", "Papers preferred"], condition: "Used" },
  { title: "Seiko 6105-8110 Diver Vintage", country: "Japan", budget_max: 1000, category: "Collectibles", prefs: ["Signed crown", "Full kit"], condition: "Used" },

  // Food & Ingredients
  { title: "Saffron Threads Grade 1 Kashmiri", country: "India", budget_max: 80, category: "General", prefs: ["Dark red stigmas", "Tested ISO certified"], condition: "New" },
  { title: "Aged Parmigiano Reggiano 36 months", country: "Italy", budget_max: 60, category: "General", prefs: ["Producer stamped rind"], condition: "New" },
  { title: "White truffle fresh Tuber Magnatum", country: "Italy", budget_max: 400, category: "General", prefs: ["Minimum 50g", "Same-day harvest"], condition: "New" },

  // Plants
  { title: "Variegated Monstera Albo Borsigiana", country: "Netherlands", budget_max: 250, category: "Garden", prefs: ["High variegation", "Healthy roots"], deals: ["Yellowing leaves", "Rot"], condition: "Either" },
  { title: "Hoya Ruthiae rare species", budget_max: 90, category: "Garden", prefs: ["Rooted cutting", "At least 3 nodes"], condition: "Either" },

  // Woodworking
  { title: "Lie-Nielsen No. 4.5 Bench Plane", budget_max: 350, category: "Office", prefs: ["Bronze body preferred", "Unused or lightly used"], condition: "Either" },
];

const proposalNotes = [
  "Found exactly what you described! Great condition and seller has good feedback.",
  "This might be a great match — price is firm but there's room to negotiate shipping.",
  "I spotted this one yesterday, grabbed the link before it disappeared. Looks legit.",
  "Checked it in person, it's exactly as described. Highly recommend.",
  "The seller is open to offers. Send them a message mentioning Onseek.",
  "I own the same model — if this listing sells I can put you in touch with my contact.",
  "This one is local pickup only but the price makes up for it.",
  "Reached out to the seller, they still have it available. Move fast!",
  "Not 100% perfect but very close to what you're after at a great price point.",
  "Authenticated by a specialist — provenance is solid on this one.",
];

function generateSlug(title: string, id: string): string {
  const shortId = id.replace(/-/g, "").substring(0, 8);
  const cleanTitle = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${shortId}-${cleanTitle}`;
}

function randomNote(): string {
  return proposalNotes[Math.floor(Math.random() * proposalNotes.length)];
}

async function seedLarge2() {
  console.log("🚀 Starting LARGE-2 database seed...\n");

  const userIds: string[] = [];

  // Create / upsert users
  for (const user of users) {
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users.find((u) => u.email === user.email);
    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
      console.log(`  ↩ User already exists: ${user.email}`);
    } else {
      const { data: authData, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: "password123",
        email_confirm: true,
        user_metadata: { username: user.username, full_name: user.displayName },
      });
      if (error || !authData?.user) {
        console.error(`  ✗ Failed to create ${user.email}:`, error?.message);
        continue;
      }
      userId = authData.user.id;
      console.log(`  ✓ Created user: ${user.email}`);
    }

    userIds.push(userId);

    await supabase.from("profiles").upsert({
      id: userId,
      username: user.username,
      display_name: user.displayName,
      bio: user.bio,
      onboarding_completed: true,
      reputation: Math.floor(Math.random() * 120) + 5,
    });
  }

  console.log(`\n👥 ${userIds.length} users ready.\n`);

  // Create 40 requests (cycling through the 20 templates twice)
  for (let i = 0; i < 40; i++) {
    const template = requestTemplates[i % requestTemplates.length];
    const requesterId = userIds[Math.floor(Math.random() * userIds.length)];
    const requestId = randomUUID();
    const title = template.title;
    const slug = generateSlug(title, requestId);

    const extras = [
      "I have been searching for months and haven't found the right one.",
      "This is for a personal project I've been working on all year.",
      "Happy to pay a fair price for something in genuine good condition.",
      "Please reach out if you have leads — even partial matches help!",
      "Prefer to buy from EU/UK but open to international if shipping is reasonable.",
    ];
    const description = `Looking for ${title}. ${extras[i % extras.length]} Budget is around ${template.budget_max ?? "open"}.`;

    const preferencesMetadata = {
      priceLock: Math.random() > 0.75 ? "locked" : "open",
      exactItem: Math.random() > 0.6,
      exactSpecification: Math.random() > 0.4,
      exactPrice: false,
      preferences: (template.prefs || []).map((p) => ({ label: p, note: "Preferred" })),
      dealbreakers: (template.deals || []).map((d) => ({ label: d, note: "Dealbreaker" })),
      editedFields: [],
    };

    const descriptionWithMetadata = `${description}\n\n<!--REQUEST_PREFS:${JSON.stringify(preferencesMetadata)}-->`;

    const { data: request, error: requestError } = await supabase
      .from("requests")
      .insert({
        id: requestId,
        user_id: requesterId,
        title,
        slug,
        description: descriptionWithMetadata,
        category: template.category ?? "General",
        budget_max: template.budget_max ?? null,
        country: template.country ?? null,
        condition: template.condition ?? "Either",
        status: "open",
        is_seeded: true,
        created_at: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (requestError) {
      console.error(`  ✗ Request failed [${i + 1}/40]: ${title} — ${requestError.message}`);
      continue;
    }
    console.log(`  ✓ Created [${i + 1}/40]: ${title}`);

    // Proposals (1–6)
    const numProposals = Math.floor(Math.random() * 6) + 1;
    let topVotes = -1;
    let winnerSubId: string | null = null;

    for (let j = 0; j < numProposals; j++) {
      const proposerId = userIds[Math.floor(Math.random() * userIds.length)];
      if (proposerId === requesterId) continue;

      const price = template.budget_max
        ? Math.floor(template.budget_max * (0.65 + Math.random() * 0.6))
        : Math.floor(50 + Math.random() * 200);

      const { data: sub, error: subError } = await supabase
        .from("submissions")
        .insert({
          request_id: requestId,
          user_id: proposerId,
          article_name: `${title.substring(0, 30)} — option ${j + 1}`,
          url: `https://example.com/item-${requestId.substring(0, 6)}-${j}`,
          price,
          shipping_cost: Math.random() > 0.4 ? parseFloat((Math.random() * 20).toFixed(2)) : 0,
          notes: randomNote(),
          is_seeded: true,
        })
        .select()
        .single();

      if (subError || !sub) continue;

      // Upvotes
      const upvotes = Math.floor(Math.random() * 12);
      for (let v = 0; v < upvotes; v++) {
        const voter = userIds[Math.floor(Math.random() * userIds.length)];
        try {
          await supabase.from("votes").insert({ submission_id: sub.id, user_id: voter, vote: 1 });
        } catch (_) {}
      }

      if (upvotes > topVotes) {
        topVotes = upvotes;
        winnerSubId = sub.id;
      }
    }

    // ~25% chance to mark as solved
    if (Math.random() < 0.25 && winnerSubId) {
      await supabase
        .from("requests")
        .update({ status: "solved", winner_submission_id: winnerSubId })
        .eq("id", requestId);
      console.log(`    🏆 Marked as solved`);
    }
  }

  console.log("\n🎉 LARGE-2 seed completed successfully!");
  console.log("\nTest credentials (all use password123):");
  users.forEach((u) => console.log(`  ${u.displayName} — ${u.email}`));
}

seedLarge2().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});

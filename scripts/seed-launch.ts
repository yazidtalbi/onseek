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
  console.error("Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const launchUsers = [
  { email: "requester@onseek.co", password: "password123", username: "alex_requester", displayName: "Alex Johnson", bio: "Always looking for rare vintage pieces." },
  { email: "proposer1@onseek.co", password: "password123", username: "sam_proposer", displayName: "Sam Smith", bio: "Expert in sustainable fashion and vintage finds." },
  { email: "proposer2@onseek.co", password: "password123", username: "jamie_proposer", displayName: "Jamie Lee", bio: "I spend my weekends hunting for unique items." },
];

function generateSlug(title: string, id: string): string {
  const shortId = id.replace(/-/g, "").substring(0, 8);
  const cleanTitle = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${shortId}-${cleanTitle}`;
}

async function seedLaunch() {
  console.log("🚀 Starting launch database seed...\n");

  const userIds: Record<string, string> = {};

  for (const user of launchUsers) {
    console.log(`👤 Creating/Updating user: ${user.username}...`);
    
    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users.find((u) => u.email === user.email);
    
    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
      console.log(`  ✓ User ${user.email} already exists.`);
    } else {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          username: user.username,
          full_name: user.displayName,
        },
      });

      if (authError) {
        console.error(`  ✗ Error creating user ${user.email}:`, authError.message);
        continue;
      }
      userId = authData.user!.id;
      console.log(`  ✓ Created user ${user.email}`);
    }
    
    userIds[user.email] = userId;

    // Upsert profile to ensure it's up to date and onboarding is marked completed
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        username: user.username,
        display_name: user.displayName,
        bio: user.bio,
        onboarding_completed: true,
        reputation: 15,
      });

    if (profileError) {
      console.error(`  ✗ Error updating profile for ${user.username}:`, profileError.message);
    }
  }

  // Ensure we have the requester ID
  if (!userIds["requester@onseek.co"]) {
    console.error("❌ Failed to create/find requester user. Exiting.");
    process.exit(1);
  }

  // Create Request
  console.log("\n📋 Creating launch request...");
  const requesterId = userIds["requester@onseek.co"];
  const requestId = randomUUID();
  const title = "Rare 1990s Vintage Denim Jacket";
  const slug = generateSlug(title, requestId);

  // Define preferences and dealbreakers
  const preferencesMetadata = {
    priceLock: "open",
    exactItem: false,
    exactSpecification: true,
    exactPrice: false,
    preferences: [
      { label: "Authentic fading", note: "Prefer natural wear over artificial distressing" },
      { label: "Size L/XL", note: "Looking for an oversized fit" }
    ],
    dealbreakers: [
      { label: "Modern reproduction", note: "Must be from the 90s, not a recent 'vintage style' release" },
      { label: "Major holes", note: "Minor fraying is okay, but no big rips" }
    ],
    editedFields: [],
  };
  const preferencesJson = JSON.stringify(preferencesMetadata);
  const baseDescription = "I am looking for a specific vintage denim jacket from the 90s, preferably Levi's or Lee. Must be in good condition with authentic fading. I've been searching for months and can't find the right wash.";
  const descriptionWithMetadata = `${baseDescription}\n\n<!--REQUEST_PREFS:${preferencesJson}-->`;

  const { data: request, error: requestError } = await supabase
    .from("requests")
    .insert({
      id: requestId,
      user_id: requesterId,
      title,
      slug,
      description: descriptionWithMetadata,
      category: "Fashion",
      budget_min: 80,
      budget_max: 200,
      country: "FR", 
      condition: "Used",
      urgency: "High",
      status: "open",
      is_seeded: true,
    })
    .select()
    .single();

  if (requestError) {
    console.error("  ✗ Error creating request:", requestError.message);
    process.exit(1);
  }
  console.log(`  ✓ Created request: ${title} (Slug: ${slug})`);

  // Create Submissions
  console.log("\n💬 Creating launch submissions...");
  
  const submissions = [
    {
      user_id: userIds["proposer1@onseek.co"],
      article_name: "Vintage 90s Levi's Trucker Jacket",
      url: "https://www.vinted.fr/items/levis-vintage-90s-jacket",
      price: 120,
      shipping_cost: 5.50,
      notes: "This is an authentic 90s piece in great condition. Fits true to size and has that retro look you want.",
      is_seeded: true,
    },
    {
      user_id: userIds["proposer2@onseek.co"],
      article_name: "Rare Lee Rider Jacket 1994 Edition",
      url: "https://www.ebay.com/itm/rare-lee-rider-1994",
      price: 155,
      shipping_cost: 12.00,
      notes: "Found this one on eBay. It's exactly the kind of fade you're looking for. The seller is highly rated.",
      is_seeded: true,
    }
  ];

  for (const sub of submissions) {
    if (!sub.user_id) continue;
    
    const { error: subError } = await supabase
      .from("submissions")
      .insert({
        request_id: requestId,
        ...sub
      });

    if (subError) {
      console.error(`  ✗ Error creating submission from ${sub.user_id}:`, subError.message);
    } else {
      console.log(`  ✓ Created submission: ${sub.article_name}`);
    }
  }

  console.log("\n🎉 Launch seed completed successfully!");
  console.log("\nAccess details for testing:");
  launchUsers.forEach(u => {
    console.log(`  - ${u.displayName} (${u.email}): password123`);
  });
  console.log(`\nView the request at: /requests/${slug}`);
}

seedLaunch().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});

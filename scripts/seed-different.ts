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

const techUsers = [
  { email: "tech_seeker@onseek.co", password: "password123", username: "tech_collector", displayName: "Mark Chen", bio: "Always chasing the latest specs." },
  { email: "tech_pro1@onseek.co", password: "password123", username: "apple_expert", displayName: "Sarah Appleby", bio: "Former IT admin, I know where to find the best deals." },
  { email: "tech_pro2@onseek.co", password: "password123", username: "gadget_guru", displayName: "David Tech", bio: "Reviewing tech is my passion. Finding it for you is my job." },
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

async function seedDifferent() {
  console.log("🚀 Starting different database seed (Tech)...\n");

  const userIds: Record<string, string> = {};

  for (const user of techUsers) {
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

    // Upsert profile
    await supabase
      .from("profiles")
      .upsert({
        id: userId,
        username: user.username,
        display_name: user.displayName,
        bio: user.bio,
        onboarding_completed: true,
        reputation: 25,
      });
  }

  // Create Request
  console.log("\n📋 Creating Tech request...");
  const requesterId = userIds["tech_seeker@onseek.co"];
  const requestId = randomUUID();
  const title = "MacBook Pro M3 Max 14-inch (Space Black)";
  const slug = generateSlug(title, requestId);

  const preferencesMetadata = {
    priceLock: "open",
    exactItem: true,
    exactSpecification: true,
    exactPrice: false,
    preferences: [
      { label: "64GB RAM", note: "Minimum for my workflow" },
      { label: "1TB SSD", note: "Need space for video projects" },
      { label: "Battery health > 95%", note: "If used" }
    ],
    dealbreakers: [
      { label: "Screen scratches", note: "Absolute no-go" },
      { label: "Keyboard damage", note: "Must be fully working" }
    ],
    editedFields: [],
  };
  const preferencesJson = JSON.stringify(preferencesMetadata);
  const baseDescription = "Searching for a MacBook Pro with M3 Max chip. 14-inch model preferred for portability but would consider 16-inch if the price is right. Space Black color is a must.";
  const descriptionWithMetadata = `${baseDescription}\n\n<!--REQUEST_PREFS:${preferencesJson}-->`;

  const { data: request, error: requestError } = await supabase
    .from("requests")
    .insert({
      id: requestId,
      user_id: requesterId,
      title,
      slug,
      description: descriptionWithMetadata,
      category: "Tech",
      budget_min: 3000,
      budget_max: 4500,
      country: "USA", 
      condition: "Either",
      urgency: "Standard",
      status: "open",
      is_seeded: true,
    })
    .select()
    .single();

  if (requestError) {
    console.error("  ✗ Error creating request:", requestError.message);
    process.exit(1);
  }
  console.log(`  ✓ Created request: ${title}`);

  // Create Submissions
  console.log("\n💬 Creating tech submissions...");
  
  const submissions = [
    {
      user_id: userIds["tech_pro1@onseek.co"],
      article_name: "MacBook Pro 14 M3 Max - 64GB/1TB - Mint",
      url: "https://www.backmarket.com/macbook-pro-m3-max-64gb",
      price: 3699,
      shipping_cost: 0,
      notes: "Found this certified refurbished unit. It looks like brand new and comes with a 1-year warranty.",
      is_seeded: true,
    },
    {
      user_id: userIds["tech_pro2@onseek.co"],
      article_name: "Brand New Sealed MacBook Pro 14 M3 Max",
      url: "https://www.bhphotovideo.com/c/product/macbook-pro-m3-max",
      price: 3999,
      shipping_cost: 0,
      notes: "This is brand new, sealed. B&H has it in stock for immediate shipping.",
      is_seeded: true,
    }
  ];

  for (const sub of submissions) {
    if (!sub.user_id) continue;
    await supabase.from("submissions").insert({
      request_id: requestId,
      ...sub
    });
    console.log(`  ✓ Created submission: ${sub.article_name}`);
  }

  console.log("\n🎉 Tech seed completed successfully!");
  console.log(`\nView it at: /requests/${slug}`);
}

seedDifferent().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});

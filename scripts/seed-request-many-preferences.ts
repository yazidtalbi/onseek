import { createClient } from "@supabase/supabase-js";
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

async function seedRequestWithManyPreferences() {
  console.log("🌱 Seeding a request with 7 preferences...\n");

  // Get or create a test user
  let userId: string;
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const testUser = existingUsers?.users.find((u) => u.email === "test@example.com");

  if (testUser) {
    userId = testUser.id;
    console.log("✓ Using existing test user");
  } else {
    const { data: newUser, error } = await supabase.auth.admin.createUser({
      email: "test@example.com",
      password: "testpass123",
      email_confirm: true,
      user_metadata: {
        username: "testuser",
        full_name: "Test User",
      },
    });

    if (error || !newUser.user) {
      console.error("✗ Error creating test user:", error?.message);
      process.exit(1);
    }

    userId = newUser.user.id;
    // Ensure profile exists
    await supabase.from("profiles").upsert({
      id: userId,
      username: "testuser",
      display_name: "Test User",
      bio: "Test account for seeding requests",
    });
    console.log("✓ Created test user");
  }

  // Create request with 7 preferences
  const preferences = [
    { label: "Wireless connectivity" },
    { label: "Bluetooth 5.0 or higher" },
    { label: "USB-C charging" },
    { label: "Water resistant" },
    { label: "Noise cancellation" },
    { label: "Battery life 20+ hours" },
    { label: "Comfortable for long wear" },
  ];

  const dealbreakers = [
    { label: "No defects" },
    { label: "Original packaging preferred" },
  ];

  const preferencesJson = JSON.stringify({
    priceLock: "open",
    exactItem: false,
    exactSpecification: false,
    exactPrice: false,
    preferences,
    dealbreakers,
  });

  const description = `Looking for premium wireless headphones with excellent sound quality and comfort. Perfect for long listening sessions, travel, and daily use.

Key features I'm looking for:
- Superior audio quality
- Long battery life
- Comfortable fit
- Modern connectivity options

<!--REQUEST_PREFS:${preferencesJson}-->`;

  const { data: request, error: requestError } = await supabase
    .from("requests")
    .insert({
      user_id: userId,
      title: "Premium Wireless Headphones - High Quality Sound",
      description,
      category: "Tech",
      budget_min: 150,
      budget_max: 500,
      country: "USA",
      condition: "New",
      urgency: "Standard",
      status: "open",
    })
    .select()
    .single();

  if (requestError || !request) {
    console.error("✗ Error creating request:", requestError?.message);
    process.exit(1);
  }

  console.log(`✓ Created request: ${request.title} (ID: ${request.id})`);
  console.log(`✓ Added ${preferences.length} preferences`);
  console.log(`✓ Added ${dealbreakers.length} dealbreakers`);

  // Add reference links
  const referenceLinks = [
    "https://www.amazon.com/sony-wh-1000xm5",
    "https://www.bestbuy.com/bose-quietcomfort",
  ];

  if (referenceLinks.length > 0) {
    await supabase.from("request_links").insert(
      referenceLinks.map((url) => ({
        request_id: request.id,
        url,
      }))
    );
    console.log(`✓ Added ${referenceLinks.length} reference links`);
  }

  // Add images
  const imageUrls = [
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
    "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400",
  ];

  if (imageUrls.length > 0) {
    await supabase.from("request_images").insert(
      imageUrls.map((url, index) => ({
        request_id: request.id,
        image_url: url,
        image_order: index,
      }))
    );
    console.log(`✓ Added ${imageUrls.length} images`);
  }

  console.log(`\n✅ Successfully seeded request with 7 preferences!`);
  console.log(`\nRequest details:`);
  console.log(`  - Title: ${request.title}`);
  console.log(`  - Preferences: ${preferences.length}`);
  preferences.forEach((pref, idx) => {
    console.log(`    ${idx + 1}. ${pref.label}`);
  });
  console.log(`  - Dealbreakers: ${dealbreakers.length}`);
  console.log(`  - Images: ${imageUrls.length}`);
  console.log(`  - Reference Links: ${referenceLinks.length}`);
  console.log(`\nView it at: /app/requests/${request.id}`);
}

seedRequestWithManyPreferences().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});


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

async function seedWatchRequest() {
  console.log("🌱 Seeding a watch request...\n");

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

  // Create request with preferences and dealbreakers for a watch
  const preferences = [
    { label: "Water resistant" },
    { label: "Leather strap" },
    { label: "Automatic movement" },
  ];

  const dealbreakers = [
    { label: "No scratches" },
    { label: "Working condition" },
  ];

  const preferencesJson = JSON.stringify({
    priceLock: "open",
    exactItem: false,
    exactSpecification: false,
    exactPrice: false,
    preferences,
    dealbreakers,
  });

  const description = `Looking for a quality watch, preferably a vintage or classic design. Interested in both automatic and quartz movements. Budget is flexible depending on the condition and brand.

<!--REQUEST_PREFS:${preferencesJson}-->`;

  const { data: request, error: requestError } = await supabase
    .from("requests")
    .insert({
      user_id: userId,
      title: "Looking for a quality watch",
      description,
      category: "Fashion",
      budget_min: 100,
      budget_max: 500,
      country: "USA",
      condition: "Used",
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

  // Add reference links
  const referenceLinks = [
    "https://www.chrono24.com/watches/index.htm",
    "https://www.ebay.com/b/Watches/260324/bn_2408457",
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
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
    "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400",
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

  // Create some submissions
  const submissions = [
    {
      url: "https://www.ebay.com/itm/example-watch-1",
      store_name: "eBay",
      price: 249.99,
      shipping_cost: 15.99,
      notes: "Great condition, includes original box and papers.",
    },
    {
      url: "https://www.chrono24.com/example-watch-2",
      store_name: "Chrono24",
      price: 399.99,
      shipping_cost: 0,
      notes: "Vintage automatic movement, excellent condition.",
    },
  ];

  for (const submission of submissions) {
    const { data: sub, error: subError } = await supabase
      .from("submissions")
      .insert({
        request_id: request.id,
        user_id: userId,
        ...submission,
      })
      .select()
      .single();

    if (!subError && sub) {
      console.log(`✓ Created submission: ${submission.store_name} - $${submission.price}`);
    }
  }

  console.log(`\n✅ Successfully seeded watch request!`);
  console.log(`\nRequest details:`);
  console.log(`  - Title: ${request.title}`);
  console.log(`  - Preferences: ${preferences.length}`);
  console.log(`  - Dealbreakers: ${dealbreakers.length}`);
  console.log(`  - Images: ${imageUrls.length}`);
  console.log(`  - Reference Links: ${referenceLinks.length}`);
  console.log(`  - Submissions: ${submissions.length}`);
  console.log(`\nView it at: /app/requests/${request.id}`);
}

seedWatchRequest().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});


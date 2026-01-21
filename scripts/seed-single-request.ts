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

async function seedRequest() {
  console.log("🌱 Seeding a test request with all functionalities...\n");

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

  // Create request with preferences and dealbreakers (simplified, no notes)
  const preferences = [
    { label: "Gen 9 ou ultérieur" },
    { label: "16 Go RAM" },
    { label: "Windows 11" },
  ];

  const dealbreakers = [
    { label: "No defects" },
    { label: "Warranty required" },
  ];

  const preferencesJson = JSON.stringify({
    priceLock: "locked",
    exactItem: false,
    exactSpecification: false,
    exactPrice: false,
    preferences,
    dealbreakers,
  });

  const description = `Looking for a high-performance gaming laptop that can handle modern games and development work. Must have excellent build quality and good battery life for on-the-go use.

<!--REQUEST_PREFS:${preferencesJson}-->`;

  const { data: request, error: requestError } = await supabase
    .from("requests")
    .insert({
      user_id: userId,
      title: "Gaming Laptop - High Performance",
      description,
      category: "Tech",
      budget_min: 1000,
      budget_max: 2500,
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

  // Add reference links
  const referenceLinks = [
    "https://www.amazon.com/example-gaming-laptop",
    "https://www.bestbuy.com/example-laptop",
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

  // Add images (using placeholder URLs - you can replace with actual image URLs)
  const imageUrls = [
    "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=400",
    "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400",
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400",
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
      url: "https://www.amazon.com/dp/example1",
      store_name: "Amazon",
      price: 1899.99,
      shipping_cost: 0,
      notes: "Great deal! Includes warranty and free shipping.",
    },
    {
      url: "https://www.bestbuy.com/product/example2",
      store_name: "Best Buy",
      price: 2199.99,
      shipping_cost: 49.99,
      notes: "Premium model with extended warranty option available.",
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

  console.log(`\n✅ Successfully seeded request with all functionalities!`);
  console.log(`\nRequest details:`);
  console.log(`  - Title: ${request.title}`);
  console.log(`  - Preferences: ${preferences.length}`);
  console.log(`  - Dealbreakers: ${dealbreakers.length}`);
  console.log(`  - Images: ${imageUrls.length}`);
  console.log(`  - Reference Links: ${referenceLinks.length}`);
  console.log(`  - Submissions: ${submissions.length}`);
  console.log(`\nView it at: /app/requests/${request.id}`);
}

seedRequest().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});


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

async function seedFullRequest() {
  console.log("🌱 Seeding a new request using full creation flow...\n");

  // Get or create a test user
  let userId: string;
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const testUser = existingUsers?.users.find((u) => u.email === "test@example.com");

  if (testUser) {
    userId = testUser.id;
    console.log("✓ Using existing test user");
    
    // Ensure profile exists
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .single();
    
    if (!profile) {
      await supabase.from("profiles").upsert({
        id: userId,
        username: "testuser",
        display_name: "Test User",
        bio: "Test account for seeding requests",
      });
      console.log("✓ Created profile for existing user");
    }
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
    await supabase.from("profiles").upsert({
      id: userId,
      username: "testuser",
      display_name: "Test User",
      bio: "Test account for seeding requests",
    });
    console.log("✓ Created test user and profile");
  }

  // Full request data matching the form structure
  const requestData = {
    title: "Casio W23 Watch - Classic Digital Timepiece",
    description: `Looking for a Casio W23 digital watch. This is a classic retro-style watch that I've been wanting to add to my collection. I prefer the original design with the classic LCD display.

Key features I'm looking for:
- Original Casio W23 model
- Working condition (all functions operational)
- Original band preferred but not required
- Good battery life
- Authentic Casio product (no knockoffs)

I'm open to different color variations but prefer the classic black/silver combination.`,
    category: "Fashion",
    budgetMin: null,
    budgetMax: 150,
    country: "USA",
    condition: "New",
    urgency: "Standard",
    priceLock: "open" as const,
    exactItem: false,
    exactSpecification: false,
    exactPrice: false,
    preferences: [
      { label: "Original Casio brand", note: "Must be authentic" },
      { label: "Working condition", note: "All functions must work" },
      { label: "Good battery life" },
      { label: "Original band preferred" },
    ],
    dealbreakers: [
      { label: "No defects", note: "Screen must be clear" },
      { label: "No knockoffs", note: "Must be genuine Casio" },
      { label: "No water damage" },
    ],
    referenceLinks: [
      "https://www.casio.com/us/watches/product.W23",
      "https://www.amazon.com/s?k=casio+w23",
    ],
    imageUrls: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800",
    ],
  };

  // Build preferences JSON (same format as the action)
  const preferencesJson = JSON.stringify({
    priceLock: requestData.priceLock,
    exactItem: requestData.exactItem,
    exactSpecification: requestData.exactSpecification,
    exactPrice: requestData.exactPrice,
    preferences: requestData.preferences,
    dealbreakers: requestData.dealbreakers,
  });

  // Append preferences as hidden metadata to description (same as action)
  const descriptionWithMetadata = `${requestData.description}\n\n<!--REQUEST_PREFS:${preferencesJson}-->`;

  // Insert request (same structure as createRequestAction)
  const insertData = {
    user_id: userId,
    title: requestData.title,
    description: descriptionWithMetadata,
    category: requestData.category,
    budget_min: requestData.budgetMin,
    budget_max: requestData.budgetMax,
    country: requestData.country,
    condition: requestData.condition,
    urgency: requestData.urgency,
    status: "open" as const,
  };

  const { data: request, error: requestError } = await supabase
    .from("requests")
    .insert(insertData)
    .select()
    .single();

  if (requestError || !request) {
    console.error("✗ Error creating request:", requestError?.message);
    console.error("Error details:", requestError);
    process.exit(1);
  }

  console.log(`✓ Created request: ${request.title} (ID: ${request.id})`);

  // Add reference links (same as action)
  if (requestData.referenceLinks.length > 0) {
    const { error: linksError } = await supabase.from("request_links").insert(
      requestData.referenceLinks.map((url) => ({
        request_id: request.id,
        url,
      }))
    );

    if (linksError) {
      console.error("✗ Error adding reference links:", linksError.message);
    } else {
      console.log(`✓ Added ${requestData.referenceLinks.length} reference links`);
    }
  }

  // Add images (same as action)
  if (requestData.imageUrls.length > 0) {
    const { error: imagesError } = await supabase.from("request_images").insert(
      requestData.imageUrls.map((url, index) => ({
        request_id: request.id,
        image_url: url,
        image_order: index,
      }))
    );

    if (imagesError) {
      console.error("✗ Error adding images:", imagesError.message);
    } else {
      console.log(`✓ Added ${requestData.imageUrls.length} images`);
    }
  }

  console.log(`\n✅ Successfully seeded request using full creation flow!`);
  console.log(`\nRequest details:`);
  console.log(`  - Title: ${request.title}`);
  console.log(`  - Category: ${request.category}`);
  console.log(`  - Budget: Up to $${requestData.budgetMax}`);
  console.log(`  - Country: ${requestData.country}`);
  console.log(`  - Condition: ${requestData.condition}`);
  console.log(`  - Preferences: ${requestData.preferences.length}`);
  console.log(`  - Dealbreakers: ${requestData.dealbreakers.length}`);
  console.log(`  - Images: ${requestData.imageUrls.length}`);
  console.log(`  - Reference Links: ${requestData.referenceLinks.length}`);
  console.log(`\nView it at: /app/requests/${request.id}`);
}

seedFullRequest().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});


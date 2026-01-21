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

async function seedSubmissions() {
  console.log("🌱 Seeding submissions for the latest request...\n");

  // Get the latest request
  const { data: latestRequest, error: requestError } = await supabase
    .from("requests")
    .select("id, title, user_id, budget_max, description")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (requestError || !latestRequest) {
    console.error("✗ Error fetching latest request:", requestError?.message);
    process.exit(1);
  }

  console.log(`✓ Found latest request: ${latestRequest.title} (ID: ${latestRequest.id})`);

  // Get or create submission users (different from request owner)
  const submissionUsers = [
    { email: "submitter1@example.com", username: "submitter1", displayName: "Submitter One" },
    { email: "submitter2@example.com", username: "submitter2", displayName: "Submitter Two" },
    { email: "submitter3@example.com", username: "submitter3", displayName: "Submitter Three" },
    { email: "submitter4@example.com", username: "submitter4", displayName: "Submitter Four" },
  ];

  const userIds: string[] = [];

  for (const userData of submissionUsers) {
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users.find((u) => u.email === userData.email);

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
      // Ensure profile exists
      await supabase.from("profiles").upsert({
        id: userId,
        username: userData.username,
        display_name: userData.displayName,
      });
    } else {
      const { data: newUser, error } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: "password123",
        email_confirm: true,
        user_metadata: {
          username: userData.username,
          full_name: userData.displayName,
        },
      });

      if (error || !newUser.user) {
        console.error(`✗ Error creating user ${userData.email}:`, error?.message);
        continue;
      }

      userId = newUser.user.id;
      await supabase.from("profiles").upsert({
        id: userId,
        username: userData.username,
        display_name: userData.displayName,
      });
    }

    userIds.push(userId);
  }

  console.log(`✓ Prepared ${userIds.length} submission users`);

  // Create diverse submissions
  const submissions = [
    {
      url: "https://www.amazon.com/dp/example1",
      store_name: "Amazon",
      price: latestRequest.budget_max ? Math.floor(latestRequest.budget_max * 0.8) : 199.99,
      shipping_cost: 5.99,
      notes: "Great deal! Fast shipping and excellent reviews. Perfect match for your requirements.",
      userIndex: 0,
    },
    {
      url: "https://www.ebay.com/itm/example2",
      store_name: "eBay",
      price: latestRequest.budget_max ? Math.floor(latestRequest.budget_max * 0.6) : 149.99,
      shipping_cost: 12.99,
      notes: "Used but in excellent condition. Comes with original packaging. Highly recommended seller.",
      userIndex: 1,
    },
    {
      url: "https://www.bestbuy.com/site/example3",
      store_name: "Best Buy",
      price: latestRequest.budget_max ? Math.floor(latestRequest.budget_max * 0.9) : 249.99,
      shipping_cost: 0,
      notes: "Brand new with warranty included. Free shipping on orders over $35. Limited time offer!",
      userIndex: 2,
    },
    {
      url: "https://www.target.com/p/example4",
      store_name: "Target",
      price: latestRequest.budget_max ? Math.floor(latestRequest.budget_max * 0.7) : 179.99,
      shipping_cost: 5.99,
      notes: "Good value for money. Available for pickup or delivery. Check local store availability.",
      userIndex: 3,
    },
    {
      url: "https://www.walmart.com/ip/example5",
      store_name: "Walmart",
      price: latestRequest.budget_max ? Math.floor(latestRequest.budget_max * 0.65) : 159.99,
      shipping_cost: 7.99,
      notes: "Affordable option that meets all your criteria. Ships within 2 business days.",
      userIndex: 0,
    },
  ];

  let successCount = 0;

  for (const submission of submissions) {
    const userId = userIds[submission.userIndex];
    
    // Skip if we don't want same user as request owner
    if (userId === latestRequest.user_id) {
      continue;
    }

    const { data: sub, error: subError } = await supabase
      .from("submissions")
      .insert({
        request_id: latestRequest.id,
        user_id: userId,
        url: submission.url,
        article_name: submission.store_name,
        price: submission.price,
        shipping_cost: submission.shipping_cost,
        notes: submission.notes,
      })
      .select()
      .single();

    if (!subError && sub) {
      console.log(`✓ Created submission: ${submission.store_name} - $${submission.price} (by user ${submission.userIndex + 1})`);
      successCount++;
    } else {
      console.error(`✗ Error creating submission for ${submission.store_name}:`, subError?.message);
    }
  }

  console.log(`\n✅ Successfully seeded ${successCount} submissions!`);
  console.log(`\nRequest: ${latestRequest.title}`);
  console.log(`View submissions at: /app/requests/${latestRequest.id}`);
}

seedSubmissions().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});


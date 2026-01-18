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

// Sample data
const users = [
  { email: "alice@example.com", password: "password123", username: "alice", displayName: "Alice Johnson", bio: "Tech enthusiast and product hunter" },
  { email: "bob@example.com", password: "password123", username: "bob", displayName: "Bob Smith", bio: "Gadget collector and reviewer" },
  { email: "charlie@example.com", password: "password123", username: "charlie", displayName: "Charlie Brown", bio: "Fashion and lifestyle blogger" },
  { email: "diana@example.com", password: "password123", username: "diana", displayName: "Diana Prince", bio: "Home decor expert" },
  { email: "eve@example.com", password: "password123", username: "eve", displayName: "Eve Williams", bio: "Auto parts specialist" },
  { email: "frank@example.com", password: "password123", username: "frank", displayName: "Frank Miller", bio: "Collectibles dealer" },
  { email: "grace@example.com", password: "password123", username: "grace", displayName: "Grace Lee", bio: "Local business owner" },
  { email: "henry@example.com", password: "password123", username: "henry", displayName: "Henry Davis", bio: "Software developer" },
];

const categories = ["Tech", "Home", "Fashion", "Auto", "Collectibles", "Local"];
const conditions = ["New", "Used", "Refurbished", "Open Box"];
const countries = ["USA", "UK", "Canada", "Germany", "France", "Japan", "Australia"];
const urgencies = ["Standard", "High", "Low"];

const requestTitles = [
  "Looking for a mechanical keyboard with RGB lighting",
  "Need a standing desk for home office",
  "Searching for vintage denim jacket",
  "Want a car phone mount for iPhone",
  "Looking for rare Pokemon cards",
  "Need a local plumber recommendation",
  "Searching for wireless earbuds under $100",
  "Want a smart home thermostat",
  "Looking for a leather messenger bag",
  "Need a bike rack for SUV",
  "Searching for vintage vinyl records",
  "Want a local yoga studio recommendation",
  "Looking for a gaming mouse with good DPI",
  "Need a coffee maker with timer",
  "Searching for sustainable fashion brands",
  "Want a dash cam for car",
  "Looking for limited edition sneakers",
  "Need a local electrician",
  "Searching for a 4K monitor",
  "Want a smart doorbell",
];

const storeNames = [
  "Amazon", "eBay", "Best Buy", "Target", "Walmart",
  "Etsy", "AliExpress", "Newegg", "B&H Photo", "Home Depot",
  "Zappos", "Nordstrom", "AutoZone", "GameStop", "REI",
];

const submissionUrls = [
  "https://amazon.com/dp/example1",
  "https://ebay.com/itm/example2",
  "https://bestbuy.com/product/example3",
  "https://target.com/p/example4",
  "https://walmart.com/ip/example5",
  "https://etsy.com/listing/example6",
  "https://aliexpress.com/item/example7",
  "https://newegg.com/product/example8",
];

async function seed() {
  console.log("🌱 Starting database seed...\n");

  // Step 1: Create users and profiles
  console.log("📝 Creating users and profiles...");
  const userIds: string[] = [];

  for (const user of users) {
    try {
      // Create auth user
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
        // User might already exist, try to get existing user
        const { data: existingUser } = await supabase.auth.admin.listUsers();
        const found = existingUser?.users.find((u) => u.email === user.email);
        if (found) {
          userIds.push(found.id);
          // Update profile
          await supabase
            .from("profiles")
            .upsert({
              id: found.id,
              username: user.username,
              display_name: user.displayName,
              bio: user.bio,
              reputation: Math.floor(Math.random() * 100),
            });
          console.log(`  ✓ User ${user.username} already exists, updated profile`);
          continue;
        } else {
          throw authError;
        }
      }

      if (authData.user) {
        userIds.push(authData.user.id);
        // Update profile with bio and reputation
        await supabase
          .from("profiles")
          .update({
            username: user.username,
            display_name: user.displayName,
            bio: user.bio,
            reputation: Math.floor(Math.random() * 100),
          })
          .eq("id", authData.user.id);
        console.log(`  ✓ Created user ${user.username}`);
      }
    } catch (error: any) {
      console.error(`  ✗ Error creating user ${user.username}:`, error.message);
    }
  }

  if (userIds.length === 0) {
    console.error("❌ No users created. Exiting.");
    process.exit(1);
  }

  console.log(`\n✅ Created/updated ${userIds.length} users\n`);

  // Step 2: Create requests
  console.log("📋 Creating requests...");
  const requestIds: string[] = [];

  for (let i = 0; i < requestTitles.length; i++) {
    const title = requestTitles[i];
    const randomUser = userIds[Math.floor(Math.random() * userIds.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const condition = Math.random() > 0.5 ? conditions[Math.floor(Math.random() * conditions.length)] : null;
    const country = Math.random() > 0.3 ? countries[Math.floor(Math.random() * countries.length)] : null;
    const urgency = urgencies[Math.floor(Math.random() * urgencies.length)];
    const hasBudget = Math.random() > 0.4;
    const budgetMin = hasBudget ? Math.floor(Math.random() * 500) + 50 : null;
    const budgetMax = hasBudget ? budgetMin! + Math.floor(Math.random() * 500) + 100 : null;

    const statuses: ("open" | "closed" | "solved")[] = ["open", "open", "open", "closed", "solved"];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    const descriptions = [
      `${title}. Looking for the best quality and price. Any recommendations would be appreciated!`,
      `I'm searching for ${title.toLowerCase()}. Please share any links or suggestions you have.`,
      `Need help finding ${title.toLowerCase()}. Budget is flexible, quality is important.`,
      `Looking to purchase ${title.toLowerCase()}. Prefer new condition but open to options.`,
      `${title}. Would love to hear from the community about the best options available.`,
    ];
    const description = descriptions[Math.floor(Math.random() * descriptions.length)];

    try {
      const { data: request, error } = await supabase
        .from("requests")
        .insert({
          user_id: randomUser,
          title,
          description,
          category,
          budget_min: budgetMin,
          budget_max: budgetMax,
          country,
          condition,
          urgency,
          status,
          created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Random date in last 30 days
        })
        .select()
        .single();

      if (error) throw error;
      if (request) {
        requestIds.push(request.id);
        console.log(`  ✓ Created request: ${title.substring(0, 50)}...`);
      }
    } catch (error: any) {
      console.error(`  ✗ Error creating request:`, error.message);
    }
  }

  console.log(`\n✅ Created ${requestIds.length} requests\n`);

  // Step 3: Create submissions
  console.log("💬 Creating submissions...");
  const submissionIds: string[] = [];
  const submissionRequestMap: Map<string, string[]> = new Map(); // request_id -> submission_ids

  for (const requestId of requestIds) {
    // Each request gets 2-5 submissions
    const numSubmissions = Math.floor(Math.random() * 4) + 2;
    const requestSubmissions: string[] = [];

    for (let i = 0; i < numSubmissions; i++) {
      const randomUser = userIds[Math.floor(Math.random() * userIds.length)];
      const storeName = storeNames[Math.floor(Math.random() * storeNames.length)];
      const url = submissionUrls[Math.floor(Math.random() * submissionUrls.length)] + `/${randomUUID()}`;
      const price = Math.floor(Math.random() * 500) + 20;
      const shippingCost = Math.random() > 0.5 ? Math.floor(Math.random() * 30) + 5 : null;
      const notes = Math.random() > 0.5 ? [
        "Great quality, highly recommended!",
        "Fast shipping, good seller",
        "Best price I found",
        "Comes with warranty",
        "Excellent reviews",
      ][Math.floor(Math.random() * 5)] : null;

      try {
        const { data: submission, error } = await supabase
          .from("submissions")
          .insert({
            request_id: requestId,
            user_id: randomUser,
            url,
            store_name: storeName,
            price,
            shipping_cost: shippingCost,
            notes,
            created_at: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000).toISOString(),
          })
          .select()
          .single();

        if (error) throw error;
        if (submission) {
          submissionIds.push(submission.id);
          requestSubmissions.push(submission.id);
          console.log(`  ✓ Created submission for request ${requestId.substring(0, 8)}...`);
        }
      } catch (error: any) {
        console.error(`  ✗ Error creating submission:`, error.message);
      }
    }

    submissionRequestMap.set(requestId, requestSubmissions);
  }

  console.log(`\n✅ Created ${submissionIds.length} submissions\n`);

  // Step 4: Create votes (upvotes)
  console.log("👍 Creating votes...");
  let voteCount = 0;

  for (const submissionId of submissionIds) {
    // Each submission gets 0-8 upvotes from random users
    const numVotes = Math.floor(Math.random() * 9);
    const voters = new Set<string>();

    for (let i = 0; i < numVotes; i++) {
      let voterId = userIds[Math.floor(Math.random() * userIds.length)];
      // Make sure each user only votes once per submission
      while (voters.has(voterId) && voters.size < userIds.length) {
        voterId = userIds[Math.floor(Math.random() * userIds.length)];
      }
      voters.add(voterId);

      try {
        const { error } = await supabase
          .from("votes")
          .insert({
            submission_id: submissionId,
            user_id: voterId,
            vote: 1, // Upvote
            created_at: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000).toISOString(),
          });

        if (error && !error.message.includes("duplicate")) {
          throw error;
        }
        if (!error) voteCount++;
      } catch (error: any) {
        // Ignore duplicate vote errors
        if (!error.message.includes("duplicate")) {
          console.error(`  ✗ Error creating vote:`, error.message);
        }
      }
    }
  }

  console.log(`\n✅ Created ${voteCount} votes\n`);

  // Step 5: Mark random submissions as winners
  console.log("🏆 Marking winners...");
  let winnerCount = 0;

  for (const [requestId, submissionIds] of submissionRequestMap.entries()) {
    // 30% chance to have a winner
    if (Math.random() < 0.3 && submissionIds.length > 0) {
      const winnerId = submissionIds[Math.floor(Math.random() * submissionIds.length)];

      try {
        const { error } = await supabase
          .from("requests")
          .update({
            winner_submission_id: winnerId,
            status: "solved",
          })
          .eq("id", requestId);

        if (error) throw error;
        winnerCount++;
        console.log(`  ✓ Marked submission ${winnerId.substring(0, 8)}... as winner for request ${requestId.substring(0, 8)}...`);
      } catch (error: any) {
        console.error(`  ✗ Error marking winner:`, error.message);
      }
    }
  }

  console.log(`\n✅ Marked ${winnerCount} requests as solved with winners\n`);

  console.log("\n🎉 Seed completed successfully!");
  console.log(`\nSummary:`);
  console.log(`  - Users: ${userIds.length}`);
  console.log(`  - Requests: ${requestIds.length}`);
  console.log(`  - Submissions: ${submissionIds.length}`);
  console.log(`  - Votes: ${voteCount}`);
  console.log(`  - Winners: ${winnerCount}`);
  console.log(`\nYou can now log in with any of these accounts:`);
  users.forEach((u) => {
    console.log(`  - ${u.email} / ${u.password}`);
  });
}

seed().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});


import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { config } from "dotenv";
import { resolve } from "node:path";
import { inferIconName } from "../src/lib/utils/icons";

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

const batchUsers = [
  { email: "user_a@onseek.co", username: "alex_traveler", displayName: "Alex T" },
  { email: "user_b@onseek.co", username: "martha_vntg", displayName: "Martha" },
  { email: "user_c@onseek.co", username: "gadget_guy", displayName: "Kevin" },
  { email: "user_d@onseek.co", username: "paris_local", displayName: "Jean" },
  { email: "user_e@onseek.co", username: "retro_fan", displayName: "Bobby" },
  { email: "user_f@onseek.co", username: "book_worm", displayName: "Claire" },
];

const batchRequests = [
  {
    title: "Vintag mechanical keyboard repair service",
    description: "Hey guys, I have an old IBM Model M that has some stuck keys. Looking for someone who knows how to fix these old mechanical keyboards without breaking them. I tried opening it but its too complex for me lol.",
    category: "Tech",
    budget_max: 100,
    country: "USA",
    preferences: [
      { label: "Experience with Model M", note: "very important" },
      { label: "Quick turnaround" }
    ],
    dealbreakers: [
      { label: "No soldering experience", note: "i dont want someone learning on my board" }
    ],
    proposals: [
      { article_name: "IBM Model M Repair Service", notes: "I specialized in vintage IBM boards. I have the bolt mod kits ready. Can fix your stuck keys easily.", price: 85, alignment: "high" },
      { article_name: "Custom Keyboard Cleaning", notes: "I can clean it for u, but i dont do electronics repair. just making it look pretty.", price: 40, alignment: "low" },
      { article_name: "Gaming Mouse Pad", notes: "hey check this mouse pad, it goes great with mechanical keyboards!", price: 25, alignment: "none" }
    ]
  },
  {
    title: "Rare pokemon card Pikachu Illustrator (repro ok)",
    description: "Looking for a high quality repro of the Pikachu Illustrator card. i know real ones are millions lol. just want it for my display collection. it needs to look VERY REAL tho.",
    category: "Collectibles",
    budget_max: 50,
    preferences: [
      { label: "Holographic effect must be perfect" },
      { label: "Centering should be clean" }
    ],
    dealbreakers: [
      { label: "Pixelated printing", note: "must look sharp" }
    ],
    proposals: [
      { article_name: "Premium Pikachu Illustrator Repro", notes: "This is the best repro on the market. Holo pattern is 1:1. You wont be disappointed.", price: 45, alignment: "high", is_personal: true },
      { article_name: "Pokemon Card Sleeves", notes: "You'll need these to protect your card!", price: 10, alignment: "low" }
    ]
  },
  {
    title: "Neede a dog walker in Paris (11eme)",
    description: "I am looking for someone to walk my litle golden retriever 3 times a week. needs to be reliable. perfer someone who lives close to Republique.",
    category: "Local",
    budget_max: 20,
    country: "FR",
    preferences: [
      { label: "Reference from other owners" },
      { label: "Lives in 10th or 11th arrondissement" }
    ],
    dealbreakers: [
      { label: "Afraid of big dogs", note: "hes friendly but energetic" }
    ],
    proposals: [
      { article_name: "Reliable Dog Walking 11e", notes: "I live near Canal Saint Martin, very close to Republique. Love goldens!", price: 18, alignment: "high" },
      { article_name: "Pet Sitting Service", notes: "I mainly do cats but can help with dogs if they are small.", price: 25, alignment: "medium" }
    ]
  },
  {
    title: "Loking for a specific bread fermenter tank",
    description: "I am starting a small bakery and need a 20L stainless steel fermenter. searching for specific brands like Speidel or similar but open to cheaper options if they are good quality.",
    category: "Home & Living",
    budget_max: 300,
    preferences: [
      { label: "Stainless steel 304" },
      { label: "Easy to clean" },
      { label: "Thermometer well" }
    ],
    proposals: [
      { article_name: "Speidel 20L Stainless Fermenter", notes: "Found one in stock at this local brew shop. They ship to all of Germany.", price: 280, alignment: "high" }
    ]
  },
  {
    title: "Used car for parts Corola 2005",
    description: "Need a scrap Toyota Corola 2005 for parts. specifically looking for the front bumper and left headlight. if you have a wrecked one sitting around let me know.",
    category: "Auto",
    budget_max: 500,
    dealbreakers: [
      { label: "Front damage", note: "need the front parts to be intact" },
      { label: "Rusted frame" }
    ],
    proposals: [
      { article_name: "2005 Corolla Part-out", notes: "I have the front bumper and headlight. Both are clean. Come pick them up.", price: 350, alignment: "high", is_personal: true }
    ]
  },
  {
    title: "Handmade pottery classes for beginners",
    description: "Searching for a workshop or person who gives pottery lessons. i want to learn how to use a wheel. prefer evening classes or weekends.",
    category: "Local",
    preferences: [
      { label: "Small groups", note: "max 4 people" },
      { label: "Kiln included in price" }
    ],
    proposals: [
      { article_name: "Beginner Wheel Throwing Workshop", notes: "Saturday morning classes starting next month. We have 5 wheels available.", price: 120, alignment: "high" }
    ]
  },
  {
    title: "Searching for 19th century book about alchemy",
    description: "looking for any original 19th century books (or older) about alchemy or herbal medicin. condition doesnt matter too much as long as the pages are readable. its for a research project.",
    category: "Collectibles",
    budget_max: 200,
    preferences: [
      { label: "Illustrated diagrams" },
      { label: "Original binding preferred" }
    ],
    dealbreakers: [
      { label: "Missing pages", note: "text must be complete" }
    ],
    proposals: [
      { article_name: "1845 Traité d'Alchimie", notes: "Found this at a bouquiniste near the Seine. Cover is worn but text is perfect.", price: 175, alignment: "high", is_personal: true }
    ]
  },
  {
    title: "Help with Python script for data scrapin",
    description: "i have a script that is currently blocked by cloudflare. need a pro to help me bypass it or optimize the scraping logic. budget is flexible for a working solution.",
    category: "Tech",
    budget_max: 150,
    dealbreakers: [
      { label: "No past experience with scraping" },
      { label: "Usage of selenium only", note: "need something faster" }
    ],
    proposals: [
      { article_name: "Cloudflare Bypass Expert", notes: "I can fix this in 1 hour. I use FlareSolverr and residential proxies.", price: 120, alignment: "high" }
    ]
  },
  {
    title: "Limited edition sneakers size 45",
    description: "Looking for the Nike SB Dunk Low 'What The Paul' in size 45. need them with OG box and tags. prefer unworn but lightly used is okay if the price is right.",
    category: "Fashion",
    budget_max: 600,
    preferences: [
      { label: "Receipt included" },
      { label: "Double boxed shipping" }
    ],
    dealbreakers: [
      { label: "Fakes (i will check every detail)", note: "serious sellers only" }
    ],
    proposals: [
      { article_name: "Nike SB Dunk Low 'What The Paul' - Size 45", notes: "Worn once, basically new. Have receipt and everything.", price: 580, alignment: "high", is_personal: true }
    ]
  },
  {
    title: "Retro gaming console GameBoy modulated",
    description: "want a customized GameBoy Color with an IPS screen mod and rechargeable battery. shell color doesnt matter too much but prefer something transparent.",
    category: "Gaming",
    budget_max: 180,
    preferences: [
      { label: "IPS v3 screen", note: "no ghosting" },
      { label: "USB-C charging mod" }
    ],
    proposals: [
      { article_name: "Custom GBC with IPS & Lipo", notes: "Just finished this build. Shell is Atomic Purple (transparent). Looks amazing.", price: 175, alignment: "high", is_personal: true }
    ]
  }
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

async function seedBatch() {
  console.log("🚀 Starting advanced Human-like seed...\n");

  const userIds: string[] = [];

  for (const user of batchUsers) {
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users.find((u) => u.email === user.email);
    
    let userId: string;
    if (existingUser) {
      userId = existingUser.id;
    } else {
      const { data: authData } = await supabase.auth.admin.createUser({
        email: user.email,
        password: "password123",
        email_confirm: true,
        user_metadata: { username: user.username, full_name: user.displayName },
      });
      userId = authData.user!.id;
    }
    userIds.push(userId);
    await supabase.from("profiles").upsert({
      id: userId,
      username: user.username,
      display_name: user.displayName,
      onboarding_completed: true,
      reputation: Math.floor(Math.random() * 50),
    });
  }

  for (const reqData of batchRequests as any[]) {
    const randomUser = userIds[Math.floor(Math.random() * userIds.length)];
    const requestId = randomUUID();
    const slug = generateSlug(reqData.title, requestId);

    const preferencesMetadata = {
      priceLock: "open",
      exactItem: false,
      exactSpecification: Math.random() > 0.5,
      exactPrice: false,
      preferences: reqData.preferences || [],
      dealbreakers: reqData.dealbreakers || [],
      editedFields: [],
    };
    
    const descriptionWithMetadata = `${reqData.description}\n\n<!--REQUEST_PREFS:${JSON.stringify(preferencesMetadata)}-->`;

    const { data: request, error: requestError } = await supabase
      .from("requests")
      .insert({
        id: requestId,
        user_id: randomUser,
        title: reqData.title,
        slug,
        description: descriptionWithMetadata,
        category: reqData.category,
        budget_max: reqData.budget_max || null,
        country: reqData.country || null,
        condition: reqData.condition || "Either",
        urgency: reqData.urgency || "Standard",
        status: "open",
        is_seeded: true,
        icon: inferIconName(reqData.title, reqData.category),
      })
      .select()
      .single();

    if (requestError) {
      console.error(`  ✗ Error creating request ${reqData.title}:`, requestError.message);
      continue;
    }
    console.log(`  ✓ Created request: ${reqData.title}`);

    let winningSubmissionId: string | null = null;
    let maxVotes = -1;

    for (const propData of reqData.proposals || []) {
      const prop = propData as any;
      const proposer = userIds[Math.floor(Math.random() * userIds.length)];
      if (proposer === randomUser) continue; 

      if (prop.is_personal) {
        const { error: personalError } = await supabase.from("saved_personal_items").insert({
          user_id: proposer,
          article_name: prop.article_name,
          description: prop.notes,
          price: prop.price,
          is_seeded: true
        });
        if (personalError) console.error(`    ✗ Error adding to inventory:`, personalError.message);
        else console.log(`    ↳ Added ${prop.article_name} to inventory`);
      }

      const { data: submission, error: subError } = await supabase
        .from("submissions")
        .insert({
          request_id: requestId,
          user_id: proposer,
          article_name: prop.article_name,
          url: `https://example.com/${prop.article_name.toLowerCase().replace(/ /g, "-")}`,
          price: prop.price,
          notes: prop.notes,
          is_seeded: true,
        })
        .select()
        .single();

      if (subError || !submission) continue;

      let upvotes = 0;
      let downvotes = 0;
      if (prop.alignment === "high") upvotes = Math.floor(Math.random() * 8) + 3;
      else if (prop.alignment === "low") downvotes = Math.floor(Math.random() * 5);

      for (let j = 0; j < upvotes; j++) {
        const voter = userIds[Math.floor(Math.random() * userIds.length)];
        try { await supabase.from("votes").insert({ submission_id: submission.id, user_id: voter, vote: 1 }); } catch (e) {}
      }
      for (let j = 0; j < downvotes; j++) {
        const voter = userIds[Math.floor(Math.random() * userIds.length)];
        try { await supabase.from("votes").insert({ submission_id: submission.id, user_id: voter, vote: -1 }); } catch (e) {}
      }

      if (upvotes - downvotes > maxVotes) {
        maxVotes = upvotes - downvotes;
        winningSubmissionId = submission.id;
      }
    }

    if (Math.random() < 0.4 && winningSubmissionId) {
      await supabase.from("requests").update({ status: "solved", winner_submission_id: winningSubmissionId }).eq("id", requestId);
    }
  }

  console.log("\n🎉 Advanced seed completed successfully!");
}

seedBatch().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});

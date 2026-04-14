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

const largeUsers = [
  { email: "alex@onseek.co", username: "alex_adventures", displayName: "Alex Thompson", bio: "Global nomad and tech collector." },
  { email: "sarah@onseek.co", username: "sarah_style", displayName: "Sarah Miller", bio: "Fashion consultant and vintage lover." },
  { email: "mike@onseek.co", username: "mike_mechanics", displayName: "Mike Ross", bio: "Car enthusiast and DIY expert." },
  { email: "emma@onseek.co", username: "emma_books", displayName: "Emma Wilson", bio: "Librarian and antique book searcher." },
  { email: "david@onseek.co", username: "david_dev", displayName: "David Chen", bio: "Software engineer and gadget nerd." },
  { email: "lisa@onseek.co", username: "lisa_local", displayName: "Lisa Dubois", bio: "Helping the neighborhood, one request at a time." },
  { email: "tom@onseek.co", username: "tom_retro", displayName: "Tom Baker", bio: "Retro gaming is my life." },
  { email: "sophie@onseek.co", username: "sophie_pots", displayName: "Sophie Green", bio: "Pottery and handmade crafts lover." },
  { email: "james@onseek.co", username: "james_watches", displayName: "James Bond", bio: "Searching for timepieces with history." },
  { email: "lucy@onseek.co", username: "lucy_home", displayName: "Lucy Smith", bio: "Interior designer and home decor hunter." },
  { email: "paul@onseek.co", username: "paul_fitness", displayName: "Paul Walker", bio: "Gym rat and health supplement expert." },
  { email: "claire@onseek.co", username: "claire_art", displayName: "Claire Redfield", bio: "Always looking for rare art pieces." },
  { email: "marc@onseek.co", username: "marc_chef", displayName: "Marc Veyrat", bio: "Searching for the best kitchen tools." },
  { email: "elena@onseek.co", username: "elena_travels", displayName: "Elena Fisher", bio: "Exploring the world, finding unique items." },
  { email: "chris@onseek.co", username: "chris_coins", displayName: "Chris Evans", bio: "Numismatics and coin collector." }
];

const requestTemplates = [
  // Fashion
  { title: "Vintage Levis 501 Big E", country: "USA", budget_max: 300, category: "Fashion", prefs: ["Original tags", "No repairs"], deals: ["Large holes"], condition: "Used" },
  { title: "Hermes Birkin 35 Black", country: "France", budget_max: 12000, category: "Fashion", prefs: ["Receipt included", "Gold hardware"], condition: "Used" },
  { title: "Nike Air Jordan 1 Chicago 1985", country: "USA", budget_max: 5000, category: "Fashion", deals: ["Fakes", "Sole swap"], condition: "Used" },
  
  // Tech
  { title: "Nikon FM2 Titanium", country: "Japan", budget_max: 800, category: "Tech", prefs: ["Mint condition", "Original box"], condition: "Used" },
  { title: "Graphic design help for logo", category: "Services", budget_max: 200, prefs: ["Modern style", "Vector file included"], condition: "Either" },
  { title: "Help me build a gaming PC budget 1500", category: "Tech", budget_max: 1500, prefs: ["RGB lighting", "Nvidia GPU"], condition: "New" },
  
  // Home
  { title: "Danish Teak Sideboard", country: "Denmark", budget_max: 1500, category: "Home & Living", prefs: ["Good oil finish", "Original doors"], condition: "Used" },
  { title: "Espresso machine repair (La Marzocco)", category: "Services", budget_max: 300, prefs: ["Local to London", "Authentic parts"], condition: "Either" },
  { title: "Outdoor pizza oven Wood fired", category: "Home & Living", budget_max: 1000, prefs: ["Portable preferred"], condition: "New" },
  
  // Auto
  { title: "Porsche 911 964 Project car", country: "Germany", budget_max: 45000, category: "Auto", deals: ["Cracked frame", "Flood damage"], condition: "Used" },
  { title: "Roof rack for Tesla Model 3", budget_max: 400, category: "Auto", prefs: ["Quiet at high speeds"], condition: "New" },
  
  // Collectibles
  { title: "1st Edition Charizard PSA 10", category: "Collectibles", budget_max: 200000, deals: ["Fake slab", "Trimming"], condition: "Used" },
  { title: "Batman #1 Comic book", category: "Collectibles", budget_max: 10000, prefs: ["CGC graded"], condition: "Used" },
  { title: "Signed Vinyl by Daft Punk", country: "UK", budget_max: 1500, prefs: ["Certificate of Authenticity"], condition: "Used" },
  
  // Local/Services
  { title: "Local tour guide in Kyoto", country: "Japan", budget_max: 150, category: "Local", prefs: ["Fluent English", "Hidden spots"], condition: "Either" },
  { title: "Native French tutor for kids", country: "France", budget_max: 30, category: "Local", prefs: ["Experienced with toddlers"], condition: "Either" },
  { title: "Custom wedding dress maker", category: "Services", budget_max: 3000, prefs: ["Silk materials", "Lace detail"], condition: "New" },
  
  // Miscellaneous
  { title: "Rare mechanical pencil Pentel Smash", country: "Japan", budget_max: 50, category: "Office", prefs: ["0.3mm lead"], condition: "Either" },
  { title: "Old surf board 70s style", country: "Australia", budget_max: 500, category: "Sports", prefs: ["Single fin"], condition: "Used" },
  { title: "Rare cactus species Astrophytum", category: "Garden", budget_max: 100, prefs: ["Beautiful pattern"], condition: "Either" }
];

const typoWords: Record<string, string[]> = {
  "Looking": ["Loking", "Lookin", "Lucing"],
  "Search": ["Serch", "Searching for", "Searh"],
  "Vintage": ["Vintag", "Vintaje", "Old"],
  "Need": ["Neede", "Ned", "Want"],
  "Condition": ["Conditon", "Conditon", "Condish"]
};

function injectTypos(text: string): string {
  let result = text;
  Object.entries(typoWords).forEach(([word, typos]) => {
    if (Math.random() > 0.7) {
      const regex = new RegExp(word, "g");
      result = result.replace(regex, typos[Math.floor(Math.random() * typos.length)]);
    }
  });
  return result;
}

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

async function seedLarge() {
  console.log("🚀 Starting LARGE database seed...\n");

  const userIds: string[] = [];

  for (const user of largeUsers) {
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users.find((u) => u.email === user.email);
    let userId: string;
    if (existingUser) userId = existingUser.id;
    else {
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
      bio: user.bio,
      onboarding_completed: true,
      reputation: Math.floor(Math.random() * 100),
    });
  }

  // Create 40 requests
  for (let i = 0; i < 40; i++) {
    const template = requestTemplates[i % requestTemplates.length];
    const randomUser = userIds[Math.floor(Math.random() * userIds.length)];
    const requestId = randomUUID();
    
    const title = injectTypos(template.title);
    const slug = generateSlug(title, requestId);
    const description = `Trying to find ${title.toLowerCase()}. ${Math.random() > 0.5 ? "If anyone knows where to get this please let me know!" : "I've been looking for weeks now and cant find a decent one."} Budget is around ${template.budget_max || 'open'}. Thanks!`;

    const preferencesMetadata = {
      priceLock: Math.random() > 0.8 ? "locked" : "open",
      exactItem: Math.random() > 0.7,
      exactSpecification: Math.random() > 0.5,
      exactPrice: false,
      preferences: (template.prefs || []).map(p => ({ label: p, note: "Preferred" })),
      dealbreakers: (template.deals || []).map(d => ({ label: d, note: "No thank you" })),
      editedFields: [],
    };
    
    const descriptionWithMetadata = `${description}\n\n<!--REQUEST_PREFS:${JSON.stringify(preferencesMetadata)}-->`;

    const { data: request, error: requestError } = await supabase
      .from("requests")
      .insert({
        id: requestId,
        user_id: randomUser,
        title,
        slug,
        description: descriptionWithMetadata,
        category: template.category || "General",
        budget_max: template.budget_max || null,
        country: template.country || null,
        condition: template.condition || "Either",
        status: "open",
        is_seeded: true,
        created_at: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString()
      })
      .select().single();

    if (requestError) continue;
    console.log(`  ✓ Created [${i+1}/40]: ${title}`);

    // Random proposals
    const numSubmissions = Math.floor(Math.random() * 8);
    let winningSubId = null;
    let maxV = -1;

    for (let j = 0; j < numSubmissions; j++) {
      const proposer = userIds[Math.floor(Math.random() * userIds.length)];
      if (proposer === randomUser) continue;
      
      const { data: sub } = await supabase.from("submissions").insert({
        request_id: requestId,
        user_id: proposer,
        article_name: `Found ${title.substring(0, 15)}...`,
        url: `https://example.com/${i}-${j}`,
        price: template.budget_max ? Math.floor(template.budget_max * (0.7 + Math.random() * 0.5)) : 100,
        notes: "Hey I found this one, looks like what you need!",
        is_seeded: true,
      }).select().single();

      if (!sub) continue;

      const upvotes = Math.floor(Math.random() * 15);
      for (let v = 0; v < upvotes; v++) {
        const voter = userIds[Math.floor(Math.random() * userIds.length)];
        try {
          await supabase.from("votes").insert({ submission_id: sub.id, user_id: voter, vote: 1 });
        } catch (e) {}
      }
      if (upvotes > maxV) { maxV = upvotes; winningSubId = sub.id; }
    }

    if (Math.random() < 0.2 && winningSubId) {
      await supabase.from("requests").update({ status: "solved", winner_submission_id: winningSubId }).eq("id", requestId);
    }
  }

  console.log("\n🎉 LARGE seed completed successfully!");
}

seedLarge().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});

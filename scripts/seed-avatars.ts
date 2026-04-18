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

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedAvatars() {
  console.log("🌱 Starting profile avatar seed...\n");

  const { data: profiles, error: fetchError } = await supabase
    .from("profiles")
    .select("id, username");

  if (fetchError) {
    console.error("❌ Error fetching profiles:", fetchError.message);
    process.exit(1);
  }

  if (!profiles || profiles.length === 0) {
    console.log("❌ No profiles found.");
    return;
  }

  console.log(`📝 Updating ${profiles.length} profiles with high-quality avatars...\n`);

  // Curated list of high-quality diverse avatars
  const avatarPool = [
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1530268729831-4b0b9e170218?w=400&h=400&fit=crop",
  ];

  let updatedCount = 0;
  for (let i = 0; i < profiles.length; i++) {
    const profile = profiles[i];
    // Use modulo to cycle through the pool
    const avatarUrl = avatarPool[i % avatarPool.length];

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: avatarUrl })
      .eq("id", profile.id);

    if (updateError) {
      console.error(`  ✗ Error updating profile ${profile.username}:`, updateError.message);
    } else {
      updatedCount++;
    }
  }

  console.log(`\n✅ Successfully updated ${updatedCount} profiles with high-quality avatars.`);
}

seedAvatars().catch((error) => {
  console.error("❌ Avatar seeding failed:", error);
  process.exit(1);
});

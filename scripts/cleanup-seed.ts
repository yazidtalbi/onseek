import { createClient } from "@supabase/supabase-js";
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

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanup() {
  console.log("🧹 Cleaning up seeded data...");
  
  const { error: subError } = await supabase.from("submissions").delete().eq("is_seeded", true);
  if (subError) console.error("Error deleting submissions:", subError.message);
  
  const { error: reqError } = await supabase.from("requests").delete().eq("is_seeded", true);
  if (reqError) console.error("Error deleting requests:", reqError.message);

  const { error: personalError } = await supabase.from("saved_personal_items").delete().eq("is_seeded", true);
  if (personalError) console.error("Error deleting personal items:", personalError.message);

  console.log("✨ Cleanup complete!");
}

cleanup();

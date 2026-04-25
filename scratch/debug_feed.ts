
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function debugFeed() {
  const slug = 'specialty-coffee'
  console.log(`Debugging feed for tag: ${slug}`)

  // 1. Get IDs using same logic as feed.ts
  const { data: tag } = await supabase
    .from("tags")
    .select("id")
    .eq("slug", slug)
    .single();
  
  if (!tag) {
    console.log('Tag not found');
    return;
  }
  console.log('Tag ID:', tag.id);

  const { data: rt } = await supabase
    .from("request_tags")
    .select("request_id")
    .eq("tag_id", tag.id);
  
  const ids = rt?.map(r => r.request_id) || [];
  console.log('Found IDs:', ids);

  if (ids.length === 0) return;

  // 2. Main query
  const { data: requests, error } = await supabase
    .from("requests")
    .select("*, profiles(username, avatar_url, first_name, last_name)")
    .eq("status", "open")
    .in("id", ids);

  if (error) {
    console.error('Query error:', error);
  } else {
    console.log(`Found ${requests.length} requests`);
    requests.forEach(r => console.log(`- ${r.title} (ID: ${r.id})`));
  }
}

debugFeed()

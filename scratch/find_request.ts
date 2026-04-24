import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function searchRequest() {
  const shortId = '24e0e7c9';
  console.log(`Searching for ID starting with: ${shortId}`);
  
  // Try using filter with explicit cast syntax for PostgREST
  const { data, error } = await supabase
    .from('requests')
    .select('id, title, slug, category')
    .filter('id', 'ilike', `${shortId}%`);

  if (error) {
    console.error('Error with ilike:', error.message);
    
    // Try with .text() if available or other hacks
    const { data: data2, error: error2 } = await supabase
      .from('requests')
      .select('id, title, slug, category')
      .gte('id', `${shortId}0000-0000-0000-0000-000000000000`)
      .lt('id', `${shortId}ffff-ffff-ffff-ffff-ffffffffffff`);
      
    if (error2) {
        console.error('Error with range:', error2.message);
    } else {
        console.log('Results with range:', data2);
    }
  } else {
    console.log('Results with ilike:', data);
  }
}

searchRequest();

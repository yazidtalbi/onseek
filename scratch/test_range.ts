import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testRangeQuery() {
  // 1. Get a real request
  const { data: realReq } = await supabase.from('requests').select('id, title').limit(1).single();
  if (!realReq) return console.log('No requests found');
  
  const fullId = realReq.id;
  const shortId = fullId.replace(/-/g, '').substring(0, 8);
  console.log(`Real ID: ${fullId}, Short ID: ${shortId}`);

  // 2. Test range query
  const { data, error } = await supabase
    .from('requests')
    .select('id, title')
    .gte('id', `${shortId}-0000-0000-0000-000000000000`)
    .lte('id', `${shortId}-ffff-ffff-ffff-ffffffffffff`)
    .maybeSingle();

  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('Result:', data);
  }
}

testRangeQuery();

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTags() {
  const { data: requests, error: reqError } = await supabase
    .from('requests')
    .select('id, title, slug')
    .order('created_at', { ascending: false })
    .limit(1);

  if (reqError) {
    console.error('Error fetching latest request:', reqError);
    return;
  }

  const request = requests[0];
  console.log('Latest Request:', request.title, 'ID:', request.id);

  const { data: tags, error: tagError } = await supabase
    .from('request_tags')
    .select('tags(*)')
    .eq('request_id', request.id);

  if (tagError) {
    console.error('Error fetching tags:', tagError);
    return;
  }

  console.log('Tags for this request:', tags.map(t => t.tags.name));
}

checkTags();

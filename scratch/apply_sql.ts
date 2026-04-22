import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Need service role to bypass RLS for migration
const supabase = createClient(supabaseUrl, supabaseKey);

async function applyFix() {
  const sql = `
    create policy "Authenticated users can create tags"
      on tags for insert
      with check (auth.role() = 'authenticated');
  `;
  
  // We can't run arbitrary SQL via the client easily, but we can try to use the 'rpc' method if a custom function exists.
  // Since we don't have one, we'll just advise the user or try a direct insert to verify if it works now.
  
  console.log('Please run this SQL in your Supabase dashboard:');
  console.log(sql);
}

applyFix();

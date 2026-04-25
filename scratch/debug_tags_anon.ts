
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function debugTags() {
  const slug = 'specialty-coffee'
  
  console.log(`Checking tag with slug: ${slug} (AS ANON)`)
  
  // 1. Check tag
  const { data: tag, error: tagError } = await supabase
    .from('tags')
    .select('*')
    .eq('slug', slug)
    .single()
    
  if (tagError) {
    console.error('Error finding tag:', tagError)
    return
  }
  
  console.log('Found tag:', tag)
  
  // 2. Check request_tags
  const { data: requestTags, error: rtError } = await supabase
    .from('request_tags')
    .select('request_id, tags!inner(slug)')
    .eq('tags.slug', slug)
    
  if (rtError) {
    console.error('Error finding request_tags:', rtError)
    return
  }
  
  console.log(`Found ${requestTags.length} links in request_tags`)

  // 3. Test the join query on requests
  const { data: joined, error: joinedError } = await supabase
    .from('requests')
    .select('id, title, request_tags!inner(tags!inner(slug))')
    .eq('request_tags.tags.slug', slug)

  if (joinedError) {
    console.error('Error with join query on requests:', joinedError)
  } else {
    console.log(`Join query on requests found ${joined.length} requests`)
  }
}

debugTags()


import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function debugTags() {
  const slug = 'specialty-coffee'
  
  console.log(`Checking tag with slug: ${slug}`)
  
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
    .select('*, requests(*)')
    .eq('tag_id', tag.id)
    
  if (rtError) {
    console.error('Error finding request_tags:', rtError)
    return
  }
  
  console.log(`Found ${requestTags.length} links in request_tags`)
  requestTags.forEach(rt => {
    console.log(`- Request ID: ${rt.request_id}, Title: ${rt.requests?.title}, Status: ${rt.requests?.status}`)
  })

  // 3. Test the join query
  const { data: joined, error: joinedError } = await supabase
    .from('requests')
    .select('id, title, request_tags!inner(tags!inner(slug))')
    .eq('request_tags.tags.slug', slug)

  if (joinedError) {
    console.error('Error with join query:', joinedError)
  } else {
    console.log(`Join query found ${joined.length} requests`)
  }
}

debugTags()

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceKey) {
  console.error('Missing env vars')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceKey)

async function setupStorage() {
  console.log('Creating carousel_assets bucket...')
  
  // Create bucket
  const { data, error } = await supabase.storage.createBucket('carousel_assets', {
    public: true,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
    fileSizeLimit: 5242880 // 5MB
  })

  if (error) {
    if (error.message.includes('already exists')) {
      console.log('✅ Bucket already exists')
    } else {
      console.error('❌ Failed to create bucket:', error)
      process.exit(1)
    }
  } else {
    console.log('✅ Bucket created successfully')
  }

  // Update bucket to public just in case
  await supabase.storage.updateBucket('carousel_assets', {
    public: true,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
  })

  console.log('Done.')
}

setupStorage()

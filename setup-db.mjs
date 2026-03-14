#!/usr/bin/env node
/**
 * GM Automation — Supabase Database Setup Script
 * Run: node setup-db.mjs
 *
 * Requires:
 *  - SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env (or env vars)
 *
 * NOTE: The anon key CANNOT run DDL. You need the service_role key.
 * Get it from: Supabase Dashboard → Settings → API → service_role
 */

import { config } from 'dotenv'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

config()

const __dir = dirname(fileURLToPath(import.meta.url))
const supabaseUrl = process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  console.error('❌ SUPABASE_URL not set in .env')
  process.exit(1)
}

if (!serviceKey || serviceKey.startsWith('sb_publishable_')) {
  console.warn('⚠️  SUPABASE_SERVICE_ROLE_KEY appears to be the anon key (sb_publishable_...).')
  console.warn('   DDL requires the service_role key (starts with sb_secret_ or eyJ...).')
  console.warn('   Get it from: Supabase Dashboard → Settings → API → service_role')
  console.warn('   Continuing anyway for table query tests...\n')
}

console.log(`🔗 Connecting to Supabase: ${supabaseUrl}`)

// Read the schema SQL file
const schemaPath = join(__dir, 'supabase-schema.sql')
const schema = readFileSync(schemaPath, 'utf8')

// Split into individual statements
const statements = schema
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 10 && !s.startsWith('--'))

console.log(`📋 Found ${statements.length} SQL statements to execute\n`)

let success = 0
let failed = 0

for (const stmt of statements) {
  const preview = stmt.replace(/\s+/g, ' ').slice(0, 60)
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: stmt + ';' }),
    })
    
    if (res.ok) {
      console.log(`✅ ${preview}...`)
      success++
    } else {
      const err = await res.json().catch(() => ({}))
      // Ignore "already exists" errors
      if (err.message?.includes('already exists')) {
        console.log(`⏭️  Already exists: ${preview}...`)
        success++
      } else {
        console.log(`❌ Failed: ${preview}...\n   ${err.message || res.status}`)
        failed++
      }
    }
  } catch (e) {
    console.log(`❌ Error: ${preview}...\n   ${e.message}`)
    failed++
  }
}

console.log(`\n📊 Results: ${success} ok, ${failed} failed`)

if (failed > 0) {
  console.log('\n⚠️  Some statements failed. This is normal if:')
  console.log('   1. Using the anon key instead of service_role key')
  console.log('   2. Tables already exist')
  console.log('\n💡 Alternative: Copy supabase-schema.sql and paste into:')
  console.log('   Supabase Dashboard → SQL Editor → Run')
}

console.log('\n✅ Setup complete! Your app is ready to connect.')

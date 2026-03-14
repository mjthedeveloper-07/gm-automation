import type { Handler } from '@netlify/functions'
import { supabaseQuery, corsHeaders } from './_mcp-helper.mjs'

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: corsHeaders(), body: '' }
  if (event.httpMethod !== 'GET') return { statusCode: 405, headers: corsHeaders(), body: JSON.stringify({ error: 'Method not allowed' }) }

  try {
    const queue = await supabaseQuery<unknown[]>(
      '/scheduled_posts?select=*,posts(*)&order=scheduled_at.asc&limit=50'
    )

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify(queue),
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal error'
    // Return empty array instead of error so UI doesn't break
    console.error('get-queue error:', message)
    return { statusCode: 200, headers: corsHeaders(), body: JSON.stringify([]) }
  }
}

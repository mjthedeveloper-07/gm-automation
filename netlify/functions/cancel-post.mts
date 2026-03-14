import type { Handler } from '@netlify/functions'
import { supabaseQuery, corsHeaders } from './_mcp-helper.mjs'

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: corsHeaders(), body: '' }
  if (event.httpMethod !== 'DELETE') return { statusCode: 405, headers: corsHeaders(), body: JSON.stringify({ error: 'Method not allowed' }) }

  const id = event.queryStringParameters?.id
  if (!id) return { statusCode: 400, headers: corsHeaders(), body: JSON.stringify({ error: 'id is required' }) }

  try {
    await supabaseQuery(`/scheduled_posts?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'cancelled' }),
    })
    return { statusCode: 200, headers: corsHeaders(), body: JSON.stringify({ success: true }) }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal error'
    return { statusCode: 500, headers: corsHeaders(), body: JSON.stringify({ error: message }) }
  }
}

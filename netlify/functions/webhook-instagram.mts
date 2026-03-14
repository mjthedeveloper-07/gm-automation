import type { Handler } from '@netlify/functions'
import { supabaseQuery } from './_mcp-helper.mjs'

// Your custom verify token — set this in Netlify env vars as WEBHOOK_VERIFY_TOKEN
const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || 'gm-automation-webhook-2025'

export const handler: Handler = async (event) => {
  // ── Webhook Verification (GET) ────────────────────────────────────────────
  // Meta calls this once when you click "Verify and save" in Dev Console
  if (event.httpMethod === 'GET') {
    const params = event.queryStringParameters || {}
    const mode = params['hub.mode']
    const token = params['hub.verify_token']
    const challenge = params['hub.challenge']

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('✅ Webhook verified successfully')
      return {
        statusCode: 200,
        body: challenge || '',
        headers: { 'Content-Type': 'text/plain' },
      }
    }

    return {
      statusCode: 403,
      body: 'Forbidden: verify token mismatch',
    }
  }

  // ── Webhook Events (POST) ─────────────────────────────────────────────────
  if (event.httpMethod === 'POST') {
    try {
      const payload = JSON.parse(event.body || '{}')
      const entries = payload.entry || []

      for (const entry of entries) {
        // Instagram comment / mention events
        for (const change of entry.changes || []) {
          const { field, value } = change

          if (field === 'comments') {
            console.log('💬 New comment:', value)
            // Store comment notification in Supabase (optional)
            await supabaseQuery('/cron_logs', {
              method: 'POST',
              body: JSON.stringify({
                job_name: 'webhook-comment',
                status: 'success',
                error_message: JSON.stringify({ field, value }),
                ran_at: new Date().toISOString(),
              }),
            }).catch(() => {})
          }

          if (field === 'mentions') {
            console.log('📣 New mention:', value)
          }

          // Media published event (useful for confirming posts went live)
          if (field === 'media') {
            console.log('📸 Media published:', value)
          }
        }

        // Messaging events (DMs)
        for (const msg of entry.messaging || []) {
          console.log('✉️  DM event:', msg)
        }
      }

      return { statusCode: 200, body: 'EVENT_RECEIVED' }
    } catch (error) {
      console.error('Webhook parsing error:', error)
      return { statusCode: 200, body: 'EVENT_RECEIVED' } // Always 200 to Meta
    }
  }

  return { statusCode: 405, body: 'Method not allowed' }
}

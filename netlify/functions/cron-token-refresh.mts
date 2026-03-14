import type { Handler } from '@netlify/functions'
import { supabaseQuery } from './_mcp-helper.mjs'

// Cron: every 6 hours — refresh OAuth tokens for connected platforms
export const handler: Handler = async (_event) => {
  const refreshed: string[] = []
  const errors: string[] = []

  // Instagram / Meta (long-lived tokens, refresh every 60 days, but we check)
  if (process.env.META_ACCESS_TOKEN) {
    try {
      const res = await fetch(
        `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${process.env.META_ACCESS_TOKEN}`
      )
      if (res.ok) refreshed.push('instagram')
    } catch { errors.push('instagram') }
  }

  // LinkedIn (refresh via OAuth if refresh_token available)
  if (process.env.LINKEDIN_ACCESS_TOKEN) {
    try {
      // LinkedIn tokens are long-lived (60 days), just validate
      const res = await fetch('https://api.linkedin.com/v2/me', {
        headers: { Authorization: `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}` }
      })
      if (res.ok) refreshed.push('linkedin')
    } catch { errors.push('linkedin') }
  }

  await supabaseQuery('/cron_logs', {
    method: 'POST',
    body: JSON.stringify({
      job_name: 'token-refresh',
      status: errors.length > 0 ? 'partial' : 'success',
      posts_processed: refreshed.length,
      error_message: errors.length > 0 ? `Failed: ${errors.join(', ')}` : null,
      ran_at: new Date().toISOString(),
    }),
  }).catch(() => {})

  return { statusCode: 200, body: JSON.stringify({ refreshed, errors }) }
}

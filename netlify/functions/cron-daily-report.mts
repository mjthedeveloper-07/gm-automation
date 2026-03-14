import type { Handler } from '@netlify/functions'
import { supabaseQuery } from './_mcp-helper.mjs'

// Cron: daily 9 AM UTC
export const handler: Handler = async (_event) => {
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  try {
    const analytics = await supabaseQuery<Array<{
      impressions: number; likes: number; comments: number; shares: number; engagement_rate: number
    }>>(`/post_analytics?recorded_at=gte.${yesterday}T00:00:00Z&recorded_at=lt.${yesterday}T23:59:59Z`).catch(() => [])

    const report = {
      date: yesterday,
      total_impressions: analytics.reduce((s, r) => s + r.impressions, 0),
      total_likes: analytics.reduce((s, r) => s + r.likes, 0),
      total_comments: analytics.reduce((s, r) => s + r.comments, 0),
      total_shares: analytics.reduce((s, r) => s + r.shares, 0),
      avg_engagement: analytics.length
        ? (analytics.reduce((s, r) => s + r.engagement_rate, 0) / analytics.length).toFixed(2)
        : 0,
    }

    await supabaseQuery('/cron_logs', {
      method: 'POST',
      body: JSON.stringify({
        job_name: 'daily-report',
        status: 'success',
        posts_processed: analytics.length,
        error_message: JSON.stringify(report),
        ran_at: new Date().toISOString(),
      }),
    }).catch(() => {})

    return { statusCode: 200, body: JSON.stringify(report) }
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: String(error) }) }
  }
}

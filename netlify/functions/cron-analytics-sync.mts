import type { Handler } from '@netlify/functions'
import { supabaseQuery } from './_mcp-helper.mjs'

// Cron: hourly — sync instagram analytics for recent posts
export const handler: Handler = async (_event) => {
  const accessToken = process.env.META_ACCESS_TOKEN
  const igUserId = process.env.INSTAGRAM_ACCOUNT_ID
  let synced = 0

  try {
    // Get recently published posts
    const published = await supabaseQuery<Array<{ id: string; external_post_id?: string; platform: string }>>(
      `/posts?status=eq.published&platform=eq.instagram&select=id,external_post_id&order=posted_at.desc&limit=20`
    ).catch(() => [])

    for (const post of published) {
      if (!post.external_post_id || !igUserId || !accessToken) continue

      try {
        const insightsRes = await fetch(
          `https://graph.instagram.com/v20.0/${post.external_post_id}/insights?metric=impressions,reach,likes,comments,shares,saves&access_token=${accessToken}`
        )
        if (!insightsRes.ok) continue

        const data = await insightsRes.json()
        const metrics: Record<string, number> = {}
        for (const item of data.data || []) {
          metrics[item.name] = item.values?.[0]?.value || 0
        }

        const likes = metrics.likes || 0
        const impressions = metrics.impressions || 0
        const engagement_rate = impressions > 0
          ? ((likes + (metrics.comments || 0) + (metrics.shares || 0)) / impressions) * 100
          : 0

        await supabaseQuery('/post_analytics', {
          method: 'POST',
          headers: { Prefer: 'resolution=merge-duplicates' },
          body: JSON.stringify({
            post_id: post.id,
            platform: 'instagram',
            impressions,
            reach: metrics.reach || 0,
            likes,
            comments: metrics.comments || 0,
            shares: metrics.shares || 0,
            saves: metrics.saves || 0,
            clicks: 0,
            engagement_rate: parseFloat(engagement_rate.toFixed(2)),
          }),
        }).catch(() => {})
        synced++
      } catch { /* skip this post */ }
    }

    await supabaseQuery('/cron_logs', {
      method: 'POST',
      body: JSON.stringify({ job_name: 'analytics-sync', status: 'success', posts_processed: synced, ran_at: new Date().toISOString() }),
    }).catch(() => {})

    return { statusCode: 200, body: JSON.stringify({ synced }) }
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: String(error) }) }
  }
}

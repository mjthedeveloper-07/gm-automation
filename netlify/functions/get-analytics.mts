import type { Handler } from '@netlify/functions'
import { supabaseQuery, corsHeaders } from './_mcp-helper.mjs'

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: corsHeaders(), body: '' }
  if (event.httpMethod !== 'GET') return { statusCode: 405, headers: corsHeaders(), body: JSON.stringify({ error: 'Method not allowed' }) }

  const days = parseInt(event.queryStringParameters?.days || '30', 10)

  try {
    // Aggregate analytics
    const analytics = await supabaseQuery<Array<{
      impressions: number
      likes: number
      comments: number
      shares: number
      engagement_rate: number
    }>>(
      `/post_analytics?select=impressions,likes,comments,shares,engagement_rate&recorded_at=gte.${new Date(Date.now() - days * 86400000).toISOString()}`
    ).catch(() => [])

    // Count posts
    const posts = await supabaseQuery<Array<{ id: string; platform: string }>>(
      `/posts?select=id,platform&created_at=gte.${new Date(Date.now() - days * 86400000).toISOString()}`
    ).catch(() => [])

    const total_posts = posts.length
    const total_impressions = analytics.reduce((s, r) => s + (r.impressions || 0), 0)
    const total_likes = analytics.reduce((s, r) => s + (r.likes || 0), 0)
    const total_comments = analytics.reduce((s, r) => s + (r.comments || 0), 0)
    const total_shares = analytics.reduce((s, r) => s + (r.shares || 0), 0)
    const avg_engagement_rate = analytics.length
      ? analytics.reduce((s, r) => s + (r.engagement_rate || 0), 0) / analytics.length
      : 0

    // Platform breakdown
    const platform_breakdown: Record<string, number> = {}
    for (const p of posts) {
      platform_breakdown[p.platform] = (platform_breakdown[p.platform] || 0) + 1
    }

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({
        total_posts,
        total_impressions,
        total_likes,
        total_comments,
        total_shares,
        avg_engagement_rate: parseFloat(avg_engagement_rate.toFixed(2)),
        platform_breakdown,
        daily_data: [],
      }),
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal error'
    return { statusCode: 500, headers: corsHeaders(), body: JSON.stringify({ error: message }) }
  }
}

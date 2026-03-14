import type { Handler } from '@netlify/functions'
import { supabaseQuery } from './_mcp-helper.mjs'

// Cron: every Monday 8 AM UTC — find best posting times
export const handler: Handler = async (_event) => {
  try {
    // Get all analytics with timestamps
    const analytics = await supabaseQuery<Array<{ recorded_at: string; engagement_rate: number }>>(
      `/post_analytics?select=recorded_at,engagement_rate&order=recorded_at.desc&limit=500`
    ).catch(() => [])

    // Group by hour of day
    const byHour: Record<number, number[]> = {}
    const byDay: Record<number, number[]> = {}

    for (const item of analytics) {
      const d = new Date(item.recorded_at)
      const hour = d.getHours()
      const day = d.getDay()
      if (!byHour[hour]) byHour[hour] = []
      if (!byDay[day]) byDay[day] = []
      byHour[hour].push(item.engagement_rate || 0)
      byDay[day].push(item.engagement_rate || 0)
    }

    const avgByHour = Object.entries(byHour).map(([h, rates]) => ({
      hour: parseInt(h),
      avg_engagement: rates.reduce((a, b) => a + b, 0) / rates.length,
    })).sort((a, b) => b.avg_engagement - a.avg_engagement)

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const avgByDay = Object.entries(byDay).map(([d, rates]) => ({
      day: dayNames[parseInt(d)],
      avg_engagement: rates.reduce((a, b) => a + b, 0) / rates.length,
    })).sort((a, b) => b.avg_engagement - a.avg_engagement)

    const insights = {
      best_hours: avgByHour.slice(0, 5).map((h) => `${h.hour}:00 (${h.avg_engagement.toFixed(1)}%)`),
      best_days: avgByDay.slice(0, 3).map((d) => `${d.day} (${d.avg_engagement.toFixed(1)}%)`),
    }

    await supabaseQuery('/cron_logs', {
      method: 'POST',
      body: JSON.stringify({
        job_name: 'weekly-analysis',
        status: 'success',
        posts_processed: analytics.length,
        error_message: JSON.stringify(insights),
        ran_at: new Date().toISOString(),
      }),
    }).catch(() => {})

    return { statusCode: 200, body: JSON.stringify(insights) }
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: String(error) }) }
  }
}

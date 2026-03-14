import type { Handler } from '@netlify/functions'
import { supabaseQuery } from './_mcp-helper.mjs'

// Cron: daily at 6 AM UTC — fetch trends from all sources
export const handler: Handler = async (_event) => {
  const categories = ['ai', 'automation', 'no-code', 'productivity', 'saas']
  let fetched = 0

  for (const category of categories) {
    try {
      const res = await fetch(`${process.env.URL || 'http://localhost:8888'}/.netlify/functions/get-trends?category=${category}`)
      if (!res.ok) continue
      const topics = await res.json()

      for (const topic of topics.slice(0, 10)) {
        await supabaseQuery('/trending_topics', {
          method: 'POST',
          body: JSON.stringify({ ...topic, category }),
        }).catch(() => {})
        fetched++
      }
    } catch { /* continue */ }
  }

  await supabaseQuery('/cron_logs', {
    method: 'POST',
    body: JSON.stringify({
      job_name: 'trend-fetch',
      status: 'success',
      posts_processed: fetched,
      ran_at: new Date().toISOString(),
    }),
  }).catch(() => {})

  return { statusCode: 200, body: JSON.stringify({ fetched }) }
}

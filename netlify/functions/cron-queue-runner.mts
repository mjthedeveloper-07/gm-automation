import type { Handler } from '@netlify/functions'
import { supabaseQuery } from './_mcp-helper.mjs'

// Cron: every 5 minutes — process pending posts from queue
export const handler: Handler = async (_event) => {
  const now = new Date().toISOString()

  try {
    // Get pending posts due for publishing
    const pending = await supabaseQuery<Array<{
      id: string
      post_id: string
      platforms: string[]
      retry_count: number
      posts?: { content: string; caption?: string; media_urls?: string[] }
    }>>(
      `/scheduled_posts?status=eq.pending&scheduled_at=lte.${now}&retry_count=lt.3&select=*,posts(*)`
    ).catch(() => [])

    let processed = 0
    let errors = 0

    for (const item of pending) {
      try {
        for (const platform of item.platforms) {
          await fetch(`${process.env.URL || 'http://localhost:8888'}/.netlify/functions/publish-post`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              platform,
              content: item.posts?.content || '',
              caption: item.posts?.caption,
              media_urls: item.posts?.media_urls,
            }),
          })
        }

        // Mark as published
        await supabaseQuery(`/scheduled_posts?id=eq.${item.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'published' }),
        })
        await supabaseQuery(`/posts?id=eq.${item.post_id}`, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'published', posted_at: now }),
        })
        processed++
      } catch (e) {
        errors++
        const newRetry = (item.retry_count || 0) + 1
        const newStatus = newRetry >= 3 ? 'failed' : 'pending'
        const nextAttempt = newRetry >= 3 ? {} : {
          scheduled_at: new Date(Date.now() + 5 * 60 * 1000).toISOString()
        }

        await supabaseQuery(`/scheduled_posts?id=eq.${item.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            status: newStatus,
            retry_count: newRetry,
            error_message: e instanceof Error ? e.message : 'Unknown error',
            ...nextAttempt,
          }),
        }).catch(() => {})
      }
    }

    // Log cron run
    await supabaseQuery('/cron_logs', {
      method: 'POST',
      body: JSON.stringify({
        job_name: 'queue-runner',
        status: errors > 0 ? 'partial' : 'success',
        posts_processed: processed,
        error_message: errors > 0 ? `${errors} posts failed` : null,
        ran_at: now,
      }),
    }).catch(() => {})

    return { statusCode: 200, body: JSON.stringify({ processed, errors }) }
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: String(error) }) }
  }
}

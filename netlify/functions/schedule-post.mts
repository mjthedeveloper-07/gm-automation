import type { Handler } from '@netlify/functions'
import { supabaseQuery, corsHeaders } from './_mcp-helper.mjs'

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: corsHeaders(), body: '' }
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: corsHeaders(), body: JSON.stringify({ error: 'Method not allowed' }) }

  try {
    const { content, platforms, scheduled_at, media_urls, content_type = 'post', caption, hashtags } = JSON.parse(event.body || '{}')

    if (!content || !platforms?.length || !scheduled_at) {
      return { statusCode: 400, headers: corsHeaders(), body: JSON.stringify({ error: 'content, platforms, and scheduled_at are required' }) }
    }

    const userId = 'default-user' // Would come from auth in production

    // 1. Insert post
    const [post] = await supabaseQuery<Array<{ id: string }>>('/posts', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        content,
        caption,
        hashtags,
        media_urls,
        content_type,
        platform: platforms[0],
        status: 'scheduled',
      }),
    })

    // 2. Insert scheduled_posts
    const [scheduledPost] = await supabaseQuery<Array<{ id: string }>>('/scheduled_posts', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        post_id: post.id,
        platforms,
        scheduled_at,
        status: 'pending',
        retry_count: 0,
      }),
    })

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({ id: scheduledPost.id, post_id: post.id }),
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal error'
    return { statusCode: 500, headers: corsHeaders(), body: JSON.stringify({ error: message }) }
  }
}

import type { Handler } from '@netlify/functions'
import { corsHeaders } from './_mcp-helper.mjs'

// Instagram two-phase publish (per skill.md: create container → check status → publish)
async function publishInstagram(content: string, mediaUrls?: string[], caption?: string) {
  const igUserId = process.env.INSTAGRAM_ACCOUNT_ID
  const accessToken = process.env.META_ACCESS_TOKEN
  const baseUrl = `https://graph.instagram.com/v20.0`

  if (!igUserId || !accessToken) throw new Error('Instagram credentials not configured')

  const postCaption = caption || content

  // Check publishing limit first (25 posts/24hr rolling window)
  const limitRes = await fetch(
    `${baseUrl}/${igUserId}/content_publishing_limit?fields=config,quota_usage&access_token=${accessToken}`
  )
  if (limitRes.ok) {
    const limitData = await limitRes.json()
    const quota = limitData.data?.[0]?.quota_usage || 0
    if (quota >= 25) throw new Error('Instagram publishing limit reached (25 posts/24hr)')
  }

  let containerId: string
  const finalMediaUrls = mediaUrls && mediaUrls.length > 0 ? mediaUrls : [
    // Fallback beautiful abstract gradient image for text-only posts
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1080&auto=format&fit=crop'
  ]

  if (finalMediaUrls.length > 1) {
    // Carousel: create individual containers first
    const childIds: string[] = []
    for (const imgUrl of finalMediaUrls) {
      const childRes = await fetch(`${baseUrl}/${igUserId}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: imgUrl, is_carousel_item: true, access_token: accessToken }),
      })
      const childData = await childRes.json()
      if (!childData.id) throw new Error('Failed to create carousel child container')
      childIds.push(childData.id)
    }

    // Poll each child for FINISHED status
    for (const childId of childIds) {
      await pollContainerStatus(baseUrl, childId, accessToken)
    }

    // Create carousel container
    const carouselRes = await fetch(`${baseUrl}/${igUserId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ media_type: 'CAROUSEL', children: childIds.join(','), caption: postCaption, access_token: accessToken }),
    })
    const carouselData = await carouselRes.json()
    if (!carouselData.id) throw new Error('Failed to create carousel container')
    containerId = carouselData.id
  } else {
    // Single image post (or fallback image)
    const mediaRes = await fetch(`${baseUrl}/${igUserId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_url: finalMediaUrls[0], caption: postCaption, access_token: accessToken }),
    })
    const mediaData = await mediaRes.json()
    if (!mediaData.id) throw new Error('Failed to create media container')
    containerId = mediaData.id
  }

  // Poll container status
  await pollContainerStatus(baseUrl, containerId, accessToken)

  // Publish the container
  const publishRes = await fetch(`${baseUrl}/${igUserId}/media_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ creation_id: containerId, access_token: accessToken }),
  })
  const publishData = await publishRes.json()
  if (!publishData.id) throw new Error('Instagram publish failed')

  return publishData.id
}

async function pollContainerStatus(baseUrl: string, containerId: string, accessToken: string, maxAttempts = 10): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    const statusRes = await fetch(`${baseUrl}/${containerId}?fields=status_code&access_token=${accessToken}`)
    const statusData = await statusRes.json()
    if (statusData.status_code === 'FINISHED') return
    if (statusData.status_code === 'ERROR') throw new Error('Media container processing failed')
    await new Promise((r) => setTimeout(r, 2000)) // wait 2s between polls
  }
  throw new Error('Media container processing timed out')
}

async function publishTwitter(content: string) {
  const res = await fetch('https://api.twitter.com/2/tweets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text: content }),
  })
  if (!res.ok) throw new Error(`Twitter API error: ${res.status}`)
  const data = await res.json()
  return data.data?.id
}

async function publishLinkedIn(content: string) {
  const personId = process.env.LINKEDIN_PERSON_ID
  const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify({
      author: `urn:li:person:${personId}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text: content },
          shareMediaCategory: 'NONE',
        },
      },
      visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
    }),
  })
  if (!res.ok) throw new Error(`LinkedIn API error: ${res.status}`)
  const id = res.headers.get('x-restli-id')
  return id || undefined
}

async function publishThreads(content: string) {
  const userId = process.env.THREADS_USER_ID
  const accessToken = process.env.META_ACCESS_TOKEN

  // Step 1: Create container
  const containerRes = await fetch(`https://graph.threads.net/v1.0/${userId}/threads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ media_type: 'TEXT', text: content, access_token: accessToken }),
  })
  const containerData = await containerRes.json()
  if (!containerData.id) throw new Error('Threads container creation failed')

  // Step 2: Publish
  const publishRes = await fetch(`https://graph.threads.net/v1.0/${userId}/threads_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ creation_id: containerData.id, access_token: accessToken }),
  })
  const publishData = await publishRes.json()
  return publishData.id
}

async function publishMastodon(content: string) {
  const instance = process.env.MASTODON_INSTANCE || 'mastodon.social'
  const res = await fetch(`https://${instance}/api/v1/statuses`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.MASTODON_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status: content, visibility: 'public' }),
  })
  if (!res.ok) throw new Error(`Mastodon error: ${res.status}`)
  const data = await res.json()
  return data.id
}

async function publishBluesky(content: string) {
  // Get session token
  const sessionRes = await fetch('https://bsky.social/xrpc/com.atproto.server.createSession', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: process.env.BLUESKY_IDENTIFIER,
      password: process.env.BLUESKY_APP_PASSWORD,
    }),
  })
  if (!sessionRes.ok) throw new Error('Bluesky auth failed')
  const session = await sessionRes.json()

  // Create post
  const res = await fetch('https://bsky.social/xrpc/com.atproto.repo.createRecord', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.accessJwt}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      repo: session.did,
      collection: 'app.bsky.feed.post',
      record: {
        text: content,
        createdAt: new Date().toISOString(),
        $type: 'app.bsky.feed.post',
        langs: ['en'],
      },
    }),
  })
  if (!res.ok) throw new Error(`Bluesky publish error: ${res.status}`)
  const data = await res.json()
  return data.uri
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: corsHeaders(), body: '' }
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: corsHeaders(), body: JSON.stringify({ error: 'Method not allowed' }) }

  try {
    const { platform, content, caption, media_urls } = JSON.parse(event.body || '{}')

    if (!platform || !content) {
      return { statusCode: 400, headers: corsHeaders(), body: JSON.stringify({ error: 'platform and content are required' }) }
    }

    let postId: string | undefined

    switch (platform) {
      case 'instagram':
        postId = await publishInstagram(content, media_urls, caption)
        break
      case 'twitter':
        postId = await publishTwitter(content)
        break
      case 'linkedin':
        postId = await publishLinkedIn(content)
        break
      case 'threads':
        postId = await publishThreads(content)
        break
      case 'mastodon':
        postId = await publishMastodon(content)
        break
      case 'bluesky':
        postId = await publishBluesky(content)
        break
      default:
        return { statusCode: 400, headers: corsHeaders(), body: JSON.stringify({ error: `Unknown platform: ${platform}` }) }
    }

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({ success: true, post_id: postId }),
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal error'
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ success: false, error: message }),
    }
  }
}

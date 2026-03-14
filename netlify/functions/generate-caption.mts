import type { Handler } from '@netlify/functions'
import { generateWithFallback, HASHTAG_BANK, TRENDING_HOOKS, corsHeaders } from './_mcp-helper.mjs'

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: corsHeaders(), body: '' }
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: corsHeaders(), body: JSON.stringify({ error: 'Method not allowed' }) }

  try {
    const { topic, platform = 'instagram', include_emojis = true, hashtag_count = 15 } = JSON.parse(event.body || '{}')

    if (!topic) return { statusCode: 400, headers: corsHeaders(), body: JSON.stringify({ error: 'Topic required' }) }

    const emojiNote = include_emojis ? 'Include relevant emojis throughout.' : 'No emojis please.'

    const prompt = `You are a social media copywriter for the Automations & Tech niche.

Write a ${platform} caption for this topic: "${topic}"

Rules:
- Start with a powerful hook (first line grabs attention)
- Share value in 3–5 lines
- End with a clear CTA (follow, comment, share your story)
- ${emojiNote}
- Platform: ${platform}

Then on a new line write exactly ${hashtag_count} relevant hashtags (mix niche + broad), formatted as:
HASHTAGS: #tag1 #tag2 #tag3...

Also provide the hook alone on a line starting with:
HOOK: [the first line of your caption]

Format your response EXACTLY like:
HOOK: [hook text]
CAPTION: [full caption]
HASHTAGS: #tag1 #tag2...`

    const raw = await generateWithFallback(prompt, 800)

    // Parse response
    const hookMatch = raw.match(/HOOK:\s*(.+?)(?:\n|$)/i)
    const captionMatch = raw.match(/CAPTION:\s*([\s\S]+?)(?:HASHTAGS:|$)/i)
    const hashtagMatch = raw.match(/HASHTAGS:\s*(.+)/i)

    const hook = hookMatch?.[1]?.trim() || TRENDING_HOOKS[Math.floor(Math.random() * TRENDING_HOOKS.length)]
    const caption = captionMatch?.[1]?.trim() || raw.trim()

    let hashtags: string[]
    if (hashtagMatch?.[1]) {
      hashtags = hashtagMatch[1]
        .split(/[\s,]+/)
        .map((h) => h.replace('#', '').trim())
        .filter(Boolean)
        .slice(0, hashtag_count)
    } else {
      hashtags = HASHTAG_BANK.slice(0, hashtag_count)
    }

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({ caption, hook, hashtags }),
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal error'
    return { statusCode: 500, headers: corsHeaders(), body: JSON.stringify({ error: message }) }
  }
}

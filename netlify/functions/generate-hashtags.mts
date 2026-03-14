import type { Handler } from '@netlify/functions'
import { HASHTAG_BANK, generateWithFallback, corsHeaders } from './_mcp-helper.mjs'

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: corsHeaders(), body: '' }
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: corsHeaders(), body: JSON.stringify({ error: 'Method not allowed' }) }

  try {
    const { topic, count = 15 } = JSON.parse(event.body || '{}')

    if (!topic) {
      return { statusCode: 400, headers: corsHeaders(), body: JSON.stringify({ error: 'topic required' }) }
    }

    const prompt = `Generate ${count} relevant hashtags for this social media topic: "${topic}"
Context: Automations & Tech niche. Mix high-traffic (#AI #tech) and niche (#n8nautomation #aiagents) tags.
Return ONLY the hashtags separated by spaces, no # symbol, no explanation.
Example: automation AI productivity nocode tech`

    const raw = await generateWithFallback(prompt, 200)
    const aiHashtags = raw
      .split(/[\s,]+/)
      .map((h) => h.replace('#', '').trim().toLowerCase())
      .filter((h) => h.length > 2 && /^[a-zA-Z0-9]+$/.test(h))

    // Merge AI-generated with bank
    const merged = [...new Set([...aiHashtags, ...HASHTAG_BANK])].slice(0, count)

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({ hashtags: merged }),
    }
  } catch (error: unknown) {
    // Fallback to bank
    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({ hashtags: HASHTAG_BANK.slice(0, 15) }),
    }
  }
}

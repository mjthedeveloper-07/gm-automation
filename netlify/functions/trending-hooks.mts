import type { Handler } from '@netlify/functions'
import { TRENDING_HOOKS, generateWithFallback, corsHeaders } from './_mcp-helper.mjs'

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: corsHeaders(), body: '' }
  if (event.httpMethod !== 'GET') return { statusCode: 405, headers: corsHeaders(), body: JSON.stringify({ error: 'Method not allowed' }) }

  const topic = event.queryStringParameters?.topic

  try {
    if (topic) {
      const prompt = `Generate 15 powerful social media hooks for the topic: "${topic}"
Context: Automations & Tech niche. Hooks should be punchy, curiosity-inducing, or contrarian.
Format: One hook per line, no numbering, no bullets.`
      const raw = await generateWithFallback(prompt, 500)
      const hooks = raw.split('\n').map((h) => h.trim()).filter((h) => h.length > 10).slice(0, 15)
      return { statusCode: 200, headers: corsHeaders(), body: JSON.stringify({ hooks }) }
    }

    // Return general trending hooks from bank
    const shuffled = [...TRENDING_HOOKS].sort(() => Math.random() - 0.5).slice(0, 15)
    return { statusCode: 200, headers: corsHeaders(), body: JSON.stringify({ hooks: shuffled }) }
  } catch {
    return { statusCode: 200, headers: corsHeaders(), body: JSON.stringify({ hooks: TRENDING_HOOKS.slice(0, 10) }) }
  }
}

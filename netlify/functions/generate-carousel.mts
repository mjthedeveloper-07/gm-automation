import type { Handler } from '@netlify/functions'
import { generateWithFallback, corsHeaders } from './_mcp-helper.mjs'

const SLIDE_SEQUENCE = ['hook', 'value', 'value', 'example', 'tip', 'tip', 'value', 'example', 'tip', 'cta']

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: corsHeaders(), body: '' }
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: corsHeaders(), body: JSON.stringify({ error: 'Method not allowed' }) }

  try {
    const { topic, slide_count = 5, template = 'minimal-dark', brand_color = '#0ea5e9' } = JSON.parse(event.body || '{}')

    if (!topic) return { statusCode: 400, headers: corsHeaders(), body: JSON.stringify({ error: 'Topic required' }) }

    const types = SLIDE_SEQUENCE.slice(0, slide_count)

    const prompt = `You are an expert carousel content creator for the Automations & Tech niche.
Create a ${slide_count}-slide Instagram carousel about: "${topic}"

Generate exactly ${slide_count} slides in this JSON format. Each slide must have:
- slide_order (1 to ${slide_count})
- type: one of these in order: ${types.join(', ')}
- headline: short punchy headline (max 8 words)
- body: 1–2 sentence value statement (max 30 words)

Rules for slide types:
- hook: Bold claim, surprising fact, or provocative question
- value: A key insight or actionable takeaway  
- example: Real-world example or use case
- tip: Actionable tip they can implement today
- cta: Clear call to action (follow, save, share, try)

Return ONLY valid JSON array, no markdown, no explanation:
[{"slide_order":1,"type":"hook","headline":"...","body":"..."},...]`

    const raw = await generateWithFallback(prompt, 1200)

    // Parse JSON from response
    let slides
    const jsonMatch = raw.match(/\[[\s\S]+\]/)
    if (jsonMatch) {
      slides = JSON.parse(jsonMatch[0])
    } else {
      // Fallback: generate minimal slides
      slides = Array.from({ length: slide_count }, (_, i) => ({
        slide_order: i + 1,
        type: types[i] || 'value',
        headline: i === 0 ? 'Stop Doing This Manually' : i === slide_count - 1 ? 'Take Action Today' : `Key Insight #${i}`,
        body: i === 0
          ? `Most people waste hours on tasks AI can automate in minutes. Here's what to do instead.`
          : `Automation hack #${i}: Build it once, let it run forever.`,
      }))
    }

    // Add template + color metadata
    const enrichedSlides = slides.map((s: Record<string, unknown>) => ({
      ...s,
      template,
      bg_color: template === 'white-clean' ? '#ffffff' : '#0a0a0a',
      text_color: template === 'white-clean' ? '#111827' : '#ffffff',
    }))

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({ slides: enrichedSlides }),
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal error'
    return { statusCode: 500, headers: corsHeaders(), body: JSON.stringify({ error: message }) }
  }
}

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

    const prompt = `You are an expert carousel content creator.
Create a ${slide_count}-slide Instagram carousel about: "${topic}"

STRATEGY: Incorporate the "Full-Stack Hooks" playbook for slide composition. Do NOT copy the exact example words, but strictly use the structural template of these styles matched to the topic:
- The Flex: 4 short punchy lines (e.g., "[Action 1]. [Action 2]. [Action 3]. [Result].")
- The Callout: Challenge a norm (e.g., "YOUR [Target] DESERVES MORE THAN A [Basic Solution].")
- The Offer: An irresistible value prop (e.g., "What if you could get [Outcome] for [Price/Time]?")
- The Truth: An exposing fact (e.g., "MOST [Professionals] ARE ONE [Mistake] AWAY FROM [Failure].")
- The Price Shock: Highlighting value (e.g., "<s>[Expensive]</s> [Premium Solution]. [Accessible Value].")
- The Code Drop: Direct delivery (e.g., "I WRITE THE [Code]. I DEPLOY THE [App]. YOU GET THE [Result].")

Generate exactly ${slide_count} slides in this JSON format.
Each slide must have:
- slide_order (1 to ${slide_count})
- type: (Assign one of: hook, value, example, tip, cta)
- headline: Follow the structural templates above. Max 10 words. KEEP IT SHORT, BOLD, AND PROVOCATIVE.
- body: 1–2 sentence value statement (max 30 words)

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

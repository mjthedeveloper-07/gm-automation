import type { Handler } from '@netlify/functions'
import { generateWithFallback, CHAR_LIMITS, corsHeaders } from './_mcp-helper.mjs'

const PLATFORM_PROMPTS: Record<string, string> = {
  instagram: 'Write an engaging Instagram caption. Use emojis, line breaks, and storytelling. End with a CTA.',
  twitter: 'Write a punchy tweet under 280 chars. Hook first. No fluff.',
  linkedin: 'Write a professional LinkedIn post. Share insight or a lesson learned. Use line breaks for readability.',
  threads: 'Write a short Threads post under 500 chars. Conversational and authentic.',
  mastodon: 'Write a Mastodon post. Clear, informative, community-friendly.',
  bluesky: 'Write a Bluesky post under 300 chars. Brief, engaging, thought-provoking.',
}

const TONE_MODIFIERS: Record<string, string> = {
  educational: 'Use a teacher\'s voice: explain clearly, share value, use analogies.',
  inspiring: 'Be uplifting and motivational. Share a vision of what\'s possible.',
  humorous: 'Be witty and funny. Use humor naturally without forcing it.',
  professional: 'Be authoritative but approachable. Show domain expertise.',
  casual: 'Be conversational and relaxed. Write like texting a smart friend.',
}

const LENGTH_TARGETS: Record<string, string> = {
  short: 'Keep it under 150 characters. Ultra-concise.',
  medium: 'Aim for 200-400 characters. Good balance of detail and brevity.',
  long: 'Write a fuller piece with context, examples, and detail.',
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders(), body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders(), body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  try {
    const { topic, platform = 'instagram', tone = 'educational', length = 'medium', include_emojis = true } = JSON.parse(event.body || '{}')

    if (!topic) {
      return { statusCode: 400, headers: corsHeaders(), body: JSON.stringify({ error: 'Topic is required' }) }
    }

    const platformPrompt = PLATFORM_PROMPTS[platform] || PLATFORM_PROMPTS.instagram
    const toneModifier = TONE_MODIFIERS[tone] || ''
    const lengthTarget = LENGTH_TARGETS[length] || LENGTH_TARGETS.medium
    const charLimit = CHAR_LIMITS[platform] || 2200
    const emojiInstruction = include_emojis ? 'Use relevant emojis naturally.' : 'No emojis.'

    const prompt = `You are an expert social media content creator for the Automations & Tech niche.
Target audience: Developers, SaaS builders, solopreneurs, no-code creators.
Content pillars: AI tools, No-code automation, Productivity hacks, Tech tutorials, Workflow automation.

${platformPrompt}
${toneModifier}
${lengthTarget}
${emojiInstruction}
Character limit: ${charLimit}

Topic: ${topic}

Write ONLY the post content. No preamble, no "Here's the post:", no quotes. Just the content itself.`

    const content = await generateWithFallback(prompt)

    // Trim to char limit if over
    const trimmed = content.length > charLimit ? content.slice(0, charLimit - 3) + '...' : content

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({ content: trimmed }),
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal error'
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: message }),
    }
  }
}

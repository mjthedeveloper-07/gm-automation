// ── Shared LLM helpers for all Netlify functions ─────────────────────────────

export const CHAR_LIMITS: Record<string, number> = {
  twitter: 280,
  threads: 500,
  instagram: 2200,
  linkedin: 3000,
  bluesky: 300,
  mastodon: 500,
}

export const HASHTAG_BANK = [
  // High traffic
  'automation', 'AI', 'tech', 'productivity', 'nocode', 'SaaS',
  // Medium traffic
  'AItools', 'zapier', 'n8n', 'make', 'buildinpublic', 'workflowautomation',
  // Low traffic (niche)
  'n8nautomation', 'aiagents', 'agenticai', 'mcpserver', 'automationhacks',
  // Community
  'indiehackers', '100DaysOfCode', 'futureofwork', 'solopreneur', 'makersgang',
]

export const TRENDING_HOOKS = [
  'Stop wasting time on tasks AI can do for you 🤖',
  'I automated my entire content workflow — here\'s how',
  'Most creators don\'t know this automation trick exists',
  'This one tool saves me 10 hours every week',
  'The future of content creation is already here',
  'Why I deleted every manual task from my workflow',
  'You\'re doing social media the hard way. Here\'s the fix:',
  'This automation changed how I run my business',
  '3 AI tools that will replace your content team (in a good way)',
  'The no-code stack that powers my entire business',
  'What if you could post content without touching it?',
  'AI automation isn\'t the future — it\'s right now',
  'I spent 10 mins setting this up and saved 5 hours/week',
  'This is why solopreneurs are winning in 2025',
  'Hot take: manual posting is wasting your life',
]

// ── HuggingFace Cerebras ──────────────────────────────────────────────────────
export async function callHuggingFace(prompt: string, maxTokens = 600): Promise<string> {
  const models = ['llama3.3-70b', 'llama3.1-8b']
  const providers = ['cerebras', 'fireworks-ai']

  for (const provider of providers) {
    for (const model of models) {
      try {
        const url = `https://router.huggingface.co/${provider}/v1/chat/completions`
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: prompt }],
            max_tokens: maxTokens,
            temperature: 0.7,
          }),
        })

        if (!res.ok) continue

        const data = await res.json()
        const text = data.choices?.[0]?.message?.content?.trim()
        if (text) return text
      } catch {
        // try next
      }
    }
  }

  throw new Error('All HuggingFace endpoints failed')
}

// ── Groq ──────────────────────────────────────────────────────────────────────
export async function callGroq(prompt: string, maxTokens = 600): Promise<string> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'mixtral-8x7b-32768',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  })

  if (!res.ok) throw new Error(`Groq error: ${res.status}`)
  const data = await res.json()
  return data.choices[0].message.content.trim()
}

// ── Mistral ───────────────────────────────────────────────────────────────────
export async function callMistral(prompt: string): Promise<string> {
  const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'mistral-7b-instruct',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    }),
  })

  if (!res.ok) throw new Error(`Mistral error: ${res.status}`)
  const data = await res.json()
  return data.choices[0].message.content.trim()
}

// ── Static fallback ───────────────────────────────────────────────────────────
function staticFallback(): string {
  const hooks = [
    '🚀 Automate your content workflow with AI — it\'s easier than you think!',
    '⚡ Stop doing manually what AI can do in seconds. Work smarter.',
    '🤖 The future of social media is automated. Are you keeping up?',
  ]
  return hooks[Math.floor(Math.random() * hooks.length)] +
    '\n\n#automation #AI #tech #nocode #productivity #buildinpublic #solopreneur #workflowautomation #n8n #AItools'
}

// ── Fallback chain ────────────────────────────────────────────────────────────
export async function generateWithFallback(prompt: string, maxTokens = 600): Promise<string> {
  // 1. HuggingFace
  try {
    return await callHuggingFace(prompt, maxTokens)
  } catch { /* fall through */ }

  // 2. Groq
  if (process.env.GROQ_API_KEY) {
    try {
      return await callGroq(prompt, maxTokens)
    } catch { /* fall through */ }
  }

  // 3. Mistral
  if (process.env.MISTRAL_API_KEY) {
    try {
      return await callMistral(prompt)
    } catch { /* fall through */ }
  }

  // 4. Static
  return staticFallback()
}

// ── Supabase helper ───────────────────────────────────────────────────────────
export function getSupabaseHeaders() {
  return {
    'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '',
    'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || ''}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
  }
}

export function supabaseUrl(path: string): string {
  return `${process.env.SUPABASE_URL}/rest/v1${path}`
}

export async function supabaseQuery<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(supabaseUrl(path), {
    ...options,
    headers: {
      ...getSupabaseHeaders(),
      ...(options?.headers as Record<string, string> || {}),
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `Supabase error: ${res.status}`)
  }
  return res.json()
}

// ── Generic CORS response helper ──────────────────────────────────────────────
export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
    'Content-Type': 'application/json',
  }
}

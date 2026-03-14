import type { Handler } from '@netlify/functions'
import { corsHeaders } from './_mcp-helper.mjs'

const CATEGORY_KEYWORDS: Record<string, { hn: string; devto: string; github: string }> = {
  ai: { hn: 'artificial intelligence', devto: 'ai', github: 'ai+machine-learning' },
  automation: { hn: 'automation workflow', devto: 'automation', github: 'automation' },
  'no-code': { hn: 'no-code nocode', devto: 'nocode', github: 'no-code' },
  productivity: { hn: 'productivity tools', devto: 'productivity', github: 'productivity' },
  saas: { hn: 'SaaS startup', devto: 'saas', github: 'saas' },
}

async function fetchHackerNews(query: string, limit = 7) {
  try {
    const res = await fetch(
      `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=${limit}`
    )
    if (!res.ok) return []
    const data = await res.json()
    return (data.hits || [])
      .filter((h: { points: number }) => h.points > 10)
      .map((h: { objectID: string; title: string; url: string; points: number }) => ({
        source: 'hackernews',
        title: h.title,
        url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
        score: h.points || 0,
        fetched_at: new Date().toISOString(),
      }))
  } catch {
    return []
  }
}

async function fetchDevTo(tag: string, limit = 7) {
  try {
    const res = await fetch(
      `https://dev.to/api/articles?tag=${encodeURIComponent(tag)}&per_page=${limit}&top=1`
    )
    if (!res.ok) return []
    const data = await res.json()
    return data.map((a: { id: number; title: string; url: string; positive_reactions_count: number }) => ({
      source: 'devto',
      title: a.title,
      url: a.url,
      score: a.positive_reactions_count || 0,
      fetched_at: new Date().toISOString(),
    }))
  } catch {
    return []
  }
}

async function fetchGitHub(topic: string, limit = 6) {
  try {
    const res = await fetch(
      `https://api.github.com/search/repositories?q=${encodeURIComponent(topic)}&sort=stars&order=desc&per_page=${limit}`,
      { headers: { 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'GM-Automation' } }
    )
    if (!res.ok) return []
    const data = await res.json()
    return (data.items || []).map((r: { id: number; name: string; html_url: string; stargazers_count: number; description: string }) => ({
      source: 'github',
      title: `${r.name}: ${r.description || 'Trending GitHub repo'}`,
      url: r.html_url,
      score: r.stargazers_count || 0,
      fetched_at: new Date().toISOString(),
    }))
  } catch {
    return []
  }
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: corsHeaders(), body: '' }
  if (event.httpMethod !== 'GET') return { statusCode: 405, headers: corsHeaders(), body: JSON.stringify({ error: 'Method not allowed' }) }

  const category = event.queryStringParameters?.category || 'ai'
  const keywords = CATEGORY_KEYWORDS[category] || CATEGORY_KEYWORDS.ai

  try {
    const [hnTopics, devtoTopics, githubTopics] = await Promise.all([
      fetchHackerNews(keywords.hn),
      fetchDevTo(keywords.devto),
      fetchGitHub(keywords.github),
    ])

    const allTopics = [...hnTopics, ...devtoTopics, ...githubTopics]
      .sort((a, b) => b.score - a.score)
      .slice(0, 20)

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify(allTopics),
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal error'
    return { statusCode: 500, headers: corsHeaders(), body: JSON.stringify({ error: message }) }
  }
}

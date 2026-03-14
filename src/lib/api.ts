import type {
  GeneratePostRequest,
  GeneratePostResponse,
  GenerateCaptionRequest,
  GenerateCaptionResponse,
  GenerateCarouselRequest,
  GenerateCarouselResponse,
  GenerateHashtagsRequest,
  PublishPostRequest,
  PublishResponse,
  SchedulePostRequest,
  ScheduledPost,
  AnalyticsSummary,
  TrendingTopic,
} from '../types'

const BASE = '/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || `Request failed: ${res.status}`)
  }
  return res.json()
}

const GET = <T>(path: string) => request<T>(path)
const POST = <T>(path: string, body: unknown) =>
  request<T>(path, { method: 'POST', body: JSON.stringify(body) })
const DELETE = <T>(path: string) => request<T>(path, { method: 'DELETE' })

export const api = {
  // ── Content Generation ────────────────────────────────────────────
  generatePost: (body: GeneratePostRequest) =>
    POST<GeneratePostResponse>('/generate-post', body),

  generateCaption: (body: GenerateCaptionRequest) =>
    POST<GenerateCaptionResponse>('/generate-caption', body),

  generateCarousel: (body: GenerateCarouselRequest) =>
    POST<GenerateCarouselResponse>('/generate-carousel', body),

  generateHashtags: (body: GenerateHashtagsRequest) =>
    POST<{ hashtags: string[] }>('/generate-hashtags', body),

  getTrendingHooks: (topic?: string) =>
    GET<{ hooks: string[] }>(`/trending-hooks${topic ? `?topic=${encodeURIComponent(topic)}` : ''}`),

  // ── Publishing ────────────────────────────────────────────────────
  publishPost: (body: PublishPostRequest) =>
    POST<PublishResponse>('/publish-post', body),

  // ── Scheduling ────────────────────────────────────────────────────
  schedulePost: (body: SchedulePostRequest) =>
    POST<{ id: string; post_id: string }>('/schedule-post', body),

  getQueue: () =>
    GET<ScheduledPost[]>('/get-queue'),

  cancelPost: (id: string) =>
    DELETE<{ success: boolean }>(`/cancel-post?id=${id}`),

  // ── Analytics ─────────────────────────────────────────────────────
  getAnalytics: (days = 30) =>
    GET<AnalyticsSummary>(`/get-analytics?days=${days}`),

  getTopPosts: (limit = 10) =>
    GET<AnalyticsSummary>(`/get-analytics?top=${limit}`),

  // ── Trends ────────────────────────────────────────────────────────
  getTrends: (category = 'ai') =>
    GET<TrendingTopic[]>(`/get-trends?category=${category}`),
}

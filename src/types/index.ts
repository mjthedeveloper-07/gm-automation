// ── Unions ────────────────────────────────────────────────────────────
export type Platform = 'instagram' | 'twitter' | 'linkedin' | 'threads' | 'mastodon' | 'bluesky'
export type ContentType = 'post' | 'carousel' | 'reel' | 'story'
export type PostStatus = 'draft' | 'scheduled' | 'pending' | 'published' | 'failed' | 'cancelled'
export type Tone = 'educational' | 'inspiring' | 'humorous' | 'professional' | 'casual'
export type PostLength = 'short' | 'medium' | 'long'
export type TrendCategory = 'ai' | 'automation' | 'no-code' | 'productivity' | 'saas'

// ── Core Interfaces ───────────────────────────────────────────────────
export interface Post {
  id: string
  user_id: string
  content: string
  caption?: string
  hashtags?: string[]
  media_urls?: string[]
  content_type: ContentType
  platform: Platform
  status: PostStatus
  external_post_id?: string
  posted_at?: string
  created_at: string
  updated_at: string
}

export interface ScheduledPost {
  id: string
  user_id: string
  post_id: string
  platforms: Platform[]
  scheduled_at: string
  status: PostStatus
  retry_count: number
  error_message?: string
  created_at: string
  posts?: Post
}

export interface PostAnalytics {
  id: string
  post_id: string
  platform: Platform
  impressions: number
  reach: number
  likes: number
  comments: number
  shares: number
  saves: number
  clicks: number
  engagement_rate: number
  recorded_at: string
}

export interface CarouselSlide {
  id?: string
  post_id?: string
  slide_order: number
  headline: string
  body: string
  image_url?: string
  template: string
  bg_color?: string
  text_color?: string
  type?: 'hook' | 'value' | 'example' | 'tip' | 'cta'
}

export interface TrendingTopic {
  id?: string
  source: string
  title: string
  url: string
  score: number
  fetched_at: string
  category?: string
}

export interface AnalyticsSummary {
  total_posts: number
  total_impressions: number
  total_likes: number
  total_comments: number
  total_shares: number
  avg_engagement_rate: number
  top_performing?: Post[]
  platform_breakdown?: Partial<Record<Platform, number>>
  daily_data?: Array<{
    date: string
    impressions: number
    likes: number
    comments: number
    shares: number
  }>
}

export interface CronJob {
  name: string
  schedule: string
  description: string
  lastRun: string
  status: 'active' | 'error' | 'pending'
}

// ── Request Types ─────────────────────────────────────────────────────
export interface GeneratePostRequest {
  topic: string
  platform: Platform
  tone?: Tone
  length?: PostLength
  include_emojis?: boolean
}

export interface GenerateCaptionRequest {
  topic: string
  platform: Platform
  include_emojis?: boolean
  hashtag_count?: number
}

export interface GenerateCarouselRequest {
  topic: string
  slide_count?: number
  template?: string
  brand_color?: string
}

export interface GenerateHashtagsRequest {
  topic: string
  count: number
}

export interface PublishPostRequest {
  platform: Platform
  content: string
  caption?: string
  media_urls?: string[]
  post_type?: ContentType
}

export interface SchedulePostRequest {
  content: string
  platforms: Platform[]
  scheduled_at: string
  media_urls?: string[]
  content_type?: ContentType
  caption?: string
  hashtags?: string[]
}

// ── Response Types ────────────────────────────────────────────────────
export interface GeneratePostResponse {
  content: string
}

export interface GenerateCaptionResponse {
  caption: string
  hook: string
  hashtags: string[]
}

export interface GenerateCarouselResponse {
  slides: CarouselSlide[]
}

export interface PublishResponse {
  success: boolean
  post_id?: string
  error?: string
}

export interface Notification {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
}

// ── Platform Config ───────────────────────────────────────────────────
export interface PlatformConfig {
  name: string
  color: string
  bg: string
  charLimit: number
  icon: string
  description: string
  docsUrl: string
}

export const PLATFORM_CONFIG: Record<Platform, PlatformConfig> = {
  instagram: {
    name: 'Instagram',
    color: '#E1306C',
    bg: 'from-purple-500 via-pink-500 to-orange-400',
    charLimit: 2200,
    icon: '📸',
    description: 'Share photos, videos, carousels, reels and stories',
    docsUrl: 'https://developers.facebook.com/docs/instagram-api',
  },
  twitter: {
    name: 'Twitter / X',
    color: '#1DA1F2',
    bg: 'from-sky-400 to-blue-500',
    charLimit: 280,
    icon: '🐦',
    description: 'Short-form text posts with media support',
    docsUrl: 'https://developer.twitter.com/en/docs',
  },
  linkedin: {
    name: 'LinkedIn',
    color: '#0077B5',
    bg: 'from-blue-600 to-blue-700',
    charLimit: 3000,
    icon: '💼',
    description: 'Professional networking and thought leadership',
    docsUrl: 'https://learn.microsoft.com/en-us/linkedin/',
  },
  threads: {
    name: 'Threads',
    color: '#000000',
    bg: 'from-gray-700 to-gray-900',
    charLimit: 500,
    icon: '🧵',
    description: 'Text-based conversations by Instagram',
    docsUrl: 'https://developers.facebook.com/docs/threads',
  },
  mastodon: {
    name: 'Mastodon',
    color: '#6364FF',
    bg: 'from-indigo-500 to-purple-600',
    charLimit: 500,
    icon: '🦣',
    description: 'Decentralized social platform (open-source)',
    docsUrl: 'https://docs.joinmastodon.org/api/',
  },
  bluesky: {
    name: 'Bluesky',
    color: '#0085ff',
    bg: 'from-blue-400 to-blue-600',
    charLimit: 300,
    icon: '🦋',
    description: 'Decentralized social network by ATProto',
    docsUrl: 'https://atproto.com/guides/overview',
  },
}

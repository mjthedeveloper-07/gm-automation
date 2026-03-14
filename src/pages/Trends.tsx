import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  TrendingUp, ExternalLink, PenLine, RefreshCw,
  Loader2, Globe, Github, BookOpen
} from 'lucide-react'
import { api } from '../lib/api'
import { useAppStore } from '../store/appStore'
import type { TrendCategory } from '../types'

const CATEGORIES: Array<{ value: TrendCategory; label: string }> = [
  { value: 'ai', label: '🤖 AI' },
  { value: 'automation', label: '⚙️ Automation' },
  { value: 'no-code', label: '🧩 No-Code' },
  { value: 'productivity', label: '⚡ Productivity' },
  { value: 'saas', label: '💼 SaaS' },
]

const SOURCE_CONFIG: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  'hackernews': { label: 'HackerNews', icon: BookOpen, color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  'devto': { label: 'Dev.to', icon: BookOpen, color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  'github': { label: 'GitHub', icon: Github, color: 'bg-dark-600 text-dark-200 border-dark-500' },
}

export default function Trends() {
  const { trendCategory, setTrendCategory, setDraft, addNotification } = useAppStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: trends = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['trends', trendCategory],
    queryFn: () => api.getTrends(trendCategory),
  })

  const handleCreatePost = (title: string) => {
    setDraft({ topic: title })
    addNotification('info', 'Topic pre-filled — create your post!')
    navigate('/create')
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-rose-400" />
            Trending Topics
          </h1>
          <p className="text-dark-400 text-sm mt-1">Live trends from HackerNews, Dev.to & GitHub</p>
        </div>
        <button
          className="btn-secondary flex items-center gap-2"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setTrendCategory(value)}
            className={trendCategory === value ? 'tab-btn-active' : 'tab-btn-inactive'}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Trend List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 skeleton rounded w-3/4 mb-2" />
              <div className="h-3 skeleton rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : trends.length === 0 ? (
        <div className="card flex flex-col items-center justify-center h-52 text-dark-500">
          <Globe className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-lg font-medium text-dark-400">No trends found</p>
          <p className="text-sm mt-1">Try a different category or refresh</p>
        </div>
      ) : (
        <div className="space-y-3">
          {trends.map((topic, i) => {
            const src = SOURCE_CONFIG[topic.source.toLowerCase()] || SOURCE_CONFIG.github
            const SourceIcon = src.icon

            return (
              <div
                key={topic.id ?? i}
                className="card-hover flex items-start gap-4"
              >
                {/* Rank */}
                <div className="text-2xl font-black text-dark-700 w-8 flex-shrink-0 text-center mt-0.5">
                  {i + 1}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-dark-100 leading-snug">{topic.title}</p>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className={`badge border flex items-center gap-1 ${src.color}`}>
                      <SourceIcon className="w-3 h-3" />
                      {src.label}
                    </span>
                    <span className="text-xs text-dark-400 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {topic.score.toLocaleString()} pts
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    className="btn-ghost text-xs flex items-center gap-1 py-1.5"
                    onClick={() => handleCreatePost(topic.title)}
                    title="Create post from this topic"
                  >
                    <PenLine className="w-3.5 h-3.5" />
                    Create Post
                  </button>
                  <a
                    href={topic.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost text-xs flex items-center gap-1 py-1.5"
                    title="Open original"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

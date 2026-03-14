import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  PenLine, Layers, Clock, BarChart3,
  TrendingUp, ArrowUpRight, Zap, Activity,
  Eye, Heart, MessageCircle, Globe
} from 'lucide-react'
import { api } from '../lib/api'
import { PLATFORM_CONFIG } from '../types'

const MCP_SERVERS = [
  { name: 'content-generator', status: 'active' },
  { name: 'caption-hashtag', status: 'active' },
  { name: 'social-publisher', status: 'active' },
  { name: 'trends-watcher', status: 'active' },
  { name: 'analytics', status: 'active' },
  { name: 'scheduler', status: 'active' },
]

function StatCard({ icon: Icon, label, value, trend, color }: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  trend?: string
  color: string
}) {
  return (
    <div className="card-hover">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend && (
          <span className="badge-success text-xs">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-dark-400 mt-0.5">{label}</p>
    </div>
  )
}

function QuickAction({ icon: Icon, label, description, to, color }: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  description: string
  to: string
  color: string
}) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate(to)}
      className="card-hover text-left group w-full"
    >
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="font-semibold text-white">{label}</p>
      <p className="text-xs text-dark-400 mt-1">{description}</p>
    </button>
  )
}

export default function Dashboard() {
  const { data: analytics } = useQuery({
    queryKey: ['analytics', 30],
    queryFn: () => api.getAnalytics(30),
  })

  const { data: queue } = useQuery({
    queryKey: ['queue'],
    queryFn: () => api.getQueue(),
  })

  const { data: trends } = useQuery({
    queryKey: ['trends', 'ai'],
    queryFn: () => api.getTrends('ai'),
  })

  const navigate = useNavigate()

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Good Evening 👋
        </h1>
        <p className="text-dark-400 mt-1 text-sm">
          Your content automation hub — powered by AI
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={PenLine}
          label="Total Posts"
          value={analytics?.total_posts ?? '—'}
          trend="+12%"
          color="bg-gradient-to-br from-brand-500 to-brand-600"
        />
        <StatCard
          icon={Eye}
          label="Impressions"
          value={analytics?.total_impressions ? `${(analytics.total_impressions / 1000).toFixed(1)}K` : '—'}
          trend="+8%"
          color="bg-gradient-to-br from-purple-500 to-purple-600"
        />
        <StatCard
          icon={Heart}
          label="Total Likes"
          value={analytics?.total_likes ?? '—'}
          trend="+24%"
          color="bg-gradient-to-br from-pink-500 to-rose-500"
        />
        <StatCard
          icon={Activity}
          label="Engagement Rate"
          value={analytics?.avg_engagement_rate ? `${analytics.avg_engagement_rate.toFixed(1)}%` : '—'}
          trend="+3%"
          color="bg-gradient-to-br from-emerald-500 to-teal-500"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickAction
            icon={PenLine}
            label="Create Post"
            description="Generate AI-powered content"
            to="/create"
            color="bg-gradient-to-br from-brand-500 to-blue-600"
          />
          <QuickAction
            icon={Layers}
            label="Build Carousel"
            description="Multi-slide visual content"
            to="/carousel"
            color="bg-gradient-to-br from-purple-500 to-pink-500"
          />
          <QuickAction
            icon={Clock}
            label="Schedule Post"
            description="Queue content in advance"
            to="/queue"
            color="bg-gradient-to-br from-orange-500 to-amber-500"
          />
          <QuickAction
            icon={BarChart3}
            label="View Analytics"
            description="Track performance metrics"
            to="/analytics"
            color="bg-gradient-to-br from-emerald-500 to-teal-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Queue */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-400" />
              Upcoming Queue
            </h2>
            <button
              onClick={() => navigate('/queue')}
              className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1"
            >
              View all <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          {queue && queue.length > 0 ? (
            <div className="space-y-3">
              {queue.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-dark-800 border border-dark-700"
                >
                  <div className="flex -space-x-1">
                    {item.platforms.slice(0, 3).map((p) => (
                      <span key={p} className="text-base" title={PLATFORM_CONFIG[p]?.name}>
                        {PLATFORM_CONFIG[p]?.icon}
                      </span>
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-dark-200 truncate">
                      {item.posts?.content?.slice(0, 80) ?? 'No content'}...
                    </p>
                    <p className="text-xs text-dark-400 mt-0.5">
                      {new Date(item.scheduled_at).toLocaleString()}
                    </p>
                  </div>
                  <span className={`badge ${
                    item.status === 'pending' ? 'badge-warning' :
                    item.status === 'published' ? 'badge-success' :
                    'badge-error'
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-dark-500">
              <Clock className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">No scheduled posts yet</p>
              <button
                onClick={() => navigate('/create')}
                className="mt-2 text-xs text-brand-400 hover:text-brand-300"
              >
                Create your first post
              </button>
            </div>
          )}
        </div>

        {/* Trending Topics */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-400" />
              Trending Now
            </h2>
            <button
              onClick={() => navigate('/trends')}
              className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1"
            >
              More <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          {trends && trends.length > 0 ? (
            <div className="space-y-2">
              {trends.slice(0, 5).map((topic, i) => (
                <div key={topic.id ?? i} className="flex items-start gap-3">
                  <span className="text-xs font-bold text-dark-500 w-4 mt-0.5">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <a
                      href={topic.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-dark-200 hover:text-white line-clamp-2 leading-tight"
                    >
                      {topic.title}
                    </a>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="badge badge-info">{topic.source}</span>
                      <span className="text-xs text-dark-500">{topic.score} pts</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-dark-500">
              <Globe className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">No trends loaded</p>
            </div>
          )}
        </div>
      </div>

      {/* MCP Server Status */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-brand-400" />
          <h2 className="font-semibold text-white">MCP Server Status</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {MCP_SERVERS.map((server) => (
            <div
              key={server.name}
              className="flex items-center gap-2 p-2.5 rounded-lg bg-dark-800 border border-dark-700"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
              <span className="text-xs text-dark-300 truncate">{server.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

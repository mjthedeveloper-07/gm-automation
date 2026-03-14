import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import {
  Clock, Send, XCircle, RefreshCw, AlertCircle, CheckCircle,
  Loader2
} from 'lucide-react'
import { api } from '../lib/api'
import { useAppStore } from '../store/appStore'
import { PLATFORM_CONFIG } from '../types'
import type { PostStatus } from '../types'

const FILTERS: Array<PostStatus | 'all'> = ['all', 'pending', 'published', 'failed', 'cancelled']

const STATUS_CONFIG: Record<string, { label: string; badge: string; icon: React.ComponentType<{ className?: string }> }> = {
  pending: { label: 'Pending', badge: 'badge-warning', icon: Clock },
  published: { label: 'Published', badge: 'badge-success', icon: CheckCircle },
  failed: { label: 'Failed', badge: 'badge-error', icon: AlertCircle },
  cancelled: { label: 'Cancelled', badge: 'bg-dark-700 text-dark-400 border border-dark-600', icon: XCircle },
  scheduled: { label: 'Scheduled', badge: 'badge-info', icon: Clock },
}

export default function Queue() {
  const { queueFilter, setQueueFilter, addNotification } = useAppStore()
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<PostStatus | 'all'>(queueFilter)

  const { data: queue = [], isLoading, refetch } = useQuery({
    queryKey: ['queue'],
    queryFn: () => api.getQueue(),
    refetchInterval: 30000, // Auto-refresh every 30s
  })

  const publishMutation = useMutation({
    mutationFn: (item: typeof queue[0]) => api.publishPost({
      platform: item.platforms[0],
      content: item.posts?.content || '',
    }),
    onSuccess: () => {
      addNotification('success', 'Post published!')
      queryClient.invalidateQueries({ queryKey: ['queue'] })
    },
    onError: (e: Error) => addNotification('error', e.message),
  })

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.cancelPost(id),
    onSuccess: () => {
      addNotification('info', 'Post cancelled')
      queryClient.invalidateQueries({ queryKey: ['queue'] })
    },
    onError: (e: Error) => addNotification('error', e.message),
  })

  const updateFilter = (f: PostStatus | 'all') => {
    setFilter(f)
    setQueueFilter(f)
  }

  const filtered = filter === 'all' ? queue : queue.filter((q) => q.status === filter)

  const countFor = (f: PostStatus | 'all') =>
    f === 'all' ? queue.length : queue.filter((q) => q.status === f).length

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Clock className="w-6 h-6 text-orange-400" />
            Queue
          </h1>
          <p className="text-dark-400 text-sm mt-1">Manage and monitor your scheduled posts</p>
        </div>
        <button
          className="btn-secondary flex items-center gap-2"
          onClick={() => refetch()}
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => updateFilter(f)}
            className={`${filter === f ? 'tab-btn-active' : 'tab-btn-inactive'} capitalize flex items-center gap-1.5`}
          >
            {f}
            <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
              filter === f ? 'bg-brand-500/30 text-brand-300' : 'bg-dark-700 text-dark-400'
            }`}>
              {countFor(f)}
            </span>
          </button>
        ))}
      </div>

      {/* Queue List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 skeleton rounded w-3/4 mb-2" />
              <div className="h-3 skeleton rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center h-48 text-dark-500">
          <Clock className="w-10 h-10 mb-3 opacity-30" />
          <p className="text-lg font-medium text-dark-400">No {filter !== 'all' ? filter : ''} posts</p>
          <p className="text-sm mt-1">Your queued posts will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const statusCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending
            const StatusIcon = statusCfg.icon

            return (
              <div
                key={item.id}
                className="card hover:border-dark-600 transition-all"
              >
                <div className="flex items-start gap-4">
                  {/* Platform icons */}
                  <div className="flex flex-col gap-1 mt-0.5">
                    {item.platforms.slice(0, 3).map((p) => (
                      <span
                        key={p}
                        className="text-xl"
                        title={PLATFORM_CONFIG[p]?.name}
                      >
                        {PLATFORM_CONFIG[p]?.icon}
                      </span>
                    ))}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-dark-200 line-clamp-2 leading-relaxed">
                      {item.posts?.content || 'Content not available'}
                    </p>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className="text-xs text-dark-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(item.scheduled_at).toLocaleString()}
                      </span>
                      {item.retry_count > 0 && (
                        <span className="text-xs text-orange-400">
                          {item.retry_count} retry{item.retry_count > 1 ? 's' : ''}
                        </span>
                      )}
                      {item.error_message && (
                        <span className="text-xs text-red-400 truncate max-w-xs" title={item.error_message}>
                          {item.error_message.slice(0, 60)}...
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status + Actions */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className={`badge ${statusCfg.badge} flex items-center gap-1`}>
                      <StatusIcon className="w-3 h-3" />
                      {statusCfg.label}
                    </span>
                    <div className="flex gap-1.5">
                      {(item.status === 'pending' || item.status === 'failed') && (
                        <button
                          className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1"
                          disabled={publishMutation.isPending}
                          onClick={() => publishMutation.mutate(item)}
                        >
                          {publishMutation.isPending
                            ? <Loader2 className="w-3 h-3 animate-spin" />
                            : <Send className="w-3 h-3" />
                          }
                          Publish Now
                        </button>
                      )}
                      {item.status === 'pending' && (
                        <button
                          className="btn-danger text-xs px-3 py-1.5 flex items-center gap-1"
                          disabled={cancelMutation.isPending}
                          onClick={() => cancelMutation.mutate(item.id)}
                        >
                          <XCircle className="w-3 h-3" />
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <p className="text-xs text-dark-500 text-center">
        Auto-refreshes every 30 seconds • {queue.length} total post{queue.length !== 1 ? 's' : ''} in queue
      </p>
    </div>
  )
}

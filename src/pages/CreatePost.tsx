import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import {
  Sparkles, Copy, Send, Clock, Hash, Wand2,
  ChevronDown, Loader2, CheckCircle, RotateCcw
} from 'lucide-react'
import { api } from '../lib/api'
import { useAppStore } from '../store/appStore'
import { PLATFORM_CONFIG } from '../types'
import type { Platform, Tone, PostLength } from '../types'

const PLATFORMS: Platform[] = ['instagram', 'twitter', 'linkedin', 'threads', 'mastodon', 'bluesky']
const TONES: Tone[] = ['educational', 'inspiring', 'humorous', 'professional', 'casual']
const LENGTHS: PostLength[] = ['short', 'medium', 'long']

export default function CreatePost() {
  const { draft, setDraft, addNotification } = useAppStore()
  const [activeTab, setActiveTab] = useState<'post' | 'caption'>('post')
  const [copied, setCopied] = useState(false)
  const [scheduleDate, setScheduleDate] = useState('')

  // Post generation
  const postMutation = useMutation({
    mutationFn: api.generatePost,
    onSuccess: (data) => {
      setDraft({ content: data.content })
      addNotification('success', 'Post generated successfully!')
    },
    onError: (e: Error) => addNotification('error', e.message || 'Failed to generate post'),
  })

  // Caption generation
  const captionMutation = useMutation({
    mutationFn: api.generateCaption,
    onSuccess: (data) => {
      setDraft({ caption: data.caption, hook: data.hook, hashtags: data.hashtags })
      addNotification('success', 'Caption generated!')
    },
    onError: (e: Error) => addNotification('error', e.message || 'Failed to generate caption'),
  })

  // Trending hooks
  const hooksMutation = useMutation({
    mutationFn: () => api.getTrendingHooks(draft.topic),
    onSuccess: (data) => {
      if (data.hooks?.[0]) setDraft({ hook: data.hooks[0] })
    },
  })

  // Publish
  const publishMutation = useMutation({
    mutationFn: api.publishPost,
    onSuccess: () => addNotification('success', 'Post published successfully!'),
    onError: (e: Error) => addNotification('error', e.message || 'Failed to publish'),
  })

  // Schedule
  const scheduleMutation = useMutation({
    mutationFn: api.schedulePost,
    onSuccess: () => addNotification('success', 'Post scheduled!'),
    onError: (e: Error) => addNotification('error', e.message || 'Failed to schedule'),
  })

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const charLimit = PLATFORM_CONFIG[draft.platform || 'instagram']?.charLimit || 2200
  const contentLength = draft.content?.length || 0

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-brand-400" />
          Create Post
        </h1>
        <p className="text-dark-400 text-sm mt-1">Generate AI-powered content for any platform</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-dark-900 border border-dark-700 rounded-xl w-fit">
        <button
          className={activeTab === 'post' ? 'tab-btn-active' : 'tab-btn-inactive'}
          onClick={() => setActiveTab('post')}
        >
          <Wand2 className="w-4 h-4 inline mr-1.5" />
          Post Content
        </button>
        <button
          className={activeTab === 'caption' ? 'tab-btn-active' : 'tab-btn-inactive'}
          onClick={() => setActiveTab('caption')}
        >
          <Hash className="w-4 h-4 inline mr-1.5" />
          Caption + Hashtags
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Config Panel */}
        <div className="space-y-4">
          {activeTab === 'post' ? (
            <div className="card space-y-4">
              <h2 className="font-semibold text-white">Post Configuration</h2>

              {/* Topic */}
              <div>
                <label className="label">Topic / Idea</label>
                <textarea
                  className="input-field resize-none h-20"
                  placeholder="e.g. How to automate your Instagram with n8n and AI"
                  value={draft.topic || ''}
                  onChange={(e) => setDraft({ topic: e.target.value })}
                />
              </div>

              {/* Platform */}
              <div>
                <label className="label">Platform</label>
                <div className="grid grid-cols-3 gap-2">
                  {PLATFORMS.map((p) => (
                    <button
                      key={p}
                      onClick={() => setDraft({ platform: p })}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${
                        draft.platform === p
                          ? 'border-brand-500 bg-brand-500/10 text-brand-400'
                          : 'border-dark-600 bg-dark-800 text-dark-300 hover:border-dark-500'
                      }`}
                    >
                      <span>{PLATFORM_CONFIG[p].icon}</span>
                      <span className="truncate">{PLATFORM_CONFIG[p].name.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tone */}
              <div>
                <label className="label">Tone</label>
                <div className="flex flex-wrap gap-2">
                  {TONES.map((t) => (
                    <button
                      key={t}
                      onClick={() => setDraft({ tone: t })}
                      className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-all ${
                        draft.tone === t
                          ? 'bg-purple-500/20 border border-purple-500/40 text-purple-300'
                          : 'bg-dark-800 border border-dark-600 text-dark-300 hover:border-dark-500'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Length */}
              <div>
                <label className="label">Length</label>
                <div className="flex gap-2">
                  {LENGTHS.map((l) => (
                    <button
                      key={l}
                      onClick={() => setDraft({ length: l })}
                      className={`flex-1 py-2 rounded-lg text-sm capitalize transition-all ${
                        draft.length === l
                          ? 'bg-brand-500/20 border border-brand-500/40 text-brand-300'
                          : 'bg-dark-800 border border-dark-600 text-dark-300 hover:border-dark-500'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate */}
              <button
                className="btn-primary w-full flex items-center justify-center gap-2"
                disabled={!draft.topic || postMutation.isPending}
                onClick={() => postMutation.mutate({
                  topic: draft.topic!,
                  platform: draft.platform || 'instagram',
                  tone: draft.tone,
                  length: draft.length,
                })}
              >
                {postMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Generate Post</>
                )}
              </button>
            </div>
          ) : (
            <div className="card space-y-4">
              <h2 className="font-semibold text-white">Caption Configuration</h2>

              {/* Topic */}
              <div>
                <label className="label">Topic</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. n8n automation workflow"
                  value={draft.topic || ''}
                  onChange={(e) => setDraft({ topic: e.target.value })}
                />
              </div>

              {/* Platform */}
              <div>
                <label className="label">Platform</label>
                <div className="relative">
                  <select
                    className="input-field appearance-none pr-10"
                    value={draft.platform || 'instagram'}
                    onChange={(e) => setDraft({ platform: e.target.value as Platform })}
                  >
                    {PLATFORMS.map((p) => (
                      <option key={p} value={p}>{PLATFORM_CONFIG[p].name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400 pointer-events-none" />
                </div>
              </div>

              {/* Hashtag count */}
              <div>
                <label className="label">Hashtags: {draft.hashtags?.length || 15}</label>
                <input
                  type="range"
                  min={5}
                  max={30}
                  defaultValue={15}
                  className="w-full accent-brand-500"
                  onChange={(e) => {/* controlled by generation */void e}}
                />
                <div className="flex justify-between text-xs text-dark-500 mt-1">
                  <span>5</span><span>30</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                  disabled={!draft.topic || captionMutation.isPending}
                  onClick={() => captionMutation.mutate({
                    topic: draft.topic!,
                    platform: draft.platform || 'instagram',
                    include_emojis: true,
                    hashtag_count: 15,
                  })}
                >
                  {captionMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Wand2 className="w-4 h-4" />
                  )}
                  Generate Caption
                </button>
                <button
                  className="btn-secondary flex items-center gap-2"
                  disabled={hooksMutation.isPending}
                  onClick={() => hooksMutation.mutate()}
                >
                  <RotateCcw className="w-4 h-4" />
                  Hook
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Preview Panel */}
        <div className="space-y-4">
          <div className="card flex flex-col gap-4 min-h-64">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-white">Preview</h2>
              {(draft.content || draft.caption) && (
                <button
                  className="btn-ghost text-xs flex items-center gap-1"
                  onClick={() => copyToClipboard(activeTab === 'post' ? draft.content! : `${draft.hook}\n\n${draft.caption}\n\n${draft.hashtags?.join(' ')}`)}
                >
                  {copied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              )}
            </div>

            {activeTab === 'post' ? (
              draft.content ? (
                <>
                  <div className="flex-1 p-4 bg-dark-800 rounded-lg text-sm text-dark-200 leading-relaxed whitespace-pre-wrap">
                    {draft.content}
                  </div>
                  <div className="flex items-center justify-between text-xs text-dark-400">
                    <span className={contentLength > charLimit ? 'text-red-400' : ''}>
                      {contentLength}/{charLimit} chars
                    </span>
                    {contentLength > charLimit && <span className="text-red-400">Over limit!</span>}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-dark-500 py-8">
                  <Sparkles className="w-10 h-10 mb-3 opacity-30" />
                  <p className="text-sm">Generated content will appear here</p>
                </div>
              )
            ) : (
              draft.caption ? (
                <div className="flex-1 space-y-3">
                  {draft.hook && (
                    <div>
                      <p className="text-xs font-semibold text-brand-400 mb-1">🪝 HOOK</p>
                      <p className="text-sm text-white font-medium">{draft.hook}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-semibold text-purple-400 mb-1">📝 CAPTION</p>
                    <p className="text-sm text-dark-200 leading-relaxed">{draft.caption}</p>
                  </div>
                  {draft.hashtags && draft.hashtags.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-emerald-400 mb-2">🏷️ HASHTAGS</p>
                      <div className="flex flex-wrap gap-1.5">
                        {draft.hashtags.map((h, i) => (
                          <span key={i} className="badge badge-info">#{h.replace('#', '')}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-dark-500 py-8">
                  <Hash className="w-10 h-10 mb-3 opacity-30" />
                  <p className="text-sm">Caption and hashtags will appear here</p>
                </div>
              )
            )}
          </div>

          {/* Actions */}
          {(draft.content || draft.caption) && (
            <div className="card space-y-3">
              <h3 className="font-medium text-white text-sm">Publish Options</h3>
              <button
                className="btn-primary w-full flex items-center justify-center gap-2"
                disabled={publishMutation.isPending}
                onClick={() => publishMutation.mutate({
                  platform: draft.platform || 'instagram',
                  content: draft.content || draft.caption || '',
                  caption: draft.caption,
                })}
              >
                {publishMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Publish Now
              </button>

              <div className="flex gap-2">
                <input
                  type="datetime-local"
                  className="input-field flex-1 text-sm"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                />
                <button
                  className="btn-secondary flex items-center gap-2"
                  disabled={!scheduleDate || scheduleMutation.isPending}
                  onClick={() => scheduleMutation.mutate({
                    content: draft.content || draft.caption || '',
                    platforms: [draft.platform || 'instagram'],
                    scheduled_at: new Date(scheduleDate).toISOString(),
                    caption: draft.caption,
                    hashtags: draft.hashtags,
                  })}
                >
                  <Clock className="w-4 h-4" />
                  Schedule
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

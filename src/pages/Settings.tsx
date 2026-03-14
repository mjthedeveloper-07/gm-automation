import { useState } from 'react'
import {
  Settings2, Wifi, WifiOff, Bot, Clock, ExternalLink,
  CheckCircle, Shield
} from 'lucide-react'
import { useAppStore } from '../store/appStore'
import { PLATFORM_CONFIG } from '../types'
import type { Platform } from '../types'

const PLATFORMS: Platform[] = ['instagram', 'twitter', 'linkedin', 'threads', 'mastodon', 'bluesky']

const AI_PROVIDERS = [
  {
    name: 'HuggingFace (Cerebras)',
    model: 'llama3.3-70b / llama3.1-8b',
    tier: 'Primary',
    status: 'active',
    free: true,
    color: 'from-yellow-500 to-orange-500',
    description: 'Fast AI via Cerebras accelerated hardware. Free tier.',
  },
  {
    name: 'Groq',
    model: 'mixtral-8x7b-32768',
    tier: 'Fallback 1',
    status: 'configured',
    free: true,
    color: 'from-blue-500 to-indigo-500',
    description: '30 req/min free tier. Activates if HuggingFace fails.',
  },
  {
    name: 'Mistral',
    model: 'mistral-7b-instruct',
    tier: 'Fallback 2',
    status: 'configured',
    free: true,
    color: 'from-purple-500 to-pink-500',
    description: 'Limited free tier. Final fallback before static response.',
  },
]

const CRON_JOBS = [
  { name: 'cron-queue-runner', expr: '*/5 * * * *', desc: 'Processes pending posts, calls publish API per platform, marks done/failed' },
  { name: 'cron-trend-fetch', expr: '0 6 * * *', desc: 'Fetches HN + Dev.to + GitHub trends → stores in trending_topics table' },
  { name: 'cron-analytics-sync', expr: '0 * * * *', desc: 'Fetches Instagram Insights for recent posts → updates post_analytics' },
  { name: 'cron-daily-report', expr: '0 9 * * *', desc: "Aggregates yesterday's performance → logs to cron_logs" },
  { name: 'cron-weekly-analysis', expr: '0 8 * * 1', desc: 'Finds best posting hours/days → logs insights' },
  { name: 'cron-token-refresh', expr: '0 */6 * * *', desc: 'Calls token refresh for Instagram, Twitter, LinkedIn' },
]

type Tab = 'platforms' | 'ai' | 'cron'

export default function Settings() {
  const { connectedPlatforms, connectPlatform, disconnectPlatform, addNotification } = useAppStore()
  const [activeTab, setActiveTab] = useState<Tab>('platforms')

  const handleConnect = (platform: Platform) => {
    connectPlatform(platform)
    addNotification('success', `${PLATFORM_CONFIG[platform].name} connected!`)
  }

  const handleDisconnect = (platform: Platform) => {
    disconnectPlatform(platform)
    addNotification('info', `${PLATFORM_CONFIG[platform].name} disconnected`)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings2 className="w-6 h-6 text-dark-300" />
          Settings
        </h1>
        <p className="text-dark-400 text-sm mt-1">Platform connections, AI providers, and system configuration</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-dark-900 border border-dark-700 rounded-xl w-fit">
        <button className={activeTab === 'platforms' ? 'tab-btn-active' : 'tab-btn-inactive'} onClick={() => setActiveTab('platforms')}>
          Platforms
        </button>
        <button className={activeTab === 'ai' ? 'tab-btn-active' : 'tab-btn-inactive'} onClick={() => setActiveTab('ai')}>
          AI Providers
        </button>
        <button className={activeTab === 'cron' ? 'tab-btn-active' : 'tab-btn-inactive'} onClick={() => setActiveTab('cron')}>
          Cron Jobs
        </button>
      </div>

      {/* Platforms Tab */}
      {activeTab === 'platforms' && (
        <div className="space-y-4">
          <p className="text-sm text-dark-400">
            Connect your social media accounts to enable publishing. Each platform requires its own OAuth token.
          </p>
          {PLATFORMS.map((platform) => {
            const config = PLATFORM_CONFIG[platform]
            const isConnected = connectedPlatforms.includes(platform)

            return (
              <div key={platform} className="card">
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.bg} flex items-center justify-center text-2xl flex-shrink-0`}>
                    {config.icon}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">{config.name}</h3>
                      {isConnected && (
                        <span className="badge-success flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Connected
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-dark-400 mt-0.5">{config.description}</p>
                    <p className="text-xs text-dark-500 mt-1">Char limit: {config.charLimit.toLocaleString()}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <a
                      href={config.docsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-ghost text-xs flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Docs
                    </a>
                    {isConnected ? (
                      <button
                        className="btn-danger text-xs flex items-center gap-1"
                        onClick={() => handleDisconnect(platform)}
                      >
                        <WifiOff className="w-3.5 h-3.5" />
                        Disconnect
                      </button>
                    ) : (
                      <button
                        className="btn-secondary text-xs flex items-center gap-1"
                        onClick={() => handleConnect(platform)}
                      >
                        <Wifi className="w-3.5 h-3.5" />
                        Connect
                      </button>
                    )}
                  </div>
                </div>

                {!isConnected && (
                  <div className="mt-3 p-3 rounded-lg bg-dark-800 border border-dark-700">
                    <p className="text-xs text-dark-400">
                      <Shield className="w-3.5 h-3.5 inline mr-1 text-brand-400" />
                      To connect: Add your <code className="text-brand-400">{platform.toUpperCase()}_ACCESS_TOKEN</code> to{' '}
                      <code className="text-dark-300">.env</code> and restart the dev server. Then click Connect to activate.
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* AI Providers Tab */}
      {activeTab === 'ai' && (
        <div className="space-y-4">
          <p className="text-sm text-dark-400">
            AI generation uses a fallback chain: HuggingFace → Groq → Mistral → Static response.
          </p>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-dark-800 border border-dark-700 text-sm text-dark-300">
            <Bot className="w-5 h-5 text-brand-400 flex-shrink-0" />
            Fallback order: <span className="text-white font-medium">HuggingFace → Groq → Mistral → Static</span>
          </div>

          {AI_PROVIDERS.map((provider) => (
            <div key={provider.name} className="card">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${provider.color} flex items-center justify-center flex-shrink-0`}>
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-white">{provider.name}</h3>
                    <span className="badge badge-purple">{provider.tier}</span>
                    {provider.free && <span className="badge badge-success">Free</span>}
                    <span className={`badge ${provider.status === 'active' ? 'badge-success' : 'badge-info'}`}>
                      {provider.status}
                    </span>
                  </div>
                  <p className="text-sm text-dark-400 mt-1">{provider.description}</p>
                  <p className="text-xs text-dark-500 mt-1">
                    Model: <code className="text-brand-400">{provider.model}</code>
                  </p>
                </div>
              </div>
            </div>
          ))}

          <div className="card">
            <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-brand-400" />
              Static Fallback
            </h3>
            <p className="text-sm text-dark-400">
              If all LLM providers fail, a pre-written automation/tech post is returned with niche-relevant hashtags.
              This ensures the app always returns something useful.
            </p>
          </div>
        </div>
      )}

      {/* Cron Jobs Tab */}
      {activeTab === 'cron' && (
        <div className="space-y-4">
          <p className="text-sm text-dark-400">
            Automated background tasks powered by Netlify Scheduled Functions. Free tier: 750 function-hours/month.
          </p>

          <div className="space-y-3">
            {CRON_JOBS.map((job) => (
              <div key={job.name} className="card">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0 mt-1" />
                    <h3 className="font-medium text-white text-sm font-mono">{job.name}</h3>
                  </div>
                  <code className="text-xs bg-dark-800 text-brand-400 px-2 py-1 rounded border border-dark-600 font-mono flex-shrink-0">
                    {job.expr}
                  </code>
                </div>
                <p className="text-sm text-dark-400 ml-4">{job.desc}</p>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-brand-500/5 border border-brand-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-brand-400" />
              <span className="font-medium text-brand-300 text-sm">Netlify Free Tier</span>
            </div>
            <p className="text-xs text-dark-400">
              750 function-hours/month. Current 6 cron jobs consume approximately 5 hrs/month (queue runner runs most frequently). 
              You have ~745 hrs remaining for API functions.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

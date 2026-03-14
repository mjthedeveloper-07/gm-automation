import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Platform, PostStatus, TrendCategory, ContentType, Tone, PostLength, Notification } from '../types'

interface DraftState {
  topic?: string
  content?: string
  caption?: string
  hashtags?: string[]
  hook?: string
  platform?: Platform
  tone?: Tone
  length?: PostLength
  mediaUrls?: string[]
  contentType?: ContentType
}

interface AppState {
  // User
  userId: string | null

  // Draft content
  draft: DraftState

  // UI state
  sidebarOpen: boolean
  activeTab: string
  queueFilter: PostStatus | 'all'
  analyticsDays: 30 | 7 | 14 | 90
  trendCategory: TrendCategory

  // Platform connections
  connectedPlatforms: Platform[]

  // Toast notifications
  notifications: Notification[]

  // Actions
  setUserId: (id: string | null) => void
  setDraft: (partial: Partial<DraftState>) => void
  clearDraft: () => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  setActiveTab: (tab: string) => void
  setQueueFilter: (filter: PostStatus | 'all') => void
  setAnalyticsDays: (days: 30 | 7 | 14 | 90) => void
  setTrendCategory: (cat: TrendCategory) => void
  connectPlatform: (platform: Platform) => void
  disconnectPlatform: (platform: Platform) => void
  addNotification: (type: 'success' | 'error' | 'info', message: string) => void
  removeNotification: (id: string) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      userId: null,
      draft: {},
      sidebarOpen: true,
      activeTab: 'post',
      queueFilter: 'all',
      analyticsDays: 30,
      trendCategory: 'ai',
      connectedPlatforms: [],
      notifications: [],

      // Actions
      setUserId: (id) => set({ userId: id }),

      setDraft: (partial) =>
        set((state) => ({ draft: { ...state.draft, ...partial } })),

      clearDraft: () => set({ draft: {} }),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      setActiveTab: (tab) => set({ activeTab: tab }),

      setQueueFilter: (filter) => set({ queueFilter: filter }),

      setAnalyticsDays: (days) => set({ analyticsDays: days }),

      setTrendCategory: (cat) => set({ trendCategory: cat }),

      connectPlatform: (platform) =>
        set((state) => ({
          connectedPlatforms: state.connectedPlatforms.includes(platform)
            ? state.connectedPlatforms
            : [...state.connectedPlatforms, platform],
        })),

      disconnectPlatform: (platform) =>
        set((state) => ({
          connectedPlatforms: state.connectedPlatforms.filter((p) => p !== platform),
        })),

      addNotification: (type, message) => {
        const id = crypto.randomUUID()
        set((state) => ({
          notifications: [...state.notifications, { id, type, message }],
        }))
        // Auto-remove after 4 seconds
        setTimeout(() => {
          get().removeNotification(id)
        }, 4000)
      },

      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),
    }),
    {
      name: 'gm-automation-store',
      partialize: (state) => ({
        analyticsDays: state.analyticsDays,
        connectedPlatforms: state.connectedPlatforms,
        trendCategory: state.trendCategory,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
)

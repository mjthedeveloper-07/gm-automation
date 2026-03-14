import { useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  PenLine,
  Layers,
  BarChart3,
  Clock,
  TrendingUp,
  Settings,
  Zap,
  Menu,
  X,
  CheckCircle,
  AlertCircle,
  Info,
  Bot,
} from 'lucide-react'
import { useAppStore } from '../store/appStore'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/create', icon: PenLine, label: 'Create Post' },
  { to: '/carousel', icon: Layers, label: 'Carousel Builder' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/queue', icon: Clock, label: 'Queue' },
  { to: '/trends', icon: TrendingUp, label: 'Trends' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, toggleSidebar, notifications, removeNotification } = useAppStore()
  const location = useLocation()

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (window.innerWidth < 768) {
      useAppStore.getState().setSidebarOpen(false)
    }
  }, [location.pathname])

  return (
    <div className="flex h-screen overflow-hidden bg-dark-950">
      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative z-30 h-full flex flex-col bg-dark-900 border-r border-dark-700 transition-all duration-300 ease-in-out overflow-hidden ${
          sidebarOpen ? 'w-64' : 'w-0 md:w-16'
        }`}
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 p-4 border-b border-dark-700 min-h-[65px] ${!sidebarOpen && 'md:justify-center'}`}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-brand">
            <Zap className="w-5 h-5 text-white" />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <p className="font-bold text-white text-sm leading-tight whitespace-nowrap">GM Automation</p>
              <p className="text-xs text-dark-400 whitespace-nowrap">Social AI Platform</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                isActive
                  ? `sidebar-item-active ${!sidebarOpen && 'md:justify-center'}`
                  : `sidebar-item-inactive ${!sidebarOpen && 'md:justify-center'}`
              }
              title={!sidebarOpen ? label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* AI Status */}
        {sidebarOpen && (
          <div className="p-3 m-2 rounded-lg bg-dark-800 border border-dark-600">
            <div className="flex items-center gap-2 mb-2">
              <Bot className="w-4 h-4 text-brand-400" />
              <span className="text-xs font-semibold text-dark-300">AI Engine</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-dark-400">HuggingFace Active</span>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="flex items-center gap-4 px-4 md:px-6 h-16 bg-dark-900/80 backdrop-blur-sm border-b border-dark-700 flex-shrink-0">
          <button
            onClick={toggleSidebar}
            className="btn-ghost p-2 -ml-2"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex-1" />

          {/* Status pill */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-medium text-green-400">All Systems Active</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 animate-fade-in">
            {children}
          </div>
        </main>
      </div>

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 pointer-events-none">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl animate-slide-up max-w-sm ${
              n.type === 'success'
                ? 'bg-green-500/10 border-green-500/30 text-green-300'
                : n.type === 'error'
                ? 'bg-red-500/10 border-red-500/30 text-red-300'
                : 'bg-brand-500/10 border-brand-500/30 text-brand-300'
            }`}
          >
            {n.type === 'success' && <CheckCircle className="w-4 h-4 flex-shrink-0" />}
            {n.type === 'error' && <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            {n.type === 'info' && <Info className="w-4 h-4 flex-shrink-0" />}
            <p className="text-sm font-medium">{n.message}</p>
            <button
              onClick={() => removeNotification(n.id)}
              className="ml-auto text-current opacity-60 hover:opacity-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

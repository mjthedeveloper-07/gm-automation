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
  Shield,
  LogOut,
  Crown,
} from 'lucide-react'
import { useAppStore } from '../store/appStore'
import { useAuth } from '../lib/auth'

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
  const { user, isAdmin, signOut } = useAuth()
  const location = useLocation()

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (window.innerWidth < 768) {
      useAppStore.getState().setSidebarOpen(false)
    }
  }, [location.pathname])

  // Build user initials for avatar
  const initials = user?.email?.charAt(0).toUpperCase() ?? 'U'

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

          {/* Admin link — only visible to admin */}
          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `${isActive ? 'sidebar-item-active border-brand-500/40 text-brand-400' : 'sidebar-item-inactive text-brand-500/70 hover:text-brand-400 hover:bg-brand-500/5'} ${!sidebarOpen && 'md:justify-center'}`
              }
              title={!sidebarOpen ? 'Admin' : undefined}
            >
              <Crown className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="truncate">Admin Panel</span>}
            </NavLink>
          )}
        </nav>

        {/* User footer in sidebar */}
        {sidebarOpen && user && (
          <div className="p-3 border-t border-dark-700">
            <div className="flex items-center gap-2.5 px-2 py-2">
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${isAdmin ? 'bg-gradient-to-br from-brand-500 to-purple-500' : 'bg-dark-600'}`}>
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">{user.email}</p>
                {isAdmin && (
                  <p className="text-xs text-brand-400 flex items-center gap-1">
                    <Shield className="w-2.5 h-2.5" />Admin
                  </p>
                )}
              </div>
              <button
                onClick={signOut}
                title="Sign out"
                className="text-dark-500 hover:text-red-400 transition-colors p-1 rounded flex-shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

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

          {/* Admin badge in topbar */}
          {isAdmin && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-500/10 border border-brand-500/30">
              <Crown className="w-3 h-3 text-brand-400" />
              <span className="text-xs font-semibold text-brand-400">Admin</span>
            </div>
          )}

          {/* Status pill */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-medium text-green-400">All Systems Active</span>
          </div>

          {/* User avatar in topbar (compact) */}
          {user && (
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold cursor-default ${isAdmin ? 'bg-gradient-to-br from-brand-500 to-purple-500 shadow-brand' : 'bg-dark-600'}`}>
                {initials}
              </div>
              <button
                onClick={signOut}
                title="Sign out"
                className="btn-ghost p-2 text-dark-400 hover:text-red-400"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
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

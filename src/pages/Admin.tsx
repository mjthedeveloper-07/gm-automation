import { Navigate } from 'react-router-dom'
import { Shield, Users, Activity, Database, Key, Globe, Server, CheckCircle, AlertCircle, Crown } from 'lucide-react'
import { useAuth } from '../lib/auth'

const ADMIN_EMAIL = 'jagathratchagan2023@gmail.com'

export default function Admin() {
  const { user, isAdmin, signOut } = useAuth()

  // Non-admins are redirected away
  if (!isAdmin) return <Navigate to="/" replace />

  const systemItems = [
    { label: 'Auth', status: 'active', icon: Key, desc: 'Supabase Auth · JWT sessions' },
    { label: 'Database', status: 'active', icon: Database, desc: 'Supabase PostgreSQL' },
    { label: 'Storage', status: 'active', icon: Server, desc: 'carousel_assets bucket' },
    { label: 'Functions', status: 'active', icon: Globe, desc: '19 Netlify serverless functions' },
    { label: 'Cron Jobs', status: 'active', icon: Activity, desc: '6 automated schedules active' },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Shield className="w-7 h-7 text-brand-400" />
            <h1 className="text-2xl font-bold text-white">Admin Control Center</h1>
          </div>
          <p className="text-dark-400 text-sm">Full system access · Restricted to super-admin</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30">
          <Crown className="w-3.5 h-3.5 text-brand-400" />
          <span className="text-xs font-medium text-brand-400">Super Admin</span>
        </div>
      </div>

      {/* Admin Profile Card */}
      <div className="card flex items-center gap-5 border-brand-500/20 bg-gradient-to-r from-brand-500/5 to-purple-500/5">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-brand">
          <span className="text-white font-bold text-xl">J</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-lg">Jagath Ratchagan</p>
          <p className="text-dark-400 text-sm truncate">{ADMIN_EMAIL}</p>
          <p className="text-brand-400 text-xs font-medium mt-0.5">Administrator · Full Access</p>
        </div>
        <button
          onClick={signOut}
          className="btn-secondary text-sm flex items-center gap-2 flex-shrink-0"
        >
          <Shield className="w-4 h-4" />
          Sign Out
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Access Level', value: 'SUPER ADMIN', color: 'text-brand-400' },
          { label: 'Session', value: 'Active', color: 'text-green-400' },
          { label: 'Permissions', value: 'Unlimited', color: 'text-purple-400' },
          { label: 'Data Access', value: 'Full', color: 'text-amber-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card text-center">
            <p className={`text-lg font-bold ${color}`}>{value}</p>
            <p className="text-xs text-dark-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Current User Session */}
      <div className="card space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-brand-400" />
          <h2 className="font-semibold text-white">Active Session</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-sm">
          {[
            { label: 'User ID', value: user?.id?.slice(0, 18) + '...' },
            { label: 'Email', value: user?.email },
            { label: 'Role', value: user?.role || 'authenticated' },
            { label: 'Last Sign In', value: user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : 'N/A' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-dark-800 rounded-lg p-3 flex flex-col gap-1">
              <span className="text-dark-500 text-xs uppercase tracking-wider">{label}</span>
              <span className="text-dark-200 truncate">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* System Health */}
      <div className="card space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-4 h-4 text-brand-400" />
          <h2 className="font-semibold text-white">System Health</h2>
          <span className="ml-auto text-xs text-green-400 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />All systems operational
          </span>
        </div>
        <div className="space-y-2">
          {systemItems.map(({ label, status, icon: Icon, desc }) => (
            <div key={label} className="flex items-center gap-3 px-4 py-3 bg-dark-800 rounded-lg">
              <Icon className="w-4 h-4 text-dark-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{label}</p>
                <p className="text-xs text-dark-500 truncate">{desc}</p>
              </div>
              {status === 'active' ? (
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Access & Permissions */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Key className="w-4 h-4 text-brand-400" />
          <h2 className="font-semibold text-white">Permissions</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {[
            'Create Posts', 'Publish Content', 'Schedule Posts',
            'View Analytics', 'Manage Queue', 'Access Trends',
            'Build Carousels', 'Admin Panel', 'Full Data Access',
          ].map((perm) => (
            <div key={perm} className="flex items-center gap-2 px-3 py-2 bg-green-500/5 border border-green-500/20 rounded-lg">
              <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
              <span className="text-xs text-dark-300">{perm}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

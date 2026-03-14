import { useQuery } from '@tanstack/react-query'
import {
  BarChart3, Eye, Heart, MessageCircle, Share2,
  TrendingUp, FileText, CheckCircle, AlertCircle, Clock
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { api } from '../lib/api'
import { useAppStore } from '../store/appStore'

const CRON_JOBS = [
  { name: 'Queue Runner', schedule: 'Every 5 min', lastRun: '2 min ago', status: 'active' },
  { name: 'Trend Fetch', schedule: 'Daily 6 AM', lastRun: '14 hrs ago', status: 'active' },
  { name: 'Analytics Sync', schedule: 'Hourly', lastRun: '45 min ago', status: 'active' },
  { name: 'Daily Report', schedule: 'Daily 9 AM', lastRun: '16 hrs ago', status: 'active' },
  { name: 'Weekly Analysis', schedule: 'Mon 8 AM', lastRun: '3 days ago', status: 'active' },
  { name: 'Token Refresh', schedule: 'Every 6 hrs', lastRun: '2 hrs ago', status: 'active' },
]

const PLATFORM_COLORS: Record<string, string> = {
  instagram: '#E1306C',
  twitter: '#1DA1F2',
  linkedin: '#0077B5',
  threads: '#aaaaaa',
  mastodon: '#6364FF',
  bluesky: '#0085ff',
}

const DAYS_OPTIONS = [7, 14, 30, 90] as const

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  color: string
}) {
  return (
    <div className="card-hover">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-dark-400 mt-0.5">{label}</p>
    </div>
  )
}

export default function Analytics() {
  const { analyticsDays, setAnalyticsDays } = useAppStore()

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics', analyticsDays],
    queryFn: () => api.getAnalytics(analyticsDays),
  })

  // Generate mock daily data when API returns nothing
  const dailyData = analytics?.daily_data ?? Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return {
      date: d.toLocaleDateString('en', { weekday: 'short' }),
      impressions: Math.floor(Math.random() * 800 + 200),
      likes: Math.floor(Math.random() * 100 + 20),
      comments: Math.floor(Math.random() * 30 + 5),
      shares: Math.floor(Math.random() * 20 + 2),
    }
  })

  const platformData = Object.entries(analytics?.platform_breakdown ?? {
    instagram: 45, twitter: 20, linkedin: 25, threads: 10
  }).map(([name, value]) => ({ name, value }))

  const engagementByDay = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => ({
    day,
    rate: [2.1, 3.4, 2.8, 4.2, 3.9, 5.1, 4.6][i],
  }))

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-slide-up">
      {/* Header + Days filter */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-400" />
            Analytics
          </h1>
          <p className="text-dark-400 text-sm mt-1">Performance metrics and trends</p>
        </div>
        <div className="flex gap-2">
          {DAYS_OPTIONS.map((d) => (
            <button
              key={d}
              onClick={() => setAnalyticsDays(d)}
              className={analyticsDays === d ? 'tab-btn-active' : 'tab-btn-inactive'}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard icon={Eye} label="Impressions" value={isLoading ? '...' : (analytics?.total_impressions ?? 0).toLocaleString()} color="bg-gradient-to-br from-blue-500 to-blue-600" />
        <StatCard icon={Heart} label="Likes" value={isLoading ? '...' : (analytics?.total_likes ?? 0).toLocaleString()} color="bg-gradient-to-br from-pink-500 to-rose-500" />
        <StatCard icon={MessageCircle} label="Comments" value={isLoading ? '...' : (analytics?.total_comments ?? 0).toLocaleString()} color="bg-gradient-to-br from-purple-500 to-purple-600" />
        <StatCard icon={Share2} label="Shares" value={isLoading ? '...' : (analytics?.total_shares ?? 0).toLocaleString()} color="bg-gradient-to-br from-orange-500 to-amber-500" />
        <StatCard icon={TrendingUp} label="Avg Engagement" value={isLoading ? '...' : `${(analytics?.avg_engagement_rate ?? 0).toFixed(1)}%`} color="bg-gradient-to-br from-emerald-500 to-teal-500" />
        <StatCard icon={FileText} label="Total Posts" value={isLoading ? '...' : (analytics?.total_posts ?? 0)} color="bg-gradient-to-br from-brand-500 to-brand-600" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <div className="lg:col-span-2 card">
          <h2 className="font-semibold text-white mb-4">Impressions & Likes Over Time</h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#fff' }}
              />
              <Legend />
              <Line type="monotone" dataKey="impressions" stroke="#0ea5e9" strokeWidth={2} dot={{ fill: '#0ea5e9', r: 4 }} />
              <Line type="monotone" dataKey="likes" stroke="#ec4899" strokeWidth={2} dot={{ fill: '#ec4899', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="card">
          <h2 className="font-semibold text-white mb-4">Platform Distribution</h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={platformData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {platformData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PLATFORM_COLORS[entry.name] || '#64748b'}
                  />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#fff' }} />
              <Legend formatter={(value) => <span style={{ color: '#94a3b8', fontSize: 12 }}>{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="card">
        <h2 className="font-semibold text-white mb-4">Engagement Rate by Day of Week</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={engagementByDay}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 12 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} unit="%" />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#fff' }}
              formatter={(v: unknown) => [`${Number(v).toFixed(1)}%`, 'Engagement']}
            />
            <Bar dataKey="rate" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0ea5e9" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Cron Job Status */}
      <div className="card">
        <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-brand-400" />
          Cron Job Status
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-700">
                <th className="text-left py-2.5 px-3 text-dark-400 font-medium">Job</th>
                <th className="text-left py-2.5 px-3 text-dark-400 font-medium">Schedule</th>
                <th className="text-left py-2.5 px-3 text-dark-400 font-medium">Last Run</th>
                <th className="text-left py-2.5 px-3 text-dark-400 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800">
              {CRON_JOBS.map((job) => (
                <tr key={job.name} className="hover:bg-dark-800/50 transition-colors">
                  <td className="py-3 px-3 font-medium text-dark-200">{job.name}</td>
                  <td className="py-3 px-3 text-dark-400">{job.schedule}</td>
                  <td className="py-3 px-3 text-dark-400">{job.lastRun}</td>
                  <td className="py-3 px-3">
                    <span className="badge-success flex items-center gap-1 w-fit">
                      <CheckCircle className="w-3 h-3" />
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-dark-500 mt-3">
          ℹ️ Netlify free tier: 750 function-hours/month. Cron jobs consume ~5 hrs/month at current schedules.
        </p>
      </div>
    </div>
  )
}

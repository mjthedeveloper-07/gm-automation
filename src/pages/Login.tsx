import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Zap, Mail, Lock, Eye, EyeOff, Shield, AlertCircle } from 'lucide-react'
import { useAuth } from '../lib/auth'

export default function Login() {
  const { user, signIn, isLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Already logged in? Redirect to home
  if (!isLoading && user) return <Navigate to="/" replace />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const { error } = await signIn(email, password)
    if (error) {
      setError('Invalid credentials. Access denied.')
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-brand-500/8 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-purple-500/6 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-500 shadow-brand mb-4 relative">
            <Zap className="w-8 h-8 text-white" />
            {/* Glow ring */}
            <div className="absolute inset-0 rounded-2xl ring-1 ring-brand-400/30 blur-sm" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">GM Automation</h1>
          <p className="text-dark-400 mt-1 text-sm">Social AI Platform · Secure Access</p>
        </div>

        {/* Login card */}
        <div className="bg-dark-900/80 backdrop-blur-xl border border-dark-700 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-4 h-4 text-brand-400" />
            <h2 className="text-sm font-semibold text-dark-300 uppercase tracking-widest">Administrator Login</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="input-field pl-10"
                  autoComplete="email"
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input-field pl-10 pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm animate-slide-up">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting || !email || !password}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base relative"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Sign In Securely
                </>
              )}
            </button>
          </form>

          <p className="text-xs text-dark-600 text-center mt-6">
            Access restricted to authorized personnel only.
          </p>
        </div>

        {/* Security note */}
        <p className="text-center text-dark-600 text-xs mt-6 flex items-center justify-center gap-1.5">
          <Shield className="w-3 h-3" />
          Protected by Supabase Auth · All sessions are encrypted
        </p>
      </div>
    </div>
  )
}

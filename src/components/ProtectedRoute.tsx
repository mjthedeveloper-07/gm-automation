import { type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { Zap } from 'lucide-react'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center mx-auto shadow-brand">
            <Zap className="w-7 h-7 text-white animate-pulse" />
          </div>
          <p className="text-dark-400 text-sm animate-pulse">Verifying session...</p>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  return <>{children}</>
}

export function AdminRoute({ children }: { children: ReactNode }) {
  const { isAdmin, isLoading } = useAuth()
  if (isLoading) return null
  if (!isAdmin) return <Navigate to="/" replace />
  return <>{children}</>
}

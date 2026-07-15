import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Banned-until sentinel + expiry check (mirrors the ban convention).
function isBanActive(until) {
  return !!until && (until === '2099-01-01T00:00:00Z' || new Date(until) > new Date())
}

export default function ProtectedRoute({ children }) {
  const { user, profile, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  // Ban backstop: fetchProfile already signs banned users out, but guard the
  // route too so a stale session can't linger inside the app.
  if (profile && isBanActive(profile.banned_until)) return <Navigate to="/login" replace />
  return children
}

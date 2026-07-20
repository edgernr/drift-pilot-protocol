import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Banned-until sentinel + expiry check (mirrors the ban convention).
function isBanActive(until) {
  return !!until && (until === '2099-01-01T00:00:00Z' || new Date(until) > new Date())
}

// Opt-in: only enforce email confirmation when the owner sets this flag AND has
// enabled "Confirm email" in Supabase. Off by default → zero lockout risk, and
// naturally inert anyway (when confirmation is disabled, email_confirmed_at is set).
const REQUIRE_EMAIL_CONFIRMED = import.meta.env.VITE_REQUIRE_EMAIL_CONFIRMED === 'true'

export default function ProtectedRoute({ children }) {
  const { user, profile, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  // Ban backstop: fetchProfile already signs banned users out, but guard the
  // route too so a stale session can't linger inside the app.
  if (profile && isBanActive(profile.banned_until)) return <Navigate to="/login" replace />
  // Email-confirmation gate (opt-in). email_confirmed_at / confirmed_at are on
  // the Supabase auth user; both null = unconfirmed.
  if (REQUIRE_EMAIL_CONFIRMED && user.email && !user.email_confirmed_at && !user.confirmed_at) {
    return <Navigate to="/login?confirm=1" replace />
  }
  return children
}

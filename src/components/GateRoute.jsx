import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function GateRoute({ requires = [], unlockKey = null, children }) {
  const { user, profile, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (!profile) return null
  // Admins can open any gate regardless of prerequisites.
  if (profile.is_admin) return children
  // Season 01: brand-new hunters cannot enter ANY gate before "Zero Hour".
  // Strict `=== false` — if the prologue_done migration hasn't run, the column
  // is undefined and this guard stays inert (old behavior preserved).
  if (profile.prologue_done === false && (profile.questsCompleted ?? 0) === 0) {
    return <Navigate to="/prologue" replace />
  }
  const hasUnlock = unlockKey ? profile.unlockedGateIds?.has(unlockKey) : false
  if (!hasUnlock && requires.some(id => !profile.completedQuestIds?.has(id))) {
    return <Navigate to="/dashboard" replace />
  }
  return children
}

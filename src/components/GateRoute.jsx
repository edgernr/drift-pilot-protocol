import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function GateRoute({ requires = [], unlockKey = null, children }) {
  const { user, profile, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (!profile) return null
  const hasUnlock = unlockKey ? profile.unlockedGateIds?.has(unlockKey) : false
  if (!hasUnlock && requires.some(id => !profile.completedQuestIds?.has(id))) {
    return <Navigate to="/dashboard" replace />
  }
  return children
}

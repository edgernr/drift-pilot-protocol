import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './GameHUD.css'

const QUEST_PATHS = new Set([
  '/quest', '/quest2', '/quest3', '/quest4', '/quest5',
  '/quest6', '/quest7', '/quest8', '/quest9', '/quest10',
])

const GATE_LABELS = {
  '/quest':  'THE FOUNDRY · GATE 01',
  '/quest2': 'THE FOUNDRY · GATE 02',
  '/quest3': 'THE FOUNDRY · GATE 03',
}

export default function GameHUD() {
  const { pathname } = useLocation()
  const { user, profile } = useAuth()

  if (!user || !QUEST_PATHS.has(pathname)) return null

  const level      = profile?.level      ?? 1
  const levelLabel = profile?.levelLabel ?? 'CADET'
  const initial    = (profile?.name || profile?.email || 'P')[0].toUpperCase()
  const gateLabel  = GATE_LABELS[pathname] || 'THE FOUNDRY'

  return (
    <div className="ghud-strip">
      <div className="ghud-pilot">
        <div className="ghud-avatar">{initial}</div>
        <span className="ghud-lvl">LV.{level} {levelLabel}</span>
      </div>
      <span className="ghud-region">{gateLabel}</span>
      <div className="ghud-channel">
        <span className="ghud-channel-dot" />
        <span>HANDLER ONLINE</span>
      </div>
    </div>
  )
}

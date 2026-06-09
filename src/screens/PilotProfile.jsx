import { useState, useEffect } from 'react'
import './PilotProfile.css'
import { supabase } from '../lib/supabase'
import { useParams } from 'react-router-dom'
import { computeLevelData, HUNT_REWARDS, USERNAME_COLORS } from '../context/AuthContext'

const RAID_XP_TO_HUNT = { 500: 2350, 300: 1050, 100: 250, 0: 0 }
const RAID_NEW_XP_SET   = new Set([100, 300, 500])
const RAID_OLD_TO_XP    = { 2350: 500, 1050: 300, 250: 100 }

const GATE_META = {
  'act1-ch01': { label: 'Gate 01', icon: '📡', color: 'var(--teal)' },
  'act1-ch02': { label: 'Gate 02', icon: '⚱️', color: 'var(--violet)' },
  'act1-ch03': { label: 'Gate 03', icon: '📋', color: 'oklch(0.62 0.22 25)' },
  'act1-ch04': { label: 'Gate 04', icon: '🎨', color: 'var(--amber)' },
}

function initials(name) {
  return (name ?? 'PL').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}
function fmt(n) { return (n ?? 0).toLocaleString() }

export default function PilotProfile() {
  const { id } = useParams()
  const [pilot, setPilot]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [copied, setCopied]   = useState(false)

  useEffect(() => {
    async function load() {
      const [{ data: prof }, { data: rows }] = await Promise.all([
        supabase.from('profiles').select('id, name, created_at, is_subscribed, username_color').eq('id', id).single(),
        supabase.from('public_completions').select('quest_id, xp_earned, completed_at').eq('user_id', id),
      ])
      if (!prof) { setNotFound(true); setLoading(false); return }

      const completions = rows ?? []

      const totalXp = completions.reduce((s, r) => {
        if (r.quest_id?.startsWith('raid:')) {
          if (r.xp_earned === 0) return s
          if (RAID_NEW_XP_SET.has(r.xp_earned)) return s + r.xp_earned
          return s + (RAID_OLD_TO_XP[r.xp_earned] ?? 0)
        }
        return s + r.xp_earned
      }, 0)

      const totalHunt = completions.reduce((s, r) => {
        if (HUNT_REWARDS[r.quest_id]) return s + HUNT_REWARDS[r.quest_id]
        if (r.quest_id?.startsWith('raid:')) {
          if (r.xp_earned === 0) return s
          if (RAID_NEW_XP_SET.has(r.xp_earned)) return s + (RAID_XP_TO_HUNT[r.xp_earned] ?? 0)
          return s + r.xp_earned
        }
        return s
      }, 0)

      const completedGates = completions
        .filter(r => GATE_META[r.quest_id])
        .map(r => r.quest_id)

      // Streak
      const days = [...new Set(completions.map(r => r.completed_at?.slice(0, 10)).filter(Boolean))].sort().reverse()
      const today     = new Date().toISOString().slice(0, 10)
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
      let streak = 0
      if (days.length && (days[0] === today || days[0] === yesterday)) {
        streak = 1
        for (let i = 1; i < days.length; i++) {
          if ((new Date(days[i - 1]) - new Date(days[i])) / 86400000 === 1) streak++
          else break
        }
      }

      const ld = computeLevelData(totalXp)
      setPilot({
        ...prof, totalXp, totalHunt, completedGates,
        questsCompleted: completedGates.length, streak,
        level: ld.level, levelLabel: ld.label, levelColor: ld.color,
        levelProgress: ld.progress, xpInLevel: ld.xpInLevel, xpNeeded: ld.xpNeeded,
        nextLevelLabel: ld.nextLabel,
      })
      setLoading(false)
    }
    load()
  }, [id])

  function copyLink() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  if (loading) return (
    <div className="pp-shell">
      <div className="pp-state">LOADING PILOT DATA...</div>
    </div>
  )

  if (notFound) return (
    <div className="pp-shell">
      <div className="pp-state">
        <div className="pp-state-glyph">⊘</div>
        <div className="pp-state-title">PILOT NOT FOUND</div>
        <div className="pp-state-sub">This callsign doesn't exist in the records.</div>
        <a href="/" className="btn btn-primary" style={{ marginTop: 24 }}>Return to Base →</a>
      </div>
    </div>
  )

  const TOTAL_GATES = 15
  const actPct = Math.round(pilot.questsCompleted / TOTAL_GATES * 100)
  const joined = new Date(pilot.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="pp-shell">
      <div className="pp-card">

        <a href="/" className="pp-back">← hunterprotocol.net</a>

        {/* Avatar */}
        <div className="pp-avatar" style={{
          boxShadow: `0 0 48px ${pilot.levelColor}40, 0 0 0 3px ${pilot.levelColor}60`,
        }}>
          {initials(pilot.name)}
        </div>

        {/* Rank badge */}
        <div className="pp-rank-badge" style={{
          color: pilot.levelColor,
          borderColor: `${pilot.levelColor}50`,
          background: `${pilot.levelColor}12`,
        }}>
          LV.{pilot.level} {pilot.levelLabel}
        </div>

        <h1 className="pp-name" style={pilot.is_subscribed ? { color: USERNAME_COLORS[pilot.username_color]?.value ?? undefined } : undefined}>{pilot.name ?? 'PILOT'}</h1>
        {pilot.is_subscribed && <div style={{ display: 'inline-block', marginTop: 8, fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.12em', color: 'var(--magenta)', border: '1px solid color-mix(in oklch, var(--magenta) 45%, transparent)', background: 'color-mix(in oklch, var(--magenta) 12%, transparent)', borderRadius: 999, padding: '3px 10px' }}>◈ SEASON 01 PASS</div>}
        <div className="pp-since">Pilot since {joined}</div>

        {/* Stats row */}
        <div className="pp-stats-row">
          <div className="pp-stat">
            <div className="pp-stat-val" style={{ color: 'var(--teal)' }}>{fmt(pilot.totalXp)}</div>
            <div className="pp-stat-lbl">XP EARNED</div>
          </div>
          <div className="pp-stat-sep" />
          <div className="pp-stat">
            <div className="pp-stat-val" style={{ color: 'var(--lime)' }}>{pilot.questsCompleted}</div>
            <div className="pp-stat-lbl">GATES CLEARED</div>
          </div>
          <div className="pp-stat-sep" />
          <div className="pp-stat">
            <div className="pp-stat-val" style={{ color: 'var(--magenta)' }}>{fmt(pilot.totalHunt)}</div>
            <div className="pp-stat-lbl">$HUNT EARNED</div>
          </div>
        </div>

        {/* Act I progress */}
        <div className="pp-bar-block">
          <div className="pp-bar-head">
            <span>ACT I — HTML RUINS</span>
            <span>{pilot.questsCompleted}/{TOTAL_GATES} · {actPct}%</span>
          </div>
          <div className="pp-bar-track">
            <div className="pp-bar-fill" style={{ width: `${actPct}%`, background: 'linear-gradient(90deg, var(--teal), var(--violet))' }} />
          </div>
        </div>

        {/* XP level progress */}
        <div className="pp-bar-block">
          <div className="pp-bar-head">
            <span style={{ color: pilot.levelColor }}>LV.{pilot.level} {pilot.levelLabel}</span>
            <span>
              {pilot.level < 10
                ? `${pilot.xpInLevel} / ${pilot.xpNeeded} XP · ${pilot.levelProgress}% → LV.${pilot.level + 1} ${pilot.nextLevelLabel}`
                : 'MAX LEVEL · LEGEND'
              }
            </span>
          </div>
          <div className="pp-bar-track">
            <div className="pp-bar-fill" style={{ width: `${pilot.levelProgress}%`, background: pilot.levelColor }} />
          </div>
        </div>

        {/* Cleared gates */}
        {pilot.completedGates.length > 0 && (
          <div className="pp-gates-block">
            <div className="pp-section-lbl">CLEARED</div>
            <div className="pp-chips">
              {pilot.completedGates.map(gid => {
                const m = GATE_META[gid]
                return (
                  <span key={gid} className="pp-chip"
                    style={{ color: m.color, borderColor: `${m.color}55`, background: `${m.color}10` }}>
                    {m.icon} {m.label}
                  </span>
                )
              })}
            </div>
          </div>
        )}

        {/* Streak */}
        {pilot.streak > 0 && (
          <div className="pp-streak">🔥 {pilot.streak}-day streak active</div>
        )}

        <div className="pp-divider" />

        {/* CTA */}
        <div className="pp-cta">
          <div className="pp-cta-brand">HUNTER PROTOCOL</div>
          <div className="pp-cta-sub">Learn. Build. Earn. Clear the gates. Raid the tower.</div>
          <a href="/" className="btn btn-primary" style={{ marginTop: 16 }}>Join the Protocol →</a>
        </div>

        <button className="pp-copy-btn" onClick={copyLink}>
          {copied ? '✓ Link copied' : '⎘ Copy profile link'}
        </button>

      </div>
    </div>
  )
}

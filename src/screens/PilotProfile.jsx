import { useState, useEffect } from 'react'
import './PilotProfile.css'
import { supabase } from '../lib/supabase'
import { useParams } from 'react-router-dom'
import { computeLevelData, HUNT_REWARDS, USERNAME_COLORS } from '../context/AuthContext'
import HunterSigil from '../components/HunterSigil'
import { useNav } from '../context/NavigationContext'

// Must stay in step with AuthContext — these maps decide what a raid row is
// worth, and a missing value reads as legacy DRIFT with zero XP.
const RAID_XP_TO_HUNT = { 500: 2350, 300: 1050, 100: 250, 0: 0 }
const RAID_NEW_XP_SET  = new Set([100, 300, 500])
const RAID_OLD_TO_XP   = { 2350: 500, 1050: 300, 250: 100 }
// RAID 01 — THE BROODGATE: own scale, identified by the :fN suffix.
const BROODGATE_ROW = /^raid:[^:]+:f[1-5]$/
const BROODGATE_XP_TO_HUNT = { 350: 1650, 200: 800, 150: 500, 100: 250, 0: 0 }

// All of Stratum 1 (+ a raid fallback) so cleared contracts + recent activity read right.
const GATE_META = {
  'act1-ch01': { label: 'The Document Tomb', short: 'Gate 01', icon: '📡', color: 'var(--teal)' },
  'act1-ch02': { label: 'The Semantic Crypt', short: 'Gate 02', icon: '⚱️', color: 'var(--violet)' },
  'act1-ch03': { label: 'The Registry Hall',  short: 'Gate 03', icon: '⚗️', color: 'oklch(0.62 0.22 25)', boss: true },
  'act1-ch04': { label: 'Paint the City',      short: 'Gate 04', icon: '🎨', color: 'var(--amber)' },
  'act1-ch05': { label: 'The Gravity Anchor',  short: 'Gate 05', icon: '🧲', color: 'var(--teal)' },
  'act1-ch06': { label: 'The Infinite Grid',   short: 'Gate 06', icon: '🌌', color: 'var(--violet)', boss: true },
  'act1-ch07': { label: 'Ghost Feedback',      short: 'Gate 07', icon: '👻', color: 'var(--cyan)' },
  'act1-ch08': { label: 'The Collapse',        short: 'Gate 08', icon: '📱', color: 'var(--amber)', boss: true },
  'act1-ch09': { label: 'The Control Room',    short: 'Gate 09', icon: '🎛️', color: 'var(--lime)' },
  'act1-ch10': { label: 'The Static City',     short: 'Gate 10', icon: '🌐', color: 'var(--magenta)', boss: true },
}
const STRATUM1_GATES = 10

function metaFor(qid) {
  if (GATE_META[qid]) return GATE_META[qid]
  if (qid?.startsWith('raid:')) return { label: 'Tower Raid', short: 'Raid', icon: '⚔️', color: 'var(--magenta)' }
  return null
}
function fmt(n) { return (n ?? 0).toLocaleString() }
function relTime(iso) {
  if (!iso) return ''
  const s = (Date.now() - new Date(iso).getTime()) / 1000
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  if (s < 2592000) return `${Math.floor(s / 86400)}d ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function PilotProfile() {
  const { id } = useParams()
  const { goto } = useNav()
  const [pilot, setPilot]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [copied, setCopied]   = useState(false)

  useEffect(() => {
    async function load() {
      // public_profiles only: avatar + guild + derived is_banned, never
      // wallet/stripe/email. The old fallback read the base profiles table for
      // an ARBITRARY id — the one cross-user read on this screen — and it is
      // dead weight now that the view has shipped everywhere.
      const [{ data: pv }, { data: rows }] = await Promise.all([
        supabase.from('public_profiles').select('*').eq('id', id).maybeSingle(),
        supabase.from('public_completions').select('quest_id, xp_earned, completed_at').eq('user_id', id),
      ])
      const prof = pv
      if (!prof) { setNotFound(true); setLoading(false); return }

      const completions = rows ?? []

      const totalXp = completions.reduce((s, r) => {
        if (r.quest_id?.startsWith('raid:')) {
          if (BROODGATE_ROW.test(r.quest_id)) return s + r.xp_earned
          if (r.xp_earned === 0) return s
          if (RAID_NEW_XP_SET.has(r.xp_earned)) return s + r.xp_earned
          return s + (RAID_OLD_TO_XP[r.xp_earned] ?? 0)
        }
        return s + r.xp_earned
      }, 0)

      const totalHunt = completions.reduce((s, r) => {
        if (HUNT_REWARDS[r.quest_id]) return s + HUNT_REWARDS[r.quest_id]
        if (r.quest_id?.startsWith('raid:')) {
          if (BROODGATE_ROW.test(r.quest_id)) return s + (BROODGATE_XP_TO_HUNT[r.xp_earned] ?? 0)
          if (r.xp_earned === 0) return s
          if (RAID_NEW_XP_SET.has(r.xp_earned)) return s + (RAID_XP_TO_HUNT[r.xp_earned] ?? 0)
          return s + r.xp_earned
        }
        return s
      }, 0)

      const completedGates = completions.filter(r => GATE_META[r.quest_id]).map(r => r.quest_id)
      const recent = completions
        .filter(r => metaFor(r.quest_id) && r.completed_at)
        .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))
        .slice(0, 6)
      const lastActive = recent[0]?.completed_at ?? null

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
        ...prof, totalXp, totalHunt, completedGates, recent, lastActive,
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
    <div className="pp-shell"><div className="pp-state">LOADING SEEKER DATA…</div></div>
  )
  if (notFound) return (
    <div className="pp-shell">
      <div className="pp-state">
        <div className="pp-state-glyph">⊘</div>
        <div className="pp-state-title">SEEKER NOT FOUND</div>
        <div className="pp-state-sub">This callsign doesn't exist in the records.</div>
        <a href="/" className="btn btn-primary" style={{ marginTop: 24 }}>Return to Base →</a>
      </div>
    </div>
  )
  if (pilot.is_banned) return (
    <div className="pp-shell">
      <div className="pp-state">
        <div className="pp-state-glyph">⛒</div>
        <div className="pp-state-title">RECORD SEALED</div>
        <div className="pp-state-sub">This hunter's file has been sealed by the Association.</div>
        <a href="/" className="btn btn-primary" style={{ marginTop: 24 }}>Return to Base →</a>
      </div>
    </div>
  )

  const gates = pilot.questsCompleted
  const clearedBoss = pilot.completedGates.some(g => GATE_META[g]?.boss)
  const climbPct = Math.round(gates / STRATUM1_GATES * 100)
  const joined = new Date(pilot.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const nameColor = pilot.is_subscribed ? (USERNAME_COLORS[pilot.username_color]?.value ?? undefined) : undefined

  // Steam-style achievement showcase (derived from real progress)
  const achievements = [
    { id: 'first',   icon: '🩸', name: 'First Blood',      desc: 'Clear your first contract',   got: gates >= 1 },
    { id: 'boss',    icon: '⚗️', name: 'Boss Slayer',      desc: 'Down a stratum boss',         got: clearedBoss },
    { id: 'half',    icon: '🌌', name: 'Halfway Down',     desc: 'Clear 5 contracts',           got: gates >= 5 },
    { id: 'stratum', icon: '🏆', name: 'Stratum 1 Clear',  desc: 'Clear all 10 of the Foundry', got: gates >= STRATUM1_GATES },
    { id: 'fire',    icon: '🔥', name: 'On Fire',          desc: '3-day dive streak',           got: pilot.streak >= 3 },
    { id: 'op',      icon: '⚡', name: 'Operative',        desc: 'Reach Level 5',               got: pilot.level >= 5 },
    { id: 'founder', icon: '◈',  name: 'Founder',          desc: 'A founding hunter',           got: !!pilot.is_founder },
    { id: 'pass',    icon: '✦',  name: 'Season Pass',      desc: 'Season 01 pass holder',       got: !!pilot.is_subscribed },
  ]
  const earned = achievements.filter(a => a.got)

  const HEADLINE = [
    { v: pilot.level, l: 'LEVEL', c: pilot.levelColor },
    { v: fmt(pilot.totalXp), l: 'XP', c: 'var(--teal)' },
    { v: gates, l: 'CLEARED', c: 'var(--lime)' },
    { v: fmt(pilot.totalHunt), l: '$SHARD', c: 'var(--magenta)' },
    { v: pilot.streak, l: 'STREAK', c: 'var(--amber)' },
  ]

  return (
    <div className="pp-shell">
      <div className="pp-page">

        <div className="pp-topbar">
          <a href="/" className="pp-back">← voidshards.net</a>
          <button className="pp-copy-btn" onClick={copyLink}>{copied ? '✓ Link copied' : '⎘ Copy profile link'}</button>
        </div>

        {/* ── Header banner ── */}
        <header className="pp-header">
          <div className="pp-header-glow" style={{ background: `radial-gradient(ellipse at 12% 0%, ${pilot.levelColor}22, transparent 60%)` }} />
          <div className="pp-avatar-wrap">
            <div className="pp-avatar" style={{ boxShadow: `0 0 0 3px ${pilot.levelColor}70, 0 0 42px ${pilot.levelColor}35` }}>
              <HunterSigil config={pilot.avatar} name={pilot.name} size="100%" />
            </div>
            <div className="pp-level-chip" style={{ color: pilot.levelColor, borderColor: `${pilot.levelColor}80` }}>{pilot.level}</div>
          </div>

          <div className="pp-header-main">
            <div className="pp-name-row">
              <h1 className="pp-name" style={nameColor ? { color: nameColor } : undefined}>{pilot.name ?? 'SEEKER'}</h1>
              {pilot.is_subscribed && <span className="pp-pass-chip">◈ PASS</span>}
            </div>
            <div className="pp-rank-line" style={{ color: pilot.levelColor }}>
              LV.{pilot.level} · {pilot.levelLabel}
            </div>
            <div className="pp-meta-line">
              Seeker since {joined}
              {pilot.lastActive && <> · <span className="pp-lastseen">last dive {relTime(pilot.lastActive)}</span></>}
            </div>
            <div className="pp-badges">
              {pilot.guild_id && (
                <span className="pp-guild-chip" onClick={() => goto(`guild/${pilot.guild_id}`)} title={pilot.guild_name}>
                  <span className="pp-guild-emblem"><HunterSigil config={pilot.guild_emblem} name={pilot.guild_name} size="100%" variant="emblem" /></span>
                  <span className="pp-guild-tag">[{pilot.guild_tag}]</span>
                </span>
              )}
              {pilot.is_founder && <span className="pp-founder-badge">◈ FOUNDER</span>}
            </div>

            <div className="pp-headline">
              {HEADLINE.map((s, i) => (
                <div key={s.l} className="pp-hl-stat">
                  <span className="pp-hl-val" style={{ color: s.c }}>{s.v}</span>
                  <span className="pp-hl-lbl">{s.l}</span>
                  {i < HEADLINE.length - 1 && <span className="pp-hl-sep" />}
                </div>
              ))}
            </div>
          </div>
        </header>

        {/* ── Two-column body ── */}
        <div className="pp-body">
          <div className="pp-col-main">

            {/* Recent activity */}
            <section className="pp-panel">
              <div className="pp-panel-head"><h2>RECENT ACTIVITY</h2></div>
              {pilot.recent.length === 0 ? (
                <div className="pp-empty">No dives logged yet.</div>
              ) : (
                <ul className="pp-activity">
                  {pilot.recent.map((r, i) => {
                    const m = metaFor(r.quest_id)
                    return (
                      <li key={i} className="pp-activity-row">
                        <span className="pp-activity-icon" style={{ background: `${m.color}14`, borderColor: `${m.color}44` }}>{m.icon}</span>
                        <span className="pp-activity-txt">
                          Cleared <strong style={{ color: m.color }}>{m.label}</strong>
                          {m.boss && <span className="pp-boss-tag">BOSS</span>}
                        </span>
                        <span className="pp-activity-time">{relTime(r.completed_at)}</span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>

            {/* The Climb progress */}
            <section className="pp-panel">
              <div className="pp-panel-head"><h2>THE CLIMB</h2><span className="pp-panel-note">Stratum 1 · The Foundry</span></div>
              <div className="pp-bar-block">
                <div className="pp-bar-head"><span>CONTRACTS CLEARED</span><span>{gates}/{STRATUM1_GATES} · {climbPct}%</span></div>
                <div className="pp-bar-track"><div className="pp-bar-fill" style={{ width: `${climbPct}%`, background: 'linear-gradient(90deg, var(--teal), var(--violet))' }} /></div>
              </div>
              <div className="pp-bar-block">
                <div className="pp-bar-head">
                  <span style={{ color: pilot.levelColor }}>LV.{pilot.level} {pilot.levelLabel}</span>
                  <span>{pilot.level < 10 ? `${pilot.xpInLevel}/${pilot.xpNeeded} XP → LV.${pilot.level + 1}` : 'MAX · LEGEND'}</span>
                </div>
                <div className="pp-bar-track"><div className="pp-bar-fill" style={{ width: `${pilot.levelProgress}%`, background: pilot.levelColor }} /></div>
              </div>
            </section>

            {/* Cleared contracts showcase */}
            <section className="pp-panel">
              <div className="pp-panel-head"><h2>CLEARED CONTRACTS</h2><span className="pp-panel-note">{gates} total</span></div>
              {pilot.completedGates.length === 0 ? (
                <div className="pp-empty">No contracts cleared yet.</div>
              ) : (
                <div className="pp-gate-grid">
                  {pilot.completedGates.map(gid => {
                    const m = GATE_META[gid]
                    return (
                      <div key={gid} className="pp-gate-cell" style={{ borderColor: `${m.color}44`, background: `${m.color}0d` }} title={m.label}>
                        <span className="pp-gate-icon">{m.icon}</span>
                        <span className="pp-gate-short" style={{ color: m.color }}>{m.short}</span>
                        {m.boss && <span className="pp-gate-boss">◆</span>}
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <aside className="pp-col-side">
            <section className="pp-panel pp-level-panel">
              <div className="pp-level-big" style={{ color: pilot.levelColor, borderColor: `${pilot.levelColor}55` }}>{pilot.level}</div>
              <div className="pp-level-name" style={{ color: pilot.levelColor }}>{pilot.levelLabel}</div>
              <div className="pp-level-xp">{fmt(pilot.totalXp)} XP</div>
            </section>

            <section className="pp-panel">
              <div className="pp-panel-head"><h2>ACHIEVEMENTS</h2><span className="pp-panel-note">{earned.length}/{achievements.length}</span></div>
              <div className="pp-ach-grid">
                {achievements.map(a => (
                  <div key={a.id} className={`pp-ach${a.got ? ' got' : ''}`} title={`${a.name} — ${a.desc}`}>
                    <span className="pp-ach-icon">{a.icon}</span>
                    <span className="pp-ach-name">{a.name}</span>
                  </div>
                ))}
              </div>
            </section>

            {pilot.streak > 0 && (
              <section className="pp-panel pp-streak-panel">🔥 <strong>{pilot.streak}-day</strong> dive streak</section>
            )}

            <section className="pp-panel pp-cta">
              <div className="pp-cta-brand">VOID SHARDS</div>
              <div className="pp-cta-sub">Writing code is combat. Clear the gates. Climb the tower.</div>
              <a href="/" className="btn btn-primary" style={{ marginTop: 14, width: '100%' }}>Start your climb →</a>
            </section>
          </aside>
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import './Dashboard.css'
import './AcademyDashboard.css'
import { useNav } from '../context/NavigationContext'
import { useAuth } from '../context/AuthContext'
import { useAcademy } from '../context/AcademyContext'
import { supabase } from '../lib/supabase'

function fmt(n) { return (n ?? 0).toLocaleString() }
function initials(name) { return (name ?? 'BL').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) }

// ── Gate manifests ───────────────────────────────────────
const SCRATCH_GATES = [
  { id: 'S-01', name: 'The First Block',        rank: 'E', concept: 'Sequences',        xp: 80,  boss: false, icon: '🟦' },
  { id: 'S-02', name: 'The Repeat Machine',     rank: 'E', concept: 'Loops',            xp: 80,  boss: false, icon: '🔁' },
  { id: 'S-03', name: 'The Decision Point',     rank: 'E', concept: 'Conditionals',     xp: 90,  boss: false, icon: '🔀' },
  { id: 'S-04', name: 'The Memory Box',         rank: 'E', concept: 'Variables',        xp: 100, boss: false, icon: '📦' },
  { id: 'S-05', name: 'The Event Tower',        rank: 'D', concept: 'Events',           xp: 100, boss: false, icon: '⚡' },
  { id: 'S-06', name: 'The Glitch Block',       rank: 'D', concept: 'Debugging',        xp: 500, boss: true,  icon: '☠️' },
  { id: 'S-07', name: 'The Function Machine',   rank: 'D', concept: 'Functions',        xp: 180, boss: false, icon: '⚙️' },
  { id: 'S-08', name: 'The Counter Loop',       rank: 'D', concept: 'Loop + Counter',   xp: 150, boss: false, icon: '🔢' },
  { id: 'S-09', name: 'The Multi-Sprite World', rank: 'C', concept: 'Multiple Sprites', xp: 165, boss: false, icon: '🌍' },
  { id: 'S-10', name: 'The Complete World',     rank: 'C', concept: 'Integration',      xp: 300, boss: false, icon: '🌟' },
  { id: 'S-11', name: 'The Glitch King',        rank: 'C', concept: 'Debugging Boss',   xp: 650, boss: true,  icon: '👑' },
  { id: 'S-12', name: 'The Animation Studio',   rank: 'C', concept: 'Animation',        xp: 200, boss: false, icon: '🎬' },
  { id: 'S-13', name: 'The Sound System',       rank: 'C', concept: 'Sound',            xp: 150, boss: false, icon: '🔊' },
  { id: 'S-14', name: 'The Clone Factory',      rank: 'B', concept: 'Clones',           xp: 250, boss: false, icon: '🏭' },
  { id: 'S-15', name: 'The Mini Game Jam',      rank: 'B', concept: 'All Concepts',     xp: 400, boss: false, icon: '🎮' },
]
const PYTHON_GATES = [
  { id: 'P-01', name: 'First Words',          rank: 'E', concept: 'Print & Strings',  xp: 200, boss: false, icon: '🐍' },
  { id: 'P-02', name: 'The Number Engine',    rank: 'E', concept: 'Math & Input',      xp: 200, boss: false, icon: '🔢' },
  { id: 'P-03', name: 'The Condition Writer', rank: 'E', concept: 'Conditionals',      xp: 300, boss: false, icon: '🔀' },
  { id: 'P-04', name: 'The Loop Writer',      rank: 'D', concept: 'Loops',             xp: 250, boss: false, icon: '🔁' },
  { id: 'P-05', name: 'The Function Forge',          rank: 'D', concept: 'Functions',              xp: 250, boss: false, icon: '⚙️' },
  { id: 'P-06', name: 'The List Library',            rank: 'D', concept: 'Lists',                   xp: 280, boss: false, icon: '📚' },
  { id: 'P-07', name: 'The Dictionary District',     rank: 'D', concept: 'Dictionaries',            xp: 280, boss: false, icon: '🗺️' },
  { id: 'P-08', name: 'The Class Constructor',       rank: 'C', concept: 'Classes & Objects',       xp: 330, boss: false, icon: '🏗️' },
  { id: 'P-09', name: 'The Error Handler',           rank: 'C', concept: 'Error Handling',          xp: 275, boss: false, icon: '🛡️' },
  { id: 'P-10', name: 'The File System',             rank: 'C', concept: 'File I/O',                xp: 275, boss: false, icon: '💾' },
  { id: 'P-11', name: 'The Data Structures Forge',   rank: 'C', concept: 'Tuples, Sets & Strings',  xp: 275, boss: false, icon: '🗂️' },
  { id: 'P-12', name: 'The Algorithm Mind',          rank: 'B', concept: 'Algorithms',              xp: 300, boss: false, icon: '🧠' },
  { id: 'P-13', name: 'The Module Network',          rank: 'B', concept: 'Modules',                 xp: 275, boss: false, icon: '🔗' },
  { id: 'P-14', name: 'The Complete System',         rank: 'B', concept: 'Integration',             xp: 360, boss: false, icon: '🖥️' },
  { id: 'P-15', name: 'The Rot Detector',            rank: 'B', concept: 'Python Boss',             xp: 800, boss: true,  icon: '🌱' },
  { id: 'P-16', name: 'The String Forge',           rank: 'C', concept: 'String Methods',          xp: 315, boss: false, icon: '📝' },
  { id: 'P-17', name: 'The Comprehension Engine',   rank: 'C', concept: 'Comprehensions',          xp: 300, boss: false, icon: '🗜️' },
  { id: 'P-18', name: 'The Inheritance Tower',      rank: 'B', concept: 'Advanced OOP',            xp: 385, boss: false, icon: '🏰' },
  { id: 'P-19', name: 'The Generator Network',      rank: 'B', concept: 'Generators',             xp: 330, boss: false, icon: '♾️' },
  { id: 'P-20', name: 'The Decorator Chamber',      rank: 'B', concept: 'Decorators',             xp: 330, boss: false, icon: '✨' },
  { id: 'P-21', name: 'The Test Protocol',          rank: 'B', concept: 'Testing',                xp: 330, boss: false, icon: '✅' },
  { id: 'P-22', name: 'The Context Manager',        rank: 'B', concept: 'Context Managers',       xp: 330, boss: false, icon: '🔒' },
  { id: 'P-23', name: 'The Type System',            rank: 'B', concept: 'Type Hints',             xp: 300, boss: false, icon: '📋' },
  { id: 'P-24', name: 'The Environment Protocol',   rank: 'B', concept: 'Environments',           xp: 330, boss: false, icon: '🌱' },
]
const JS_GATES = [
  { id: 'J-01', name: 'The DOM Awakens',         rank: 'E', concept: 'DOM Basics',       xp: 250, boss: false, icon: '🌐' },
  { id: 'J-02', name: 'The Event System',         rank: 'E', concept: 'Events',           xp: 250, boss: false, icon: '📡' },
  { id: 'J-03', name: 'The Async Signal',         rank: 'D', concept: 'Async / Await',    xp: 300, boss: false, icon: '⚡' },
  { id: 'J-04', name: 'The State Machine',        rank: 'D', concept: 'State Management', xp: 300, boss: false, icon: '🎮' },
  { id: 'J-05', name: 'The Module System',        rank: 'D', concept: 'ES Modules',       xp: 300, boss: false, icon: '📦' },
  { id: 'J-06', name: 'The Array Toolkit',        rank: 'C', concept: 'Array Methods',    xp: 280, boss: false, icon: '🔧' },
  { id: 'J-07', name: 'The Complete Interface',   rank: 'C', concept: 'Integration',      xp: 380, boss: false, icon: '🌍' },
  { id: 'J-08', name: 'The Performance Layer',    rank: 'C', concept: 'Performance',      xp: 300, boss: false, icon: '🚀' },
  { id: 'J-09', name: 'The React Awakening',      rank: 'B', concept: 'React Components', xp: 350, boss: false, icon: '⚛️' },
  { id: 'J-10', name: 'The Hook Circuit',         rank: 'B', concept: 'React Hooks',      xp: 500, boss: true,  icon: '🪝' },
  { id: 'J-11', name: 'The Scope Chamber',       rank: 'D', concept: 'Closures & Scope', xp: 330, boss: false, icon: '🔐' },
  { id: 'J-12', name: 'The Prototype Chain',     rank: 'D', concept: 'Prototypes',       xp: 330, boss: false, icon: '⛓️' },
  { id: 'J-13', name: 'The Event Loop Depths',   rank: 'C', concept: 'Event Loop',       xp: 330, boss: false, icon: '🔄' },
  { id: 'J-14', name: 'The Regex Forge',         rank: 'C', concept: 'Regex',            xp: 300, boss: false, icon: '🎯' },
  { id: 'J-15', name: 'The Error Architecture',  rank: 'C', concept: 'Error Handling',   xp: 330, boss: false, icon: '🛡️' },
  { id: 'J-16', name: 'The Browser API Vault',   rank: 'C', concept: 'Browser APIs',     xp: 300, boss: false, icon: '🔧' },
  { id: 'J-17', name: 'The Form Depths',         rank: 'C', concept: 'Advanced Forms',   xp: 330, boss: false, icon: '📋' },
  { id: 'J-18', name: 'The TypeScript Gateway',  rank: 'B', concept: 'TypeScript',       xp: 330, boss: false, icon: '🚪' },
  { id: 'J-19', name: 'The Testing Station',     rank: 'B', concept: 'JS Testing',       xp: 330, boss: false, icon: '✅' },
  { id: 'J-20', name: 'The Build System',        rank: 'B', concept: 'Build Tools',      xp: 330, boss: false, icon: '🏭' },
  { id: 'J-21', name: 'The React Introduction',  rank: 'B', concept: 'React',            xp: 385, boss: false, icon: '⚛️' },
]
const TRACK_GATES = { scratch: SCRATCH_GATES, python: PYTHON_GATES, javascript: JS_GATES }
const TRACK_META  = {
  scratch:    { label: 'Block Layer', lang: 'Block Coding', color: 'var(--amber)'  },
  python:     { label: 'Code Layer',  lang: 'Python',       color: 'var(--lime)'   },
  javascript: { label: 'Web Layer',   lang: 'JavaScript',   color: 'var(--teal)'   },
}
const RANK_COLOR  = { E: 'var(--lime)', D: 'var(--amber)', C: 'var(--teal)', B: 'var(--violet)', A: 'var(--magenta)' }
const LB_GRADS = [
  'oklch(0.72 0.28 340), oklch(0.55 0.26 290)',
  'oklch(0.86 0.18 185), oklch(0.68 0.25 295)',
  'oklch(0.82 0.18 75),  oklch(0.55 0.22 40)',
  'oklch(0.7 0.25 295),  oklch(0.5 0.2 200)',
  'oklch(0.9 0.22 135),  oklch(0.55 0.18 185)',
]

export default function AcademyDashboard() {
  const { user, profile, logout, updateProfile, updatePassword, updateEmail } = useAuth()
  const { childProfiles, activeChild, setActiveChild, completedGateIds, totalAcademyXp, loading } = useAcademy()
  const { goto } = useNav()

  const [view, setView]               = useState(() => localStorage.getItem('acd-view') ?? 'home')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifOpen, setNotifOpen]     = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [welcomed, setWelcomed]       = useState(() => !!localStorage.getItem('acd_welcomed'))
  const [onboardStep, setOnboardStep] = useState(1)
  const [bugModalOpen, setBugModalOpen] = useState(false)
  const [bugText, setBugText]         = useState('')
  const [bugStatus, setBugStatus]     = useState(null)
  const [lbData, setLbData]           = useState([])
  const [settingsName, setSettingsName]     = useState('')
  const [settingsEmail, setSettingsEmail]   = useState('')
  const [newPassword, setNewPassword]       = useState('')
  const [saveStatus, setSaveStatus]         = useState(null)
  const [pwStatus, setPwStatus]             = useState(null)
  const [emailStatus, setEmailStatus]       = useState(null)
  const [changingEmail, setChangingEmail]   = useState(false)
  const [viewTrack, setViewTrack]           = useState(null)

  // ── Auth guard ──────────────────────────────────────────
  useEffect(() => {
    if (!user) { goto('login'); return }
    if (!loading && childProfiles.length === 0) goto('academy/onboarding')
  }, [user, loading, childProfiles.length])

  useEffect(() => { localStorage.setItem('acd-view', view) }, [view])

  // ── Leaderboard ─────────────────────────────────────────
  useEffect(() => {
    supabase
      .from('child_profiles')
      .select('id, name, track, academy_completions(xp_earned)')
      .then(({ data }) => {
        if (!data) return
        const ranked = data
          .map(p => ({
            id: p.id,
            name: p.name,
            track: p.track,
            totalXp: (p.academy_completions || []).reduce((s, r) => s + (r.xp_earned ?? 0), 0),
          }))
          .sort((a, b) => b.totalXp - a.totalXp)
          .map((p, i) => ({ ...p, rank: i + 1 }))
        setLbData(ranked)
      })
  }, [activeChild?.id])

  // ── Bug report ──────────────────────────────────────────
  async function submitBugReport() {
    if (!bugText.trim()) return
    setBugStatus('sending')
    const { count } = await supabase
      .from('bug_reports')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString())
    if (count >= 2) { setBugStatus('ratelimit'); return }
    const { error } = await supabase.from('bug_reports').insert({
      user_id: user.id,
      description: bugText.trim(),
      view: `academy/${view}`,
      url: window.location.href,
      user_agent: navigator.userAgent,
      status: 'new',
    })
    if (!error) {
      setBugStatus('sent')
      setBugText('')
      setTimeout(() => { setBugModalOpen(false); setBugStatus(null) }, 1800)
    } else {
      setBugStatus('error')
    }
  }

  // ── Settings ────────────────────────────────────────────
  function openSettings() {
    setSettingsName(profile?.name ?? '')
    setSettingsEmail(user?.email ?? '')
    setSaveStatus(null)
    setView('settings')
  }

  async function handleSave() {
    setSaveStatus('saving')
    const ok = await updateProfile(settingsName, profile?.wallet ?? '')
    setSaveStatus(ok ? 'saved' : 'error')
    if (ok) setTimeout(() => setSaveStatus(null), 2500)
  }

  async function handlePasswordChange() {
    if (!newPassword.trim()) return
    setPwStatus('saving')
    const ok = await updatePassword(newPassword)
    setPwStatus(ok ? 'saved' : 'error')
    if (ok) { setNewPassword(''); setTimeout(() => setPwStatus(null), 2500) }
  }

  async function handleEmailChange() {
    if (!settingsEmail.trim()) return
    setEmailStatus('saving')
    const ok = await updateEmail(settingsEmail.trim())
    setEmailStatus(ok ? 'saved' : 'error')
    if (ok) setTimeout(() => { setEmailStatus(null); setChangingEmail(false) }, 2500)
  }

  // ── Derived ─────────────────────────────────────────────
  if (!user || loading || !activeChild) return (
    <div className="acd-loading">
      <div className="acd-loading-ring" />
      <div className="acd-loading-text">Loading Academy...</div>
    </div>
  )

  const track         = activeChild.track ?? 'scratch'
  const meta          = TRACK_META[track] ?? TRACK_META.scratch
  const gates         = TRACK_GATES[track] ?? SCRATCH_GATES
  const totalXpPoss   = gates.reduce((s, g) => s + g.xp, 0)
  const xpPct         = totalXpPoss > 0 ? Math.min(100, Math.round((totalAcademyXp / totalXpPoss) * 100)) : 0
  const completedCount = gates.filter(g => completedGateIds.has(g.id)).length
  const activeGateIdx  = gates.findIndex(g => !completedGateIds.has(g.id))
  const activeGateId   = activeGateIdx >= 0 ? gates[activeGateIdx]?.id : null
  const showWelcome    = !welcomed

  function gateStatus(gate) {
    if (completedGateIds.has(gate.id)) return 'done'
    if (gate.id === activeGateId)      return 'active'
    return 'locked'
  }
  function gotoGate(gateId) {
    const gate = gates.find(g => g.id === gateId)
    if (gate && gateStatus(gate) === 'locked') return
    goto(`academy/gate/${gateId.toLowerCase().replace('-', '')}`)
  }
  function gotoActiveGate() {
    if (activeGateId) gotoGate(activeGateId)
  }

  const pilotName = profile?.name ?? 'Builder'
  const myEntry   = lbData.find(r => r.id === activeChild?.id)

  const objectives = [
    ...gates.slice(0, 4).map(g => ({ done: completedGateIds.has(g.id), text: `Clear ${g.id} — ${g.name}`, rw: `+${g.xp} XP` })),
    { done: xpPct >= 50, text: 'Reach 50% track progress', rw: '🏅 Badge' },
  ]
  const objDone = objectives.filter(o => o.done).length

  // ── Render ──────────────────────────────────────────────
  return (
    <div className="dash-wrap">

      {/* ── Welcome modal ────────────────────────────────── */}
      {showWelcome && (
        <div className="welcome-backdrop">
          <div className="welcome-modal" onClick={e => e.stopPropagation()}>
            {onboardStep === 1 && (<>
              <div className="welcome-glyph onboard-glyph-pulse">◈</div>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--amber)', letterSpacing: '0.18em', marginBottom: 10 }}>VOID ACADEMY</div>
              <h2 className="welcome-title">Welcome, {activeChild.name}.</h2>
              <p className="welcome-body">
                You're in the Construct — a digital world built by young coders, gate by gate.
                Clear each gate to unlock the next one and build your Builder rank.
              </p>
              <div style={{ background: 'oklch(0.72 0.28 340 / 0.08)', border: '1px solid oklch(0.72 0.28 340 / 0.35)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontFamily: 'var(--f-mono)', fontSize: 11, color: 'oklch(0.85 0.18 25)', lineHeight: 1.6, textAlign: 'left' }}>
                ⚠ Make sure your parent or guardian created this account. Using an account without parental consent will result in a permanent ban.
              </div>
              <div className="onboard-dots">
                <span className="onboard-dot onboard-dot-on" /><span className="onboard-dot" />
              </div>
              <div className="welcome-actions">
                <button className="welcome-cta" onClick={() => setOnboardStep(2)}>Continue →</button>
              </div>
            </>)}

            {onboardStep === 2 && (<>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--amber)', letterSpacing: '0.14em', marginBottom: 10 }}>TRACK — {meta.label.toUpperCase()}</div>
              <h2 className="welcome-title" style={{ marginBottom: 20 }}>Your First Gates</h2>
              <div className="onboard-gates">
                {gates.slice(0, 4).map(g => (
                  <div key={g.id} className={`onboard-gate${g.boss ? ' onboard-gate-boss' : ''}`}>
                    <span className="onboard-gate-icon">{g.icon}</span>
                    <span className="onboard-gate-name">{g.name}</span>
                    <span className="onboard-gate-sub">{g.concept}</span>
                    <span className="onboard-gate-reward">+{g.xp} XP{g.boss ? ' · BOSS' : ''}</span>
                  </div>
                ))}
              </div>
              <div className="onboard-dots" style={{ marginTop: 20 }}>
                <span className="onboard-dot" /><span className="onboard-dot onboard-dot-on" />
              </div>
              <button className="welcome-cta" style={{ marginTop: 16 }} onClick={() => { localStorage.setItem('acd_welcomed', '1'); setWelcomed(true); gotoActiveGate() }}>
                Begin Gate 01 →
              </button>
            </>)}
          </div>
        </div>
      )}

      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}

      {/* ── Bug report modal ─────────────────────────────── */}
      {bugModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(5,7,13,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setBugModalOpen(false) }}>
          <div className="panel" style={{ width: '100%', maxWidth: 460, padding: '32px 28px' }}>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--magenta)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>⚠ Bug Report</div>
            <h3 style={{ fontSize: 20, fontWeight: 500, marginBottom: 6 }}>What went wrong?</h3>
            <p style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-3)', marginBottom: 20 }}>Describe what happened. View and browser info are captured automatically.</p>
            <textarea
              value={bugText}
              onChange={e => setBugText(e.target.value)}
              placeholder="e.g. Clicking a gate does nothing..."
              rows={4}
              style={{ width: '100%', background: 'rgba(180,200,255,0.03)', border: '1px solid var(--line-2)', borderRadius: 10, padding: '12px 14px', color: 'var(--ink-0)', fontFamily: 'var(--f-body)', fontSize: 13, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => setBugModalOpen(false)} style={{ fontSize: 12 }}>Cancel</button>
              <button className="btn btn-primary" onClick={submitBugReport} disabled={!bugText.trim() || bugStatus === 'sending'} style={{ fontSize: 12 }}>
                {bugStatus === 'sending' ? 'Sending…' : bugStatus === 'sent' ? '✓ Sent!' : 'Submit Report'}
              </button>
            </div>
            {bugStatus === 'error'     && <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--magenta)', marginTop: 10 }}>Failed — try again.</div>}
            {bugStatus === 'ratelimit' && <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--amber)',   marginTop: 10 }}>Too many reports — wait 5 min.</div>}
          </div>
        </div>
      )}

      {/* ── Sidebar ──────────────────────────────────────── */}
      <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="logo" style={{ cursor: 'pointer' }} onClick={() => { goto('academy'); setSidebarOpen(false) }}>
          <img src="/LOGO.svg" alt="SHARD" style={{ height: 40 }} />
          <span className="chip chip-amber" style={{ fontSize: 9, padding: '2px 8px' }}>ACADEMY</span>
        </div>

        <div>
          <div className="section-label">Builder HQ</div>
          <div className="navlist">
            <a className={view === 'home' ? 'active' : ''} onClick={() => setView('home')}><span className="ic">◈</span> Dashboard</a>
            <a onClick={gotoActiveGate}><span className="ic">▶</span> Active Gate</a>
            <a className={view === 'skill-tree' ? 'active' : ''} onClick={() => setView('skill-tree')}><span className="ic">⟐</span> Skill Tree</a>
          </div>
        </div>

        <div>
          <div className="section-label">Family</div>
          <div className="navlist">
            <a className={view === 'leaderboard' ? 'active' : ''} onClick={() => setView('leaderboard')}><span className="ic">♦</span> Your Builders</a>
          </div>
        </div>


        <div style={{ padding: '0 12px 8px' }}>
          <button onClick={() => { setBugModalOpen(true); setBugText(''); setBugStatus(null) }}
            style={{ width: '100%', background: 'none', border: '1px solid var(--line)', borderRadius: 8, padding: '7px 12px', fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-3)', cursor: 'pointer', letterSpacing: '0.06em', transition: 'color 0.15s, border-color 0.15s', textAlign: 'left' }}>
            ⚠ Report a Bug
          </button>
        </div>

        {/* Bottom — child profile (replaces wallet card) */}
        <div className="wallet-card">
          <div className="addr">
            <span className="dot" style={{ color: meta.color }} />
            {activeChild.name} · {meta.lang}
          </div>
          <div className="bal" style={{ fontSize: 20 }}>{fmt(totalAcademyXp)}<span className="u" style={{ color: 'var(--amber)' }}>XP</span></div>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────── */}
      <main className="dash-main">
        <div className="topbar">
          <div className="hamburger" onClick={() => setSidebarOpen(o => !o)}>
            <span /><span /><span />
          </div>
          <div className="search">
            <span>⌕</span>
            <input placeholder="Search gates, concepts..." readOnly />
          </div>
          <div className="top-actions">
            {/* Notifications */}
            <div style={{ position: 'relative' }}>
              {notifOpen && <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setNotifOpen(false)} />}
              <div className="bell" style={{ cursor: 'pointer' }} onClick={() => { setNotifOpen(o => !o); setProfileOpen(false) }}>🔔</div>
              {notifOpen && (
                <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 280, zIndex: 100, background: 'var(--bg-popup)', border: '1px solid var(--border-popup)', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow-popup)' }}>
                  <div style={{ padding: '11px 16px', borderBottom: '1px solid var(--line-popup)', fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Builder Activity</div>
                  {completedGateIds.size === 0 ? (
                    <div style={{ padding: '14px 16px', fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-3)' }}>No gates cleared yet. Enter Gate 01!</div>
                  ) : (
                    gates.filter(g => completedGateIds.has(g.id)).slice().reverse().slice(0, 4).map((g, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10, padding: '11px 16px', borderBottom: '1px solid var(--line-popup)', alignItems: 'center' }}>
                        <span style={{ fontSize: 18, flexShrink: 0 }}>{g.icon}</span>
                        <div>
                          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-1)' }}>{g.id} — {g.name} cleared</div>
                          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--ink-3)', marginTop: 2 }}>+{g.xp} XP · {g.concept}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Profile */}
            <div style={{ position: 'relative' }}>
              {profileOpen && <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setProfileOpen(false)} />}
              <div className="dash-avatar" style={{ cursor: 'pointer' }} onClick={() => { setProfileOpen(o => !o); setNotifOpen(false) }}>{initials(pilotName)}</div>
              {profileOpen && (
                <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 220, zIndex: 100, background: 'var(--bg-popup)', border: '1px solid var(--border-popup)', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow-popup)' }}>
                  <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--line-popup)' }}>
                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--ink-1)', fontWeight: 600 }}>{pilotName}</div>
                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-3)', marginTop: 3 }}>{user?.email}</div>
                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: meta.color, marginTop: 5, letterSpacing: '0.08em' }}>
                      {activeChild.name} · {meta.lang}
                    </div>
                  </div>
                  <div style={{ padding: '6px 0' }}>
                    <div style={{ padding: '9px 16px', fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--ink-2)', cursor: 'pointer', display: 'flex', gap: 8, alignItems: 'center' }}
                      onClick={() => { openSettings(); setProfileOpen(false) }}>
                      <span style={{ color: 'var(--ink-3)' }}>◐</span> Settings
                    </div>
                    <div style={{ height: 1, background: 'var(--line-popup)', margin: '4px 0' }} />
                    <div style={{ padding: '9px 16px', fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--magenta)', cursor: 'pointer', display: 'flex', gap: 8, alignItems: 'center' }}
                      onClick={() => { logout(); goto('landing') }}>
                      <span>↩</span> Sign out
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── HOME view ─────────────────────────────────── */}
        {view === 'home' && (<>
          <div className="hero-banner">
            <div>
              <span className="chip chip-amber" style={{ display: 'inline-flex' }}>
                <span className="dot dot-pulse" /> {meta.lang.toUpperCase()} · {meta.label.toUpperCase()}
              </span>
              <h1 style={{ marginTop: 16 }}>
                Welcome, {activeChild.name}.<br />
                <span className="gradient-text">Ready for your next gate?</span>
              </h1>
              <p>{completedCount === 0
                ? <>Your first gate awaits. Clear all {gates.length} to complete the {meta.lang} track.</>
                : completedCount < gates.length
                ? <>{gates.length - completedCount} gate{gates.length - completedCount !== 1 ? 's' : ''} remaining on the {meta.lang} track. Keep building.</>
                : <>{meta.lang} track complete. You've built the Construct. Graduate to the main platform.</>
              }</p>
              <div className="hero-xp-bar">
                <div className="hero-xp-labels">
                  <span style={{ color: meta.color, fontFamily: 'var(--f-mono)', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    {meta.lang} Track
                  </span>
                  <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-3)' }}>
                    {totalAcademyXp} / {totalXpPoss} XP · {xpPct}%
                  </span>
                </div>
                <div className="hero-xp-track">
                  <div className="hero-xp-fill" style={{ width: `${xpPct}%`, background: meta.color }} />
                </div>
              </div>
              {activeGateId && (
                <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={gotoActiveGate}>
                  Enter {activeGateId} →
                </button>
              )}
            </div>
            <div className="streak-art">
              <div className="streak-flame" style={{ background: `radial-gradient(circle at 40% 30%, ${meta.color}, oklch(0.5 0.2 40) 50%, oklch(0.35 0.2 20) 100%)` }}>
                {completedCount || '—'}
              </div>
              <div className="streak-lbl" style={{ color: meta.color }}>
                {completedCount > 0 ? `${completedCount} GATES CLEARED` : 'NO GATES YET'}
              </div>
            </div>
          </div>

          <div className="stats-grid">
            {[
              { color: meta.color,       label: 'XP EARNED',      val: fmt(totalAcademyXp),     delta: `of ${fmt(totalXpPoss)} total` },
              { color: 'var(--violet)',  label: 'TRACK PROGRESS', val: `${xpPct}%`,             delta: `${completedCount}/${gates.length} gates` },
              { color: 'var(--lime)',    label: 'GATES CLEARED',  val: String(completedCount),   delta: `${gates.length - completedCount} remaining` },
              { color: 'var(--magenta)', label: 'GATE XP',        val: myEntry ? fmt(myEntry.totalXp) : fmt(totalAcademyXp), delta: 'this builder' },
            ].map(s => (
              <div key={s.label} className="stat">
                <div className="label"><span className="dot" style={{ color: s.color }} />{s.label}</div>
                <div className="val">{s.val}</div>
                <div className="delta">{s.delta}</div>
              </div>
            ))}
          </div>

          <div className="dash-cols">
            <div>
              <div className="section-block">
                <div className="sb-head">
                  <h3>Track Gates</h3>
                  <span className="more" onClick={() => setView('skill-tree')}>View all →</span>
                </div>
                <div className="aq-list">
                  {gates.slice(0, 5).map(gate => {
                    const status = gateStatus(gate)
                    const color = RANK_COLOR[gate.rank]
                    return (
                      <div key={gate.id} className="aq" onClick={status === 'locked' ? undefined : () => gotoGate(gate.id)}
                        style={{ opacity: status === 'locked' ? 0.4 : 1, cursor: status === 'locked' ? 'not-allowed' : 'pointer' }}>
                        <div className="icon" style={{ background: `oklch(from ${color} l c h / 0.12)`, color }}>
                          {gate.icon}
                        </div>
                        <div>
                          <div className="aq-title">{gate.id} — {gate.name}</div>
                          <div className="meta">
                            {status === 'done'
                              ? <span className="chip chip-lime" style={{ padding: '2px 6px' }}>COMPLETED</span>
                              : status === 'active'
                              ? <span className="chip chip-amber" style={{ padding: '2px 6px' }}>ACTIVE</span>
                              : <span className="chip" style={{ padding: '2px 6px', fontSize: 10 }}>LOCKED</span>
                            }
                            <span>{status === 'done' ? `${gate.xp} XP earned` : `${gate.concept} · Rank ${gate.rank}${gate.boss ? ' · BOSS' : ''}`}</span>
                          </div>
                        </div>
                        <div className="pr">
                          <div className="bar"><div className="fill" style={{ width: status === 'done' ? '100%' : '0%', background: status === 'done' ? `linear-gradient(90deg, var(--lime), var(--teal))` : undefined }} /></div>
                          <div className="pct">{status === 'done' ? `100% · ${gate.xp} XP` : 'NOT STARTED'}</div>
                        </div>
                        <button className="btn btn-primary btn-sm">{status === 'done' ? 'Review' : status === 'active' ? 'Enter' : 'Locked'}</button>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div>
              <div className="section-block">
                {(() => {
                  return (
                    <>
                      <div className="sb-head"><h3>Track Objectives</h3><span className="more">{objDone}/{objectives.length}</span></div>
                      <div className="panel daily-card">
                        {objectives.map(d => (
                          <div key={d.text} className={`daily-item${d.done ? ' done' : ''}`}>
                            <div className="check">{d.done ? '✓' : '○'}</div>
                            <div className="t">{d.text}</div>
                            <div className="rw">{d.rw}</div>
                          </div>
                        ))}
                      </div>
                    </>
                  )
                })()}
              </div>

              <div className="section-block">
                <div className="sb-head"><h3>Your Builders</h3><span className="more">{lbData.length} in family</span></div>
                <div className="panel lb">
                  {lbData.length === 0
                    ? <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-3)', padding: '8px 0' }}>Loading...</div>
                    : lbData.slice(0, 5).map(r => (
                        <div key={r.id} className={`lb-row${r.rank <= 3 ? ' top' : ''}${r.id === activeChild?.id ? ' me' : ''}`}>
                          <div className="rank">{r.rank}</div>
                          <div className="who">
                            <div className="av" style={{ background: `linear-gradient(135deg, ${LB_GRADS[(r.rank - 1) % LB_GRADS.length]})` }}>{initials(r.name)}</div>
                            <span>{r.name}{r.id === activeChild?.id && <span style={{ color: 'var(--magenta)', fontSize: 10, fontFamily: 'var(--f-mono)', marginLeft: 6 }}>YOU</span>}</span>
                          </div>
                          <div className="xp">{fmt(r.totalXp)}</div>
                        </div>
                      ))
                  }
                </div>
              </div>
            </div>
          </div>
        </>)}

        {/* ── SKILL TREE view ──────────────────────────── */}
        {view === 'skill-tree' && (<>
          {(() => {
            const stTrack = viewTrack ?? track
            const stMeta  = TRACK_META[stTrack] ?? meta
            const stGates = TRACK_GATES[stTrack] ?? gates
            const stActiveIdx = stGates.findIndex(g => !completedGateIds.has(g.id))
            const stActiveId  = stActiveIdx >= 0 ? stGates[stActiveIdx]?.id : null
            const stDoneCount = stGates.filter(g => completedGateIds.has(g.id)).length
            function stStatus(gate) {
              if (completedGateIds.has(gate.id)) return 'done'
              if (gate.id === stActiveId) return 'active'
              return 'locked'
            }
            return (<>
          <div className="st-header">
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', marginBottom: 6 }}>Skill Tree</h2>
              <p style={{ color: 'var(--ink-2)', fontFamily: 'var(--f-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                {stMeta.label} · {stMeta.lang} · {stDoneCount}/{stGates.length} gates · {fmt(totalAcademyXp)} XP
              </p>
            </div>
            <div className="st-world-tabs">
              <div className={`st-world-tab${stTrack === 'scratch'    ? ' st-tab-active' : ''}`} style={{ cursor: 'pointer' }} onClick={() => setViewTrack('scratch')}>Block Layer</div>
              <div className={`st-world-tab${stTrack === 'python'     ? ' st-tab-active' : ''}`} style={{ cursor: 'pointer' }} onClick={() => setViewTrack('python')}>Code Layer</div>
              <div className={`st-world-tab${stTrack === 'javascript' ? ' st-tab-active' : ''}`} style={{ cursor: 'pointer' }} onClick={() => setViewTrack('javascript')}>Web Layer</div>
            </div>
          </div>

          <div className="st-grid">
            {stGates.map(gate => {
              const status = stStatus(gate)
              const isDone   = status === 'done'
              const isActive = status === 'active'
              const isLocked = status === 'locked'
              const stateCls = isDone ? ' st-done' : isActive ? ' st-active' : ' st-locked'
              return (
                <div
                  key={gate.id}
                  className={`st-node${gate.boss ? ' st-boss' : ''}${stateCls}`}
                  onClick={isLocked ? undefined : () => goto(`academy/gate/${gate.id.toLowerCase().replace('-', '')}`)}
                  style={{ cursor: isLocked ? 'not-allowed' : 'pointer' }}
                >
                  <div className="st-node-top">
                    <span className="st-ch">{gate.boss ? 'BOSS' : gate.id}</span>
                    <span className="st-status-icon">{isDone ? '✓' : isActive ? '▶' : '⊘'}</span>
                  </div>
                  <div className="st-icon">{gate.icon}</div>
                  <div className="st-title">{gate.name}</div>
                  <div className="st-topic">{gate.concept} · Rank {gate.rank}</div>
                  <div className="st-node-foot">
                    <span className="st-xp">+{gate.xp.toLocaleString()} XP</span>
                    {isDone   && <span className="chip chip-lime"  style={{ padding: '1px 6px', fontSize: 9 }}>DONE</span>}
                    {isActive && <span className="chip chip-amber" style={{ padding: '1px 6px', fontSize: 9 }}>START</span>}
                    {isLocked && <span className="st-locked-lbl">LOCKED</span>}
                  </div>
                </div>
              )
            })}
          </div>
            </>)
          })()}
        </>)}

        {/* ── LEADERBOARD view ─────────────────────────── */}
        {view === 'leaderboard' && (<>
          <div className="st-header">
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', marginBottom: 6 }}>Your Builders</h2>
              <p style={{ color: 'var(--ink-2)', fontFamily: 'var(--f-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                Your family's progress · {lbData.length} builder{lbData.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="panel lb" style={{ maxWidth: 640 }}>
            {lbData.length === 0
              ? <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-3)', padding: '16px 0' }}>Loading...</div>
              : lbData.map(r => (
                  <div key={r.id} className={`lb-row${r.rank <= 3 ? ' top' : ''}${r.id === activeChild?.id ? ' me' : ''}`}>
                    <div className="rank">{r.rank}</div>
                    <div className="who">
                      <div className="av" style={{ background: `linear-gradient(135deg, ${LB_GRADS[(r.rank - 1) % LB_GRADS.length]})` }}>{initials(r.name)}</div>
                      <span>
                        {r.name}
                        {r.id === activeChild?.id && <span style={{ color: 'var(--magenta)', fontSize: 10, fontFamily: 'var(--f-mono)', marginLeft: 6 }}>YOU</span>}
                      </span>
                    </div>
                    <div className="xp">{fmt(r.totalXp)} XP</div>
                  </div>
                ))
            }
          </div>
        </>)}

        {/* ── SETTINGS view ────────────────────────────── */}
        {view === 'settings' && (<>
          <div className="set-hero">
            <div className="set-avatar">{initials(pilotName)}</div>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 500, letterSpacing: '-0.02em', marginBottom: 4 }}>{pilotName}</h2>
              <p style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-2)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{user?.email}</p>
            </div>
          </div>

          <div className="set-grid">
            <div className="section-block">
              <div className="sb-head"><h3>Parent Account</h3></div>
              <div className="panel set-form">
                <div className="set-field">
                  <label className="set-label">Display Name</label>
                  <input className="set-input" value={settingsName} onChange={e => setSettingsName(e.target.value)} placeholder="Your name" />
                </div>
                <div className="set-actions">
                  <button className="btn btn-primary" onClick={handleSave} disabled={saveStatus === 'saving'}>
                    {saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}
                  </button>
                  {saveStatus === 'saved' && <span className="set-ok">✓ Saved</span>}
                  {saveStatus === 'error'  && <span className="set-err">Save failed</span>}
                </div>
              </div>
            </div>

            <div className="section-block">
              <div className="sb-head"><h3>Account Security</h3></div>
              <div className="panel set-form">
                <div className="set-field">
                  <label className="set-label">Email</label>
                  {!changingEmail
                    ? <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 13, color: 'var(--ink-1)' }}>{user?.email}</span>
                        <button className="btn" style={{ fontSize: 10, padding: '3px 10px' }} onClick={() => setChangingEmail(true)}>Change</button>
                      </div>
                    : <div style={{ display: 'flex', gap: 8 }}>
                        <input className="set-input" style={{ flex: 1 }} value={settingsEmail} onChange={e => setSettingsEmail(e.target.value)} placeholder="New email" />
                        <button className="btn btn-primary" style={{ fontSize: 11, padding: '8px 14px' }} onClick={handleEmailChange} disabled={emailStatus === 'saving'}>
                          {emailStatus === 'saving' ? '...' : emailStatus === 'saved' ? '✓' : 'Update'}
                        </button>
                      </div>
                  }
                  {emailStatus === 'error' && <span className="set-err">Failed — try again</span>}
                </div>
                <div className="set-field">
                  <label className="set-label">New Password</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input className="set-input" type="password" style={{ flex: 1 }} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Enter new password" />
                    <button className="btn btn-primary" style={{ fontSize: 11, padding: '8px 14px', flexShrink: 0 }} onClick={handlePasswordChange} disabled={!newPassword.trim() || pwStatus === 'saving'}>
                      {pwStatus === 'saving' ? '...' : pwStatus === 'saved' ? '✓' : 'Update'}
                    </button>
                  </div>
                  {pwStatus === 'error' && <span className="set-err">Failed — try again</span>}
                </div>
                <div style={{ background: 'oklch(0.72 0.28 340 / 0.08)', border: '1px solid oklch(0.72 0.28 340 / 0.3)', borderRadius: 10, padding: '12px 14px', fontFamily: 'var(--f-mono)', fontSize: 11, color: 'oklch(0.85 0.18 25)', lineHeight: 1.6 }}>
                  ⚠ Make sure your parent or guardian created this account. Using an account without parental consent will result in a permanent ban.
                </div>
              </div>
            </div>
          </div>

        </>)}

      </main>
    </div>
  )
}

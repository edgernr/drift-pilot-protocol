import { useState, useEffect } from 'react'
import './Dashboard.css'
import { useNav } from '../context/NavigationContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import RaidView from './RaidView'

function fmt(n) { return (n ?? 0).toLocaleString() }
function initials(name) { return (name ?? 'PL').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) }
function shortenWallet(w) { return w ? `${w.slice(0, 6)}...${w.slice(-4)}` : 'Not linked' }
function fmtTime(s) { if (!s) return '—'; return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` }


export default function Dashboard() {
  const { goto } = useNav()
  const { user, profile, logout, updateProfile, clearQuest, unlockGate, clearFlag, toggleSubscription, passwordRecovery, sendPasswordReset, updatePassword, updateEmail } = useAuth()
  const [resetConfirm, setResetConfirm] = useState(null)
  const [unlockStatus, setUnlockStatus] = useState({})
  const [newPassword, setNewPassword] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [changingEmail, setChangingEmail] = useState(false)
  const [pwStatus, setPwStatus] = useState(null)
  const [emailStatus, setEmailStatus] = useState(null)
  const [view, setView] = useState(() => localStorage.getItem('dash-view') ?? 'home')
  const [cardVariant, setCardVariant] = useState(() => parseInt(localStorage.getItem('drift-card-variant') ?? '0', 10))
  const [flaggedRows, setFlaggedRows] = useState([])
  const [allPilots, setAllPilots] = useState([])
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [welcomed, setWelcomed] = useState(() => !!localStorage.getItem('dpp_welcomed'))
  const [onboardStep, setOnboardStep] = useState(1)
  const [onboardName, setOnboardName] = useState('')
  const [profileLinkCopied, setProfileLinkCopied] = useState(false)

  const CARD_VARIANTS = [
    { id: 'dark',    grad: 'linear-gradient(135deg, oklch(0.20 0.08 270), oklch(0.12 0.04 250))', swatch: 'oklch(0.22 0.08 270)' },
    { id: 'magenta', grad: 'linear-gradient(135deg, oklch(0.38 0.24 340), oklch(0.24 0.18 300))', swatch: 'oklch(0.62 0.28 340)' },
    { id: 'teal',    grad: 'linear-gradient(135deg, oklch(0.30 0.16 200), oklch(0.18 0.10 220))', swatch: 'oklch(0.72 0.22 185)' },
    { id: 'amber',   grad: 'linear-gradient(135deg, oklch(0.42 0.20 75),  oklch(0.28 0.14 50))',  swatch: 'oklch(0.82 0.18 75)'  },
  ]

  const GATE_NAMES = {
    'act1-ch01': 'The Document Tomb',
    'act1-ch02': 'The Semantic Crypt',
    'act1-ch03': 'The Form Gate',
    'act1-ch04': 'Paint the City',
  }

  const KNOWN_GATES = [
    { id: 'act1-ch01', label: 'Gate 01 — The Document Tomb', xp: 100 },
    { id: 'act1-ch02', label: 'Gate 02 — The Semantic Crypt', xp: 200 },
    { id: 'act1-ch03', label: 'Gate 03 — The Form Gate', xp: 300 },
    { id: 'act1-ch04', label: 'Gate 04 — Paint the City', xp: 200 },
  ]
  const [quests, setQuests] = useState([])
  const [lbData, setLbData] = useState([])
  const [settingsName, setSettingsName] = useState('')
  const [settingsWallet, setSettingsWallet] = useState('')
  const [saveStatus, setSaveStatus] = useState(null)
  const [onChainBalance, setOnChainBalance] = useState(null)

  const LB_GRADS = [
    'oklch(0.72 0.28 340), oklch(0.55 0.26 290)',
    'oklch(0.86 0.18 185), oklch(0.68 0.25 295)',
    'oklch(0.82 0.18 75), oklch(0.55 0.22 40)',
    'oklch(0.7 0.25 295), oklch(0.5 0.2 200)',
    'oklch(0.9 0.22 135), oklch(0.55 0.18 185)',
  ]

  const isAdmin = profile?.is_admin ?? false
  const isSubscribed = profile?.is_subscribed ?? false

  useEffect(() => {
    supabase.from('quests').select('*').eq('world', 1).order('order_index')
      .then(({ data }) => { if (data) setQuests(data) })
  }, [])

  useEffect(() => {
    localStorage.setItem('drift-card-variant', cardVariant)
  }, [cardVariant])

  const DRIFT_TOKEN_ADDRESS = '0x60FE1910182602942Bcf297fFF7244f6f4ed8633'

  async function fetchOnChainDrift(wallet) {
    const data = '0x70a08231' + wallet.slice(2).toLowerCase().padStart(64, '0')
    try {
      const res = await fetch(import.meta.env.VITE_ALCHEMY_RPC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_call', params: [{ to: DRIFT_TOKEN_ADDRESS, data }, 'latest'], id: 1 }),
      })
      const { result } = await res.json()
      if (!result || result === '0x') return 0
      return Number(BigInt(result) / (10n ** 18n))
    } catch { return 0 }
  }

  async function connectMetaMask() {
    if (!window.ethereum) { alert('MetaMask not installed'); return }
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    if (accounts[0]) setSettingsWallet(accounts[0])
  }

  useEffect(() => {
    if (view !== 'wallet' || !profile?.wallet) return
    fetchOnChainDrift(profile.wallet).then(setOnChainBalance)
  }, [view, profile?.wallet])

  useEffect(() => {
    localStorage.setItem('dash-view', view)
  }, [view])

  useEffect(() => {
    if (view !== 'admin' || !isAdmin) return
    Promise.all([
      supabase.from('quest_completions').select('user_id, quest_id, time_taken, paste_count, completed_at').eq('flagged', true).order('completed_at', { ascending: false }),
      supabase.from('profiles').select('id, name, is_subscribed, is_admin').order('name'),
    ]).then(([{ data: flagged }, { data: pilots }]) => {
      setFlaggedRows(flagged ?? [])
      setAllPilots(pilots ?? [])
    })
  }, [view, isAdmin])

  const showWelcome = !welcomed && (profile?.questsCompleted ?? 0) === 0

  function dismissWelcome(andGo) {
    localStorage.setItem('dpp_welcomed', '1')
    setWelcomed(true)
    if (andGo) goto('quest')
  }

  async function handleOnboardFinish() {
    if (onboardName.trim() && onboardName.trim() !== profile?.name) {
      await updateProfile(onboardName.trim(), profile?.wallet ?? '')
    }
    localStorage.setItem('dpp_welcomed', '1')
    setWelcomed(true)
    goto('quest')
  }

  function copyProfileLink() {
    navigator.clipboard.writeText(`${window.location.origin}/pilot/${user?.id}`)
    setProfileLinkCopied(true)
    setTimeout(() => setProfileLinkCopied(false), 2500)
  }

  useEffect(() => {
    supabase
      .from('profiles')
      .select('id, name, quest_completions(xp_earned)')
      .then(({ data }) => {
        if (!data) return
        const ranked = data
          .map(p => ({
            id: p.id,
            name: p.name || 'Pilot',
            totalXp: (p.quest_completions || []).reduce((s, r) => s + r.xp_earned, 0),
          }))
          .sort((a, b) => b.totalXp - a.totalXp)
          .map((p, i) => ({ ...p, rank: i + 1 }))
        setLbData(ranked)
      })
  }, [profile])

  function openSettings() {
    setSettingsName(profile?.name ?? '')
    setSettingsWallet(profile?.wallet ?? '')
    setSaveStatus(null)
    setView('settings')
  }

  async function handleSave() {
    setSaveStatus('saving')
    const ok = await updateProfile(settingsName, settingsWallet)
    setSaveStatus(ok ? 'saved' : 'error')
    if (ok) setTimeout(() => setSaveStatus(null), 2500)
  }

  const questsDone = profile?.questsCompleted ?? 0
  const totalXp = profile?.totalXp ?? 0
  const totalDrift = profile?.totalDrift ?? 0
  const totalDriftSpent = profile?.totalDriftSpent ?? 0
  const spendableDrift = totalDrift - totalDriftSpent
  const completions = profile?.completions ?? []
  const unlocks = profile?.unlocks ?? []
  const unlockedGateIds = profile?.unlockedGateIds ?? new Set()

  const GATE_SHORT = {
    'act1-ch01': 'Gate 01',
    'act1-ch02': 'Gate 02',
    'act1-ch03': 'Gate 03',
  }

  async function handleUnlock(chKey, driftCost) {
    setUnlockStatus(s => ({ ...s, [chKey]: 'unlocking' }))
    const result = await unlockGate(chKey, driftCost)
    if (!result.ok) {
      setUnlockStatus(s => ({ ...s, [chKey]: result.reason }))
      setTimeout(() => setUnlockStatus(s => { const n = { ...s }; delete n[chKey]; return n }), 3000)
    } else {
      setUnlockStatus(s => { const n = { ...s }; delete n[chKey]; return n })
    }
  }

  const DRIFT_GATE_NAMES = {
    'act1-ch01': { label: 'Gate 01 — The Document Tomb', icon: '📡' },
    'act1-ch02': { label: 'Gate 02 — The Semantic Crypt', icon: '⚱️' },
    'act1-ch03': { label: 'Gate 03 — The Form Gate',     icon: '📋' },
    'act1-ch04': { label: 'Gate 04 — Paint the City',    icon: '🎨' },
    'act1-ch05': { label: 'Gate 05',                     icon: '◈' },
    'act1-ch06': { label: 'Gate 06 — Boss',              icon: '💀' },
    'act1-ch07': { label: 'Gate 07',                     icon: '◈' },
    'act1-ch08': { label: 'Gate 08 — Boss',              icon: '💀' },
    'act1-ch09': { label: 'Gate 09',                     icon: '◈' },
    'act1-ch10': { label: 'Gate 10 — Boss',              icon: '💀' },
  }
  const DRIFT_REWARDS_UI = {
    'act1-ch01': 250, 'act1-ch02': 350, 'act1-ch03': 700,
    'act1-ch04': 400, 'act1-ch05': 500, 'act1-ch06': 900,
    'act1-ch07': 550, 'act1-ch08': 1000, 'act1-ch09': 700, 'act1-ch10': 1500,
  }
  function resolveQuestMeta(questId, xpEarned) {
    if (DRIFT_GATE_NAMES[questId]) return { ...DRIFT_GATE_NAMES[questId], drift: DRIFT_REWARDS_UI[questId] ?? 0, kind: 'gate' }
    if (questId?.startsWith('raid:')) return { label: 'Raid completed', icon: '⚔️', drift: xpEarned ?? 0, kind: 'raid' }
    return { label: questId, icon: '◈', drift: 0, kind: 'unknown' }
  }
  const pilotName = profile?.name ?? 'Pilot'
  const streak = profile?.streak ?? 0
  const doneQuests = profile?.completedQuestIds ?? new Set()
  const levelData = {
    level:    profile?.level ?? 1,
    label:    profile?.levelLabel ?? 'CADET',
    color:    profile?.levelColor ?? 'oklch(0.55 0.08 250)',
    progress: profile?.levelProgress ?? 0,
    xpInLevel: profile?.xpInLevel ?? 0,
    xpNeeded:  profile?.xpNeeded ?? 100,
    nextLabel: profile?.nextLevelLabel ?? 'SCOUT',
  }
  const act1Done = doneQuests.has('act1-ch01')
  const act2Done = doneQuests.has('act1-ch02')
  const act3Done = doneQuests.has('act1-ch03')
  const act4Done = doneQuests.has('act1-ch04')
  const myRank = lbData.find(r => r.id === user?.id)?.rank ?? null

  function gotoActiveQuest() {
    if (act1Done && act2Done && act3Done && !act4Done) return goto('quest4')
    if (act1Done && act2Done && !act3Done) return goto('quest3')
    if (act1Done && !act2Done) return goto('quest2')
    goto('quest')
  }

  function gotoQuestById(id) {
    if (id === 'act1-ch04') return goto('quest4')
    if (id === 'act1-ch03') return goto('quest3')
    if (id === 'act1-ch02') return goto('quest2')
    return goto('quest')
  }

  return (
    <div className="dash-wrap">
      {showWelcome && (
        <div className="welcome-backdrop" onClick={onboardStep < 3 ? () => dismissWelcome(false) : undefined}>
          <div className={`welcome-modal${onboardStep === 2 ? ' onboard-wide' : ''}`} onClick={e => e.stopPropagation()}>

            {/* ── Step 1: Welcome + Lore ── */}
            {onboardStep === 1 && (<>
              <div className="welcome-glyph onboard-glyph-pulse">◈</div>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--teal)', letterSpacing: '0.18em', marginBottom: 10 }}>DRIFT PILOT PROTOCOL</div>
              <h2 className="welcome-title">Welcome, Pilot.</h2>
              <p className="welcome-body">
                EVA City is a neon district where the old code has corrupted. As a Drift Pilot you'll clear the Gates — debugging sectors, building real projects, and earning $DRIFT.<br /><br />
                Clear all 15 gates in Act I to unlock the Reactive Sector. Raid the tower for bonus rewards.
              </p>
              <div className="onboard-dots">
                <span className="onboard-dot onboard-dot-on" /><span className="onboard-dot" /><span className="onboard-dot" />
              </div>
              <div className="welcome-actions">
                <button className="welcome-cta" onClick={() => setOnboardStep(2)}>Continue →</button>
                <button className="welcome-skip" onClick={() => dismissWelcome(false)}>Skip intro</button>
              </div>
            </>)}

            {/* ── Step 2: Mission path ── */}
            {onboardStep === 2 && (<>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--amber)', letterSpacing: '0.14em', marginBottom: 10 }}>YOUR ACT I MISSION PATH</div>
              <h2 className="welcome-title" style={{ marginBottom: 20 }}>HTML Ruins — 4 Gates</h2>
              <div className="onboard-gates">
                {[
                  { icon: '📡', name: 'The Document Tomb', sub: 'Fix corrupted HTML', xp: 100, drift: 250 },
                  { icon: '⚱️', name: 'The Semantic Crypt', sub: 'Semantic HTML',      xp: 200, drift: 350 },
                  { icon: '📋', name: 'The Form Gate',      sub: 'Build forms · BOSS', xp: 300, drift: 700, boss: true },
                  { icon: '🎨', name: 'Paint the City',     sub: 'CSS design systems', xp: 200, drift: 400 },
                ].map((g, i) => (
                  <div key={i} className={`onboard-gate${g.boss ? ' onboard-gate-boss' : ''}`}>
                    <span className="onboard-gate-icon">{g.icon}</span>
                    <span className="onboard-gate-name">{g.name}</span>
                    <span className="onboard-gate-sub">{g.sub}</span>
                    <span className="onboard-gate-reward">+{g.xp} XP · +{g.drift} $DRIFT</span>
                  </div>
                ))}
              </div>
              <div className="onboard-dots" style={{ marginTop: 20 }}>
                <span className="onboard-dot" /><span className="onboard-dot onboard-dot-on" /><span className="onboard-dot" />
              </div>
              <button className="welcome-cta" style={{ marginTop: 16 }} onClick={() => setOnboardStep(3)}>Continue →</button>
            </>)}

            {/* ── Step 3: Callsign ── */}
            {onboardStep === 3 && (<>
              <div className="welcome-glyph">◈</div>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--teal)', letterSpacing: '0.18em', marginBottom: 10 }}>STEP 3 OF 3</div>
              <h2 className="welcome-title">Confirm Your Callsign</h2>
              <p className="welcome-body" style={{ marginBottom: 0 }}>This is how you'll appear on the leaderboard and your shareable pilot profile.</p>
              <input
                className="onboard-name-input"
                value={onboardName || profile?.name || ''}
                onChange={e => setOnboardName(e.target.value)}
                placeholder="Enter callsign..."
                maxLength={30}
                autoFocus
              />
              <div className="onboard-dots">
                <span className="onboard-dot" /><span className="onboard-dot" /><span className="onboard-dot onboard-dot-on" />
              </div>
              <div className="welcome-actions" style={{ marginTop: 4 }}>
                <button className="welcome-cta" disabled={!(onboardName || profile?.name)} onClick={handleOnboardFinish}>
                  Begin Gate 01 →
                </button>
              </div>
            </>)}

          </div>
        </div>
      )}
      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="logo" style={{ cursor: 'pointer' }} onClick={() => { goto('landing'); setSidebarOpen(false) }}>
          <img src="/LOGO.svg" alt="DRIFT PILOT PROTOCOL" style={{ height: 40 }} />
        </div>

        <div>
          <div className="section-label">Pilot HQ</div>
          <div className="navlist">
            <a className={view === 'home' ? 'active' : ''} onClick={() => setView('home')}><span className="ic">◈</span> Dashboard</a>
            <a onClick={gotoActiveQuest}><span className="ic">▶</span> Active Quest</a>
            <a className={view === 'skill-tree' ? 'active' : ''} onClick={() => setView('skill-tree')}><span className="ic">⟐</span> Skill Tree</a>
            <a className={view === 'raids' ? 'active' : ''} onClick={() => setView('raids')}><span className="ic">※</span> Raids</a>
          </div>
        </div>

        <div>
          <div className="section-label">Rewards</div>
          <div className="navlist">
            <a className={view === 'wallet' ? 'active' : ''} onClick={() => setView('wallet')}><span className="ic">$</span> $DRIFT Wallet</a>
            <a className={view === 'leaderboard' ? 'active' : ''} onClick={() => setView('leaderboard')}><span className="ic">♦</span> Leaderboard</a>
          </div>
        </div>

        {isAdmin && (
          <div>
            <div className="section-label">Admin</div>
            <div className="navlist">
              <a className={view === 'admin' ? 'active' : ''} onClick={() => setView('admin')}><span className="ic">⚑</span> Admin Panel</a>
            </div>
          </div>
        )}

        <div className="wallet-card">
          <div className="addr">
            <span className="dot" style={{ color: profile?.wallet ? 'var(--lime)' : 'var(--ink-3)' }} />
            {shortenWallet(profile?.wallet)}
          </div>
          <div className="bal">{fmt(spendableDrift)}<span className="u">$DRIFT</span></div>
        </div>
      </aside>

      <main className="dash-main">
        <div className="topbar">
          <div className="hamburger" onClick={() => setSidebarOpen(o => !o)}>
            <span /><span /><span />
          </div>
          <div className="search">
            <span>⌕</span>
            <input placeholder="Search quests, skills, pilots..." />
            <span className="kbd">⌘K</span>
          </div>
          <div className="top-actions">

            {/* Notifications */}
            <div style={{ position: 'relative' }}>
              {notifOpen && <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setNotifOpen(false)} />}
              <div className="bell" style={{ position: 'relative', cursor: 'pointer' }} onClick={() => { setNotifOpen(o => !o); setProfileOpen(false) }}>
                🔔
                {completions.length > 0 && <span style={{ position: 'absolute', top: 1, right: 1, width: 7, height: 7, borderRadius: '50%', background: 'var(--magenta)', border: '1px solid oklch(0.14 0.02 250)' }} />}
              </div>
              {notifOpen && (
                <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 300, zIndex: 100, background: 'oklch(0.16 0.02 250)', border: '1px solid oklch(1 0 0 / 0.08)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 8px 32px oklch(0 0 0 / 0.4)' }}>
                  <div style={{ padding: '11px 16px', borderBottom: '1px solid oklch(1 0 0 / 0.07)', fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Notifications</div>
                  {completions.length === 0 && streak === 0 ? (
                    <div style={{ padding: '14px 16px', fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-3)' }}>No notifications yet.</div>
                  ) : (
                    <>
                      {streak > 0 && (
                        <div style={{ display: 'flex', gap: 10, padding: '11px 16px', borderBottom: '1px solid oklch(1 0 0 / 0.05)', alignItems: 'center' }}>
                          <span style={{ fontSize: 18, flexShrink: 0 }}>🔥</span>
                          <div>
                            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'oklch(0.82 0.18 75)' }}>{streak}-day streak active</div>
                            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--ink-3)', marginTop: 2 }}>Keep it alive for bonus rewards</div>
                          </div>
                        </div>
                      )}
                      {completions.slice().reverse().slice(0, 4).map((c, i) => {
                        const meta = resolveQuestMeta(c.quest_id, c.xp_earned)
                        return (
                          <div key={i} style={{ display: 'flex', gap: 10, padding: '11px 16px', borderBottom: '1px solid oklch(1 0 0 / 0.05)', alignItems: 'center' }}>
                            <span style={{ fontSize: 18, flexShrink: 0 }}>{meta.icon}</span>
                            <div>
                              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-1)' }}>{meta.label} cleared</div>
                              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--ink-3)', marginTop: 2 }}>+{meta.drift} $DRIFT · {new Date(c.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                            </div>
                          </div>
                        )
                      })}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Profile */}
            <div style={{ position: 'relative' }}>
              {profileOpen && <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setProfileOpen(false)} />}
              <div className="dash-avatar" style={{ cursor: 'pointer' }} onClick={() => { setProfileOpen(o => !o); setNotifOpen(false) }}>{initials(pilotName)}</div>
              {profileOpen && (
                <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 220, zIndex: 100, background: 'oklch(0.16 0.02 250)', border: '1px solid oklch(1 0 0 / 0.08)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 8px 32px oklch(0 0 0 / 0.4)' }}>
                  <div style={{ padding: '14px 16px', borderBottom: '1px solid oklch(1 0 0 / 0.07)' }}>
                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--ink-1)', fontWeight: 600 }}>{pilotName}</div>
                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-3)', marginTop: 3 }}>{user?.email}</div>
                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: levelData.color, marginTop: 5, letterSpacing: '0.08em' }}>
                      LV.{levelData.level} {levelData.label} · {levelData.level < 10 ? `${levelData.progress}%` : 'MAX'}
                    </div>
                  </div>
                  <div style={{ padding: '6px 0' }}>
                    <div style={{ padding: '9px 16px', fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--ink-2)', cursor: 'pointer', display: 'flex', gap: 8, alignItems: 'center' }}
                      onClick={() => { openSettings(); setProfileOpen(false) }}>
                      <span style={{ color: 'var(--ink-3)' }}>◐</span> Settings
                    </div>
                    <div style={{ height: 1, background: 'oklch(1 0 0 / 0.07)', margin: '4px 0' }} />
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

        {view === 'home' ? (
          <>
            <div className="hero-banner">
              <div>
                <span className="chip chip-amber" style={{ display: 'inline-flex' }}>
                  <span className="dot dot-pulse" /> {streak > 0 ? `${streak}-DAY STREAK` : 'START YOUR STREAK'}
                </span>
                <h1 style={{ marginTop: 16 }}>GM, {pilotName}.<br /><span className="gradient-text">Ready for today's mission?</span></h1>
                <p>{questsDone === 0
                  ? <>Your first mission awaits. Complete Act I to unlock <strong>React Act II</strong>.</>
                  : questsDone < 15
                  ? <>You're {15 - questsDone} quest{15 - questsDone !== 1 ? 's' : ''} away from unlocking <strong>React Act II</strong>. Keep the streak alive to 2x your rewards.</>
                  : <>Act I complete. <strong>React Act II</strong> is now unlocked. Ready for the next challenge?</>
                }</p>

                {/* XP Level progress bar */}
                <div className="hero-xp-bar">
                  <div className="hero-xp-labels">
                    <span style={{ color: levelData.color, fontFamily: 'var(--f-mono)', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      LV.{levelData.level} {levelData.label}
                    </span>
                    <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-3)' }}>
                      {levelData.level < 10
                        ? `${levelData.xpInLevel} / ${levelData.xpNeeded} XP · ${levelData.progress}% → LV.${levelData.level + 1} ${levelData.nextLabel}`
                        : 'MAX RANK · LEGEND ACHIEVED'
                      }
                    </span>
                  </div>
                  <div className="hero-xp-track">
                    <div className="hero-xp-fill" style={{ width: `${levelData.progress}%`, background: levelData.color }} />
                  </div>
                </div>

                <button className="btn btn-primary" onClick={gotoActiveQuest}>Resume Quest →</button>
              </div>
              <div className="streak-art">
                <div className="streak-flame">{streak || '—'}</div>
                <div className="streak-lbl">{streak > 0 ? 'DAY STREAK · ×2 MULT' : 'NO STREAK YET'}</div>
              </div>
            </div>

            <div className="stats-grid">
              {[
                { color: 'var(--teal)',    label: 'TOTAL XP',        val: fmt(totalXp),       delta: 'lifetime earned' },
                { color: 'var(--magenta)', label: '$DRIFT BALANCE',   val: fmt(spendableDrift), unit: 'DRIFT', delta: `${fmt(totalDrift)} earned · ${fmt(totalDriftSpent)} spent` },
                { color: 'var(--violet)',  label: 'QUESTS CLEARED',  val: String(questsDone), unit: `/${quests.length || 15}`, delta: `${Math.round(questsDone / (quests.length || 15) * 100)}% of Act I` },
                { color: 'var(--amber)',   label: 'GLOBAL RANK',     val: myRank ? `#${myRank}` : '—', delta: myRank ? `of ${lbData.length} pilots` : lbData.length > 0 ? 'not ranked yet' : 'loading...' },
              ].map(s => (
                <div key={s.label} className="stat">
                  <div className="label"><span className="dot" style={{ color: s.color }} />{s.label}</div>
                  <div className="val">{s.val}{s.unit && <span className="u">{s.unit}</span>}</div>
                  <div className="delta">{s.delta}</div>
                </div>
              ))}
            </div>

            <div className="dash-cols">
              <div>
                <div className="section-block">
                  <div className="sb-head">
                    <h3>Active Quests</h3>
                    <span className="more" onClick={() => setView('skill-tree')}>View all →</span>
                  </div>
                  <div className="aq-list">
                    <div className="aq" onClick={() => goto('quest')}>
                      <div className="icon" style={{ background: 'linear-gradient(135deg, oklch(0.86 0.18 185 / 0.15), oklch(0.55 0.26 220 / 0.15))', color: 'var(--teal)' }}>📡</div>
                      <div>
                        <div className="aq-title">Gate 01 — The Document Tomb</div>
                        <div className="meta">
                          {act1Done
                            ? <span className="chip chip-lime" style={{ padding: '2px 6px' }}>COMPLETED</span>
                            : <span className="chip chip-magenta" style={{ padding: '2px 6px' }}>CURRENT</span>
                          }
                          <span>{act1Done ? '100 XP earned' : '~10 min · Rank E'}</span>
                        </div>
                      </div>
                      <div className="pr">
                        <div className="bar"><div className="fill" style={{ width: act1Done ? '100%' : '0%', background: act1Done ? 'linear-gradient(90deg, var(--lime), var(--teal))' : undefined }} /></div>
                        <div className="pct">{act1Done ? '100% · 100 XP' : 'NOT STARTED'}</div>
                      </div>
                      <button className="btn btn-primary btn-sm">{act1Done ? 'Review' : 'Enter'}</button>
                    </div>

                    <div className="aq" onClick={() => goto('quest2')}>
                      <div className="icon" style={{ background: 'linear-gradient(135deg, oklch(0.72 0.22 290 / 0.2), oklch(0.5 0.18 270 / 0.2))', color: 'var(--violet)' }}>⚱️</div>
                      <div>
                        <div className="aq-title">Gate 02 — The Semantic Crypt</div>
                        <div className="meta">
                          {act2Done
                            ? <span className="chip chip-lime" style={{ padding: '2px 6px' }}>COMPLETED</span>
                            : act1Done
                            ? <span className="chip chip-amber" style={{ padding: '2px 6px' }}>UNLOCKED</span>
                            : <span className="chip" style={{ padding: '2px 6px', fontSize: 10 }}>LOCKED</span>
                          }
                          <span>{act2Done ? '200 XP earned' : '~10 min · Rank E'}</span>
                        </div>
                      </div>
                      <div className="pr">
                        <div className="bar"><div className="fill" style={{ width: act2Done ? '100%' : '0%', background: act2Done ? 'linear-gradient(90deg, var(--lime), var(--teal))' : undefined }} /></div>
                        <div className="pct">{act2Done ? '100% · 200 XP' : 'NOT STARTED'}</div>
                      </div>
                      <button className="btn btn-primary btn-sm">{act2Done ? 'Review' : 'Enter'}</button>
                    </div>

                    <div className="aq" onClick={() => goto('quest3')}>
                      <div className="icon" style={{ background: 'linear-gradient(135deg, oklch(0.62 0.22 25 / 0.2), oklch(0.4 0.15 15 / 0.2))', color: 'oklch(0.68 0.24 25)' }}>📋</div>
                      <div>
                        <div className="aq-title">Gate 03 — The Form Gate</div>
                        <div className="meta">
                          {act3Done
                            ? <span className="chip chip-lime" style={{ padding: '2px 6px' }}>COMPLETED</span>
                            : act2Done
                            ? <span className="chip chip-amber" style={{ padding: '2px 6px' }}>UNLOCKED</span>
                            : <span className="chip" style={{ padding: '2px 6px', fontSize: 10 }}>LOCKED</span>
                          }
                          <span>{act3Done ? '300 XP earned' : '~15 min · Rank D · Boss'}</span>
                        </div>
                      </div>
                      <div className="pr">
                        <div className="bar"><div className="fill" style={{ width: act3Done ? '100%' : '0%', background: act3Done ? 'linear-gradient(90deg, var(--lime), var(--teal))' : undefined }} /></div>
                        <div className="pct">{act3Done ? '100% · 300 XP' : 'NOT STARTED'}</div>
                      </div>
                      <button className="btn btn-primary btn-sm">{act3Done ? 'Review' : 'Enter'}</button>
                    </div>

                    <div className="aq" onClick={() => goto('quest4')}>
                      <div className="icon" style={{ background: 'linear-gradient(135deg, oklch(0.82 0.18 75 / 0.2), oklch(0.60 0.15 55 / 0.2))', color: 'var(--amber)' }}>🎨</div>
                      <div>
                        <div className="aq-title">Gate 04 — Paint the City</div>
                        <div className="meta">
                          {act4Done
                            ? <span className="chip chip-lime" style={{ padding: '2px 6px' }}>COMPLETED</span>
                            : act3Done
                            ? <span className="chip chip-amber" style={{ padding: '2px 6px' }}>UNLOCKED</span>
                            : <span className="chip" style={{ padding: '2px 6px', fontSize: 10 }}>LOCKED</span>
                          }
                          <span>{act4Done ? '200 XP earned' : '~15 min · Rank E · CSS'}</span>
                        </div>
                      </div>
                      <div className="pr">
                        <div className="bar"><div className="fill" style={{ width: act4Done ? '100%' : '0%', background: act4Done ? 'linear-gradient(90deg, var(--lime), var(--teal))' : undefined }} /></div>
                        <div className="pct">{act4Done ? '100% · 200 XP' : 'NOT STARTED'}</div>
                      </div>
                      <button className="btn btn-primary btn-sm">{act4Done ? 'Review' : 'Enter'}</button>
                    </div>
                  </div>
                </div>

              </div>

              <div>
                <div className="section-block">
                  {(() => {
                    const objectives = [
                      { done: act1Done, text: 'Clear Gate 01 — The Document Tomb', rw: '+100 XP' },
                      { done: act2Done, text: 'Clear Gate 02 — The Semantic Crypt', rw: '+200 XP' },
                      { done: act3Done, text: 'Clear Gate 03 — The Form Gate',     rw: '+300 XP' },
                      { done: act4Done, text: 'Clear Gate 04 — Paint the City',    rw: '+200 XP' },
                      { done: streak >= 3, text: 'Build a 3-day streak',           rw: '+streak' },
                    ]
                    const objDone = objectives.filter(o => o.done).length
                    return (
                      <>
                        <div className="sb-head"><h3>Season Objectives</h3><span className="more">{objDone}/{objectives.length}</span></div>
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
                  <div className="sb-head"><h3>Season Leaderboard</h3><span className="more">Top {Math.min(lbData.length, 5)}</span></div>
                  <div className="panel lb">
                    {lbData.length === 0
                      ? <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-3)', padding: '8px 0' }}>Loading...</div>
                      : lbData.slice(0, 5).map(r => (
                          <div key={r.id} className={`lb-row${r.rank <= 3 ? ' top' : ''}${r.id === user?.id ? ' me' : ''}`}>
                            <div className="rank">{r.rank}</div>
                            <div className="who">
                              <div className="av" style={{ background: `linear-gradient(135deg, ${LB_GRADS[(r.rank - 1) % LB_GRADS.length]})` }}>{initials(r.name)}</div>
                              <span>{r.name}{r.id === user?.id && <span style={{ color: 'var(--magenta)', fontSize: 10, fontFamily: 'var(--f-mono)', marginLeft: 6 }}>YOU</span>}</span>
                            </div>
                            <div className="xp">{fmt(r.totalXp)}</div>
                          </div>
                        ))
                    }
                    {(() => {
                      const me = lbData.find(r => r.id === user?.id)
                      if (!me || me.rank <= 5) return null
                      return (
                        <div className="lb-row me">
                          <div className="rank">{me.rank}</div>
                          <div className="who">
                            <div className="av" style={{ background: 'linear-gradient(135deg, var(--violet), var(--magenta))' }}>{initials(pilotName)}</div>
                            <span>{pilotName} · <span style={{ color: 'var(--magenta)', fontSize: 10, fontFamily: 'var(--f-mono)' }}>YOU</span></span>
                          </div>
                          <div className="xp">{fmt(totalXp)}</div>
                        </div>
                      )
                    })()}
                  </div>
                </div>
              </div>
            </div>

            <div className="section-block">
              <div className="sb-head"><h3>World Map</h3><span className="more">Season 01</span></div>
              <div className="panel wmap-grid">
                {[
                  { n:'01', name:'HTML Ruins',      color:'var(--amber)',   quests: Math.min(questsDone, quests.length || 15), total: quests.length || 15, boss:'DIV EATER',        active:true  },
                  { n:'02', name:'Reactive Sector', color:'var(--violet)',  quests: 0, total:18, boss:'STATE OVERFLOW',   active:false },
                  { n:'03', name:'Router Maze',     color:'var(--teal)',    quests: 0, total:12, boss:'404 PHANTOM',      active:false },
                  { n:'04', name:'Immersive Grid',  color:'var(--magenta)', quests: 0, total:15, boss:'THE WHITE SCREEN', active:false },
                ].map(w => (
                  <div key={w.n} className={`wmap-world${w.active ? ' wmap-active' : ''}`} style={{ '--wc': w.color }}>
                    <div className="wmap-header">
                      <span className="wmap-num">W{w.n}</span>
                      {w.active ? <span className="wmap-live">ACTIVE</span> : <span className="wmap-locked">LOCKED</span>}
                    </div>
                    <div className="wmap-name">{w.name}</div>
                    <div className="wmap-bar-wrap">
                      <div className="wmap-fill" style={{ width: `${Math.round(w.quests / w.total * 100)}%` }} />
                    </div>
                    <div className="wmap-foot">
                      <span>{w.quests}/{w.total} quests</span>
                      <span className="wmap-boss">{w.boss}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : view === 'skill-tree' ? (
          <>
            <div className="st-header">
              <div>
                <h2 style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', marginBottom: 6 }}>Skill Tree</h2>
                <p style={{ color: 'var(--ink-2)', fontFamily: 'var(--f-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                  W01 · HTML Ruins · {questsDone}/{quests.length} quests · {fmt(totalXp)} XP earned
                </p>
              </div>
              <div className="st-world-tabs">
                <div className="st-world-tab st-tab-active">W01 HTML Ruins</div>
                <div className="st-world-tab st-tab-locked">W02 Reactive Sector</div>
                <div className="st-world-tab st-tab-locked">W03 Router Maze</div>
                <div className="st-world-tab st-tab-locked">W04 Immersive Grid</div>
              </div>
            </div>

            {!isSubscribed && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'oklch(0.72 0.28 340 / 0.06)', border: '1px solid oklch(0.72 0.28 340 / 0.2)', borderRadius: 10, padding: '12px 18px', marginBottom: 16, fontFamily: 'var(--f-mono)', fontSize: 11 }}>
                <span style={{ fontSize: 20 }}>🔓</span>
                <span style={{ color: 'var(--ink-2)', flex: 1 }}>Unlock <strong style={{ color: 'var(--ink-1)' }}>all 15 gates</strong> sequentially with a Season Pass — no $DRIFT spend needed.</span>
                <span className="chip chip-amber">Coming Soon</span>
              </div>
            )}

            <div className="st-grid">
              {quests.map((q) => {
                const chKey = `act1-ch${String(q.chapter).padStart(2, '0')}`
                const prevChKey = `act1-ch${String(q.chapter - 1).padStart(2, '0')}`
                const isDone = doneQuests.has(chKey) || doneQuests.has(q.id)
                const isUnlocked = q.chapter > 3 && unlockedGateIds.has(chKey)
                const isActive = !isDone && !isUnlocked && (
                  (q.chapter <= 3 && (q.chapter === 1 || doneQuests.has(prevChKey))) ||
                  (q.chapter > 3 && isSubscribed && (doneQuests.has(prevChKey) || unlockedGateIds.has(prevChKey)))
                )
                const isLocked = !isDone && !isActive && !isUnlocked
                const stateCls = isDone ? ' st-done' : (isActive || isUnlocked) ? ' st-active' : ' st-locked'
                const chLabel = q.is_boss ? 'BOSS' : `CH${String(q.chapter).padStart(2, '0')}`
                const driftCost = q.is_boss ? 250 : 100
                const uStatus = unlockStatus[chKey]
                const canUnlock = !isSubscribed && q.chapter > 3 && (doneQuests.has(prevChKey) || unlockedGateIds.has(prevChKey))
                return (
                  <div
                    key={q.id}
                    className={`st-node${q.is_boss ? ' st-boss' : ''}${stateCls}`}
                    onClick={(isDone || isActive) && !q.is_boss ? () => gotoQuestById(chKey) : undefined}
                  >
                    <div className="st-node-top">
                      <span className="st-ch">{chLabel}</span>
                      <span className="st-status-icon">{isDone ? '✓' : (isActive || isUnlocked) ? '▶' : '⊘'}</span>
                    </div>
                    <div className="st-icon">{q.icon}</div>
                    <div className="st-title">{GATE_NAMES[chKey] || q.title}</div>
                    <div className="st-topic">{q.topic}</div>
                    <div className="st-node-foot">
                      <span className="st-xp">+{q.xp.toLocaleString()} XP</span>
                      {isDone     && <span className="chip chip-lime"  style={{ padding: '1px 6px', fontSize: 9 }}>DONE</span>}
                      {isActive   && <span className="chip chip-amber" style={{ padding: '1px 6px', fontSize: 9 }}>START</span>}
                      {isUnlocked && <span className="chip chip-teal"  style={{ padding: '1px 6px', fontSize: 9 }}>UNLOCKED</span>}
                      {isLocked && q.chapter <= 3 && <span className="st-locked-lbl">LOCKED</span>}
                      {isLocked && q.chapter > 3 && !canUnlock && <span className="st-locked-lbl">LOCKED</span>}
                      {isLocked && q.chapter > 3 && canUnlock && (
                        uStatus === 'unlocking' ? (
                          <span className="chip" style={{ padding: '1px 6px', fontSize: 9, color: 'var(--ink-3)' }}>...</span>
                        ) : uStatus === 'insufficient' ? (
                          <span className="chip" style={{ padding: '1px 6px', fontSize: 9, color: 'var(--magenta)' }}>Need {driftCost} $DRIFT</span>
                        ) : (
                          <button
                            style={{ padding: '2px 8px', fontSize: 9, color: 'var(--magenta)', background: 'none', border: '1px solid oklch(0.72 0.28 340 / 0.4)', borderRadius: 4, cursor: 'pointer', fontFamily: 'var(--f-mono)' }}
                            onClick={e => { e.stopPropagation(); handleUnlock(chKey, driftCost) }}
                          >{driftCost} $DRIFT</button>
                        )
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        ) : view === 'wallet' ? (
          <>
            <div className="st-header">
              <div>
                <h2 style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', marginBottom: 6 }}>$DRIFT Wallet</h2>
                <p style={{ color: 'var(--ink-2)', fontFamily: 'var(--f-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                  Off-chain balance · Season 01
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, maxWidth: 480, margin: '0 auto' }}>

              {/* Card */}
              <div style={{
                width: '100%', aspectRatio: '1.586', borderRadius: 20,
                background: CARD_VARIANTS[cardVariant].grad,
                padding: '22px 28px', position: 'relative', overflow: 'hidden',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                boxShadow: '0 24px 64px oklch(0 0 0 / 0.5)',
              }}>
                <div style={{ position: 'absolute', right: -50, top: -50, width: 220, height: 220, borderRadius: '50%', background: 'oklch(1 0 0 / 0.05)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', right: 30, bottom: -70, width: 170, height: 170, borderRadius: '50%', background: 'oklch(1 0 0 / 0.04)', pointerEvents: 'none' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
                  <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'oklch(1 0 0 / 0.6)', letterSpacing: '0.14em' }}>DRIFT PILOT PROTOCOL</div>
                  <div style={{ width: 32, height: 24, background: 'linear-gradient(135deg, oklch(0.85 0.15 75), oklch(0.70 0.20 50))', borderRadius: 4 }} />
                </div>

                <div style={{ position: 'relative' }}>
                  <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'oklch(1 0 0 / 0.4)', letterSpacing: '0.12em', marginBottom: 6 }}>BALANCE</div>
                  <div style={{ fontSize: 40, fontWeight: 700, color: 'oklch(1 0 0 / 0.95)', letterSpacing: '-0.02em', lineHeight: 1 }}>{fmt(spendableDrift)}</div>
                  <div style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color: 'oklch(1 0 0 / 0.5)', marginTop: 4 }}>$DRIFT</div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'oklch(1 0 0 / 0.4)', letterSpacing: '0.1em', marginBottom: 3 }}>PILOT</div>
                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color: 'oklch(1 0 0 / 0.85)' }}>{pilotName.toUpperCase()}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'oklch(1 0 0 / 0.4)', letterSpacing: '0.1em', marginBottom: 3 }}>WALLET</div>
                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'oklch(1 0 0 / 0.7)' }}>{profile?.wallet ? shortenWallet(profile.wallet) : 'Not linked'}</div>
                  </div>
                </div>
              </div>

              {/* Variant picker */}
              <div style={{ display: 'flex', gap: 10 }}>
                {CARD_VARIANTS.map((v, i) => (
                  <button key={v.id} onClick={() => setCardVariant(i)} style={{
                    width: 18, height: 18, borderRadius: '50%', border: 'none', cursor: 'pointer',
                    background: v.swatch,
                    outline: cardVariant === i ? '2px solid oklch(1 0 0 / 0.7)' : '2px solid transparent',
                    outlineOffset: 3, transition: 'outline 0.15s',
                  }} />
                ))}
              </div>

              {/* Stats row */}
              <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="panel" style={{ padding: '16px 20px' }}>
                  <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.1em', marginBottom: 6 }}>EARNED</div>
                  <div style={{ fontFamily: 'var(--f-mono)', fontSize: 22, fontWeight: 600, color: 'var(--lime)' }}>+{fmt(totalDrift)}</div>
                </div>
                <div className="panel" style={{ padding: '16px 20px' }}>
                  <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.1em', marginBottom: 6 }}>SPENT</div>
                  <div style={{ fontFamily: 'var(--f-mono)', fontSize: 22, fontWeight: 600, color: 'var(--ink-2)' }}>{totalDriftSpent > 0 ? `-${fmt(totalDriftSpent)}` : '0'}</div>
                </div>
              </div>

              {/* On-chain balance */}
              {profile?.wallet && (
                <div className="panel" style={{ width: '100%', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.1em', marginBottom: 4 }}>ON-CHAIN · SEPOLIA TESTNET</div>
                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 22, fontWeight: 600, color: 'var(--amber)' }}>
                      {onChainBalance === null ? '...' : fmt(onChainBalance)}
                      <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--ink-3)', marginLeft: 6 }}>$DRIFT</span>
                    </div>
                  </div>
                  <a
                    href={`https://sepolia.etherscan.io/token/${DRIFT_TOKEN_ADDRESS}?a=${profile.wallet}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--teal)', textDecoration: 'none' }}
                  >etherscan ↗</a>
                </div>
              )}

              {/* Transaction history */}
              <div style={{ width: '100%' }}>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>Transaction History</div>
                <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
                  {completions.length === 0 && unlocks.length === 0 ? (
                    <div style={{ padding: '24px 20px', fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-3)' }}>No transactions yet. Clear a gate to earn $DRIFT.</div>
                  ) : (
                    [
                      ...completions.map(c => ({ type: 'earn', quest_id: c.quest_id, date: c.completed_at, drift: resolveQuestMeta(c.quest_id, c.xp_earned).drift, xp_earned: c.xp_earned })),
                      ...unlocks.map(u => ({ type: 'spend', quest_id: u.quest_id, date: u.unlocked_at, drift: u.drift_cost })),
                    ]
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map((tx, i) => {
                        const meta = tx.type === 'earn'
                          ? resolveQuestMeta(tx.quest_id, tx.xp_earned)
                          : tx.quest_id?.startsWith('raid-entry:')
                            ? { label: 'Raid Entry Fee', icon: '⚔️' }
                            : { label: DRIFT_GATE_NAMES[tx.quest_id]?.label ?? tx.quest_id, icon: '🔓' }
                        const date = new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        return (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 18px', borderBottom: '1px solid oklch(1 0 0 / 0.05)' }}>
                            <div style={{ fontSize: 20, width: 30, textAlign: 'center', flexShrink: 0 }}>{meta.icon}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-1)', marginBottom: 2 }}>{meta.label}</div>
                              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--ink-3)' }}>{date} · {tx.type === 'earn' ? (meta.kind === 'raid' ? 'Raid completed' : 'Gate cleared') : 'Gate unlocked'}</div>
                            </div>
                            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 13, fontWeight: 600, color: tx.type === 'earn' ? 'var(--lime)' : 'var(--magenta)', flexShrink: 0 }}>
                              {tx.type === 'earn' ? '+' : '-'}{tx.drift}
                            </div>
                          </div>
                        )
                      })
                  )}
                </div>
              </div>

            </div>
          </>
        ) : view === 'raids' ? (
          <>
            <div className="st-header">
              <div>
                <h2 style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', marginBottom: 6 }}>Raids</h2>
                <p style={{ color: 'var(--ink-2)', fontFamily: 'var(--f-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                  Multiplayer · Season 01
                </p>
              </div>
            </div>
            <RaidView />
          </>
        ) : view === 'leaderboard' ? (
          <>
            <div className="st-header">
              <div>
                <h2 style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', marginBottom: 6 }}>Leaderboard</h2>
                <p style={{ color: 'var(--ink-2)', fontFamily: 'var(--f-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                  Season 01 · {lbData.length} pilot{lbData.length !== 1 ? 's' : ''} ranked
                </p>
              </div>
            </div>

            <div className="panel lb" style={{ maxWidth: 640 }}>
              {lbData.length === 0
                ? <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-3)', padding: '16px 0' }}>Loading...</div>
                : lbData.map(r => (
                    <div key={r.id} className={`lb-row${r.rank <= 3 ? ' top' : ''}${r.id === user?.id ? ' me' : ''}`}>
                      <div className="rank">{r.rank}</div>
                      <div className="who">
                        <div className="av" style={{ background: `linear-gradient(135deg, ${LB_GRADS[(r.rank - 1) % LB_GRADS.length]})` }}>{initials(r.name)}</div>
                        <span>
                          {r.name}
                          {r.id === user?.id && <span style={{ color: 'var(--magenta)', fontSize: 10, fontFamily: 'var(--f-mono)', marginLeft: 6 }}>YOU</span>}
                        </span>
                      </div>
                      <div className="xp">{fmt(r.totalXp)} XP</div>
                    </div>
                  ))
              }
            </div>
          </>
        ) : view === 'admin' ? (
          <>
            <div className="st-header">
              <div>
                <h2 style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', marginBottom: 6 }}>Admin Panel</h2>
                <p style={{ color: 'var(--ink-2)', fontFamily: 'var(--f-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                  {flaggedRows.length} flagged · {allPilots.length} pilots
                </p>
              </div>
            </div>

            <div className="section-block" style={{ marginBottom: 24 }}>
              <div className="sb-head">
                <h3>Flagged Completions</h3>
                <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--magenta)' }}>{flaggedRows.length} flagged</span>
              </div>
              <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
                {flaggedRows.length === 0 ? (
                  <div style={{ padding: '20px 18px', fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-3)' }}>No flagged completions.</div>
                ) : (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 64px 64px 90px 72px', padding: '8px 18px', borderBottom: '1px solid oklch(1 0 0 / 0.06)', fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      <span>Pilot</span><span>Gate</span><span>Time</span><span>Pastes</span><span>Date</span><span>Action</span>
                    </div>
                    {flaggedRows.map((row, i) => (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 90px 64px 64px 90px 72px', padding: '12px 18px', borderBottom: '1px solid oklch(1 0 0 / 0.05)', alignItems: 'center' }}>
                        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-1)' }}>{allPilots.find(p => p.id === row.user_id)?.name ?? 'Unknown'}</span>
                        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-2)' }}>{GATE_SHORT[row.quest_id] ?? row.quest_id}</span>
                        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: row.time_taken < 90 ? 'var(--magenta)' : 'var(--ink-2)' }}>{fmtTime(row.time_taken)}</span>
                        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: row.paste_count > 0 ? 'var(--magenta)' : 'var(--ink-2)' }}>{row.paste_count ?? 0}</span>
                        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-3)' }}>{new Date(row.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        <button className="btn" style={{ fontSize: 10, padding: '3px 8px' }}
                          onClick={async () => { const ok = await clearFlag(row.user_id, row.quest_id); if (ok) setFlaggedRows(r => r.filter((_, j) => j !== i)) }}>
                          Clear
                        </button>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

            <div className="section-block">
              <div className="sb-head">
                <h3>Pilot Management</h3>
                <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-3)' }}>{allPilots.length} pilots</span>
              </div>
              <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 80px', padding: '8px 18px', borderBottom: '1px solid oklch(1 0 0 / 0.06)', fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  <span>Pilot</span><span>Season Pass</span><span>Action</span>
                </div>
                {allPilots.map((p, i) => (
                  <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 80px', padding: '12px 18px', borderBottom: '1px solid oklch(1 0 0 / 0.05)', alignItems: 'center' }}>
                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-1)' }}>
                      {p.name ?? 'Unnamed'}
                      {p.is_admin && <span className="chip" style={{ marginLeft: 8, padding: '1px 5px', fontSize: 8 }}>ADMIN</span>}
                    </div>
                    <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10 }}>
                      {p.is_subscribed ? <span style={{ color: 'var(--lime)' }}>✓ Active</span> : <span style={{ color: 'var(--ink-3)' }}>—</span>}
                    </span>
                    <button className="btn" style={{ fontSize: 10, padding: '3px 8px', color: p.is_subscribed ? 'var(--magenta)' : undefined }}
                      onClick={async () => { const ok = await toggleSubscription(p.id, p.is_subscribed); if (ok) setAllPilots(ps => ps.map((pl, j) => j === i ? { ...pl, is_subscribed: !pl.is_subscribed } : pl)) }}>
                      {p.is_subscribed ? 'Revoke' : 'Grant'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="set-hero">
              <div className="set-avatar">{initials(pilotName)}</div>
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 500, letterSpacing: '-0.02em', marginBottom: 4 }}>{pilotName}</h2>
                <p style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-2)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{user?.email}</p>
              </div>
            </div>

            <div className="set-grid">
              <div className="section-block">
                <div className="sb-head"><h3>Pilot Profile</h3></div>
                <div className="panel set-form">
                  <div className="set-field">
                    <label className="set-label">Display Name</label>
                    <input
                      className="set-input"
                      value={settingsName}
                      onChange={e => setSettingsName(e.target.value)}
                      placeholder="Your pilot name"
                    />
                  </div>
                  <div className="set-field">
                    <label className="set-label">Wallet Address</label>
                    <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                      <input
                        className="set-input"
                        value={settingsWallet}
                        onChange={e => setSettingsWallet(e.target.value)}
                        placeholder="0x... (optional)"
                        style={{ flex: 1, minWidth: 0 }}
                      />
                      <button className="btn-metamask" onClick={connectMetaMask} title="Auto-fill from MetaMask">
                        🦊
                      </button>
                    </div>
                  </div>
                  <div className="set-field">
                    <label className="set-label">Season Pass</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {isSubscribed
                        ? <span className="chip chip-lime" style={{ padding: '2px 8px', fontSize: 10 }}>ACTIVE</span>
                        : <span className="chip" style={{ padding: '2px 8px', fontSize: 10 }}>NOT ACTIVE</span>
                      }
                      <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-3)' }}>
                        {isSubscribed ? 'Full access to all worlds' : 'Unlock gates with $DRIFT or contact for Season Pass'}
                      </span>
                    </div>
                  </div>
                  <div className="set-actions">
                    <button className="btn btn-primary" onClick={handleSave} disabled={saveStatus === 'saving'}>
                      {saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}
                    </button>
                    {saveStatus === 'saved' && <span className="set-ok">✓ Saved</span>}
                    {saveStatus === 'error'  && <span className="set-err">Save failed — try again</span>}
                  </div>
                </div>
              </div>

              <div className="section-block">
                <div className="sb-head"><h3>Account</h3></div>
                <div className="panel set-form">

                  {/* Email */}
                  <div className="set-field">
                    <label className="set-label">Email</label>
                    {changingEmail ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
                        <input
                          className="set-input"
                          type="email"
                          value={newEmail}
                          onChange={e => setNewEmail(e.target.value)}
                          placeholder="New email address"
                        />
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            className="btn btn-primary"
                            style={{ fontSize: 11, padding: '5px 12px' }}
                            disabled={emailStatus === 'sending'}
                            onClick={async () => {
                              setEmailStatus('sending')
                              const ok = await updateEmail(newEmail)
                              setEmailStatus(ok ? 'sent' : 'error')
                            }}
                          >
                            {emailStatus === 'sending' ? 'Sending...' : 'Send Confirmation →'}
                          </button>
                          <button className="btn" style={{ fontSize: 11, padding: '5px 12px' }} onClick={() => { setChangingEmail(false); setEmailStatus(null); setNewEmail('') }}>Cancel</button>
                        </div>
                        {emailStatus === 'sent'  && <span className="set-ok">✓ Confirmation sent — check your new inbox</span>}
                        {emailStatus === 'error' && <span className="set-err">Failed — try again</span>}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: 8, width: '100%', alignItems: 'center' }}>
                        <input className="set-input set-readonly" value={user?.email ?? ''} readOnly style={{ flex: 1 }} />
                        <button className="btn" style={{ fontSize: 11, padding: '5px 12px', flexShrink: 0 }} onClick={() => { setChangingEmail(true); setNewEmail('') }}>Change</button>
                      </div>
                    )}
                  </div>

                  {/* Password */}
                  <div className="set-field">
                    <label className="set-label">Password</label>
                    {passwordRecovery ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
                        <input
                          className="set-input"
                          type="password"
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                        />
                        <button
                          className="btn btn-primary"
                          style={{ fontSize: 11, padding: '5px 12px', alignSelf: 'flex-start' }}
                          disabled={pwStatus === 'saving' || newPassword.length < 6}
                          onClick={async () => {
                            setPwStatus('saving')
                            const ok = await updatePassword(newPassword)
                            if (ok) { setPwStatus(null); setNewPassword('') }
                            else setPwStatus('error')
                          }}
                        >
                          {pwStatus === 'saving' ? 'Saving...' : 'Set New Password →'}
                        </button>
                        {pwStatus === 'error' && <span className="set-err">Failed — try again</span>}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: 8, width: '100%', alignItems: 'center' }}>
                        <div className="set-input set-readonly" style={{ flex: 1 }}>••••••••••••</div>
                        <button
                          className="btn"
                          style={{ fontSize: 11, padding: '5px 12px', flexShrink: 0 }}
                          disabled={pwStatus === 'sent'}
                          onClick={async () => {
                            setPwStatus('sending')
                            const ok = await sendPasswordReset()
                            setPwStatus(ok ? 'sent' : 'error')
                          }}
                        >
                          {pwStatus === 'sending' ? 'Sending...' : pwStatus === 'sent' ? '✓ Email sent' : 'Change'}
                        </button>
                      </div>
                    )}
                    {pwStatus === 'sent' && !passwordRecovery && (
                      <span className="set-ok" style={{ fontSize: 10 }}>Reset link sent to {user?.email} — click it to set a new password</span>
                    )}
                    {pwStatus === 'error' && !passwordRecovery && <span className="set-err">Failed — try again</span>}
                  </div>

                </div>
              </div>

              <div className="section-block">
                <div className="sb-head"><h3>Public Profile</h3></div>
                <div className="panel set-form">
                  <div className="set-field">
                    <div className="set-label">Share your pilot profile</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        className="set-input set-readonly"
                        readOnly
                        value={`${window.location.origin}/pilot/${user?.id ?? ''}`}
                      />
                      <button className="btn" style={{ flexShrink: 0, fontSize: 11 }} onClick={copyProfileLink}>
                        {profileLinkCopied ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>
                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-3)', marginTop: 4 }}>
                      Public page — visible to anyone with the link
                    </div>
                  </div>
                </div>
              </div>

              <div className="section-block">
                <div className="sb-head">
                  <h3>Gate History</h3>
                  <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-3)' }}>Reset or replay any gate</span>
                </div>
                <div className="panel set-form">
                  {KNOWN_GATES.filter(g => doneQuests.has(g.id)).length === 0 ? (
                    <p style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-3)', margin: 0 }}>No gates completed yet.</p>
                  ) : KNOWN_GATES.filter(g => doneQuests.has(g.id)).map(g => (
                    <div key={g.id} className="set-field" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-1)', marginBottom: 2 }}>{g.label}</div>
                        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-3)' }}>+{g.xp} XP earned</div>
                      </div>
                      {resetConfirm === g.id ? (
                        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                          <button className="btn" style={{ fontSize: 11, padding: '4px 10px', color: 'var(--magenta)', borderColor: 'var(--magenta)' }}
                            onClick={async () => { await clearQuest(g.id); setResetConfirm(null) }}>Confirm</button>
                          <button className="btn" style={{ fontSize: 11, padding: '4px 10px' }}
                            onClick={() => setResetConfirm(null)}>Cancel</button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                          <button className="btn" style={{ fontSize: 11, padding: '4px 10px' }}
                            onClick={() => setResetConfirm(g.id)}>Reset</button>
                          <button className="btn btn-primary" style={{ fontSize: 11, padding: '4px 10px' }}
                            onClick={async () => { await clearQuest(g.id); gotoQuestById(g.id) }}>Replay →</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

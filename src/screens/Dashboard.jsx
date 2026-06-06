import { useState, useEffect } from 'react'
import './Dashboard.css'
import { useNav } from '../context/NavigationContext'
import { useAuth, DRIFT_REWARDS, SEASON_PASS_XP_MULT, USERNAME_COLORS } from '../context/AuthContext'
import { useTheme } from '../hooks/useTheme'
import { supabase } from '../lib/supabase'
import RaidView from './RaidView'

function fmt(n) { return (n ?? 0).toLocaleString() }
function initials(name) { return (name ?? 'PL').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) }
function shortenWallet(w) { return w ? `${w.slice(0, 6)}...${w.slice(-4)}` : 'Not linked' }
function fmtTime(s) { if (!s) return '—'; return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` }


export default function Dashboard() {
  const { goto } = useNav()
  const { user, profile, logout, updateProfile, updateUsernameColor, refreshProfile, clearQuest, unlockGate, clearFlag, toggleSubscription, banPilot, passwordRecovery, sendPasswordReset, updatePassword, updateEmail } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [resetConfirm, setResetConfirm] = useState(null)
  const [unlockStatus, setUnlockStatus] = useState({})
  const [newPassword, setNewPassword] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [changingEmail, setChangingEmail] = useState(false)
  const [pwStatus, setPwStatus] = useState(null)
  const [emailStatus, setEmailStatus] = useState(null)
  const [view, setView] = useState(() => {
    const v = localStorage.getItem('dash-view') ?? 'home'
    return v === 'challenges' ? 'home' : v
  })
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
  const [banDurations, setBanDurations] = useState({})
  const [bugReports, setBugReports] = useState([])
  const [bugModalOpen, setBugModalOpen] = useState(false)
  const [bugText, setBugText] = useState('')
  const [bugStatus, setBugStatus] = useState(null)
  const [bugScreenshot, setBugScreenshot] = useState(null)
  const [bugPreview, setBugPreview] = useState(null)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState(null)
  // Read session_id BEFORE clearing URL in checkoutSuccess initializer
  const [checkoutSessionId] = useState(() => new URLSearchParams(window.location.search).get('session_id'))
  const [checkoutSuccess, setCheckoutSuccess] = useState(() => {
    const ok = new URLSearchParams(window.location.search).get('checkout') === 'success'
    if (ok) window.history.replaceState({}, '', '/dashboard')
    return ok
  })

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
    'act1-ch05': 'The Gravity Anchor',
    'act1-ch06': 'The Infinite Grid',
    'act1-ch07': 'Ghost Feedback',
    'act1-ch08': 'The Collapse',
    'act1-ch09': 'The Control Room',
    'act1-ch10': 'The Static City',
  }

  const KNOWN_GATES = [
    { id: 'act1-ch01', label: 'Gate 01 — The Document Tomb', xp: 100 },
    { id: 'act1-ch02', label: 'Gate 02 — The Semantic Crypt', xp: 200 },
    { id: 'act1-ch03', label: 'Gate 03 — The Form Gate', xp: 300 },
    { id: 'act1-ch04', label: 'Gate 04 — Paint the City', xp: 240 },
    { id: 'act1-ch05', label: 'Gate 05 — The Gravity Anchor', xp: 280 },
    { id: 'act1-ch06', label: 'Gate 06 — The Infinite Grid', xp: 500 },
    { id: 'act1-ch07', label: 'Gate 07 — Ghost Feedback', xp: 350 },
    { id: 'act1-ch08', label: 'Gate 08 — The Collapse', xp: 500 },
    { id: 'act1-ch09', label: 'Gate 09 — The Control Room', xp: 450 },
    { id: 'act1-ch10', label: 'Gate 10 — The Static City', xp: 600 },
  ]
  const [quests, setQuests] = useState([])
  const [lbData, setLbData] = useState([])
  const [settingsName, setSettingsName] = useState('')
  const [settingsWallet, setSettingsWallet] = useState('')
  const [walletError, setWalletError] = useState(null)
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
  const isFounder = profile?.is_founder ?? false

  useEffect(() => {
    supabase.from('quests').select('*').eq('world', 1).order('order_index')
      .then(({ data }) => { if (data) setQuests(data) })
  }, [])

  useEffect(() => {
    localStorage.setItem('drift-card-variant', cardVariant)
  }, [cardVariant])

  useEffect(() => {
    if (profile?.is_parent) goto('academy/dashboard')
  }, [profile?.is_parent, goto])

  const DRIFT_TOKEN_ADDRESS = '0x60FE1910182602942Bcf297fFF7244f6f4ed8633'

  async function fetchOnChainDrift(wallet) {
    // No RPC configured → on-chain balance is unavailable (return null so the UI
    // shows "—" rather than a misleading on-chain 0 or a fetch(undefined) error).
    if (!import.meta.env.VITE_ALCHEMY_RPC) return null
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
    setWalletError(null)
    if (!window.ethereum) {
      setWalletError('MetaMask not detected — install it to link a wallet.')
      return
    }
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      if (accounts[0]) setSettingsWallet(accounts[0])
    } catch {
      setWalletError('Wallet connection cancelled.')
    }
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
      supabase.from('profiles').select('id, name, is_subscribed, is_admin, banned_until').order('name'),
      supabase.from('bug_reports').select('id, user_id, description, view, url, user_agent, status, created_at').order('created_at', { ascending: false }),
    ]).then(([{ data: flagged }, { data: pilots }, { data: bugs }]) => {
      setFlaggedRows(flagged ?? [])
      setAllPilots(pilots ?? [])
      setBugReports(bugs ?? [])
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

  async function submitBugReport() {
    if (!bugText.trim()) return
    setBugStatus('sending')

    const { count } = await supabase
      .from('bug_reports')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString())
    if (count >= 3) { setBugStatus('ratelimit'); return }

    const { error } = await supabase.from('bug_reports').insert({
      user_id: user.id,
      description: bugText.trim(),
      view,
      url: window.location.href,
      user_agent: navigator.userAgent,
      status: 'new',
    })

    if (!error) {
      // Flat shape matches the notify-discord edge function, which builds the embed.
      supabase.functions.invoke('notify-discord', {
        body: {
          description: bugText.trim(),
          user_name: profile?.name ?? user?.email ?? 'unknown',
          view,
          url: window.location.href,
          screenshot_base64: bugPreview || undefined,
          created_at: new Date().toISOString(),
        },
      }).catch(() => {})
      setBugStatus('sent')
      setBugText('')
      setBugScreenshot(null)
      setBugPreview(null)
      setTimeout(() => { setBugModalOpen(false); setBugStatus(null) }, 1800)
    } else {
      setBugStatus('error')
    }
  }

  useEffect(() => {
    if (!checkoutSuccess) return
    if (checkoutSessionId && user?.id) {
      supabase.functions.invoke('verify-checkout', {
        body: { session_id: checkoutSessionId, user_id: user.id },
      }).then(() => refreshProfile())
    } else {
      refreshProfile()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleCheckout() {
    setCheckoutError(null)
    setCheckoutLoading(true)
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: { user_id: user.id, email: user.email },
    })
    if (error || !data?.url) {
      setCheckoutLoading(false)
      setCheckoutError('Checkout is not available yet — try again later.')
      return
    }
    window.location.href = data.url
  }


  useEffect(() => {
    // Use the SQL `leaderboard` view: nested quest_completions are blocked by
    // RLS cross-user (every pilot would read 0). The view aggregates total_xp
    // server-side. Degrade gracefully if the view isn't provisioned yet.
    supabase
      .from('leaderboard')
      .select('id,name,total_xp')
      .order('total_xp', { ascending: false })
      .then(({ data, error }) => {
        if (error || !data) {
          if (error) console.warn('leaderboard view unavailable:', error.message)
          setLbData([])
          return
        }
        const ranked = data.map((p, i) => ({
          id: p.id,
          name: p.name || 'Pilot',
          totalXp: p.total_xp ?? 0,
          rank: i + 1,
        }))
        setLbData(ranked)
      })
  }, [profile])

  function openSettings() {
    setSettingsName(profile?.name ?? '')
    setSettingsWallet(profile?.wallet ?? '')
    setWalletError(null)
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
  // questsCompleted counts raid rows too, so it can exceed the gate denominator.
  // Count only Act I gate completions for the "QUESTS CLEARED" stat.
  const gatesDone = [...(profile?.completedQuestIds ?? [])].filter(id => id.startsWith('act1-ch')).length
  const totalXp = profile?.totalXp ?? 0
  const totalDrift = profile?.totalDrift ?? 0
  const totalDriftSpent = profile?.totalDriftSpent ?? 0
  const spendableDrift = totalDrift - totalDriftSpent
  const completions = profile?.completions ?? []
  const unlocks = profile?.unlocks ?? []
  const unlockedGateIds = profile?.unlockedGateIds ?? new Set()

  // Readable gate labels for the admin flagged-completions table — covers all
  // of Act I (ch01–ch10) by reusing the GATE_NAMES titles.
  const GATE_SHORT = Object.fromEntries(
    Object.entries(GATE_NAMES).map(([id, name]) => {
      const ch = id.slice(-2)
      return [id, `Gate ${ch} — ${name}`]
    })
  )

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
    'act1-ch05': { label: 'Gate 05 — The Gravity Anchor', icon: '⚓' },
    'act1-ch06': { label: 'Gate 06 — The Infinite Grid',  icon: '⬛' },
    'act1-ch07': { label: 'Gate 07 — Ghost Feedback',     icon: '👻' },
    'act1-ch08': { label: 'Gate 08 — The Collapse',       icon: '📱' },
    'act1-ch09': { label: 'Gate 09 — The Control Room',  icon: '⬡' },
    'act1-ch10': { label: 'Gate 10 — The Static City',   icon: '📡' },
  }
  // Source of truth for $DRIFT payouts lives in AuthContext.DRIFT_REWARDS —
  // mirror it directly so wallet credits, transactions, and notifications match.
  const DRIFT_REWARDS_UI = DRIFT_REWARDS
  function resolveQuestMeta(questId, xpEarned) {
    if (DRIFT_GATE_NAMES[questId]) return { ...DRIFT_GATE_NAMES[questId], drift: DRIFT_REWARDS_UI[questId] ?? 0, kind: 'gate' }
    if (questId?.startsWith('raid:')) return { label: 'Raid completed', icon: '⚔️', drift: xpEarned ?? 0, kind: 'raid' }
    return { label: questId, icon: '◈', drift: 0, kind: 'unknown' }
  }
  const pilotName = profile?.name ?? 'Pilot'
  const streak = profile?.streak ?? 0
  const streakMult = profile?.streakMultiplier ?? 1
  const xpMult = profile?.xpMultiplier ?? 1
  const fmtMult = (m) => Number(m.toFixed(3)).toString()
  // Season Pass: custom name colour (only honoured while subscribed)
  const nameColor = isSubscribed ? (USERNAME_COLORS[profile?.username_color]?.value ?? undefined) : undefined
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
  const act5Done = doneQuests.has('act1-ch05')
  const act6Done = doneQuests.has('act1-ch06')
  const act7Done = doneQuests.has('act1-ch07')
  const act8Done = doneQuests.has('act1-ch08')
  const act9Done = doneQuests.has('act1-ch09')
  const act10Done = doneQuests.has('act1-ch10')
  const myRank = lbData.find(r => r.id === user?.id)?.rank ?? null

  function gotoActiveQuest() {
    if (act9Done && !act10Done) return goto('quest10')
    if (act8Done && !act9Done) return goto('quest9')
    if (act7Done && !act8Done) return goto('quest8')
    if (act6Done && !act7Done) return goto('quest7')
    if (act5Done && !act6Done) return goto('quest6')
    if (act4Done && !act5Done) return goto('quest5')
    if (act1Done && act2Done && act3Done && !act4Done) return goto('quest4')
    if (act1Done && act2Done && !act3Done) return goto('quest3')
    if (act1Done && !act2Done) return goto('quest2')
    goto('quest')
  }

  function gotoQuestById(id) {
    if (id === 'act1-ch10') return goto('quest10')
    if (id === 'act1-ch09') return goto('quest9')
    if (id === 'act1-ch08') return goto('quest8')
    if (id === 'act1-ch07') return goto('quest7')
    if (id === 'act1-ch06') return goto('quest6')
    if (id === 'act1-ch05') return goto('quest5')
    if (id === 'act1-ch04') return goto('quest4')
    if (id === 'act1-ch03') return goto('quest3')
    if (id === 'act1-ch02') return goto('quest2')
    if (id === 'act1-ch01') return goto('quest')
    // Unmapped chapter (e.g. ch11–ch15 has no screen yet) — do nothing rather
    // than silently opening Gate 01.
    return
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
                Clear all 10 gates in Act I to unlock the Reactive Sector. Raid the tower for bonus rewards.
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

      {bugModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'var(--bg-overlay)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setBugModalOpen(false) }}>
          <div className="panel" style={{ width: '100%', maxWidth: 460, padding: '32px 28px' }}>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--magenta)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>⚠ Bug Report</div>
            <h3 style={{ fontSize: 20, fontWeight: 500, marginBottom: 6 }}>What went wrong?</h3>
            <p style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-3)', marginBottom: 20 }}>Describe what happened and what you expected. Current view and browser info are captured automatically.</p>
            <textarea
              value={bugText}
              onChange={e => setBugText(e.target.value)}
              placeholder="e.g. Clicking 'Resume Quest' does nothing after completing Gate 02..."
              rows={4}
              style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--line-2)', borderRadius: 10, padding: '12px 14px', color: 'var(--ink-0)', fontFamily: 'var(--f-body)', fontSize: 13, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
            />

            <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, cursor: 'pointer' }}>
              <div style={{ flex: 1, background: 'var(--bg-input)', border: '1px dashed var(--line-2)', borderRadius: 8, padding: '10px 14px', fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.06em' }}>
                {bugScreenshot ? `📎 ${bugScreenshot.name}` : '📎 Attach screenshot (optional)'}
              </div>
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
                const f = e.target.files?.[0]
                if (!f) return
                setBugScreenshot(f)
                const reader = new FileReader()
                reader.onload = ev => setBugPreview(ev.target.result)
                reader.readAsDataURL(f)
              }} />
            </label>

            {bugPreview && (
              <div style={{ marginTop: 10, position: 'relative', display: 'inline-block' }}>
                <img src={bugPreview} alt="screenshot" style={{ maxWidth: '100%', maxHeight: 160, borderRadius: 8, border: '1px solid var(--line)' }} />
                <button onClick={() => { setBugScreenshot(null); setBugPreview(null) }}
                  style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(5,7,13,0.8)', border: 'none', color: 'var(--ink-1)', borderRadius: 4, padding: '2px 6px', cursor: 'pointer', fontSize: 12 }}>×</button>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => setBugModalOpen(false)} style={{ fontSize: 12 }}>Cancel</button>
              <button className="btn btn-primary" onClick={submitBugReport} disabled={!bugText.trim() || bugStatus === 'sending'} style={{ fontSize: 12 }}>
                {bugStatus === 'sending' ? 'Sending…' : bugStatus === 'sent' ? '✓ Sent!' : 'Submit Report'}
              </button>
            </div>
            {bugStatus === 'error' && <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--magenta)', marginTop: 10 }}>Failed to send — try again.</div>}
            {bugStatus === 'ratelimit' && <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--amber)', marginTop: 10 }}>Too many reports — wait 5 minutes before sending another.</div>}
          </div>
        </div>
      )}
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

        <div style={{ padding: '0 12px 8px' }}>
          <button onClick={() => { setBugModalOpen(true); setBugText(''); setBugStatus(null) }}
            style={{ width: '100%', background: 'none', border: '1px solid var(--line)', borderRadius: 8, padding: '7px 12px', fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-3)', cursor: 'pointer', letterSpacing: '0.06em', transition: 'color 0.15s, border-color 0.15s', textAlign: 'left' }}>
            ⚠ Report a Bug
          </button>
        </div>

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
          <div className="top-actions">
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--line-2)', background: 'none', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-2)', transition: 'color 0.15s, border-color 0.15s' }}
            >
              {theme === 'dark' ? '☀' : '◑'}
            </button>

            {/* Notifications */}
            <div style={{ position: 'relative' }}>
              {notifOpen && <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setNotifOpen(false)} />}
              <div className="bell" style={{ position: 'relative', cursor: 'pointer' }} onClick={() => { setNotifOpen(o => !o); setProfileOpen(false) }}>
                🔔
                {completions.length > 0 && <span style={{ position: 'absolute', top: 1, right: 1, width: 7, height: 7, borderRadius: '50%', background: 'var(--magenta)', border: '1px solid oklch(0.14 0.02 250)' }} />}
              </div>
              {notifOpen && (
                <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 300, zIndex: 100, background: 'var(--bg-popup)', border: '1px solid var(--border-popup)', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow-popup)' }}>
                  <div style={{ padding: '11px 16px', borderBottom: '1px solid var(--line-popup)', fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Notifications</div>
                  {completions.length === 0 && streak === 0 ? (
                    <div style={{ padding: '14px 16px', fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-3)' }}>No notifications yet.</div>
                  ) : (
                    <>
                      {streak > 0 && (
                        <div style={{ display: 'flex', gap: 10, padding: '11px 16px', borderBottom: '1px solid var(--line-popup)', alignItems: 'center' }}>
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
                          <div key={i} style={{ display: 'flex', gap: 10, padding: '11px 16px', borderBottom: '1px solid var(--line-popup)', alignItems: 'center' }}>
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
                <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 220, zIndex: 100, background: 'var(--bg-popup)', border: '1px solid var(--border-popup)', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow-popup)' }}>
                  <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--line-popup)' }}>
                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color: nameColor ?? 'var(--ink-1)', fontWeight: 600 }}>{pilotName}{isSubscribed && <span className="pilot-badge badge-season1" style={{ marginLeft: 6, fontSize: 8, verticalAlign: 'middle' }}>◈ S01</span>}</div>
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

        {checkoutSuccess && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'oklch(0.75 0.22 145 / 0.1)', border: '1px solid oklch(0.75 0.22 145 / 0.35)', borderRadius: 10, padding: '14px 18px', margin: '0 0 20px', fontFamily: 'var(--f-mono)', fontSize: 12 }}>
            <span style={{ fontSize: 20 }}>✓</span>
            <div style={{ flex: 1 }}>
              <div style={{ color: 'var(--lime)', fontWeight: 600, marginBottom: 2 }}>Season Pass activated!</div>
              <div style={{ color: 'var(--ink-2)', fontSize: 11 }}>All 10 gates are now unlocked. Welcome to the full protocol.</div>
            </div>
            <button style={{ background: 'none', border: 'none', color: 'var(--ink-3)', cursor: 'pointer', fontSize: 16 }} onClick={() => setCheckoutSuccess(false)}>×</button>
          </div>
        )}

        {view === 'home' ? (
          <>
            <div className="hero-banner">
              <div>
                <span className="chip chip-amber" style={{ display: 'inline-flex' }}>
                  <span className="dot dot-pulse" /> {streak > 0 ? `${streak}-DAY STREAK` : 'START YOUR STREAK'}
                </span>
                <h1 style={{ marginTop: 16 }}>GM, <span style={nameColor ? { color: nameColor } : undefined}>{pilotName}</span>.<br /><span className="gradient-text">Ready for today's mission?</span></h1>
                {(isFounder || isSubscribed) && (
                  <div className="pilot-badges">
                    {isFounder && <span className="pilot-badge badge-founder">⬡ EDGERNR</span>}
                    {isSubscribed && <span className="pilot-badge badge-season1">◈ SEASON 01</span>}
                  </div>
                )}
                {(() => {
                  const totalGates = quests.length || 10
                  const remaining = Math.max(0, totalGates - gatesDone)
                  return (
                    <p>{gatesDone === 0
                      ? <>Your first mission awaits. Complete Act I to unlock <strong>React Act II</strong>.</>
                      : remaining > 0
                      ? <>You're {remaining} quest{remaining !== 1 ? 's' : ''} away from unlocking <strong>React Act II</strong>. {
                          xpMult > 1
                            ? (isSubscribed && streakMult > 1
                                ? <>Season Pass <strong>×{fmtMult(SEASON_PASS_XP_MULT)}</strong> + streak <strong>×{fmtMult(streakMult)}</strong> = <strong>×{fmtMult(xpMult)} XP</strong>.</>
                                : isSubscribed
                                  ? <>Your Season Pass is earning <strong>×{fmtMult(SEASON_PASS_XP_MULT)} XP</strong>.</>
                                  : <>Your streak is earning <strong>×{fmtMult(streakMult)} XP</strong> — keep it alive.</>)
                            : <>Build a <strong>3-day streak</strong> to start earning bonus XP.</>
                        }</>
                      : <>Act I complete. <strong>React Act II</strong> is now unlocked. Ready for the next challenge?</>
                    }</p>
                  )
                })()}

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
                <div className="streak-lbl">{streak > 0 ? (streakMult > 1 ? `DAY STREAK · ×${streakMult} XP` : 'DAY STREAK') : 'NO STREAK YET'}</div>
              </div>
            </div>

            <div className="stats-grid">
              {[
                { color: 'var(--teal)',    label: 'TOTAL XP',        val: fmt(totalXp),       delta: 'lifetime earned' },
                { color: 'var(--magenta)', label: '$DRIFT BALANCE',   val: fmt(spendableDrift), unit: 'DRIFT', delta: `${fmt(totalDrift)} earned · ${fmt(totalDriftSpent)} spent` },
                { color: 'var(--violet)',  label: 'QUESTS CLEARED',  val: String(gatesDone), unit: `/${quests.length || 10}`, delta: `${Math.min(100, Math.round(gatesDone / (quests.length || 10) * 100))}% of Act I` },
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
                  { n:'01', name:'HTML Ruins',      color:'var(--amber)',   quests: Math.min(gatesDone, quests.length || 10), total: quests.length || 10, boss:'DIV EATER', active:true  },
                  { n:'02', name:'Reactive Sector', color:'var(--violet)',  active:false },
                  { n:'03', name:'Router Maze',     color:'var(--teal)',    active:false },
                  { n:'04', name:'Immersive Grid',  color:'var(--magenta)', active:false },
                ].map(w => (
                  <div key={w.n} className={`wmap-world${w.active ? ' wmap-active' : ''}`} style={{ '--wc': w.color }}>
                    <div className="wmap-header">
                      <span className="wmap-num">W{w.n}</span>
                      {w.active ? <span className="wmap-live">ACTIVE</span> : <span className="wmap-locked">LOCKED</span>}
                    </div>
                    <div className="wmap-name">{w.name}</div>
                    <div className="wmap-bar-wrap">
                      <div className="wmap-fill" style={{ width: w.active ? `${Math.round(w.quests / w.total * 100)}%` : '0%' }} />
                    </div>
                    <div className="wmap-foot">
                      {w.active ? (
                        <>
                          <span>{w.quests}/{w.total} quests</span>
                          <span className="wmap-boss">{w.boss}</span>
                        </>
                      ) : (
                        <span style={{ color: 'var(--ink-3)' }}>Coming in Season 02</span>
                      )}
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
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'oklch(0.72 0.28 340 / 0.06)', border: '1px solid oklch(0.72 0.28 340 / 0.2)', borderRadius: 10, padding: '12px 18px', fontFamily: 'var(--f-mono)', fontSize: 11 }}>
                  <span style={{ fontSize: 20 }}>🔓</span>
                  <span style={{ color: 'var(--ink-2)', flex: 1 }}>Unlock <strong style={{ color: 'var(--ink-1)' }}>all 10 gates</strong> sequentially with a Season Pass — no $DRIFT spend needed.</span>
                  <button className="btn btn-primary" style={{ fontSize: 11, padding: '6px 14px', flexShrink: 0 }} onClick={handleCheckout} disabled={checkoutLoading}>
                    {checkoutLoading ? 'Loading…' : 'Get Season Pass →'}
                  </button>
                </div>
                {checkoutError && <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--magenta)', marginTop: 8 }}>{checkoutError}</div>}
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
                    onClick={(isDone || isActive || isUnlocked || isAdmin) ? () => gotoQuestById(chKey) : undefined}
                    style={isAdmin && isLocked ? { cursor: 'pointer' } : undefined}
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
                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color: nameColor ?? 'oklch(1 0 0 / 0.85)' }}>{pilotName.toUpperCase()}</div>
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
                      {onChainBalance === null ? '—' : fmt(onChainBalance)}
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
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 18px', borderBottom: '1px solid var(--line-popup)' }}>
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
                <h3>Bug Reports</h3>
                <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--magenta)' }}>{bugReports.filter(b => b.status === 'new').length} new</span>
              </div>
              <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
                {bugReports.length === 0 ? (
                  <div style={{ padding: '20px 18px', fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-3)' }}>No bug reports yet.</div>
                ) : (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 100px 80px 80px', padding: '8px 18px', borderBottom: '1px solid oklch(1 0 0 / 0.06)', fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      <span>Description</span><span>Pilot</span><span>View</span><span>Date</span><span>Status</span>
                    </div>
                    {bugReports.map((b, i) => (
                      <div key={b.id} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 100px 80px 80px', padding: '12px 18px', borderBottom: '1px solid var(--line-popup)', alignItems: 'center', gap: 8 }}>
                        <div>
                          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-1)', marginBottom: 3 }}>{b.description}</div>
                          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--ink-3)' }}>{b.user_agent?.slice(0, 60)}…</div>
                        </div>
                        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-2)' }}>{allPilots.find(p => p.id === b.user_id)?.name ?? 'Unknown'}</span>
                        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-3)' }}>{b.view ?? '—'}</span>
                        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-3)' }}>{new Date(b.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        <select value={b.status} onChange={async e => {
                          const newStatus = e.target.value
                          await supabase.from('bug_reports').update({ status: newStatus }).eq('id', b.id)
                          setBugReports(rs => rs.map((r, j) => j === i ? { ...r, status: newStatus } : r))
                        }} style={{ fontFamily: 'var(--f-mono)', fontSize: 9, background: 'oklch(1 0 0 / 0.04)', border: '1px solid var(--line-2)', borderRadius: 6, padding: '3px 5px', color: b.status === 'new' ? 'var(--magenta)' : b.status === 'fixed' ? 'var(--lime)' : 'var(--amber)', cursor: 'pointer' }}>
                          <option value="new">New</option>
                          <option value="reviewed">Reviewed</option>
                          <option value="fixed">Fixed</option>
                        </select>
                      </div>
                    ))}
                  </>
                )}
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
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 90px 64px 64px 90px 72px', padding: '12px 18px', borderBottom: '1px solid var(--line-popup)', alignItems: 'center' }}>
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 110px 170px', padding: '8px 18px', borderBottom: '1px solid oklch(1 0 0 / 0.06)', fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  <span>Pilot</span><span>Season Pass</span><span>Ban Status</span><span>Actions</span>
                </div>
                {allPilots.map((p, i) => {
                  const banned = p.banned_until && (p.banned_until === '2099-01-01T00:00:00Z' || new Date(p.banned_until) > new Date())
                  const banExpiry = banned && p.banned_until !== '2099-01-01T00:00:00Z'
                    ? new Date(p.banned_until).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : null
                  return (
                    <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 110px 170px', padding: '12px 18px', borderBottom: '1px solid var(--line-popup)', alignItems: 'center' }}>
                      <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-1)' }}>
                        {p.name ?? 'Unnamed'}
                        {p.is_admin && <span className="chip" style={{ marginLeft: 8, padding: '1px 5px', fontSize: 8 }}>ADMIN</span>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10 }}>
                          {p.is_subscribed ? <span style={{ color: 'var(--lime)' }}>✓</span> : <span style={{ color: 'var(--ink-3)' }}>—</span>}
                        </span>
                        <button className="btn" style={{ fontSize: 9, padding: '2px 6px', color: p.is_subscribed ? 'var(--magenta)' : undefined }}
                          onClick={async () => { const ok = await toggleSubscription(p.id, p.is_subscribed); if (ok) setAllPilots(ps => ps.map((pl, j) => j === i ? { ...pl, is_subscribed: !pl.is_subscribed } : pl)) }}>
                          {p.is_subscribed ? 'Revoke' : 'Grant'}
                        </button>
                      </div>
                      <div>
                        {banned
                          ? <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--magenta)', background: 'oklch(0.72 0.28 340 / 0.08)', border: '1px solid oklch(0.72 0.28 340 / 0.35)', borderRadius: 5, padding: '2px 7px' }}>
                              🚫 {banExpiry ? `Until ${banExpiry}` : 'Permanent'}
                            </span>
                          : <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-3)' }}>—</span>
                        }
                      </div>
                      <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                        {!banned && (
                          <select
                            value={banDurations[p.id] ?? '24h'}
                            onChange={e => setBanDurations(d => ({ ...d, [p.id]: e.target.value }))}
                            style={{ fontFamily: 'var(--f-mono)', fontSize: 9, background: 'oklch(1 0 0 / 0.04)', border: '1px solid var(--line-2)', borderRadius: 6, padding: '3px 5px', color: 'var(--ink-2)', cursor: 'pointer' }}>
                            <option value="1h">1 hour</option>
                            <option value="24h">24 hours</option>
                            <option value="7d">7 days</option>
                            <option value="30d">30 days</option>
                            <option value="permanent">Permanent</option>
                          </select>
                        )}
                        <button className="btn" style={{ fontSize: 9, padding: '2px 8px', color: banned ? 'var(--lime)' : 'var(--magenta)' }}
                          onClick={async () => {
                            const dur = banned ? 'unban' : (banDurations[p.id] ?? '24h')
                            const ok = await banPilot(p.id, dur)
                            if (ok) {
                              let newBannedUntil = null
                              if (dur !== 'unban') {
                                newBannedUntil = dur === 'permanent' ? '2099-01-01T00:00:00Z'
                                  : new Date(Date.now() + { '1h': 3600000, '24h': 86400000, '7d': 604800000, '30d': 2592000000 }[dur]).toISOString()
                              }
                              setAllPilots(ps => ps.map((pl, j) => j === i ? { ...pl, banned_until: newBannedUntil } : pl))
                            }
                          }}>
                          {banned ? 'Unban' : 'Ban'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="set-hero">
              <div className="set-avatar">{initials(pilotName)}</div>
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 500, letterSpacing: '-0.02em', marginBottom: 4, color: nameColor ?? undefined }}>{pilotName}</h2>
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
                    {walletError && <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--magenta)', marginTop: 6, display: 'block' }}>{walletError}</span>}
                  </div>
                  <div className="set-field">
                    <label className="set-label">Season Pass</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {isSubscribed
                        ? <span className="chip chip-lime" style={{ padding: '2px 8px', fontSize: 10 }}>ACTIVE</span>
                        : <span className="chip" style={{ padding: '2px 8px', fontSize: 10 }}>NOT ACTIVE</span>
                      }
                      {isSubscribed
                        ? <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-3)' }}>Full access to all worlds</span>
                        : <button className="btn btn-primary" style={{ fontSize: 11, padding: '6px 14px' }} onClick={handleCheckout} disabled={checkoutLoading}>
                            {checkoutLoading ? 'Loading…' : 'Get Season Pass — $9.99/mo →'}
                          </button>
                      }
                    </div>
                    {!isSubscribed && checkoutError && <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--magenta)', marginTop: 6, display: 'block' }}>{checkoutError}</span>}
                  </div>
                  <div className="set-field">
                    <label className="set-label">Name Colour {!isSubscribed && <span style={{ color: 'var(--ink-3)', fontWeight: 400 }}>· Season Pass</span>}</label>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', opacity: isSubscribed ? 1 : 0.5 }}>
                      {Object.entries(USERNAME_COLORS).map(([key, c]) => {
                        const selected = (profile?.username_color ?? 'default') === key
                        return (
                          <button
                            key={key}
                            type="button"
                            title={c.label}
                            disabled={!isSubscribed}
                            onClick={() => { if (isSubscribed) updateUsernameColor(key) }}
                            style={{
                              width: 28, height: 28, borderRadius: '50%', padding: 0,
                              background: c.value ?? 'var(--ink-3)',
                              border: selected ? '2px solid var(--ink-1)' : '2px solid transparent',
                              boxShadow: selected ? '0 0 0 2px var(--bg-popup)' : 'none',
                              cursor: isSubscribed ? 'pointer' : 'not-allowed',
                            }}
                          />
                        )
                      })}
                    </div>
                    {!isSubscribed && <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-3)', marginTop: 6, display: 'block' }}>Unlock custom name colours with a Season Pass.</span>}
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

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import Editor from '@monaco-editor/react'
import { useAuth } from '../context/AuthContext'
import { useQuestAnalytics } from '../hooks/useQuestAnalytics'
import HunterBrowser from './HunterBrowser'
import RaidBossVarkul from './RaidBossVarkul'
import { CONSOLE_HOOK } from '../lib/consoleHook'
import {
  RAID01, FUNCTIONS, FUNCTIONS_BY_ID, FUNCTIONS_BY_ROLE,
  PHASES, ROLES,
  BOSS_HP_MAX, FUNCTION_DAMAGE, PLAYER_HP_MAX, STRIKE_FAIL_DMG, IDLE_BLEED_AFTER, ENTRY_COST,
} from '../data/raids/raid01'
import './Raid01Combat.css'

// ── RAID 01 combat shell (v2 — Sequential Functions) ──────────────────────────
// Session-agnostic: all shared state (functions, members, events) and all writes
// (complete / code persistence) come through props, so the live Supabase session
// (Raid01.jsx) and the offline solver harness (/__raidsolver) drive the exact
// same component.
//
// Unlike v1 (independent heads), this version shows ONE active function at a
// time. The whole party sees the same editor, the same wards, the same code.
// Functions unlock in order: F1 → F2 → F3 → F4 → F5. No claiming, no head
// hopping — join mid-raid and you only need to understand the current function.
//
// Layout: EDITOR-FIRST. The editor owns the main area; the function progression,
// boss visual, and party list live in a docked drawer.
//
// Rules:
//   complete a function → shared −200 boss HP
//   deflected STRIKE   → personal −15 (nothing new passed)
//   idle past 90s      → personal −1/s
//   fall at 0          → respawn at the Gate: HP restored, combo reset,
//                          code + completed functions untouched

export default function Raid01Combat({
  functions,      // { f1: { status, severed_by }, f2: ..., f3: ..., f4: ..., f5: ... }
  members,        // [{ user_id, name, role }]
  myId,
  events,         // [{ id, type, label, created_at }] newest first
  onComplete,     // (fnId) => Promise|void
  onEvent,        // (type, label) => void
  loadCode,       // (fnId) => Promise<string|null>
  saveCode,       // (fnId, content) => void
  onVictory,      // () => void
  onExit,         // () => void
  onAbandon,      // () => void — leave a LIVE raid (optional; absent offline)
}) {
  const { profile, user } = useAuth()
  const { onPaste, bindEditor, onCodeChange, pasteBlocked } = useQuestAnalytics()
  const [confirmAbandon, setConfirmAbandon] = useState(false)

  // ─── Shared-state derivations ────────────────────────────────────────────────
  const fnList = FUNCTIONS
  const completedCount = fnList.filter(f => functions[f.id]?.status === 'severed').length
  const bossHP = Math.max(0, BOSS_HP_MAX - completedCount * FUNCTION_DAMAGE)

  // Current function = first not-severed in sequence
  const currentFn = fnList.find(f => functions[f.id]?.status !== 'severed')
  const allDone = completedCount === fnList.length

  // Phase (visual only — 3 phases mapped across 5 functions)
  const currentPhase = currentFn?.phase ?? 3

  // Head states for RaidBossVarkul — derived from function completion
  const headStates = useMemo(() => {
    const states = {}
    for (const f of fnList) {
      const fnStatus = functions[f.id]?.status ?? 'open'
      const state = fnStatus === 'severed' ? 'severed' : fnStatus === 'claimed' ? 'claimed' : 'open'
      for (const hid of f.headIds) {
        states[hid] = state
      }
    }
    return states
  }, [functions])

  const memberName = useCallback(
    (id) => members.find(m => m.user_id === id)?.name ?? 'HUNTER',
    [members]
  )

  // My roles (multi-role: a hunter can have up to 3 roles)
  const myRoles = members.filter(m => m.user_id === myId).map(m => ROLES[m.role]).filter(Boolean)
  const myFunctionIds = myRoles.map(r => fnList.find(f => f.role === r.id)?.id).filter(Boolean)

  // ─── Local state ─────────────────────────────────────────────────────────────
  const lastFnRef = useRef(currentFn?.id)
  const [currentFnId, setCurrentFnId] = useState(currentFn?.id ?? 'f1')
  const [codeMap, setCodeMap] = useState({})
  const [wardResults, setWardResults] = useState({})
  const [expandedHint, setExpandedHint] = useState(null)
  const [playerHP, setPlayerHP] = useState(PLAYER_HP_MAX)
  const [combo, setCombo] = useState(0)
  const [fell, setFell] = useState(false)
  const [strikeKey, setStrikeKey] = useState(0)
  const [dmgFlash, setDmgFlash] = useState(null)
  const [phaseBanner, setPhaseBanner] = useState(null)
  const [showVictory, setShowVictory] = useState(false)
  const [browserOpen, setBrowserOpen] = useState(false)
  const [browserTab, setBrowserTab] = useState('instance')
  const [browserReloadKey, setBrowserReloadKey] = useState(0)
  const [consoleOpen, setConsoleOpen] = useState(false)
  const [consoleEntries, setConsoleEntries] = useState([])
  const [confirmSurrender, setConfirmSurrender] = useState(false)
  const [panel, setPanel] = useState('function')
  const [drawerOpen, setDrawerOpen] = useState(true)
  const [severToast, setSeverToast] = useState(null)
  const [bossFlash, setBossFlash] = useState(false)
  const [attacking, setAttacking] = useState(false)

  // ─── Refs ────────────────────────────────────────────────────────────────────
  const checkIframeRef = useRef(null)
  const browserFrameRef = useRef(null)
  const struckRef = useRef({})
  const bleedTimerRef = useRef(null)
  const bleedCountRef = useRef(0)
  const saveTimerRef = useRef(null)
  const loadedRef = useRef(new Set())
  const consoleBufRef = useRef([])
  const consoleFlushRef = useRef(null)
  const consoleIdRef = useRef(0)
  const consoleBodyRef = useRef(null)
  const guideOpenRef = useRef(false)
  const dmgIdRef = useRef(0)
  const fellRef = useRef(false)
  const victoryFiredRef = useRef(false)
  const prevSeveredRef = useRef(null)
  const toastIdRef = useRef(0)
  const bossFlashRef = useRef(null)

  const fn = currentFn ?? fnList[fnList.length - 1]
  const fnShared = functions[fn.id] ?? { status: 'open' }
  const isSevered = fnShared.status === 'severed'
  const canEdit = !isSevered && !fell
  const code = codeMap[currentFnId] ?? fn.starter

  // ─── Sync currentFn with local state ────────────────────────────────────────
  useEffect(() => {
    if (currentFn && currentFn.id !== lastFnRef.current) {
      lastFnRef.current = currentFn.id
      setCurrentFnId(currentFn.id)
      setCodeMap(prev => {
        if (prev[currentFn.id] != null) return prev
        return { ...prev, [currentFn.id]: fn.starter }
      })
    }
  }, [currentFn, fn.starter])

  // ─── Personal damage helper ──────────────────────────────────────────────────
  const triggerAttack = useCallback(() => {
    setAttacking(true)
    clearTimeout(bossFlashRef.current)
    bossFlashRef.current = setTimeout(() => setAttacking(false), 700)
  }, [])

  const takeDamage = useCallback((amount, why) => {
    if (fellRef.current) return
    triggerAttack()
    setPlayerHP(hp => {
      const next = Math.max(0, hp - amount)
      if (next === 0 && !fellRef.current) {
        fellRef.current = true
        setFell(true)
        setCombo(0)
        onEvent?.('fall', `${profile?.name ?? 'A hunter'} FELL at the Broodgate — respawning at the Gate mouth. No progress lost.`)
      }
      return next
    })
    const id = ++dmgIdRef.current
    setDmgFlash({ id, text: `−${amount} ${why}`, cls: 'hurt' })
    setTimeout(() => setDmgFlash(f => (f?.id === id ? null : f)), 1100)
  }, [onEvent, profile?.name, triggerAttack])

  const handleRespawn = useCallback(() => {
    fellRef.current = false
    setFell(false)
    setPlayerHP(PLAYER_HP_MAX)
    bleedCountRef.current = 0
  }, [])

  // ─── Load stored code on function switch ────────────────────────────────────
  useEffect(() => {
    if (loadedRef.current.has(currentFnId)) return
    const fnId = currentFnId
    Promise.resolve(loadCode?.(fnId)).then(stored => {
      loadedRef.current.add(fnId)
      if (stored == null) return
      setCodeMap(prev => ({ ...prev, [fnId]: stored }))
    })
  }, [currentFnId, loadCode])

  // ─── Ward evaluation ─────────────────────────────────────────────────────────
  const runChecks = useCallback((afterResults) => {
    const iframe = checkIframeRef.current
    if (!iframe || !fn) return
    const currentCode = codeMap[currentFnId] ?? fn.starter
    iframe.srcdoc = fn.buildCheckDoc(currentCode)
    iframe.onload = () => {
      requestAnimationFrame(() => {
        const doc = iframe.contentDocument
        const win = iframe.contentWindow
        if (!doc || !win) return
        const results = {}
        fn.wards.forEach(w => {
          try { results[w.id] = w.test(doc, win, currentCode) } catch { results[w.id] = false }
        })
        afterResults?.(results)
      })
    }
  }, [currentFnId, codeMap, fn])

  useEffect(() => {
    const t = setTimeout(() => runChecks(setWardResults), 350)
    return () => clearTimeout(t)
  }, [runChecks])

  useEffect(() => { setWardResults({}); setExpandedHint(null) }, [currentFnId])

  // ─── Code change → local map + debounced save ──────────────────────────────
  const handleCodeChange = useCallback((val, ev) => {
    const v = val ?? ''
    onCodeChange(v, ev)
    setCodeMap(prev => ({ ...prev, [currentFnId]: v }))
    bleedCountRef.current = 0
    clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => saveCode?.(currentFnId, v), 1200)
  }, [currentFnId, onCodeChange, saveCode])

  useEffect(() => () => clearTimeout(saveTimerRef.current), [])

  // ─── Hunter Browser ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!browserFrameRef.current) return
    consoleBufRef.current.length = 0
    setConsoleEntries(prev => (prev.length ? [] : prev))
    browserFrameRef.current.srcdoc = CONSOLE_HOOK + fn.buildPreview(code)
  }, [code, fn, browserReloadKey])

  // ─── Console capture ────────────────────────────────────────────────────────
  useEffect(() => {
    const onMsg = (e) => {
      const d = e.data
      if (!d || d.__vsConsole !== true) return
      if (e.source !== browserFrameRef.current?.contentWindow) return
      consoleBufRef.current.push({ level: d.level, text: String(d.text).slice(0, 500) })
      if (consoleFlushRef.current) return
      consoleFlushRef.current = setTimeout(() => {
        consoleFlushRef.current = null
        const batch = consoleBufRef.current.splice(0)
        if (!batch.length) return
        if (batch.some(b => b.level === 'error')) setConsoleOpen(true)
        setConsoleEntries(prev => {
          if (prev.length > 200) return prev
          const merged = [...prev, ...batch.map(b => ({ ...b, id: ++consoleIdRef.current }))]
          return merged.length > 200
            ? [...merged.slice(0, 200), { id: ++consoleIdRef.current, level: 'warn', text: '— output truncated at 200 entries —' }]
            : merged
        })
      }, 60)
    }
    window.addEventListener('message', onMsg)
    return () => {
      window.removeEventListener('message', onMsg)
      clearTimeout(consoleFlushRef.current)
      consoleFlushRef.current = null
    }
  }, [])

  useEffect(() => {
    const el = consoleBodyRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [consoleEntries, consoleOpen])

  // ─── Hotkeys ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        setDrawerOpen(false)
        return
      }
      if (!e.ctrlKey || e.altKey || e.shiftKey || e.metaKey) return
      if (e.key === '`' || e.code === 'Backquote') { e.preventDefault(); setConsoleOpen(o => !o) }
      else if (e.key === 'b' || e.key === 'B') { e.preventDefault(); setBrowserOpen(o => !o) }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [])

  useEffect(() => {
    guideOpenRef.current = browserOpen && browserTab === 'guide'
  }, [browserOpen, browserTab])

  // ─── Idle bleed ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (allDone || fell) { clearInterval(bleedTimerRef.current); return }
    bleedTimerRef.current = setInterval(() => {
      if (guideOpenRef.current || fellRef.current) return
      bleedCountRef.current += 1
      if (bleedCountRef.current > IDLE_BLEED_AFTER) takeDamage(1, 'BROOD BLEED')
    }, 1000)
    return () => clearInterval(bleedTimerRef.current)
  }, [allDone, fell, takeDamage])

  // ─── Panel toggling ─────────────────────────────────────────────────────────
  const togglePanel = useCallback((p) => {
    if (drawerOpen && panel === p) { setDrawerOpen(false); return }
    setPanel(p)
    setDrawerOpen(true)
  }, [drawerOpen, panel])

  // ─── Completion toast + phase transitions + victory ─────────────────────────
  useEffect(() => {
    const severedFns = fnList.filter(f => functions[f.id]?.status === 'severed').map(f => f.id)
    if (prevSeveredRef.current) {
      const fresh = severedFns.filter(fid => !prevSeveredRef.current.has(fid))
      if (fresh.length) {
        const f = FUNCTIONS_BY_ID[fresh[fresh.length - 1]]
        const by = functions[f.id]?.severed_by
        const tid = ++toastIdRef.current
        setSeverToast({ id: tid, glyph: f.glyph, name: f.name, by, byMe: by === myId })
        setTimeout(() => setSeverToast(t => (t?.id === tid ? null : t)), 2600)
        setBossFlash(true)
        clearTimeout(bossFlashRef.current)
        bossFlashRef.current = setTimeout(() => setBossFlash(false), 900)
      }
    }
    prevSeveredRef.current = new Set(severedFns)

    // Phase banners — visual-only
    const phase1Done = completedCount >= 1
    const phase2Done = completedCount >= 2
    if (phase1Done && prevPhaseDoneRef.current[0] === 0) {
      setPhaseBanner({ label: `${FUNCTIONS[0].name} — DEPLOYED`, sub: 'THE PIPELINE OPENS — PHASE II', color: '#f5c453' })
      setTimeout(() => setPhaseBanner(null), 3200)
    }
    if (phase2Done && prevPhaseDoneRef.current[1] === 0) {
      setPhaseBanner({ label: `${FUNCTIONS[1].name} — SECURED`, sub: 'THE CORE STANDS BARE — PHASE III', color: '#ff3d8b' })
      setTimeout(() => setPhaseBanner(null), 3200)
    }
    prevPhaseDoneRef.current = [completedCount >= 1 ? 1 : 0, completedCount >= 2 ? 1 : 0]

    if (allDone && !victoryFiredRef.current) {
      victoryFiredRef.current = true
      onVictory?.()
      setTimeout(() => setShowVictory(true), 1800)
    }
  }, [functions]) // eslint-disable-line react-hooks/exhaustive-deps

  const prevPhaseDoneRef = useRef([0, 0])

  // ─── STRIKE ─────────────────────────────────────────────────────────────────
  const handleStrike = useCallback(() => {
    if (fell || isSevered || !fn) return
    setStrikeKey(k => k + 1)
    bleedCountRef.current = 0
    runChecks((results) => {
      setWardResults(results)
      const struck = struckRef.current[currentFnId] ?? new Set()
      const newly = fn.wards.filter(w => results[w.id] && !struck.has(w.id))
      newly.forEach(w => struck.add(w.id))
      struckRef.current[currentFnId] = struck
      const allPass = fn.wards.every(w => results[w.id])

      if (allPass) {
        setCombo(c => c + newly.length + 1)
        triggerAttack()
        const id = ++dmgIdRef.current
        setDmgFlash({ id, text: `−${FUNCTION_DAMAGE} ${fn.name} COMPLETE`, cls: 'sever' })
        setTimeout(() => setDmgFlash(f => (f?.id === id ? null : f)), 1400)
        clearTimeout(saveTimerRef.current)
        saveCode?.(currentFnId, codeMap[currentFnId] ?? fn.starter)
        onComplete?.(currentFnId)
      } else if (newly.length > 0) {
        setCombo(c => c + newly.length)
        const id = ++dmgIdRef.current
        setDmgFlash({ id, text: `WARD ×${newly.length} DOWN`, cls: 'chip' })
        setTimeout(() => setDmgFlash(f => (f?.id === id ? null : f)), 1100)
      } else {
        setCombo(0)
        triggerAttack()
        takeDamage(STRIKE_FAIL_DMG, 'DEFLECTED')
      }
    })
  }, [fell, isSevered, fn, runChecks, currentFnId, codeMap, onComplete, saveCode, takeDamage])

  // ─── Computed display ────────────────────────────────────────────────────────
  const bossPct = (bossHP / BOSS_HP_MAX) * 100
  const playerPct = (playerHP / PLAYER_HP_MAX) * 100
  const playerLow = playerHP <= 30
  const passedCount = fn.wards.filter(w => wardResults[w.id]).length
  const failCount = fn.wards.length - passedCount
  const editorLanguage = fn.language === 'js' ? 'javascript' : fn.language
  const consoleErrs = consoleEntries.filter(en => en.level === 'error').length
  const consoleWarns = consoleEntries.filter(en => en.level === 'warn').length

  // Who severed each function
  const severCounts = useMemo(() => {
    const counts = {}
    for (const f of fnList) {
      const s = functions[f.id]
      if (s?.status === 'severed' && s.severed_by) counts[s.severed_by] = (counts[s.severed_by] ?? 0) + 1
    }
    return counts
  }, [functions])

  const displayName = profile?.name ?? user?.email ?? 'HUNTER'
  const browserConfig = useMemo(() => ({
    id: `${RAID01.id}/${fn.id}`,
    region: RAID01.region,
    guide: RAID01.guide,
  }), [fn.id])
  const phaseColor = PHASES[fn.phase - 1].color
  const expandedWard = expandedHint ? fn.wards.find(w => w.id === expandedHint) : null

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className={`r1-shell${attacking ? ' r1-under-attack' : ''}`}>

      {/* Top bar */}
      <header className="r1-topbar">
        <button className="r1-back" onClick={onExit}>← WAR ROOM</button>
        {onAbandon && !allDone && (
          <button
            className="r1-back"
            onClick={() => setConfirmAbandon(true)}
            title="Leave this warband for good"
            style={{ color: '#ff3d8b70', borderColor: '#ff3d8b30' }}
          >
            ABANDON
          </button>
        )}
        <div className="r1-topbar-center">
          <span className="r1-raid-tag">{RAID01.code} · {RAID01.title}</span>
          <div className="r1-boss-hp-row">
            <span className="r1-boss-name">{RAID01.boss.name}</span>
            <div className={`r1-boss-hp-track${bossFlash ? ' hit' : ''}`}>
              <div className="r1-boss-hp-fill" style={{ width: `${bossPct}%` }} />
            </div>
            <span className="r1-boss-hp-val">{bossHP} / {BOSS_HP_MAX}</span>
          </div>
        </div>
        <div className="r1-topbar-right">
          <span className="r1-phase-chip" style={{ color: PHASES[currentPhase - 1].color, borderColor: `${PHASES[currentPhase - 1].color}40` }}>
            {PHASES[currentPhase - 1].label}
          </span>
          <span className="r1-party-count">{members.length} IN PARTY</span>
        </div>
      </header>

      <div className="r1-body">

        {/* ── Main column — the editor ── */}
        <div className="r1-main">
          <div className="r1-editor-header">
            <span className="r1-head-mark" style={{ color: phaseColor }}>{fn.glyph}</span>
            <span className="r1-head-title">{fn.name}</span>
            <span className="r1-filename">{fn.filename}</span>
            {myFunctionIds.includes(fn.id) && !isSevered && (
              <span className="r1-domain-tag">YOUR FUNCTION</span>
            )}
            {isSevered && (
              <span className="r1-edit-lock sev">☠ {fn.name} COMPLETE{fnShared.severed_by ? ` — BY ${memberName(fnShared.severed_by)}` : ''}</span>
            )}
            <span className="r1-fn-progress">{completedCount} / {fnList.length} FUNCTIONS</span>
            <span className={`r1-editor-status ${pasteBlocked ? 'flagged' : failCount === 0 ? 'clear' : 'errors'}`}>
              {pasteBlocked ? '✕ PASTE BLOCKED' : isSevered ? '✓ COMPLETE' : failCount === 0 ? '✓ all wards down' : `${failCount} wards holding`}
            </span>
          </div>

          <div className="r1-monaco-wrap" onPasteCapture={onPaste}>
            <Editor
              height="100%"
              language={editorLanguage}
              value={code}
              onChange={handleCodeChange}
              onMount={bindEditor}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                lineHeight: 20,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                fontLigatures: true,
                padding: { top: 10 },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                lineNumbers: 'on',
                renderLineHighlight: 'line',
                readOnly: !canEdit,
              }}
            />
            {dmgFlash && (
              <span key={dmgFlash.id} className={`r1-dmg ${dmgFlash.cls}`}>{dmgFlash.text}</span>
            )}
          </div>

          {/* ── Ward strip ── */}
          <div className="r1-wardbar">
            <span className="r1-wardbar-label">WARDS</span>
            <span className={`r1-scanner-count${failCount === 0 ? ' clear' : ''}`}>
              {isSevered ? 'COMPLETE' : failCount === 0 ? 'ALL GREEN — STRIKE' : `${failCount} HOLDING`}
            </span>
            <div className="r1-chip-row">
              {fn.wards.map(w => (
                <button
                  key={w.id}
                  className={`r1-chip${wardResults[w.id] ? ' pass' : ' fail'}${expandedHint === w.id ? ' expanded' : ''}`}
                  onClick={() => setExpandedHint(expandedHint === w.id ? null : w.id)}
                  title={w.label}
                >
                  <span className="r1-chip-icon">{wardResults[w.id] ? '✓' : '⚠'}</span>
                  <span className="r1-chip-text">{w.label.split(' — ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
          {expandedWard && (
            <div className="r1-ward-pop">
              <div className="r1-ward-pop-head">
                <span className={`r1-ward-icon${wardResults[expandedWard.id] ? ' pass' : ' fail'}`}>
                  {wardResults[expandedWard.id] ? '✓' : '⚠'}
                </span>
                <span className="r1-ward-pop-label">{expandedWard.label}</span>
                <button className="r1-ward-pop-close" onClick={() => setExpandedHint(null)}>✕</button>
              </div>
              <div className={`r1-ward-hint${wardResults[expandedWard.id] ? ' pass' : ''}`}>
                {wardResults[expandedWard.id]
                  ? 'Ward down. STRIKE when the strip is all green.'
                  : expandedWard.hint}
              </div>
            </div>
          )}

          {/* Console */}
          <div className="r1-console">
            <div className="r1-console-strip" onClick={() => setConsoleOpen(o => !o)}>
              <span className="r1-console-caret">{consoleOpen ? '▾' : '▸'}</span>
              <span>CONSOLE</span>
              {consoleErrs > 0 && <span className="r1-console-badge err">{consoleErrs} ✕</span>}
              {consoleWarns > 0 && <span className="r1-console-badge warn">{consoleWarns} ⚠</span>}
              <span className="r1-console-hotkey">CTRL+`</span>
              {consoleOpen && consoleEntries.length > 0 && (
                <button
                  className="r1-console-clear"
                  onClick={(e) => { e.stopPropagation(); consoleBufRef.current.length = 0; setConsoleEntries([]) }}
                >CLEAR</button>
              )}
            </div>
            {consoleOpen && (
              <div className="r1-console-body" ref={consoleBodyRef}>
                {consoleEntries.length === 0 ? (
                  <div className="r1-console-empty">— no output. console.log() from your code lands here —</div>
                ) : consoleEntries.map(en => (
                  <div key={en.id} className={`r1-console-line ${en.level}`}>
                    <span className="r1-console-glyph">{en.level === 'error' ? '✕' : en.level === 'warn' ? '⚠' : '›'}</span>
                    <span>{en.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Strike strip */}
          <div className="r1-strike-strip">
            {!isSevered ? (
              <button
                className={`r1-strike-btn${failCount === 0 && !isSevered ? ' ready' : ''}`}
                onClick={handleStrike}
                disabled={fell || isSevered}
              >
                ▶ STRIKE
              </button>
            ) : (
              <span className="r1-complete-badge">✓ FUNCTION COMPLETE</span>
            )}
            <button
              className={`r1-browser-btn${browserOpen ? ' open' : ''}`}
              onClick={() => setBrowserOpen(o => !o)}
              title="Hunter Browser (Ctrl+B)"
            >⧉</button>
            <div className="r1-strike-bar-wrap">
              {strikeKey > 0 && <div key={strikeKey} className="r1-strike-bar-fill" />}
            </div>
            <span className={`r1-combo${combo >= 3 ? ' active' : ''}`}>{combo >= 3 ? `×${combo}` : ''}</span>
          </div>
        </div>

        {/* ── Docked drawer ── */}
        <aside className={`r1-drawer${drawerOpen ? ' open' : ''}`}>

          {/* ⊞ FUNCTIONS */}
          <section className={`r1-panel${panel === 'function' ? ' active' : ''}`} aria-label="Functions">
            <div className="r1-panel-title">
              <span>⊞ FUNCTION PROGRESSION — {completedCount} / {fnList.length}</span>
              <button className="r1-panel-close" onClick={() => setDrawerOpen(false)} title="Close (Esc)">✕</button>
            </div>
            <div className="r1-panel-scroll">
              {fnList.map(f => {
                const state = functions[f.id] ?? { status: 'open' }
                const sev = state.status === 'severed'
                const isCurrent = f.id === currentFn?.id && !allDone
                const locked = f.seq > (completedCount + 1)
                const owner = ROLES[f.role]
                return (
                  <div
                    key={f.id}
                    className={`r1-fn-row${isCurrent ? ' active' : ''}${sev ? ' done' : ''}${locked ? ' locked' : ''}`}
                    style={owner ? { '--fn-c': owner.color } : undefined}
                  >
                    <span className="r1-fn-dot">{sev ? '✓' : isCurrent ? '▶' : locked ? '⛨' : f.glyph}</span>
                    <span className="r1-fn-name">{f.name}</span>
                    <span className="r1-fn-role" style={{ color: owner?.color }}>
                      {owner?.glyph} {owner?.label ?? '—'}
                    </span>
                    <span className={`r1-fn-status${sev ? ' done' : isCurrent ? ' live' : ''}`}>
                      {sev ? 'DONE' : isCurrent ? 'ACTIVE' : locked ? 'LOCKED' : 'READY'}
                    </span>
                  </div>
                )
              })}

              {/* Current function brief */}
              {fn && !isSevered && (
                <div className="r1-brief">
                  <div className="r1-brief-label">▶ {fn.name}</div>
                  <p className="r1-brief-what">{fn.brief.what}</p>
                  <div className="r1-brief-line"><span>SKILL</span>{fn.brief.skill}</div>
                  <div className="r1-brief-line"><span>OBJECTIVE</span>{fn.brief.objective}</div>
                  {fn.brief.stages && (
                    <div className="r1-brief-stages">
                      <div className="r1-brief-label">PROGRESSION</div>
                      {fn.brief.stages.map((s, i) => (
                        <div key={i} className="r1-brief-stage">
                          <span className="r1-brief-stage-label">{s.label}</span>
                          <span className="r1-brief-stage-time">{s.time}</span>
                          <span className="r1-brief-stage-desc">{s.desc}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* ◎ BOSS */}
          <section className={`r1-panel${panel === 'boss' ? ' active' : ''}`} aria-label="Boss">
            <div className="r1-panel-title">
              <span>◎ VARKUL — LIVE READOUT</span>
              <button className="r1-panel-close" onClick={() => setDrawerOpen(false)} title="Close (Esc)">✕</button>
            </div>
            <div className="r1-panel-scroll">
              <div className={`r1-boss-scene${attacking ? ' boss-attack' : ''}`}>
                <RaidBossVarkul
                  headStates={headStates}
                  targetId={null}
                  phase={currentPhase}
                  dead={allDone}
                  attacking={attacking}
                  frame
                  hp={bossHP}
                  hpMax={BOSS_HP_MAX}
                />
              </div>
              <div className="r1-boss-readout">
                <div className="r1-readout-hp">
                  <span className="r1-readout-hp-num">{bossHP}</span>
                  <span className="r1-readout-hp-max">/ {BOSS_HP_MAX} HP</span>
                </div>
                <div className="r1-readout-pips">
                  {fnList.map(f => (
                    <span
                      key={f.id}
                      className={`r1-pip${functions[f.id]?.status === 'severed' ? ' cut' : ''}`}
                      style={{ '--pip-c': ROLES[f.role]?.color ?? '#3df0e8' }}
                      title={f.name}
                    />
                  ))}
                </div>
                <div className="r1-readout-row">
                  <span className="r1-readout-neck" style={{ color: PHASES[0].color }}>{PHASES[0].label}</span>
                  <span className={`r1-readout-state${completedCount >= 1 ? ' done' : ''}`}>
                    {completedCount >= 1 ? 'DONE' : currentFn?.phase === 1 ? 'ACTIVE' : 'PENDING'}
                  </span>
                </div>
                <div className="r1-readout-row">
                  <span className="r1-readout-neck" style={{ color: PHASES[1].color }}>{PHASES[1].label}</span>
                  <span className={`r1-readout-state${completedCount >= 2 ? ' done' : completedCount >= 1 && currentFn?.phase === 2 ? ' active' : ''}`}>
                    {completedCount >= 2 ? 'DONE' : completedCount >= 1 && currentFn?.phase === 2 ? 'ACTIVE' : completedCount >= 1 ? 'READY' : 'LOCKED'}
                  </span>
                </div>
                <div className="r1-readout-row">
                  <span className="r1-readout-neck" style={{ color: PHASES[2].color }}>{PHASES[2].label}</span>
                  <span className={`r1-readout-state${completedCount === fnList.length ? ' done' : completedCount >= 2 ? ' active' : ''}`}>
                    {completedCount === fnList.length ? 'DONE' : completedCount >= 2 ? `${completedCount - 2} / 3` : 'LOCKED'}
                  </span>
                </div>
                <div className="r1-readout-note">
                  Boss HP is shared — completing a function deals −{FUNCTION_DAMAGE} for the whole warband.
                </div>
              </div>
            </div>
          </section>

          {/* ⚑ PARTY */}
          <section className={`r1-panel${panel === 'party' ? ' active' : ''}`} aria-label="Party">
            <div className="r1-panel-title">
              <span>⚑ WARBAND — {members.length} HUNTER{members.length === 1 ? '' : 'S'}</span>
              <button className="r1-panel-close" onClick={() => setDrawerOpen(false)} title="Close (Esc)">✕</button>
            </div>
            <div className="r1-panel-scroll party">
              <div className="r1-party">
                {Array.from(
                  members.reduce((map, m) => {
                    if (!map.has(m.user_id)) map.set(m.user_id, [])
                    const r = ROLES[m.role]
                    if (r) map.get(m.user_id).push(r)
                    return map
                  }, new Map())
                ).map(([uid, roles]) => {
                  const name = members.find(m => m.user_id === uid)?.name ?? 'HUNTER'
                  const isMe = uid === myId
                  return (
                    <div key={uid} className={`r1-party-row${isMe ? ' me' : ''}`}>
                      <span className="r1-party-glyph" style={{ color: roles[0]?.color ?? '#3df0e8' }}>{roles[0]?.glyph ?? '·'}</span>
                      <span className="r1-party-name">{isMe ? `${name} (YOU)` : name}</span>
                      <span className="r1-party-roles">
                        {roles.map(r => {
                          const f = FUNCTIONS_BY_ROLE[r.id]
                          return (
                            <span key={r.id} className="r1-party-role-badge" style={{ '--role-c': r.color }}>
                              {r.glyph} {r.label}{f ? ` (F${f.seq})` : ''}
                            </span>
                          )
                        })}
                      </span>
                      <span className="r1-party-severs">{severCounts[uid] ?? 0} ✦</span>
                    </div>
                  )
                })}
              </div>
              <div className="r1-feed">
                <div className="r1-panel-head">GATE FEED</div>
                <div className="r1-feed-body">
                  {events.length === 0 && <div className="r1-feed-empty">— the Gate is quiet —</div>}
                  {events.slice(0, 40).map((e, i) => (
                    <div key={e.id ?? i} className={`r1-feed-line t-${e.type}`}>{e.label}</div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </aside>

        {/* ── Attack corruption overlay ── */}
        {attacking && <div className="r1-attack-overlay" />}

        {/* ── Dock ── */}
        <nav className="r1-dock" aria-label="Combat panels">
          {[
            { id: 'function', icon: '⊞', label: 'FUNCTIONS' },
            { id: 'boss',     icon: '◎', label: 'BOSS' },
            { id: 'party',    icon: '⚑', label: 'PARTY' },
          ].map(t => (
            <button
              key={t.id}
              className={`r1-dock-btn${drawerOpen && panel === t.id ? ' active' : ''}`}
              onClick={() => togglePanel(t.id)}
              title={`${t.label} panel`}
            >
              <span className="r1-dock-icon">{t.icon}</span>
              <span className="r1-dock-label">{t.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Bottom HUD */}
      <div className="r1-hud">
        <span className="r1-hud-identity">
          {displayName}
          {myRoles.length > 0 && (
            <span className="r1-hud-role">
              {myRoles.map(r => (
                <span key={r.id} style={{ color: r.color }}> {r.glyph} {r.label}</span>
              ))}
            </span>
          )}
        </span>
        <div className="r1-hud-hp-wrap">
          <span className={`r1-hud-hp-label${playerLow ? ' low' : ''}`}>HUNTER HP</span>
          <div className="r1-hud-hp-track">
            <div className={`r1-hud-hp-fill${playerLow ? ' low' : ''}`} style={{ width: `${playerPct}%` }} />
          </div>
          <span className="r1-hud-hp-val">{playerHP}/{PLAYER_HP_MAX}</span>
        </div>
        <div className="r1-hud-region">{RAID01.region}</div>
        <button className="r1-surrender-btn" onClick={() => setConfirmSurrender(true)} title="Give up / force finish">
          ✕ SURRENDER
        </button>
        <div className="r1-hud-right">● VERA ON · FEED LIVE</div>
      </div>

      {/* Hunter Browser */}
      <div className="r1-browser-anchor">
        <HunterBrowser
          config={browserConfig}
          open={browserOpen}
          tab={browserTab}
          onTab={setBrowserTab}
          onClose={() => setBrowserOpen(false)}
          onReload={() => setBrowserReloadKey(k => k + 1)}
          frameRef={browserFrameRef}
        />
      </div>

      {/* Offscreen check iframe */}
      <iframe
        ref={checkIframeRef}
        title="raid check"
        style={{
          position: 'absolute', left: '-99999px', top: 0,
          width: '1100px', height: '800px',
          border: 0, pointerEvents: 'none', visibility: 'hidden',
        }}
        sandbox="allow-scripts allow-same-origin"
      />

      {/* Sever toast */}
      {severToast && (
        <div key={severToast.id} className="r1-sever-toast">
          <span className="r1-sever-toast-glyph">{severToast.glyph}</span>
          <span className="r1-sever-toast-name">{severToast.name} — COMPLETE</span>
          <span className="r1-sever-toast-by">
            VARKUL −{FUNCTION_DAMAGE}{severToast.byMe ? ' · YOUR CUT' : ` · ${memberName(severToast.by)}`}
          </span>
        </div>
      )}

      {/* Phase banner */}
      {phaseBanner && (
        <div className="r1-phase-banner" style={{ '--pb-color': phaseBanner.color }}>
          <div className="r1-phase-banner-label">{phaseBanner.label}</div>
          <div className="r1-phase-banner-sub">{phaseBanner.sub}</div>
        </div>
      )}

      {/* Fell overlay */}
      {fell && (
        <div className="r1-fell-overlay">
          <div className="r1-fell-inner">
            <div className="r1-fell-title">HUNTER DOWN</div>
            <div className="r1-fell-sub">VERA // HANDLER</div>
            <p className="r1-fell-text">
              The brood dragged you back to the Gate mouth. Your code stands, every completed function stays
              complete — only your wind is gone. Get up.
            </p>
            <button className="r1-fell-btn" onClick={handleRespawn}>RESPAWN AT THE GATE</button>
          </div>
        </div>
      )}

      {/* Step away — the fight keeps running, you keep your place in the party */}
      {confirmSurrender && (
        <div className="r1-surrender-overlay">
          <div className="r1-surrender-modal">
            <div className="r1-surrender-title">STEP AWAY?</div>
            <p className="r1-surrender-text">
              The Broodgate stays open and your warband keeps fighting. Your code is saved and
              every function already paid out stays paid — walk back in whenever you want.
            </p>
            <div className="r1-surrender-actions">
              <button className="r1-surrender-cancel" onClick={() => setConfirmSurrender(false)}>CANCEL</button>
              <button className="r1-surrender-confirm" onClick={onExit}>STEP AWAY</button>
            </div>
          </div>
        </div>
      )}

      {/* Abandon — actually leaves the warband. Without this a stalled party is
          locked out of raiding forever, because every member is reattached to
          their live raid on load. */}
      {confirmAbandon && (
        <div className="r1-surrender-overlay">
          <div className="r1-surrender-modal">
            <div className="r1-surrender-title">ABANDON THE RAID?</div>
            <p className="r1-surrender-text">
              You leave the warband for good. Your {ENTRY_COST} $SHARD entry is <strong>not</strong> refunded —
              the Gate is already open — but functions that have paid out stay paid. Do this if your
              party has gone dark and you want to raid again.
            </p>
            <div className="r1-surrender-actions">
              <button className="r1-surrender-cancel" onClick={() => setConfirmAbandon(false)}>STAY</button>
              <button className="r1-surrender-confirm" onClick={() => { setConfirmAbandon(false); onAbandon?.() }}>
                ABANDON
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Victory overlay */}
      {showVictory && (
        <div className="r1-victory-overlay">
          <div className="r1-victory-inner">
            <div className="r1-victory-tag">HERALD SLAIN</div>
            <div className="r1-victory-boss">{RAID01.boss.name}</div>
            <div className="r1-victory-defeated">DEFEATED</div>
            <p className="r1-victory-note">
              All five functions deployed. The hydra's heart of static gutters and dies. First confirmed herald
              kill in Association history. Somewhere far above, in a tower of black glass, something with too
              much blood pauses mid-slaughter — and smiles.
            </p>
            <div className="r1-victory-rewards">
              <div className="r1-victory-reward"><span>1000 XP</span><label>FULL-CLEAR TOTAL</label></div>
              <div className="r1-victory-reward"><span>4000</span><label>$SHARD EACH</label></div>
              <div className="r1-victory-reward"><span>5 / 5</span><label>FUNCTIONS COMPLETE</label></div>
            </div>
            <div className="r1-victory-chip">PAYOUTS CLEARED AUTOMATICALLY — CHECK YOUR LEDGER</div>
            <button className="r1-victory-btn" onClick={onExit}>RETURN TO THE WAR ROOM</button>
          </div>
        </div>
      )}
    </div>
  )
}

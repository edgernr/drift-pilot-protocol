import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import Editor from '@monaco-editor/react'
import { useAuth } from '../context/AuthContext'
import { useQuestAnalytics } from '../hooks/useQuestAnalytics'
import HunterBrowser from './HunterBrowser'
import RaidBossVarkul from './RaidBossVarkul'
import { CONSOLE_HOOK } from '../lib/consoleHook'
import {
  RAID01, HEADS, HEADS_BY_ID, PHASES, ROLES,
  BOSS_HP_MAX, HEAD_DAMAGE, PLAYER_HP_MAX, STRIKE_FAIL_DMG, IDLE_BLEED_AFTER,
} from '../data/raids/raid01'
import './Raid01Combat.css'

// ── RAID 01 combat shell ──────────────────────────────────────────────────────
// Session-agnostic: all shared state (heads, members, events) and all writes
// (claim / sever / code persistence) come through props, so the live Supabase
// session (Raid01.jsx) and the offline solver harness (/__raidsolver) drive the
// exact same component. Personal combat (HP / combo / bleed) is local.
//
// Layout: EDITOR-FIRST. The editor owns the main area; heads / boss / party
// live in a docked drawer opened from a vertical icon strip (IDE idiom).
// All three panels stay MOUNTED at all times (drawer visibility is pure CSS)
// so the headless solver's selectors (.r1-head-row etc.) always exist in the
// DOM. Wards ride a permanent chip strip under the editor; CLAIM / STRIKE
// live in the always-visible strike strip.
//
// Rules (CLAUDE.md combat defaults):
//   sever a head        → shared −111 boss HP (the only real boss damage)
//   deflected STRIKE    → personal −15 (nothing new passed)
//   idle past 90s       → personal −1/s (reading the Field Manual pauses this)
//   fall at 0           → respawn at the Gate: HP restored, combo reset,
//                          code + severed heads untouched
//
// Ward tests run top-to-bottom on one rendered doc per evaluation — H8 depends
// on that order (its wards click sequentially). Do not parallelize.

export default function Raid01Combat({
  heads,          // { h1: { status, claimed_by, severed_by }, ... }
  members,        // [{ user_id, name, role }]
  myId,
  events,         // [{ id, type, label, created_at }] newest first
  onClaim,        // (headId) => void
  onSever,        // (headId) => Promise|void
  onEvent,        // (type, label) => void  (flavor feed posts)
  loadCode,       // (headId) => Promise<string|null>
  saveCode,       // (headId, content) => void
  onVictory,      // () => void — fired once when the 9th head falls
  onExit,         // () => void
}) {
  const { profile, user } = useAuth()
  const { onPaste, bindEditor, onCodeChange, pasteBlocked } = useQuestAnalytics()

  // ─── Shared-state derivations ────────────────────────────────────────────────
  const severedCount = HEADS.filter(h => heads[h.id]?.status === 'severed').length
  const bossHP = Math.max(0, BOSS_HP_MAX - severedCount * HEAD_DAMAGE)
  const phaseDone = (n) => HEADS.filter(h => h.phase === n).every(h => heads[h.id]?.status === 'severed')
  const currentPhase = phaseDone(1) ? (phaseDone(2) ? 3 : 2) : 1
  const allDead = severedCount === HEADS.length
  const headStates = useMemo(() => Object.fromEntries(
    HEADS.map(h => [h.id, heads[h.id]?.status ?? 'open'])
  ), [heads])
  const memberName = useCallback(
    (id) => members.find(m => m.user_id === id)?.name ?? 'HUNTER',
    [members]
  )

  // My specialization — soft guidance only. Slayer / legacy roles → no domain.
  const myRole = ROLES[members.find(m => m.user_id === myId)?.role] ?? null
  const myNeck = myRole?.neck ?? null

  // ─── Local state ─────────────────────────────────────────────────────────────
  const firstOpen = HEADS.find(h => h.phase === currentPhase && heads[h.id]?.status !== 'severed')?.id ?? 'h1'
  const [currentHeadId, setCurrentHeadId] = useState(firstOpen)
  const [codeMap, setCodeMap] = useState({})           // headId -> editor code
  const [wardResults, setWardResults] = useState({})
  const [expandedHint, setExpandedHint] = useState(null)
  const [playerHP, setPlayerHP] = useState(PLAYER_HP_MAX)
  const [combo, setCombo] = useState(0)
  const [fell, setFell] = useState(false)
  const [strikeKey, setStrikeKey] = useState(0)
  const [dmgFlash, setDmgFlash] = useState(null)       // {id, text, cls}
  const [phaseBanner, setPhaseBanner] = useState(null)
  const [showVictory, setShowVictory] = useState(false)
  const [browserOpen, setBrowserOpen] = useState(false)
  const [browserTab, setBrowserTab] = useState('instance')
  const [browserReloadKey, setBrowserReloadKey] = useState(0)
  const [consoleOpen, setConsoleOpen] = useState(false)
  const [consoleEntries, setConsoleEntries] = useState([])
  const [panel, setPanel] = useState('heads')          // heads | boss | party
  const [drawerOpen, setDrawerOpen] = useState(true)   // HEADS open on entry — pick a target
  const [severToast, setSeverToast] = useState(null)   // {id, glyph, name, by, byMe}
  const [bossFlash, setBossFlash] = useState(false)

  // ─── Refs ────────────────────────────────────────────────────────────────────
  const checkIframeRef   = useRef(null)
  const browserFrameRef  = useRef(null)
  const struckRef        = useRef({})     // headId -> Set(wardId) already struck
  const bleedTimerRef    = useRef(null)
  const bleedCountRef    = useRef(0)
  const saveTimerRef     = useRef(null)
  const loadedRef        = useRef(new Set())
  const consoleBufRef    = useRef([])
  const consoleFlushRef  = useRef(null)
  const consoleIdRef     = useRef(0)
  const consoleBodyRef   = useRef(null)
  const guideOpenRef     = useRef(false)
  const dmgIdRef         = useRef(0)
  const fellRef          = useRef(false)
  const victoryFiredRef  = useRef(false)
  const prevPhaseDoneRef = useRef({ 1: phaseDone(1), 2: phaseDone(2) })
  const prevSeveredRef   = useRef(null)   // null until first heads pass — no toast for history
  const toastIdRef       = useRef(0)
  const bossFlashRef     = useRef(null)

  const head = HEADS_BY_ID[currentHeadId]
  const headShared = heads[currentHeadId] ?? { status: 'open' }
  const claimedByMe = headShared.claimed_by === myId
  const claimedByOther = headShared.status === 'claimed' && !claimedByMe
  const isSevered = headShared.status === 'severed'
  const canEdit = claimedByMe && !isSevered && !fell
  const code = codeMap[currentHeadId] ?? head.starter

  // ─── Personal damage helper ──────────────────────────────────────────────────
  const takeDamage = useCallback((amount, why) => {
    if (fellRef.current) return
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
  }, [onEvent, profile?.name])

  const handleRespawn = useCallback(() => {
    fellRef.current = false
    setFell(false)
    setPlayerHP(PLAYER_HP_MAX)
    bleedCountRef.current = 0
  }, [])

  // ─── Load stored code on head switch ─────────────────────────────────────────
  // No stale-cancellation on purpose: StrictMode replays this effect, and a
  // cleanup flag would discard the only resolution while the ref guard blocks
  // the retry. Double-resolution is harmless — local edits win via the
  // functional update, and marking loaded happens only after resolve.
  useEffect(() => {
    if (loadedRef.current.has(currentHeadId)) return
    const headId = currentHeadId
    Promise.resolve(loadCode?.(headId)).then(stored => {
      loadedRef.current.add(headId)
      if (stored == null) return
      setCodeMap(prev => (prev[headId] != null ? prev : { ...prev, [headId]: stored }))
    })
  }, [currentHeadId, loadCode])

  // ─── Ward evaluation (offscreen rendered iframe, debounced) ──────────────────
  const runChecks = useCallback((afterResults) => {
    const iframe = checkIframeRef.current
    if (!iframe) return
    const h = HEADS_BY_ID[currentHeadId]
    const currentCode = codeMap[currentHeadId] ?? h.starter
    iframe.srcdoc = h.buildCheckDoc(currentCode)
    iframe.onload = () => {
      requestAnimationFrame(() => {
        const doc = iframe.contentDocument
        const win = iframe.contentWindow
        if (!doc || !win) return
        const results = {}
        // Sequential on purpose — H8's wards mutate the doc in order.
        h.wards.forEach(w => {
          try { results[w.id] = w.test(doc, win, currentCode) } catch { results[w.id] = false }
        })
        afterResults?.(results)
      })
    }
  }, [currentHeadId, codeMap])

  useEffect(() => {
    const t = setTimeout(() => runChecks(setWardResults), 350)
    return () => clearTimeout(t)
  }, [runChecks])

  // Reset ward display when switching heads
  useEffect(() => { setWardResults({}); setExpandedHint(null) }, [currentHeadId])

  // ─── Code change → local map + debounced shared save ─────────────────────────
  const handleCodeChange = useCallback((val, ev) => {
    const v = val ?? ''
    onCodeChange(v, ev)
    setCodeMap(prev => ({ ...prev, [currentHeadId]: v }))
    bleedCountRef.current = 0
    clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => saveCode?.(currentHeadId, v), 1200)
  }, [currentHeadId, onCodeChange, saveCode])

  useEffect(() => () => clearTimeout(saveTimerRef.current), [])

  // ─── Hunter Browser srcdoc + console clear ───────────────────────────────────
  useEffect(() => {
    if (!browserFrameRef.current) return
    consoleBufRef.current.length = 0
    setConsoleEntries(prev => (prev.length ? [] : prev))
    browserFrameRef.current.srcdoc = CONSOLE_HOOK + head.buildPreview(code)
  }, [code, head, browserReloadKey])

  // ─── Console capture (same contract as ArenaShell) ───────────────────────────
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

  // ─── Hotkeys ─────────────────────────────────────────────────────────────────
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

  // ─── Idle bleed — the brood feeds on stillness ───────────────────────────────
  useEffect(() => {
    if (allDead || fell) { clearInterval(bleedTimerRef.current); return }
    bleedTimerRef.current = setInterval(() => {
      if (guideOpenRef.current || fellRef.current) return
      bleedCountRef.current += 1
      if (bleedCountRef.current > IDLE_BLEED_AFTER) takeDamage(1, 'BROOD BLEED')
    }, 1000)
    return () => clearInterval(bleedTimerRef.current)
  }, [allDead, fell, takeDamage])

  // ─── Panel toggling (IDE dock idiom) ─────────────────────────────────────────
  const togglePanel = useCallback((p) => {
    if (drawerOpen && panel === p) { setDrawerOpen(false); return }
    setPanel(p)
    setDrawerOpen(true)
  }, [drawerOpen, panel])

  // Claim locks the target — clear the field so the editor owns the screen.
  const handleClaimClick = useCallback(() => {
    onClaim?.(currentHeadId)
    setDrawerOpen(false)
  }, [onClaim, currentHeadId])

  // ─── Sever toast + phase transitions + victory ───────────────────────────────
  useEffect(() => {
    // Sever moment — felt even with every panel closed: toast + boss bar flash.
    const severedIds = HEADS.filter(h => heads[h.id]?.status === 'severed').map(h => h.id)
    if (prevSeveredRef.current) {
      const fresh = severedIds.filter(hid => !prevSeveredRef.current.has(hid))
      if (fresh.length) {
        const h = HEADS_BY_ID[fresh[fresh.length - 1]]
        const by = heads[h.id]?.severed_by
        const tid = ++toastIdRef.current
        setSeverToast({ id: tid, glyph: h.glyph, name: h.name, by, byMe: by === myId })
        setTimeout(() => setSeverToast(t => (t?.id === tid ? null : t)), 2600)
        setBossFlash(true)
        clearTimeout(bossFlashRef.current)
        bossFlashRef.current = setTimeout(() => setBossFlash(false), 900)
        // My kill and heads remain → reopen HEADS to pick the next target.
        if (fresh.some(hid => heads[hid]?.severed_by === myId) && severedIds.length < HEADS.length) {
          setPanel('heads')
          setDrawerOpen(true)
        }
      }
    }
    prevSeveredRef.current = new Set(severedIds)

    const p1 = phaseDone(1); const p2 = phaseDone(2)
    if (p1 && !prevPhaseDoneRef.current[1]) {
      setPhaseBanner({ label: 'STRUCTURE NECK FALLS', sub: 'THE SKIN IS EXPOSED — PHASE II', color: '#f5c453' })
      setTimeout(() => setPhaseBanner(null), 3200)
    }
    if (p2 && !prevPhaseDoneRef.current[2]) {
      setPhaseBanner({ label: 'SKIN NECK FALLS', sub: 'THE NERVES ARE BARE — PHASE III', color: '#ff3d8b' })
      setTimeout(() => setPhaseBanner(null), 3200)
    }
    prevPhaseDoneRef.current = { 1: p1, 2: p2 }
    if (allDead && !victoryFiredRef.current) {
      victoryFiredRef.current = true
      onVictory?.()
      setTimeout(() => setShowVictory(true), 1800)
    }
    // Auto-advance selection off a severed head to the next open one
    if (heads[currentHeadId]?.status === 'severed' && !allDead) {
      const next = HEADS.find(h => h.phase === currentPhase && heads[h.id]?.status !== 'severed')
      if (next) setCurrentHeadId(next.id)
    }
  }, [heads]) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── STRIKE ──────────────────────────────────────────────────────────────────
  const handleStrike = useCallback(() => {
    if (fell || isSevered || !claimedByMe) return
    setStrikeKey(k => k + 1)
    bleedCountRef.current = 0
    runChecks((results) => {
      setWardResults(results)
      const h = HEADS_BY_ID[currentHeadId]
      const struck = struckRef.current[currentHeadId] ?? new Set()
      const newly = h.wards.filter(w => results[w.id] && !struck.has(w.id))
      newly.forEach(w => struck.add(w.id))
      struckRef.current[currentHeadId] = struck
      const allPass = h.wards.every(w => results[w.id])

      if (allPass) {
        setCombo(c => c + newly.length + 1)
        const id = ++dmgIdRef.current
        setDmgFlash({ id, text: `−${HEAD_DAMAGE} SEVERED`, cls: 'sever' })
        setTimeout(() => setDmgFlash(f => (f?.id === id ? null : f)), 1400)
        // Persist final code immediately, then the sever itself.
        clearTimeout(saveTimerRef.current)
        saveCode?.(currentHeadId, codeMap[currentHeadId] ?? h.starter)
        onSever?.(currentHeadId)
      } else if (newly.length > 0) {
        setCombo(c => c + newly.length)
        const id = ++dmgIdRef.current
        setDmgFlash({ id, text: `WARD ×${newly.length} DOWN`, cls: 'chip' })
        setTimeout(() => setDmgFlash(f => (f?.id === id ? null : f)), 1100)
      } else {
        setCombo(0)
        takeDamage(STRIKE_FAIL_DMG, 'DEFLECTED')
      }
    })
  }, [fell, isSevered, claimedByMe, runChecks, currentHeadId, codeMap, onSever, saveCode, takeDamage])

  // ─── Computed display ────────────────────────────────────────────────────────
  const bossPct = (bossHP / BOSS_HP_MAX) * 100
  const playerPct = (playerHP / PLAYER_HP_MAX) * 100
  const playerLow = playerHP <= 30
  const passedCount = head.wards.filter(w => wardResults[w.id]).length
  const failCount = head.wards.length - passedCount
  const editorLanguage = head.language === 'js' ? 'javascript' : head.language
  const consoleErrs = consoleEntries.filter(en => en.level === 'error').length
  const consoleWarns = consoleEntries.filter(en => en.level === 'warn').length
  const severCounts = useMemo(() => {
    const counts = {}
    for (const h of HEADS) {
      const s = heads[h.id]
      if (s?.status === 'severed' && s.severed_by) counts[s.severed_by] = (counts[s.severed_by] ?? 0) + 1
    }
    return counts
  }, [heads])
  const displayName = profile?.name ?? user?.email ?? 'HUNTER'
  const browserConfig = useMemo(() => ({
    id: `${RAID01.id}/${head.id}`,
    region: RAID01.region,
    guide: RAID01.guide,
  }), [head.id])
  const phaseColor = PHASES[head.phase - 1].color
  const expandedWard = expandedHint ? head.wards.find(w => w.id === expandedHint) : null

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="r1-shell">

      {/* Top bar — boss HP is the headline, permanently visible */}
      <header className="r1-topbar">
        <button className="r1-back" onClick={onExit}>← WAR ROOM</button>
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

        {/* ── Main column — the editor owns the field ── */}
        <div className="r1-main">
          <div className="r1-editor-header">
            <span className="r1-head-mark" style={{ color: phaseColor }}>{head.glyph}</span>
            <span className="r1-head-title">{head.name}</span>
            <span className="r1-filename">{head.filename}</span>
            {myNeck === head.phase && !isSevered && (
              <span className="r1-domain-tag" style={{ color: myRole.color, borderColor: `${myRole.color}45` }}>YOUR DOMAIN</span>
            )}
            {!canEdit && !isSevered && (
              <span className="r1-edit-lock">
                {claimedByOther ? `⛨ CLAIMED BY ${memberName(headShared.claimed_by)}` : 'CLAIM THIS HEAD TO ENGAGE'}
              </span>
            )}
            {isSevered && <span className="r1-edit-lock sev">☠ SEVERED{headShared.severed_by ? ` — BY ${memberName(headShared.severed_by)}` : ''}</span>}
            <span className={`r1-editor-status ${pasteBlocked ? 'flagged' : failCount === 0 ? 'clear' : 'errors'}`}>
              {pasteBlocked ? '✕ PASTE BLOCKED — type it, Hunter' : failCount === 0 ? '✓ all wards down' : `${failCount} wards holding`}
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

          {/* ── Ward strip — always visible, never eats editor width ── */}
          <div className="r1-wardbar">
            <span className="r1-wardbar-label">WARDS</span>
            <span className={`r1-scanner-count${failCount === 0 ? ' clear' : ''}`}>
              {isSevered ? 'SEVERED' : failCount === 0 ? 'ALL GREEN — STRIKE' : `${failCount} HOLDING`}
            </span>
            <div className="r1-chip-row">
              {head.wards.map(w => (
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
                  ? 'Ward down. It stays down as long as your code holds — STRIKE when the strip is all green.'
                  : expandedWard.hint}
              </div>
            </div>
          )}

          {/* IDE console — same idiom as the gates */}
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

          {/* Strike strip — CLAIM / STRIKE always reachable, panels or not */}
          <div className="r1-strike-strip">
            {!claimedByMe && !isSevered ? (
              <button
                className="r1-claim-btn"
                disabled={claimedByOther || fell}
                onClick={handleClaimClick}
              >
                {claimedByOther ? '⛨ CONTESTED' : '⚑ CLAIM HEAD'}
              </button>
            ) : (
              <button
                className={`r1-strike-btn${failCount === 0 && !isSevered ? ' ready' : ''}`}
                onClick={handleStrike}
                disabled={fell || isSevered}
              >
                ▶ STRIKE
              </button>
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

        {/* ── Docked drawer — all panels stay mounted; CSS controls visibility ── */}
        <aside className={`r1-drawer${drawerOpen ? ' open' : ''}`}>

          {/* ⌖ HEADS */}
          <section className={`r1-panel${panel === 'heads' ? ' active' : ''}`} aria-label="Heads">
            <div className="r1-panel-title">
              <span>⌖ THE NINE HEADS</span>
              <button className="r1-panel-close" onClick={() => setDrawerOpen(false)} title="Close (Esc)">✕</button>
            </div>
            <div className="r1-panel-scroll">
              {PHASES.map(p => {
                const locked = p.n > currentPhase
                const isDomain = myNeck === p.n
                return (
                  <div key={p.n} className={`r1-phase-group${locked ? ' locked' : ''}`}>
                    <div className="r1-phase-head" style={{ color: p.color }}>
                      <span>{p.label}</span>
                      <span className="r1-phase-head-tags">
                        {isDomain && (
                          <span className="r1-domain-mini" style={{ color: myRole.color, borderColor: `${myRole.color}45` }}>
                            YOUR DOMAIN
                          </span>
                        )}
                        {locked && <span className="r1-lock">SEALED</span>}
                      </span>
                    </div>
                    {HEADS.filter(h => h.phase === p.n).map(h => {
                      const s = heads[h.id] ?? { status: 'open' }
                      const sev = s.status === 'severed'
                      const mine = s.claimed_by === myId && !sev
                      return (
                        <button
                          key={h.id}
                          className={`r1-head-row${currentHeadId === h.id ? ' active' : ''}${sev ? ' severed' : ''}${isDomain && !sev ? ' domain' : ''}`}
                          style={isDomain && !sev ? { '--domain-c': myRole.color } : undefined}
                          disabled={locked}
                          onClick={() => setCurrentHeadId(h.id)}
                        >
                          <span className="r1-head-glyph">{h.glyph}</span>
                          <span className="r1-head-name">{h.name}</span>
                          <span className={`r1-head-state${sev ? ' sev' : mine ? ' mine' : s.status === 'claimed' ? ' other' : ''}`}>
                            {sev ? 'SEVERED' : mine ? 'YOURS' : s.status === 'claimed' ? memberName(s.claimed_by) : 'OPEN'}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )
              })}

              {/* Selected head briefing */}
              <div className="r1-brief">
                <div className="r1-brief-label">▶ {head.name}</div>
                <p className="r1-brief-what">{head.brief.what}</p>
                <div className="r1-brief-line"><span>SKILL</span>{head.brief.skill}</div>
                <div className="r1-brief-line"><span>OBJECTIVE</span>{head.brief.objective}</div>
              </div>
            </div>
          </section>

          {/* ◎ BOSS */}
          <section className={`r1-panel${panel === 'boss' ? ' active' : ''}`} aria-label="Boss">
            <div className="r1-panel-title">
              <span>◎ VARKUL — LIVE READOUT</span>
              <button className="r1-panel-close" onClick={() => setDrawerOpen(false)} title="Close (Esc)">✕</button>
            </div>
            <div className="r1-panel-scroll">
              <div className="r1-boss-scene">
                <RaidBossVarkul
                  headStates={headStates}
                  targetId={currentHeadId}
                  phase={currentPhase}
                  dead={allDead}
                />
              </div>
              <div className="r1-boss-readout">
                <div className="r1-readout-hp">
                  <span className="r1-readout-hp-num">{bossHP}</span>
                  <span className="r1-readout-hp-max">/ {BOSS_HP_MAX} HP</span>
                </div>
                <div className="r1-readout-pips">
                  {HEADS.map(h => (
                    <span
                      key={h.id}
                      className={`r1-pip${heads[h.id]?.status === 'severed' ? ' cut' : ''}`}
                      style={{ '--pip-c': PHASES[h.phase - 1].color }}
                      title={h.name}
                    />
                  ))}
                </div>
                {PHASES.map(p => {
                  const cut = HEADS.filter(h => h.phase === p.n && heads[h.id]?.status === 'severed').length
                  return (
                    <div key={p.n} className="r1-readout-row">
                      <span className="r1-readout-neck" style={{ color: p.color }}>{p.label}</span>
                      <span className={`r1-readout-state${cut === 3 ? ' done' : p.n > currentPhase ? ' sealed' : ''}`}>
                        {cut === 3 ? 'SEVERED' : p.n > currentPhase ? 'SEALED' : `${cut} / 3`}
                      </span>
                    </div>
                  )
                })}
                <div className="r1-readout-note">
                  Boss HP is shared — every sever lands −{HEAD_DAMAGE} for the whole warband.
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
                {members.map(m => {
                  const r = ROLES[m.role]
                  return (
                    <div key={m.user_id} className={`r1-party-row${m.user_id === myId ? ' me' : ''}`}>
                      <span className="r1-party-glyph" style={{ color: r?.color ?? '#3df0e8' }}>{r?.glyph ?? '·'}</span>
                      <span className="r1-party-name">{m.user_id === myId ? `${m.name} (YOU)` : m.name}</span>
                      <span className="r1-party-role" style={{ color: r ? `${r.color}b0` : undefined }}>{r?.label ?? 'HUNTER'}</span>
                      <span className="r1-party-severs">{severCounts[m.user_id] ?? 0} ✂</span>
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

        {/* ── Dock — slim vertical icon strip ── */}
        <nav className="r1-dock" aria-label="Combat panels">
          {[
            { id: 'heads', icon: '⌖', label: 'HEADS' },
            { id: 'boss',  icon: '◎', label: 'BOSS' },
            { id: 'party', icon: '⚑', label: 'PARTY' },
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

      {/* Bottom HUD — personal HP */}
      <div className="r1-hud">
        <span className="r1-hud-identity">
          {displayName}
          {myRole && (
            <span className="r1-hud-role" style={{ color: myRole.color }}> · {myRole.glyph} {myRole.label}</span>
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
        <div className="r1-hud-right">● VERA ON · FEED LIVE</div>
      </div>

      {/* Hunter Browser — INSTANCE preview of the current head + raid Field Manual */}
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

      {/* Offscreen check iframe — rendered (not display:none) so computed styles
          and geometry resolve; H5/H6 wards measure real layout. */}
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

      {/* Sever toast — the kill is felt even with every panel closed */}
      {severToast && (
        <div key={severToast.id} className="r1-sever-toast">
          <span className="r1-sever-toast-glyph">{severToast.glyph}</span>
          <span className="r1-sever-toast-name">{severToast.name} — SEVERED</span>
          <span className="r1-sever-toast-by">
            VARKUL −{HEAD_DAMAGE}{severToast.byMe ? ' · YOUR CUT' : ` · ${memberName(severToast.by)}`}
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
              The brood dragged you back to the Gate mouth. Your code stands, every severed head stays
              severed — only your wind is gone. Get up.
            </p>
            <button className="r1-fell-btn" onClick={handleRespawn}>RESPAWN AT THE GATE</button>
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
              First confirmed herald kill in Association history. Somewhere far above, in a tower of
              black glass, something with too much blood pauses mid-slaughter — and smiles.
            </p>
            <div className="r1-victory-rewards">
              <div className="r1-victory-reward"><span>900 XP</span><label>FULL-CLEAR TOTAL</label></div>
              <div className="r1-victory-reward"><span>3650</span><label>$SHARD EACH</label></div>
              <div className="r1-victory-reward"><span>9 / 9</span><label>HEADS SEVERED</label></div>
            </div>
            <div className="r1-victory-chip">PAYOUTS CLEARED AUTOMATICALLY — CHECK YOUR LEDGER</div>
            <button className="r1-victory-btn" onClick={onExit}>RETURN TO THE WAR ROOM</button>
          </div>
        </div>
      )}
    </div>
  )
}

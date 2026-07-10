import { useState, useEffect, useRef, useCallback } from 'react'
import gsap from 'gsap'
import Editor from '@monaco-editor/react'
import { useCombat } from '../context/CombatContext'
import { on } from '../lib/combatBus'
import Daemon from './Daemon'
import { ENEMY_SVGS } from './EnemySVGs'
import { GORGOROTH_SCRIPT, CORRUPTIONS } from '../data/gates/prologueGorgoroth'
import './ArenaShell.css'
import './PrologueEncounter.css'

/*
 * PrologueEncounter — the two "Zero Hour" fights, presented in ArenaShell's
 * arena style (Quest 1): full layered fight scene, GSAP virtual camera,
 * floating draggable code panel (bigger + vertically resizable here), boss
 * dominating the arena. Reuses ArenaShell.css classes; .pe-shell overrides.
 *
 * Deliberately NOT ArenaShell itself: no quiz, no completeQuest, no next-gate.
 * Modes (config.mode):
 *   'exam'   — un-losable tutorial. 3 strikes kill the drone → kill-shot
 *              cinematic → winOverlay → onWin().
 *   'rigged' — unwinnable. startEncounter(10) caps 3 wards at 30 total dmg,
 *              regen refills him, corruption re-breaks fixed wards (and gives
 *              the strike back — the player can keep fighting), the finisher
 *              forces the fall → SIGNAL LOST → onLoss().
 */

// Deterministic ambient dust motes (same seeding as ArenaShell)
const MOTES = [
  { x: '8%',  y: '12%', dur: '25s', delay: '-3s',  dx: '12px',  dy: '-18px' },
  { x: '78%', y: '8%',  dur: '32s', delay: '-8s',  dx: '-8px',  dy: '-22px' },
  { x: '45%', y: '25%', dur: '28s', delay: '-1s',  dx: '6px',   dy: '-15px' },
  { x: '22%', y: '45%', dur: '22s', delay: '-12s', dx: '14px',  dy: '-20px' },
  { x: '88%', y: '35%', dur: '30s', delay: '-5s',  dx: '-10px', dy: '-25px' },
  { x: '63%', y: '18%', dur: '27s', delay: '-9s',  dx: '8px',   dy: '-12px' },
  { x: '14%', y: '70%', dur: '35s', delay: '-15s', dx: '10px',  dy: '-18px' },
  { x: '92%', y: '62%', dur: '24s', delay: '-7s',  dx: '-12px', dy: '-20px' },
  { x: '38%', y: '55%', dur: '29s', delay: '-4s',  dx: '6px',   dy: '-15px' },
  { x: '52%', y: '80%', dur: '26s', delay: '-11s', dx: '-8px',  dy: '-22px' },
]

export default function PrologueEncounter({ config, onWin, onLoss }) {
  const {
    playerHP, enemyHP, combo, phase,
    PLAYER_HP_MAX, ENEMY_HP_MAX,
    startEncounter, resolveCheck, healEnemy, scriptedDamage,
  } = useCombat()

  const rigged = config.mode === 'rigged'

  // ─── State ─────────────────────────────────────────────────────────────────
  const [code, setCode] = useState(config.starterCode)
  const [wardResults, setWardResults] = useState(() =>
    Object.fromEntries(config.wards.map(w => [w.id, false]))
  )
  const [struckWards, setStruckWards] = useState(new Set())
  const [daemonState, setDaemonState] = useState('idle')
  const [daemonAnimKey, setDaemonAnimKey] = useState(0)
  const [dmgNums, setDmgNums] = useState([])
  const [projectiles, setProjectiles] = useState([])
  const [showVignette, setShowVignette] = useState(false)
  const [vignetteKey, setVignetteKey] = useState(0)
  const [commsMsg, setCommsMsg] = useState(config.script.entry)
  const [commsUrgent, setCommsUrgent] = useState(false)
  const [castKey, setCastKey] = useState(0)
  const [expandedHint, setExpandedHint] = useState(null)
  const [bossHurt, setBossHurt] = useState(false)
  const [bossAttacking, setBossAttacking] = useState(false)
  const [bossDeathActive, setBossDeathActive] = useState(false)
  const [showKillFlash, setShowKillFlash] = useState(false)
  const [regenActive, setRegenActive] = useState(false)
  const [corruptFlash, setCorruptFlash] = useState(0)
  const [finisherStage, setFinisherStage] = useState(0) // 0 none · 1 slam · 2 signal-lost
  const [showWin, setShowWin] = useState(false)

  // ─── Refs ──────────────────────────────────────────────────────────────────
  const previewIframeRef = useRef(null)
  const panelRef = useRef(null)
  const stageRef = useRef(null)
  const camRef = useRef({ trauma: 0, punchZoom: 0 })
  const codeRef = useRef(code)
  const wardResultsRef = useRef(wardResults)
  const struckWardsRef = useRef(struckWards)
  const resolveCheckRef = useRef(resolveCheck)
  const healEnemyRef = useRef(healEnemy)
  const scriptedDamageRef = useRef(scriptedDamage)
  const dmgIdRef = useRef(0)
  const projIdRef = useRef(0)
  const hitCountRef = useRef(0)
  const corruptIdxRef = useRef(0)
  const timersRef = useRef([])
  const bossHurtTimerRef = useRef(null)
  const prevPlayerHPRef = useRef(playerHP)
  const prevEnemyHPRef = useRef(enemyHP)
  const lossFiredRef = useRef(false)
  const winFiredRef = useRef(false)
  const corruptStartedRef = useRef(false)
  const escalatedRef = useRef(false)
  const finisherIdRef = useRef(null)
  const aggroIdxRef = useRef(0)

  useEffect(() => { codeRef.current = code }, [code])
  useEffect(() => { wardResultsRef.current = wardResults }, [wardResults])
  useEffect(() => { struckWardsRef.current = struckWards }, [struckWards])
  useEffect(() => { resolveCheckRef.current = resolveCheck }, [resolveCheck])
  useEffect(() => { healEnemyRef.current = healEnemy }, [healEnemy])
  useEffect(() => { scriptedDamageRef.current = scriptedDamage }, [scriptedDamage])

  const pushTimer = useCallback((id) => { timersRef.current.push(id); return id }, [])
  const clearTimers = useCallback(() => {
    timersRef.current.forEach(id => { clearTimeout(id); clearInterval(id) })
    timersRef.current = []
  }, [])

  // ─── Comms helper ──────────────────────────────────────────────────────────
  const say = useCallback((msg, urgent = false) => {
    if (!msg) return
    setCommsMsg(msg)
    setCommsUrgent(urgent)
  }, [])

  // ─── Ward evaluation (synchronous DOMParser — same as ArenaShell) ──────────
  const evalWards = useCallback((src) => {
    const doc = new DOMParser().parseFromString(src, 'text/html')
    const results = {}
    config.wards.forEach(w => {
      try { results[w.id] = w.test(doc, null, src) } catch { results[w.id] = false }
    })
    return results
  }, [config])

  const prevWardPassRef = useRef({})
  useEffect(() => {
    const results = evalWards(code)
    // Teach the loop: a ward flipping green prompts the player to STRIKE.
    const newlyFixed = config.wards.some(w =>
      results[w.id] && !prevWardPassRef.current[w.id] && !struckWardsRef.current.has(w.id)
    )
    prevWardPassRef.current = results
    wardResultsRef.current = results
    setWardResults(results)
    if (newlyFixed && config.script.wardFixed && !lossFiredRef.current && !winFiredRef.current) {
      say(config.script.wardFixed)
    }
  }, [code, evalWards, config, say])

  // ─── Boss attack visual — he lunges whenever HE deals the damage ───────────
  const bossAttackFx = useCallback(() => {
    setBossAttacking(true)
    camRef.current.trauma = Math.min(1, camRef.current.trauma + 0.6)
    camRef.current.punchZoom = 0.06
    setTimeout(() => setBossAttacking(false), 620)
  }, [])

  // ─── The rig: corruption tick · aggro strikes · finisher ───────────────────
  const corruptTick = useCallback(() => {
    if (lossFiredRef.current) return
    // Re-break the first currently-fixed ward — and give the strike back,
    // so the player can re-fix and re-strike. He heals faster than they hit.
    const fixed = CORRUPTIONS.filter(c => wardResultsRef.current[c.wardId])
    if (fixed.length > 0) {
      const c = fixed[corruptIdxRef.current % fixed.length]
      corruptIdxRef.current += 1
      const corrupted = c.apply(codeRef.current)
      if (corrupted !== codeRef.current) setCode(corrupted)
      const nextStruck = new Set(struckWardsRef.current)
      nextStruck.delete(c.wardId)
      struckWardsRef.current = nextStruck
      setStruckWards(nextStruck)
    }
    setCorruptFlash(k => k + 1)
    bossAttackFx()
    say(config.script.corrupt, true)
    scriptedDamageRef.current?.(GORGOROTH_SCRIPT.corrupt.counterDamage, 'gorgoroth')
  }, [bossAttackFx, say, config.script.corrupt])

  // Aggro: once his blood wakes (regen), he swings on a cadence — the player
  // is never left "sitting and waiting" while the script counts down.
  const aggroStrike = useCallback(() => {
    if (lossFiredRef.current) return
    const lines = config.script.aggro ?? []
    const line = lines.length ? lines[aggroIdxRef.current % lines.length] : null
    aggroIdxRef.current += 1
    bossAttackFx()
    if (line) say(line, true)
    scriptedDamageRef.current?.(GORGOROTH_SCRIPT.aggro.damage, 'gorgoroth')
  }, [bossAttackFx, say, config.script.aggro])

  const finisher = useCallback(() => {
    if (lossFiredRef.current) return
    clearTimers()
    setFinisherStage(1)
    bossAttackFx()
    camRef.current.trauma = 1.0
    camRef.current.punchZoom = 0.16
    say(config.script.finisher, true)
    pushTimer(setTimeout(() => {
      scriptedDamageRef.current?.(GORGOROTH_SCRIPT.finisher.damage, 'gorgoroth')
    }, 650))
  }, [clearTimers, pushTimer, bossAttackFx, say, config.script.finisher])

  const corruptTickRef = useRef(corruptTick)
  const aggroStrikeRef = useRef(aggroStrike)
  const finisherRef = useRef(finisher)
  useEffect(() => { corruptTickRef.current = corruptTick }, [corruptTick])
  useEffect(() => { aggroStrikeRef.current = aggroStrike }, [aggroStrike])
  useEffect(() => { finisherRef.current = finisher }, [finisher])

  // Reschedulable pieces (escalation pulls them forward when the player is done early)
  const startCorruption = useCallback(() => {
    if (corruptStartedRef.current || lossFiredRef.current) return
    corruptStartedRef.current = true
    corruptTickRef.current?.()
    pushTimer(setInterval(() => corruptTickRef.current?.(), GORGOROTH_SCRIPT.corrupt.intervalMs))
  }, [pushTimer])

  const armFinisher = useCallback((delayMs) => {
    clearTimeout(finisherIdRef.current)
    finisherIdRef.current = pushTimer(setTimeout(() => finisherRef.current?.(), delayMs))
  }, [pushTimer])

  // ─── Start + scripted timeline ──────────────────────────────────────────────
  // StrictMode-safe: NO run-once ref guard. The dev double-mount runs
  // effect → cleanup (clears every timer) → effect again — a guard would leave
  // the second mount with zero timers and a boss that never acts (the exact
  // "he just stands there" bug). Arming is idempotent per mount; cleanup owns
  // the teardown.
  useEffect(() => {
    startEncounter(rigged ? GORGOROTH_SCRIPT.hpChecks : config.wards.length)
    if (!rigged) return undefined

    const S = GORGOROTH_SCRIPT
    corruptStartedRef.current = false
    escalatedRef.current = false

    pushTimer(setTimeout(() => {
      setRegenActive(true)
      say(config.script.regen, true)
      pushTimer(setInterval(() => healEnemyRef.current?.(S.regen.perTick), S.regen.tickMs))
      // his blood is awake — he starts swinging back
      pushTimer(setInterval(() => aggroStrikeRef.current?.(), S.aggro.everyMs))
    }, S.regen.delayMs))

    pushTimer(setTimeout(() => startCorruption(), S.corrupt.afterMs))
    armFinisher(S.finisher.afterMs)

    return clearTimers
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── GSAP virtual camera (ArenaShell pattern: --cx/--cy/--cz on the arena) ──
  useEffect(() => {
    let t = 0
    const cam = camRef.current
    const tick = () => {
      t += 0.016
      const sh = cam.trauma * cam.trauma
      const rnd = () => Math.random() * 2 - 1
      const dx = Math.sin(t / 9) * 6 + rnd() * 8 * sh
      const dy = Math.sin(t / 13) * 4 + rnd() * 6 * sh
      const zoom = (1 + Math.sin(t / 5) * 0.006 + cam.punchZoom).toFixed(4)
      cam.trauma = Math.max(0, cam.trauma - 0.033)
      cam.punchZoom = Math.max(0, cam.punchZoom - 0.008)
      const el = stageRef.current
      if (el) {
        el.style.setProperty('--cx', `${dx.toFixed(2)}px`)
        el.style.setProperty('--cy', `${dy.toFixed(2)}px`)
        el.style.setProperty('--cz', zoom)
      }
    }
    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  }, [])

  // ─── Loss flow: phase 'fell' → SIGNAL LOST → onLoss ────────────────────────
  useEffect(() => {
    if (phase !== 'fell' || lossFiredRef.current) return
    lossFiredRef.current = true
    clearTimers()
    setFinisherStage(2)
    const t = setTimeout(() => onLoss?.(), GORGOROTH_SCRIPT.lossHoldMs)
    return () => clearTimeout(t)
  }, [phase, onLoss, clearTimers])

  // ─── Win flow (exam only): kill-shot cinematic → overlay → onWin ───────────
  const launchKillShot = useCallback(() => {
    if (winFiredRef.current) return
    winFiredRef.current = true
    say(config.script.win)
    setDaemonState('fury')
    setDaemonAnimKey(k => k + 1)
    pushTimer(setTimeout(() => {
      setShowKillFlash(true)
      camRef.current.trauma = 1.0
      camRef.current.punchZoom = 0.18
      pushTimer(setTimeout(() => setShowKillFlash(false), 1100))
    }, 450))
    pushTimer(setTimeout(() => {
      const pid = ++projIdRef.current
      setProjectiles(prev => [...prev, { id: pid, killShot: true }])
      pushTimer(setTimeout(() => setProjectiles(prev => prev.filter(p => p.id !== pid)), 900))
    }, 700))
    pushTimer(setTimeout(() => {
      gsap.globalTimeline.pause()
      camRef.current.trauma = 1.0
      setTimeout(() => gsap.globalTimeline.resume(), 140)
      setBossDeathActive(true)
    }, 980))
    pushTimer(setTimeout(() => setShowWin(true), 2300))
  }, [pushTimer, say, config.script.win])

  useEffect(() => {
    if (phase === 'won' && !rigged) launchKillShot()
  }, [phase, rigged, launchKillShot])

  // ─── Juice: HP watchers ────────────────────────────────────────────────────
  const addDmgNum = useCallback((text, cls) => {
    const id = ++dmgIdRef.current
    setDmgNums(prev => [...prev, { id, text, cls }])
    setTimeout(() => setDmgNums(prev => prev.filter(n => n.id !== id)), 950)
  }, [])

  useEffect(() => {
    if (enemyHP < prevEnemyHPRef.current && (phase === 'active' || phase === 'won')) {
      const dmg = Math.round(prevEnemyHPRef.current - enemyHP)
      setDaemonState('attack')
      setDaemonAnimKey(k => k + 1)
      setTimeout(() => setDaemonState('idle'), 600)
      clearTimeout(bossHurtTimerRef.current)
      setBossHurt(false)
      requestAnimationFrame(() => requestAnimationFrame(() => {
        setBossHurt(true)
        bossHurtTimerRef.current = setTimeout(() => setBossHurt(false), 450)
      }))
      addDmgNum(`-${Math.round(dmg * (config.hpScale ?? 1)).toLocaleString('en-US')}`, 'ar-dmg-hit')
      camRef.current.trauma = Math.min(1, camRef.current.trauma + 0.3)
      camRef.current.punchZoom = 0.045
      hitCountRef.current += 1
      const line = config.script.hits?.[hitCountRef.current - 1]
      if (line) say(line)
    }
    prevEnemyHPRef.current = enemyHP
  }, [enemyHP, phase]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (playerHP < prevPlayerHPRef.current && phase === 'active') {
      const lost = prevPlayerHPRef.current - playerHP
      setShowVignette(true)
      setVignetteKey(k => k + 1)
      setDaemonState('glitch')
      setDaemonAnimKey(k => k + 1)
      addDmgNum(`-${lost}`, 'ar-dmg-damage')
      camRef.current.trauma = Math.min(1, camRef.current.trauma + 0.5)
    }
    prevPlayerHPRef.current = playerHP
  }, [playerHP, phase]) // eslint-disable-line react-hooks/exhaustive-deps

  // Regen numbers over the boss (scaled like his HP bar)
  useEffect(() => on('regen', ({ amount }) =>
    addDmgNum(`+${Math.round(amount * (config.hpScale ?? 1)).toLocaleString('en-US')}`, 'pe-dmg-regen')
  ), [addDmgNum, config.hpScale])

  // ─── Preview iframe ────────────────────────────────────────────────────────
  useEffect(() => {
    if (previewIframeRef.current) previewIframeRef.current.srcdoc = config.buildPreview(code)
  }, [code, config])

  // ─── STRIKE (ArenaShell semantics: one strike per fixed-but-unstruck ward) ──
  const handleStrike = useCallback(() => {
    if (phase !== 'active') return
    setCastKey(k => k + 1)
    const pid = ++projIdRef.current
    setProjectiles(prev => [...prev, { id: pid }])
    setTimeout(() => setProjectiles(prev => prev.filter(p => p.id !== pid)), 500)
    const newResults = evalWards(codeRef.current)
    const currentStruck = struckWardsRef.current
    const newlyPassed = config.wards.filter(w => newResults[w.id] && !currentStruck.has(w.id))
    newlyPassed.forEach(() => resolveCheckRef.current?.(true))
    const next = new Set([...currentStruck, ...newlyPassed.map(w => w.id)])
    struckWardsRef.current = next
    setStruckWards(next)
    wardResultsRef.current = newResults
    setWardResults(newResults)
    if (newlyPassed.length === 0) say(config.script.castIdle)

    // Escalation: the player has struck every ward — don't leave them waiting
    // on wall-clock. He answers NOW: corruption within seconds, finisher soon.
    if (rigged && !escalatedRef.current && next.size === config.wards.length) {
      escalatedRef.current = true
      const E = GORGOROTH_SCRIPT.escalate
      if (config.script.allStruck) say(config.script.allStruck, true)
      pushTimer(setTimeout(() => startCorruption(), E.corruptDelayMs))
      armFinisher(E.finisherDelayMs)
    }
  }, [phase, evalWards, config, say, rigged, pushTimer, startCorruption, armFinisher])

  // ─── Draggable code panel (ArenaShell pattern) ─────────────────────────────
  const onPanelDragStart = useCallback((e) => {
    e.preventDefault()
    const panel = panelRef.current
    if (!panel) return
    const rect = panel.getBoundingClientRect()
    const parentRect = (panel.offsetParent ?? document.body).getBoundingClientRect()
    const initLeft = rect.left - parentRect.left
    const initTop = rect.top - parentRect.top
    panel.style.left = `${initLeft}px`
    panel.style.top = `${initTop}px`
    panel.style.right = 'auto'
    panel.style.bottom = 'auto'
    panel.style.transform = 'none'
    const startX = e.clientX - initLeft
    const startY = e.clientY - initTop
    const onMove = (me) => {
      panel.style.left = `${me.clientX - startX}px`
      panel.style.top = `${me.clientY - startY}px`
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [])

  // ─── Computed ──────────────────────────────────────────────────────────────
  // Presentation-only HP scale: the rig runs on 100 HP; a NULL-class titan
  // displays as millions (hits fly as -599,994; regen climbs in huge chunks).
  const hpScale = config.hpScale ?? 1
  const fmtHP = (n) => Math.round(n * hpScale).toLocaleString('en-US')
  const enemyPct = Math.max(0, (enemyHP / ENEMY_HP_MAX) * 100)
  const playerPct = Math.max(0, (playerHP / PLAYER_HP_MAX) * 100)
  const playerLow = playerHP <= 30
  const passedCount = Object.values(wardResults).filter(Boolean).length
  const failCount = config.wards.length - passedCount
  const canStrike = phase === 'active' && config.wards.some(w => wardResults[w.id] && !struckWards.has(w.id))
  const EnemySVG = ENEMY_SVGS[config.enemy.svgVariant] ?? ENEMY_SVGS[1]

  const bossCls = (enemyHP <= 0 && bossDeathActive) ? 'dead'
    : bossHurt ? 'hurt'
    : (rigged && regenActive) ? 'enraged'
    : 'idle'

  // ─── Render — ArenaShell structure, .pe-shell overrides ─────────────────────
  return (
    <div className={`ar-shell pe-shell${rigged ? ' pe-rigged' : ''}${playerLow ? ' ar-low-hp' : ''}`}>

      {/* ── Topbar (no back button — the prologue is mandatory) ── */}
      <header className="ar-topbar">
        <span className="pe-topbar-status">{rigged ? '⚠ CONTAINMENT FAILING' : 'ASSOCIATION LICENSING'}</span>
        <div className="ar-topbar-center">
          <span className="ar-rank-tag">{config.rank} · {config.region}</span>
          <div className="ar-gate-title">{config.title}</div>
        </div>
      </header>

      {/* ── Main ── */}
      <div className="ar-main">

        {/* Left rail — mission / comms / wards / preview */}
        <aside className="ar-rail">
          <div>
            <div className="ar-section-head">▶ MISSION</div>
            <p className="ar-narrator">{config.narrator}</p>
          </div>

          <div className={`pe-comms${commsUrgent ? ' urgent' : ''}`}>
            <div className="pe-comms-head">
              <span className="pe-comms-dot" />
              <span>{config.commsLabel}</span>
            </div>
            <div className="pe-comms-msg" key={commsMsg}>{commsMsg}</div>
          </div>

          <div className="ar-scan-section">
            <div className="ar-section-head">
              {config.scannerLabel}
              <span className={`ar-section-count ${failCount === 0 ? 'clear' : 'errors'}`}>
                {failCount === 0 ? 'CLEAR' : `${failCount} ${config.scannerUnit}`}
              </span>
            </div>
            {config.wards.map((w, wi) => {
              // Exam teaching aid: the first unfixed ward's hint opens itself.
              const firstUnfixed = config.wards.findIndex(x => !wardResults[x.id])
              const autoOpen = config.mode === 'exam' && wi === firstUnfixed
              return (
                <div
                  key={w.id}
                  className={`ar-ward${wardResults[w.id] ? ' passed' : ''}${autoOpen ? ' pe-ward-current' : ''}`}
                  onClick={() => setExpandedHint(expandedHint === w.id ? null : w.id)}
                >
                  <div className="ar-ward-row">
                    <span className={`ar-ward-icon${wardResults[w.id] ? ' pass' : ' fail'}`}>
                      {wardResults[w.id] ? '✓' : (config.wardFailIcon ?? '⚠')}
                    </span>
                    <span className="ar-ward-label">{w.label}</span>
                  </div>
                  {(autoOpen || expandedHint === w.id) && !wardResults[w.id] && (
                    <div className="ar-ward-hint">{w.hint}</div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="ar-preview-wrap">
            <div className="ar-section-head">DOCUMENT SCAN</div>
            <iframe
              ref={previewIframeRef}
              title="live preview"
              className="ar-preview-frame"
              sandbox="allow-scripts"
            />
          </div>
        </aside>

        {/* ── Arena — full layered fight scene ── */}
        <div className="ar-arena" ref={stageRef}>
          <div className="ar-stage-scaler">
            <div className="ar-layer ar-l-sky" />
            <div className="ar-layer ar-l-far">
              <div className="ar-far-col ar-far-l" />
              <div className="ar-far-col ar-far-r" />
            </div>
            <div className="ar-layer ar-l-mid">
              <div className="ar-arch ar-arch-l" />
              <div className="ar-arch ar-arch-r" />
              <div className="ar-arch-center" />
            </div>
            <div className="ar-layer ar-l-fog" />
            <div className="ar-layer ar-l-floor">
              <div className="ar-floor-grid" />
            </div>

            <div className="ar-layer ar-l-motes" aria-hidden="true">
              {MOTES.map((m, i) => (
                <div
                  key={i}
                  className="ar-mote"
                  style={{ left: m.x, top: m.y, '--dur': m.dur, '--delay': m.delay, '--dx': m.dx, '--dy': m.dy }}
                />
              ))}
            </div>

            {/* Boss */}
            <div className="ar-layer ar-l-boss">
              {rigged && <div className="pe-boss-tear" aria-hidden="true" />}
              <div className={`ar-boss-entity ${bossCls}${bossAttacking ? ' pe-boss-attack' : ''}`}>
                <div className="ar-boss-hp-above">
                  <span className="ar-boss-hp-name">{config.enemy.name}</span>
                  <div className="ar-boss-hp-track">
                    <div
                      className={`ar-boss-hp-fill${(rigged && regenActive) ? ' enraged pe-regen' : ''}`}
                      style={{ width: `${enemyPct}%` }}
                    />
                  </div>
                  <span className="ar-boss-hp-val">
                    {fmtHP(enemyHP)} / {fmtHP(ENEMY_HP_MAX)}
                    {regenActive && <span className="pe-regen-tag"> ▲ REGENERATING</span>}
                  </span>
                  {config.enemy.threatLabel && (
                    <span className="pe-threat-label">{config.enemy.threatLabel}</span>
                  )}
                </div>
                <div className="ar-boss-svg-wrap">
                  <EnemySVG />
                </div>
                <div className="ar-boss-shadow" />
              </div>
            </div>

            {/* Hero / Daemon */}
            <div className="ar-layer ar-l-hero">
              <div className="ar-hero-entity">
                <Daemon ability={config.ability} state={daemonState} animKey={daemonAnimKey} />
                <div className="ar-hero-shadow" />
              </div>
            </div>

            {/* FX */}
            <div className="ar-layer ar-l-fx" aria-hidden="true">
              {projectiles.map(p => (
                <div key={p.id} className={`ar-projectile${p.killShot ? ' kill-shot' : ''}`} />
              ))}
              {dmgNums.map(n => (
                <span key={n.id} className={`ar-dmg-num ${n.cls}`}>{n.text}</span>
              ))}
              {showVignette && (
                <div
                  key={vignetteKey}
                  className="ar-hit-vignette"
                  onAnimationEnd={() => setShowVignette(false)}
                />
              )}
            </div>
          </div>{/* end ar-stage-scaler */}

          <div className={`ar-layer ar-l-grade${rigged && regenActive ? ' enraged' : ''}`} aria-hidden="true" />

          {/* Floating code panel — bigger + vertically resizable in the prologue */}
          <div className="ar-code-panel pe-code-panel" ref={panelRef}>
            <div className="ar-panel-header" onMouseDown={onPanelDragStart}>
              <span className="ar-panel-filename">index.html</span>
              <span className={`ar-panel-status ${failCount === 0 ? 'clear' : 'errors'}`}>
                {failCount === 0 ? '✓ all pass' : `${failCount} failing`}
              </span>
            </div>
            <div className="ar-monaco-wrap pe-monaco-resize">
              <Editor
                height="100%"
                language="html"
                value={code}
                onChange={val => setCode(val ?? '')}
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
                  automaticLayout: true,
                }}
              />
              {corruptFlash > 0 && <div className="pe-corrupt-overlay" key={corruptFlash} />}
            </div>
            <div className="ar-panel-footer">
              <button
                className={`ar-strike-btn${canStrike ? ' ready' : ''}`}
                onClick={handleStrike}
                disabled={!canStrike}
              >
                ▶ STRIKE
              </button>
              <span className={`pe-strike-hint${canStrike ? ' armed' : ''}`}>
                {canStrike ? '⚡ WARD ARMED — STRIKE NOW' : 'seal a ward in the code to arm'}
              </span>
              <div className="ar-cast-bar-wrap">
                {castKey > 0 && <div key={castKey} className="ar-cast-bar-fill" />}
              </div>
              <span className={`ar-combo-chip${combo >= 3 ? ' active' : ''}`}>
                {combo >= 3 ? `×${combo}` : ''}
              </span>
            </div>
          </div>

        </div>{/* end ar-arena */}
      </div>

      {/* ── Bottom HUD ── */}
      <div className="ar-hud">
        <span className="ar-hud-identity">{rigged ? 'CANDIDATE · MARKED?' : 'CANDIDATE · UNLICENSED'}</span>
        <div className="ar-player-hp-wrap">
          <span className={`ar-player-hp-label${playerLow ? ' low' : ''}`}>DAEMON HP</span>
          <div className="ar-hp-track">
            <div
              className={`ar-player-hp-fill${playerLow ? ' low' : ''}`}
              style={{ width: `${playerPct}%` }}
            />
          </div>
          <span className="ar-hud-hp-val">{playerHP}/{PLAYER_HP_MAX}</span>
        </div>
        <div className="ar-hud-region">{config.region}</div>
        <div className="ar-hud-right">{rigged ? '✕ NO HANDLER' : '● PROCTOR ON'}</div>
      </div>

      {/* ── Overlays ── */}

      {showKillFlash && <div className="ar-kill-flash" aria-hidden="true" />}

      {finisherStage >= 1 && <div className="pe-slam-flash" aria-hidden="true" />}
      {finisherStage === 2 && (
        <div className="pe-signal-lost">
          <div className="pe-signal-title">SIGNAL LOST</div>
          <div className="pe-signal-sub">DAEMON TERMINATED · CANDIDATE VITALS UNKNOWN</div>
        </div>
      )}

      {showWin && config.winOverlay && (
        <div className="pe-win-overlay">
          <div className="pe-win-inner">
            <div className="pe-win-chip">{config.winOverlay.chip}</div>
            <div className="pe-win-heading">{config.winOverlay.heading}</div>
            <div className="pe-win-body">{config.winOverlay.body}</div>
            <button className="pe-win-btn" onClick={() => onWin?.()}>{config.winOverlay.cta}</button>
          </div>
        </div>
      )}

    </div>
  )
}

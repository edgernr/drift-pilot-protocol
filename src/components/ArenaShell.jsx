import { useState, useEffect, useRef, useCallback } from 'react'
import gsap from 'gsap'
import Editor from '@monaco-editor/react'
import { useCombat } from '../context/CombatContext'
import { useAuth } from '../context/AuthContext'
import { useNav } from '../context/NavigationContext'
import { on } from '../lib/combatBus'
import HandlerComms from './HandlerComms'
import Daemon from './Daemon'
import QuestQuiz from '../screens/QuestQuiz'
import { ENEMY_SVGS } from './EnemySVGs'
import { getHandlerLine } from '../data/handlerScript'
import './ArenaShell.css'

// Deterministic ambient dust motes — seeded so no hydration flicker
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
  { x: '72%', y: '48%', dur: '33s', delay: '-6s',  dx: '14px',  dy: '-16px' },
  { x: '5%',  y: '38%', dur: '21s', delay: '-14s', dx: '10px',  dy: '-24px' },
  { x: '30%', y: '15%', dur: '29s', delay: '-18s', dx: '-6px',  dy: '-19px' },
  { x: '58%', y: '72%', dur: '24s', delay: '-2s',  dx: '9px',   dy: '-14px' },
]

export default function ArenaShell({ config }) {
  const { goto } = useNav()
  const { user, profile, completeQuest } = useAuth()
  const {
    playerHP, enemyHP, combo, phase,
    PLAYER_HP_MAX, ENEMY_HP_MAX,
    startEncounter, resolveCheck, resolveQuiz,
    bleedDamage, respawn, resetEncounter,
  } = useCombat()

  // ─── State ───────────────────────────────────────────────────────────────────
  const [variantIdx] = useState(() =>
    Math.floor(Math.random() * (config.variants?.length || 1))
  )
  const [code, setCode] = useState(() =>
    config.language === 'css'
      ? (config.getStarterCode?.() ?? '')
      : (config.variants?.[variantIdx] ?? '')
  )
  const [wardResults, setWardResults] = useState(() =>
    Object.fromEntries(config.wards.map(w => [w.id, false]))
  )
  const [daemonState, setDaemonState] = useState('idle')
  const [daemonAnimKey, setDaemonAnimKey] = useState(0)
  const [dmgNums, setDmgNums] = useState([])
  const [showVignette, setShowVignette] = useState(false)
  const [vignetteKey, setVignetteKey] = useState(0)
  const [handlerMsg, setHandlerMsg] = useState(null)
  const [showQuiz, setShowQuiz] = useState(false)
  const [showCompletion, setShowCompletion] = useState(false)
  const [castKey, setCastKey] = useState(0)
  const [expandedHint, setExpandedHint] = useState(null)
  const [started, setStarted] = useState(false)
  const [bossHurt, setBossHurt] = useState(false)
  const [bossDeathActive, setBossDeathActive] = useState(false)
  const [showKillFlash, setShowKillFlash] = useState(false)
  const [struckWards, setStruckWards] = useState(new Set())
  const [projectiles, setProjectiles] = useState([])

  // ─── Refs ─────────────────────────────────────────────────────────────────────
  const previewIframeRef = useRef(null)
  const projIdRef        = useRef(0)
  const panelRef         = useRef(null)
  const wardResultsRef   = useRef(wardResults)
  const struckWardsRef   = useRef(struckWards)
  const resolveCheckRef  = useRef(null)
  const resolveQuizRef   = useRef(null)
  const bleedDamageRef   = useRef(null)
  const dmgIdRef         = useRef(0)
  const bleedTimerRef    = useRef(null)
  const bleedCountRef    = useRef(0)
  const completionFiredRef = useRef(false)
  const quizPassedRef    = useRef(false)
  const prevPhaseRef     = useRef(phase)
  const prevPlayerHPRef  = useRef(playerHP)
  const prevEnemyHPRef   = useRef(enemyHP)
  const prevPlayerHPForHandler = useRef(playerHP)
  const bossHurtTimerRef = useRef(null)
  const stageRef         = useRef(null)   // on ar-arena; GSAP ticker writes --cx/--cy/--cz here
  const camRef           = useRef({ trauma: 0, punchZoom: 0 })
  const killShotFiredRef = useRef(false)
  const levelAtStartRef  = useRef(profile?.level ?? 1)

  // ─── Keep fn refs fresh ───────────────────────────────────────────────────────
  useEffect(() => { resolveCheckRef.current = resolveCheck }, [resolveCheck])
  useEffect(() => { resolveQuizRef.current = resolveQuiz }, [resolveQuiz])
  useEffect(() => { bleedDamageRef.current = bleedDamage }, [bleedDamage])
  useEffect(() => { wardResultsRef.current = wardResults }, [wardResults])
  useEffect(() => { struckWardsRef.current = struckWards }, [struckWards])

  // ─── Synchronous ward evaluation (DOMParser — instant, no iframe async) ────────
  const evalWards = useCallback((src) => {
    const doc = new DOMParser().parseFromString(src, 'text/html')
    const results = {}
    config.wards.forEach(w => {
      try { results[w.id] = w.test(doc, null, src) } catch { results[w.id] = false }
    })
    return results
  }, [config])

  useEffect(() => {
    const results = evalWards(code)
    wardResultsRef.current = results
    setWardResults(results)
  }, [code, evalWards])

  // ─── Start encounter ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!started) {
      startEncounter(config.wards.length)
      setStarted(true)
      setHandlerMsg(getHandlerLine(config.ability, 'entry'))
    }
  }, [started, startEncounter, config])

  // ─── Preview iframe srcdoc ────────────────────────────────────────────────────
  useEffect(() => {
    if (!previewIframeRef.current) return
    const srcdoc = config.language === 'css'
      ? config.buildPreview(code, variantIdx)
      : config.buildPreview(code)
    previewIframeRef.current.srcdoc = srcdoc
  }, [code, variantIdx, config])

  // ─── GSAP virtual camera — idle drift + breath zoom + trauma shake ─────────────
  // Writes --cx/--cy/--cz onto ar-arena; layers read them via CSS inheritance.
  useEffect(() => {
    let t = 0
    const cam = camRef.current
    const tick = () => {
      t += 0.016
      const sh  = cam.trauma * cam.trauma
      const rnd = () => Math.random() * 2 - 1
      const dx   = Math.sin(t / 9)  * 6 + rnd() * 8 * sh
      const dy   = Math.sin(t / 13) * 4 + rnd() * 6 * sh
      const zoom = (1 + Math.sin(t / 5) * 0.006 + cam.punchZoom).toFixed(4)
      cam.trauma    = Math.max(0, cam.trauma    - 0.033)
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

  // ─── Phase changes ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== prevPhaseRef.current) {
      prevPhaseRef.current = phase
      if (phase === 'active') setDaemonState('idle')
    }
  }, [phase])

  // ─── Player HP — vignette + daemon hit-react + camera shake ──────────────────
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
  }, [playerHP, phase]) // eslint-disable-line

  // ─── Enemy HP — boss hurt + camera punch-in ───────────────────────────────────
  useEffect(() => {
    if (enemyHP < prevEnemyHPRef.current && phase === 'active') {
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
      addDmgNum(`-${dmg}`, 'ar-dmg-hit')
      camRef.current.trauma    = Math.min(1, camRef.current.trauma + 0.3)
      camRef.current.punchZoom = 0.045
    }
    prevEnemyHPRef.current = enemyHP
  }, [enemyHP, phase]) // eslint-disable-line

  // ─── Handler comms — HP threshold lines ──────────────────────────────────────
  useEffect(() => {
    if (playerHP <= 30 && prevPlayerHPForHandler.current > 30) {
      setHandlerMsg(getHandlerLine(config.ability, 'low_30'))
    } else if (playerHP <= 60 && prevPlayerHPForHandler.current > 60) {
      setHandlerMsg(getHandlerLine(config.ability, 'low_60'))
    }
    prevPlayerHPForHandler.current = playerHP
  }, [playerHP, config.ability])

  // ─── Idle bleed ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'active') {
      clearInterval(bleedTimerRef.current)
      bleedCountRef.current = 0
      return
    }
    bleedCountRef.current = 0
    bleedTimerRef.current = setInterval(() => {
      bleedCountRef.current += 1
      if (bleedCountRef.current > 90) bleedDamageRef.current?.()
    }, 1000)
    return () => clearInterval(bleedTimerRef.current)
  }, [phase, code])

  // ─── encounter:won ────────────────────────────────────────────────────────────
  useEffect(() => {
    return on('encounter:won', () => {
      if (quizPassedRef.current && !completionFiredRef.current) {
        completionFiredRef.current = true
        handleCompletion()
      }
    })
  }, []) // eslint-disable-line

  useEffect(() => {
    if (phase === 'won' && quizPassedRef.current && !completionFiredRef.current) {
      completionFiredRef.current = true
      handleCompletion()
    }
  }, [phase]) // eslint-disable-line

  // ─── Damage number helper ─────────────────────────────────────────────────────
  const addDmgNum = useCallback((text, cls) => {
    const id = ++dmgIdRef.current
    setDmgNums(prev => [...prev, { id, text, cls }])
    setTimeout(() => setDmgNums(prev => prev.filter(n => n.id !== id)), 950)
  }, [])

  // ─── Kill-shot cinematic ──────────────────────────────────────────────────────
  const launchKillShot = useCallback(() => {
    if (killShotFiredRef.current) return
    killShotFiredRef.current = true

    // Phase 1 — Daemon eyes go lightning
    setDaemonState('fury')
    setDaemonAnimKey(k => k + 1)

    // Phase 2 (450ms) — screen-wide lightning flash + max trauma
    setTimeout(() => {
      setShowKillFlash(true)
      camRef.current.trauma    = 1.0
      camRef.current.punchZoom = 0.18
      setTimeout(() => setShowKillFlash(false), 1100)
    }, 450)

    // Phase 3 (700ms) — oversized killing-blow projectile
    setTimeout(() => {
      const pid = ++projIdRef.current
      setProjectiles(prev => [...prev, { id: pid, killShot: true }])
      setTimeout(() => setProjectiles(prev => prev.filter(p => p.id !== pid)), 900)
    }, 700)

    // Phase 4 (980ms) — hit-stop freeze + boss death activates
    setTimeout(() => {
      gsap.globalTimeline.pause()
      camRef.current.trauma = 1.0
      setTimeout(() => gsap.globalTimeline.resume(), 140)
      setBossDeathActive(true)
    }, 980)

    // Phase 5 (2300ms) — victory card slides in
    setTimeout(() => setShowCompletion(true), 2300)
  }, []) // eslint-disable-line

  // ─── Completion ───────────────────────────────────────────────────────────────
  const handleCompletion = useCallback(async () => {
    if (user) await completeQuest(config.questId, config.completionXp)
    launchKillShot()
  }, [user, completeQuest, config.questId, config.completionXp, launchKillShot])

  // ─── Quiz ─────────────────────────────────────────────────────────────────────
  const handleQuizPass = useCallback(() => {
    setShowQuiz(false)
    resolveQuizRef.current?.(true)
    quizPassedRef.current = true
    if (!completionFiredRef.current) {
      completionFiredRef.current = true
      handleCompletion()
    }
  }, [handleCompletion])

  const handleQuizFail = useCallback(() => {
    setShowQuiz(false)
    resolveQuizRef.current?.(false)
  }, [])

  // ─── STRIKE ───────────────────────────────────────────────────────────────────
  const handleStrike = useCallback(() => {
    setCastKey(k => k + 1)
    const pid = ++projIdRef.current
    setProjectiles(prev => [...prev, { id: pid }])
    setTimeout(() => setProjectiles(prev => prev.filter(p => p.id !== pid)), 500)
    const newResults = evalWards(code)
    const currentStruckWards = struckWardsRef.current
    const newlyPassed = config.wards.filter(w => newResults[w.id] && !currentStruckWards.has(w.id))
    newlyPassed.forEach(() => resolveCheckRef.current?.(true))
    const next = new Set([...currentStruckWards, ...newlyPassed.map(w => w.id)])
    struckWardsRef.current = next
    setStruckWards(next)
    wardResultsRef.current = newResults
    setWardResults(newResults)
    if (next.size === config.wards.length) setTimeout(() => setShowQuiz(true), 350)
  }, [code, config, evalWards])

  // ─── Respawn / next ───────────────────────────────────────────────────────────
  const handleRespawn = useCallback(() => {
    const fresh = new Set()
    struckWardsRef.current = fresh
    setStruckWards(fresh)
    respawn()
  }, [respawn])

  const handleNext = useCallback(() => {
    setShowCompletion(false)
    resetEncounter()
    goto(config.nextGate ?? 'dashboard')
  }, [config.nextGate, goto, resetEncounter])

  // ─── Draggable code panel ─────────────────────────────────────────────────────
  const onPanelDragStart = useCallback((e) => {
    e.preventDefault()
    const panel = panelRef.current
    if (!panel) return
    const rect       = panel.getBoundingClientRect()
    const parentRect = (panel.offsetParent ?? document.body).getBoundingClientRect()
    // Lock to absolute pixel position immediately on mousedown so there's no jump
    // when the centered transform (translateX(-50%)) gets cleared on first move.
    const initLeft = rect.left - parentRect.left
    const initTop  = rect.top  - parentRect.top
    panel.style.left      = `${initLeft}px`
    panel.style.top       = `${initTop}px`
    panel.style.right     = 'auto'
    panel.style.bottom    = 'auto'
    panel.style.transform = 'none'
    const startX = e.clientX - initLeft
    const startY = e.clientY - initTop
    const onMove = (me) => {
      panel.style.left = `${me.clientX - startX}px`
      panel.style.top  = `${me.clientY - startY}px`
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [])

  // ─── Computed ─────────────────────────────────────────────────────────────────
  const enemyPct    = Math.max(0, (enemyHP  / ENEMY_HP_MAX)  * 100)
  const playerPct   = Math.max(0, (playerHP / PLAYER_HP_MAX) * 100)
  const playerLow   = playerHP <= 30
  const passedCount = Object.values(wardResults).filter(Boolean).length
  const failCount   = config.wards.length - passedCount
  const canStrike   = phase === 'active' && config.wards.some(w => wardResults[w.id] && !struckWards.has(w.id))
  const EnemySVG    = ENEMY_SVGS[config.enemy.svgVariant] ?? ENEMY_SVGS[1]
  const filename    = config.language === 'css' ? 'style.css' : 'index.html'
  const level       = profile?.level ?? 1
  const displayName = profile?.name ?? user?.email ?? 'K'
  const isEnraged   = enemyHP <= ENEMY_HP_MAX * 0.5 && enemyHP > 0

  // Boss stays enraged while quiz is in progress; death animation only fires during kill-shot cinematic
  const bossCls = (enemyHP <= 0 && bossDeathActive) ? 'dead'
    : (enemyHP <= 0) ? 'enraged'
    : bossHurt       ? 'hurt'
    : isEnraged      ? 'enraged'
    : 'idle'

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className={`ar-shell${playerLow ? ' ar-low-hp' : ''}`}>

      {/* ── Topbar ─────────────────────────────────────────────────────────────── */}
      <header className="ar-topbar">
        <button className="ar-topbar-back" onClick={() => goto('dashboard')}>← Dashboard</button>
        <div className="ar-topbar-center">
          <span className="ar-rank-tag">RANK {config.rank} · GATE {String(config.gateNum).padStart(2, '0')}</span>
          <div className="ar-gate-title">{config.title}</div>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────────────────────────── */}
      <div className="ar-main">

        {/* Left rail — mission / handler / wards / preview */}
        <aside className="ar-rail">

          <div>
            <div className="ar-section-head">▶ MISSION</div>
            <p className="ar-narrator">{config.narrator}</p>
          </div>

          {handlerMsg && (
            <div className="ar-handler-wrap">
              <HandlerComms message={handlerMsg} />
            </div>
          )}

          <div className="ar-scan-section">
            <div className="ar-section-head">
              SCAN REPORT
              <span className={`ar-section-count ${failCount === 0 ? 'clear' : 'errors'}`}>
                {failCount === 0 ? 'CLEAR' : `${failCount} ERRORS`}
              </span>
            </div>
            {config.wards.map(w => (
              <div
                key={w.id}
                className={`ar-ward${wardResults[w.id] ? ' passed' : ''}`}
                onClick={() => setExpandedHint(expandedHint === w.id ? null : w.id)}
              >
                <div className="ar-ward-row">
                  <span className={`ar-ward-icon${wardResults[w.id] ? ' pass' : ' fail'}`}>
                    {wardResults[w.id] ? '✓' : (config.wardFailIcon ?? '⚠')}
                  </span>
                  <span className="ar-ward-label">{w.label}</span>
                </div>
                {expandedHint === w.id && !wardResults[w.id] && (
                  <div className="ar-ward-hint">{w.hint}</div>
                )}
              </div>
            ))}
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

        {/* ── Arena — full layered fight scene ───────────────────────────────── */}
        <div className="ar-arena" ref={stageRef}>

          {/* Visual layer stack — scales + drifts with the camera */}
          <div className="ar-stage-scaler">

            {/* z0 — Sky */}
            <div className="ar-layer ar-l-sky" />

            {/* z1 — Far: distant column silhouettes */}
            <div className="ar-layer ar-l-far">
              <div className="ar-far-col ar-far-l" />
              <div className="ar-far-col ar-far-r" />
            </div>

            {/* z2 — Mid: broken arch framing */}
            <div className="ar-layer ar-l-mid">
              <div className="ar-arch ar-arch-l" />
              <div className="ar-arch ar-arch-r" />
              <div className="ar-arch-center" />
            </div>

            {/* z3 — Depth fog */}
            <div className="ar-layer ar-l-fog" />

            {/* z4 — Floor with perspective grid */}
            <div className="ar-layer ar-l-floor">
              <div className="ar-floor-grid" />
            </div>

            {/* Motes — ambient dust */}
            <div className="ar-layer ar-l-motes" aria-hidden="true">
              {MOTES.map((m, i) => (
                <div
                  key={i}
                  className="ar-mote"
                  style={{ left: m.x, top: m.y, '--dur': m.dur, '--delay': m.delay, '--dx': m.dx, '--dy': m.dy }}
                />
              ))}
            </div>

            {/* z5 — Boss / Warden */}
            <div className="ar-layer ar-l-boss">
              <div className={`ar-boss-entity ${bossCls}`}>
                {/* HP bar floating above boss */}
                <div className="ar-boss-hp-above">
                  <span className="ar-boss-hp-name">{config.enemy.name}</span>
                  <div className="ar-boss-hp-track">
                    <div
                      className={`ar-boss-hp-fill${isEnraged ? ' enraged' : ''}`}
                      style={{ width: `${enemyPct}%` }}
                    />
                  </div>
                  <span className="ar-boss-hp-val">{enemyHP} / {ENEMY_HP_MAX}</span>
                </div>
                <div className="ar-boss-svg-wrap">
                  <EnemySVG />
                </div>
                <div className="ar-boss-shadow" />
              </div>
            </div>

            {/* z6 — Hero / Daemon */}
            <div className="ar-layer ar-l-hero">
              <div className="ar-hero-entity">
                <Daemon ability={config.ability} state={daemonState} animKey={daemonAnimKey} />
                <div className="ar-hero-shadow" />
              </div>
            </div>

            {/* z7 — FX: projectiles + damage numbers + hit vignette */}
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

          {/* Grade layer — above stage, never scales */}
          <div className={`ar-layer ar-l-grade${isEnraged ? ' enraged' : ''}`} aria-hidden="true" />

          {/* Floating code panel — centered, draggable, above everything */}
          <div className="ar-code-panel" ref={panelRef}>
            <div className="ar-panel-header" onMouseDown={onPanelDragStart}>
              <span className="ar-panel-filename">{filename}</span>
              <span className={`ar-panel-status ${failCount === 0 ? 'clear' : 'errors'}`}>
                {failCount === 0 ? '✓ all pass' : `${failCount} failing`}
              </span>
            </div>
            <div className="ar-monaco-wrap">
              <Editor
                height="280px"
                language={config.language}
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
                }}
              />
            </div>
            <div className="ar-panel-footer">
              <button
                className={`ar-strike-btn${canStrike ? ' ready' : ''}`}
                onClick={handleStrike}
                disabled={!canStrike}
              >
                ▶ STRIKE
              </button>
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

      {/* ── Bottom HUD ─────────────────────────────────────────────────────────── */}
      <div className="ar-hud">
        <span className="ar-hud-identity">{displayName} · LV.{level}</span>
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
        <div className="ar-hud-region">{config.region} · GATE {String(config.gateNum).padStart(2, '0')}</div>
        <div className="ar-hud-right">● VERA ON</div>
      </div>

      {/* ── Overlays ───────────────────────────────────────────────────────────── */}

      {phase === 'fell' && (
        <div className="ar-fell-overlay">
          <div className="ar-fell-inner">
            <div className="ar-fell-title">DAEMON FELL</div>
            <div className="ar-fell-sub">VERA // HANDLER</div>
            <div className="ar-fell-progress">
              {passedCount > 0
                ? `${passedCount}/${config.wards.length} checks survived — no progress lost.`
                : 'No progress lost. Respawn and continue.'}
            </div>
            <button className="ar-fell-btn" onClick={handleRespawn}>RESPAWN</button>
          </div>
        </div>
      )}

      {showQuiz && (
        <QuestQuiz quiz={config.quiz} onPass={handleQuizPass} onFail={handleQuizFail} />
      )}

      {/* Kill-shot lightning flash — fixed, covers full screen */}
      {showKillFlash && <div className="ar-kill-flash" aria-hidden="true" />}

      {showCompletion && (
        <div className="ar-victory-overlay">
          <div className="ar-victory-inner">
            <div className="ar-victory-boss-tag">ENEMY SLAIN</div>
            <div className="ar-victory-boss-name">{config.enemy.name}</div>
            <div className="ar-victory-defeated">DEFEATED</div>
            <div className="ar-victory-divider" />
            <div className="ar-victory-rewards">
              {config.completion.rewards.map((r, i) => (
                <div key={i} className="ar-victory-reward">
                  <span className="ar-victory-reward-val">{r.value}</span>
                  <span className="ar-victory-reward-label">{r.label}</span>
                </div>
              ))}
            </div>
            {level > levelAtStartRef.current && (
              <div className="ar-victory-levelup">⚡ LEVEL UP — LV.{level}</div>
            )}
            <span className="ar-victory-chip">{config.completion.chip}</span>
            {config.nextGate && (
              <div className="ar-victory-next-section">
                <div className="ar-victory-next-label">{config.completion.nextLabel}</div>
                <div className="ar-victory-next-card">
                  <span className="ar-victory-next-icon">{config.completion.nextIcon}</span>
                  <div>
                    <div className="ar-victory-next-title">{config.completion.nextTitle}</div>
                    <div className="ar-victory-next-sub">{config.completion.nextSub}</div>
                  </div>
                </div>
              </div>
            )}
            <button className="ar-victory-btn" onClick={handleNext}>
              {config.nextGate
                ? `Enter ${config.completion.nextTitle ?? 'Next Gate'}`
                : 'Return to Map'}
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

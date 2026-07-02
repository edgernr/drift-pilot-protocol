import { useState, useEffect, useRef, useCallback } from 'react'
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
  // struckWards: ward IDs that have already been resolved as hits against the boss.
  // A ward toggled back to failing after being struck does NOT give another hit.
  const [struckWards, setStruckWards] = useState(new Set())
  const [projectiles, setProjectiles] = useState([])

  // ─── Refs ─────────────────────────────────────────────────────────────────────
  const previewIframeRef = useRef(null)
  const projIdRef = useRef(0)
  const wardResultsRef = useRef(wardResults)
  const struckWardsRef = useRef(struckWards)
  const resolveCheckRef = useRef(null)
  const resolveQuizRef = useRef(null)
  const bleedDamageRef = useRef(null)
  const dmgIdRef = useRef(0)
  const bleedTimerRef = useRef(null)
  const bleedCountRef = useRef(0)
  const completionFiredRef = useRef(false)
  const quizPassedRef = useRef(false)
  const prevPhaseRef = useRef(phase)
  const prevPlayerHPRef = useRef(playerHP)
  const prevEnemyHPRef = useRef(enemyHP)
  const prevPlayerHPForHandler = useRef(playerHP)
  const bossHurtTimerRef = useRef(null)
  const panelRef = useRef(null)

  // ─── Keep fn refs fresh ───────────────────────────────────────────────────────
  useEffect(() => { resolveCheckRef.current = resolveCheck }, [resolveCheck])
  useEffect(() => { resolveQuizRef.current = resolveQuiz }, [resolveQuiz])
  useEffect(() => { bleedDamageRef.current = bleedDamage }, [bleedDamage])
  useEffect(() => { wardResultsRef.current = wardResults }, [wardResults])
  useEffect(() => { struckWardsRef.current = struckWards }, [struckWards])

  // ─── Synchronous ward evaluation (DOMParser — no iframe, no async) ─────────────
  // DOMParser correctly handles doctype detection, tag nesting, and anchor structure.
  // This makes wardResults (and thus canStrike) update instantly on every code change.
  const evalWards = useCallback((src) => {
    const doc = new DOMParser().parseFromString(src, 'text/html')
    const results = {}
    config.wards.forEach(w => {
      try { results[w.id] = w.test(doc, null, src) } catch { results[w.id] = false }
    })
    return results
  }, [config])

  // Update ward results whenever code changes
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

  // ─── Preview iframe ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!previewIframeRef.current) return
    const srcdoc = config.language === 'css'
      ? config.buildPreview(code, variantIdx)
      : config.buildPreview(code)
    previewIframeRef.current.srcdoc = srcdoc
  }, [code, variantIdx, config])


  // ─── Phase changes ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== prevPhaseRef.current) {
      prevPhaseRef.current = phase
      if (phase === 'active') setDaemonState('idle')
    }
  }, [phase])

  // ─── Player HP — damage effects ───────────────────────────────────────────────
  useEffect(() => {
    if (playerHP < prevPlayerHPRef.current && phase === 'active') {
      const lost = prevPlayerHPRef.current - playerHP
      setShowVignette(true)
      setVignetteKey(k => k + 1)
      setDaemonState('glitch')
      setDaemonAnimKey(k => k + 1)
      addDmgNum(`-${lost}`, 'ar-dmg-damage')
    }
    prevPlayerHPRef.current = playerHP
  }, [playerHP, phase]) // eslint-disable-line

  // ─── Enemy HP — boss hurt + daemon attack ─────────────────────────────────────
  useEffect(() => {
    if (enemyHP < prevEnemyHPRef.current && phase === 'active') {
      const dmg = Math.round(prevEnemyHPRef.current - enemyHP)
      setDaemonState('attack')
      setDaemonAnimKey(k => k + 1)
      setTimeout(() => setDaemonState('idle'), 600)
      // Restart boss hurt animation (brief class-off → class-on via double RAF)
      clearTimeout(bossHurtTimerRef.current)
      setBossHurt(false)
      requestAnimationFrame(() => requestAnimationFrame(() => {
        setBossHurt(true)
        bossHurtTimerRef.current = setTimeout(() => setBossHurt(false), 450)
      }))
      addDmgNum(`-${dmg}`, 'ar-dmg-hit')
    }
    prevEnemyHPRef.current = enemyHP
  }, [enemyHP, phase]) // eslint-disable-line

  // ─── Handler comms HP thresholds ─────────────────────────────────────────────
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

  // ─── Completion ───────────────────────────────────────────────────────────────
  const handleCompletion = useCallback(async () => {
    if (user) await completeQuest(config.questId, config.completionXp)
    setShowCompletion(true)
  }, [user, completeQuest, config.questId, config.completionXp])

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

  // ─── STRIKE — resolves wards that pass now but haven't been struck yet ────────
  const handleStrike = useCallback(() => {
    setCastKey(k => k + 1)
    // Launch a projectile toward the boss
    const pid = ++projIdRef.current
    setProjectiles(prev => [...prev, pid])
    setTimeout(() => setProjectiles(prev => prev.filter(p => p !== pid)), 500)
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
    const startX = e.clientX - panel.offsetLeft
    const startY = e.clientY - panel.offsetTop
    const onMove = (me) => {
      panel.style.left = `${me.clientX - startX}px`
      panel.style.top = `${me.clientY - startY}px`
      panel.style.right = 'auto'
      panel.style.bottom = 'auto'
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [])

  // ─── Computed ─────────────────────────────────────────────────────────────────
  const enemyPct   = Math.max(0, (enemyHP  / ENEMY_HP_MAX)  * 100)
  const playerPct  = Math.max(0, (playerHP / PLAYER_HP_MAX) * 100)
  const playerLow  = playerHP <= 30
  const passedCount = Object.values(wardResults).filter(Boolean).length
  const failCount  = config.wards.length - passedCount
  // Button lights up when ≥1 ward passes that hasn't been struck yet
  const canStrike  = phase === 'active' && config.wards.some(w => wardResults[w.id] && !struckWards.has(w.id))
  const EnemySVG   = ENEMY_SVGS[config.enemy.svgVariant] ?? ENEMY_SVGS[1]
  const filename   = config.language === 'css' ? 'style.css' : 'index.html'
  const level      = profile?.level ?? 1
  const displayName = profile?.name ?? user?.email ?? 'K'
  const xpInLevel  = profile?.xpInLevel ?? 0
  const xpNeeded   = profile?.xpNeeded ?? 100

  const bossCls = enemyHP <= 0 ? 'dead'
    : bossHurt ? 'hurt'
    : enemyHP <= ENEMY_HP_MAX * 0.5 ? 'enraged'
    : 'idle'

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="ar-shell">

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

        {/* Left rail — objective + wards + preview */}
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

          <div>
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
                    {wardResults[w.id] ? '✓' : config.wardFailIcon}
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

        {/* Arena — the fight scene */}
        <div className="ar-arena">

          {/* Environment */}
          <div className="ar-floor" />
          <div className="ar-torch ar-torch-l" />
          <div className="ar-torch ar-torch-r" />

          {/* Boss entity */}
          <div className={`ar-boss-wrap ${bossCls}`}>
            <div className="ar-boss-hp-above">
              <span className="ar-boss-hp-above-name">{config.enemy.name}</span>
              <div className="ar-boss-hp-above-track">
                <div className="ar-boss-hp-above-fill" style={{ width: `${enemyPct}%` }} />
              </div>
              <span className="ar-boss-hp-above-val">{enemyHP} / {ENEMY_HP_MAX}</span>
            </div>
            <div className="ar-boss-svg-wrap">
              <EnemySVG />
            </div>
          </div>

          {/* Hero / Daemon */}
          <div className="ar-hero-wrap">
            <Daemon ability={config.ability} state={daemonState} animKey={daemonAnimKey} />
          </div>

          {/* Projectiles — fly from hero to boss on STRIKE */}
          {projectiles.map(id => (
            <div key={id} className="ar-projectile" />
          ))}

          {/* Damage numbers */}
          {dmgNums.map(n => (
            <span key={n.id} className={`ar-dmg-num ${n.cls}`}>{n.text}</span>
          ))}

          {/* Red-edge vignette on player hit */}
          {showVignette && (
            <div
              key={vignetteKey}
              className="ar-vignette"
              onAnimationEnd={() => setShowVignette(false)}
            />
          )}

          {/* Floating code panel (drag via header) */}
          <div className="ar-code-panel" ref={panelRef}>
            <div className="ar-panel-header" onMouseDown={onPanelDragStart}>
              <span className="ar-panel-filename">{filename}</span>
              <span className={`ar-panel-status ${failCount === 0 ? 'clear' : 'errors'}`}>
                {failCount === 0 ? '✓ all pass' : `${failCount} failing`}
              </span>
            </div>
            <div className="ar-monaco-wrap">
              <Editor
                height="260px"
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

        </div>
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
        <div className="ar-hud-right">● KIRA ON</div>
      </div>


      {/* ── Overlays ───────────────────────────────────────────────────────────── */}

      {phase === 'fell' && (
        <div className="ar-fell-overlay">
          <div className="ar-fell-inner">
            <div className="ar-fell-title">DAEMON FELL</div>
            <div className="ar-fell-sub">KIRA // HANDLER</div>
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

      {showCompletion && (
        <div className="ar-completion-overlay">
          <div className="ar-completion-inner">
            <span className="ar-completion-chip">{config.completion.chip}</span>
            <div className="ar-completion-heading">{config.completion.heading}</div>
            <p
              className="ar-completion-body"
              dangerouslySetInnerHTML={{ __html: config.completion.body }}
            />
            <div className="ar-completion-rewards">
              {config.completion.rewards.map((r, i) => (
                <div key={i} className="ar-completion-reward">
                  <span className="ar-completion-reward-label">{r.label}</span>
                  <span className="ar-completion-reward-val">{r.value}</span>
                </div>
              ))}
            </div>
            {config.nextGate && (
              <>
                <div className="ar-completion-next-label">{config.completion.nextLabel}</div>
                <div className="ar-completion-next-card">
                  <span className="ar-completion-next-icon">{config.completion.nextIcon}</span>
                  <div>
                    <div className="ar-completion-next-title">{config.completion.nextTitle}</div>
                    <div className="ar-completion-next-sub">{config.completion.nextSub}</div>
                  </div>
                </div>
              </>
            )}
            <button className="ar-completion-btn" onClick={handleNext}>
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

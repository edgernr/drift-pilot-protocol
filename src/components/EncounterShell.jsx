import { useState, useEffect, useRef, useCallback } from 'react'
import Editor from '@monaco-editor/react'
import { useCombat } from '../context/CombatContext'
import { useAuth } from '../context/AuthContext'
import { useNav } from '../context/NavigationContext'
import { useQuestAnalytics } from '../hooks/useQuestAnalytics'
import { on } from '../lib/combatBus'
import HandlerComms from './HandlerComms'
import Daemon from './Daemon'
import QuestQuiz from '../screens/QuestQuiz'
import { ENEMY_SVGS } from './EnemySVGs'
import { getHandlerLine } from '../data/handlerScript'
import { supabase } from '../lib/supabase'
import './EncounterShell.css'

export default function EncounterShell({ config }) {
  const { goto } = useNav()
  const { user, profile, completeQuest } = useAuth()
  // Anti-cheat / analytics (paste block, timing, flagging) — same hook the
  // legacy gate screens used; results flow into completeQuest.
  const { onPaste, trackChange, getAnalytics, pasteBlocked } = useQuestAnalytics()

  const {
    playerHP, enemyHP, combo, phase,
    PLAYER_HP_MAX, ENEMY_HP_MAX,
    startEncounter, resolveCheck, resolveQuiz,
    resolveExecError, bleedDamage, fall, win, respawn, resetEncounter,
  } = useCombat()

  // ─── State ───────────────────────────────────────────────────────────────────
  const [variantIdx] = useState(() =>
    Math.floor(Math.random() * (config.variants?.length || 1))
  )
  // Starter code: getStarterCode() when the gate separates player code from
  // variant documents (CSS + JS gates); otherwise the variant IS the code (HTML gates).
  const [code, setCode] = useState(() =>
    config.getStarterCode
      ? config.getStarterCode()
      : (config.variants?.[variantIdx] ?? '')
  )
  const [wardResults, setWardResults] = useState(() =>
    Object.fromEntries(config.wards.map(w => [w.id, false]))
  )
  const [activeTab, setActiveTab] = useState('preview')
  const [daemonState, setDaemonState] = useState('idle')
  const [daemonAnimKey, setDaemonAnimKey] = useState(0)
  const [dmgNums, setDmgNums] = useState([])
  const [showVignette, setShowVignette] = useState(false)
  const [vignetteKey, setVignetteKey] = useState(0)
  const [handlerMsg, setHandlerMsg] = useState(null)
  const [showQuiz, setShowQuiz] = useState(false)
  const [showCompletion, setShowCompletion] = useState(false)
  const [brandOverride, setBrandOverride] = useState(null)
  const [castKey, setCastKey] = useState(0)
  const [expandedHint, setExpandedHint] = useState(null)
  const [started, setStarted] = useState(false)

  // ─── Refs ────────────────────────────────────────────────────────────────────
  const checkIframeRef = useRef(null)
  const previewIframeRef = useRef(null)
  const wardResultsRef = useRef(wardResults)
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

  // ─── Keep combat fn refs fresh ───────────────────────────────────────────────
  useEffect(() => { resolveCheckRef.current = resolveCheck }, [resolveCheck])
  useEffect(() => { resolveQuizRef.current = resolveQuiz }, [resolveQuiz])
  useEffect(() => { bleedDamageRef.current = bleedDamage }, [bleedDamage])
  useEffect(() => { wardResultsRef.current = wardResults }, [wardResults])

  // ─── Start encounter on mount ─────────────────────────────────────────────────
  useEffect(() => {
    if (!started) {
      startEncounter(config.wards.length)
      setStarted(true)
      setHandlerMsg(getHandlerLine(config.ability, 'entry'))
    }
  }, [started, startEncounter, config])

  // ─── Preview iframe update ───────────────────────────────────────────────────
  useEffect(() => {
    if (!previewIframeRef.current) return
    // Extra args are harmless for 1-arg builders (HTML gates ignore them).
    previewIframeRef.current.srcdoc = config.buildPreview(code, variantIdx, brandOverride)
  }, [code, variantIdx, brandOverride, config])

  // ─── Check runner (debounced 350ms) ──────────────────────────────────────────
  const runChecks = useCallback(() => {
    const iframe = checkIframeRef.current
    if (!iframe) return

    const srcdoc = config.buildCheckDoc(code, variantIdx)
    iframe.srcdoc = srcdoc

    iframe.onload = () => {
      requestAnimationFrame(() => {
        const doc = iframe.contentDocument
        const win = iframe.contentWindow
        if (!doc || !win) return

        const newResults = {}
        config.wards.forEach(w => {
          try {
            newResults[w.id] = w.test(doc, win, code)
          } catch {
            newResults[w.id] = false
          }
        })

        wardResultsRef.current = newResults
        setWardResults(newResults)
      })
    }
  }, [code, variantIdx, config])

  useEffect(() => {
    const timer = setTimeout(runChecks, 350)
    return () => clearTimeout(timer)
  }, [runChecks])

  // ─── Watch phase changes ─────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== prevPhaseRef.current) {
      prevPhaseRef.current = phase
      if (phase === 'active') {
        setDaemonState('idle')
      }
    }
  }, [phase])

  // ─── Watch playerHP for damage vignette ──────────────────────────────────────
  useEffect(() => {
    if (playerHP < prevPlayerHPRef.current && phase === 'active') {
      const lost = prevPlayerHPRef.current - playerHP
      setShowVignette(true)
      setVignetteKey(k => k + 1)
      setDaemonState('glitch')
      setDaemonAnimKey(k => k + 1)
      addDmgNum(`-${lost}`, 'es-dmg-damage')
    }
    prevPlayerHPRef.current = playerHP
  }, [playerHP, phase]) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Watch enemyHP for hit animation ─────────────────────────────────────────
  useEffect(() => {
    if (enemyHP < prevEnemyHPRef.current && phase === 'active') {
      const dmg = Math.round(prevEnemyHPRef.current - enemyHP)
      setDaemonState('attack')
      setDaemonAnimKey(k => k + 1)
      addDmgNum(`-${dmg}`, 'es-dmg-hit')
      setActiveTab('combat')
      setTimeout(() => setDaemonState('idle'), 600)
    }
    prevEnemyHPRef.current = enemyHP
  }, [enemyHP, phase]) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Handler comms HP thresholds ─────────────────────────────────────────────
  useEffect(() => {
    if (playerHP <= 30 && prevPlayerHPForHandler.current > 30) {
      setHandlerMsg(getHandlerLine(config.ability, 'low_30'))
    } else if (playerHP <= 60 && prevPlayerHPForHandler.current > 60) {
      setHandlerMsg(getHandlerLine(config.ability, 'low_60'))
    }
    prevPlayerHPForHandler.current = playerHP
  }, [playerHP, config.ability])

  // ─── Idle bleed (reset timer on code change) ─────────────────────────────────
  useEffect(() => {
    if (phase !== 'active') {
      clearInterval(bleedTimerRef.current)
      bleedCountRef.current = 0
      return
    }
    bleedCountRef.current = 0
    bleedTimerRef.current = setInterval(() => {
      bleedCountRef.current += 1
      if (bleedCountRef.current > 90) {
        bleedDamageRef.current?.()
      }
    }, 1000)
    return () => clearInterval(bleedTimerRef.current)
  }, [phase, code])

  // ─── Combat bus: encounter:won ────────────────────────────────────────────────
  // Boss HP reaching 0 alone does NOT complete the gate — quiz must also pass.
  // completion is driven by handleQuizPass; these guards catch edge cases only.
  useEffect(() => {
    return on('encounter:won', () => {
      if (quizPassedRef.current && !completionFiredRef.current) {
        completionFiredRef.current = true
        handleCompletion()
      }
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (phase === 'won' && quizPassedRef.current && !completionFiredRef.current) {
      completionFiredRef.current = true
      handleCompletion()
    }
  }, [phase]) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Damage number helper ─────────────────────────────────────────────────────
  const addDmgNum = useCallback((text, cls) => {
    const id = ++dmgIdRef.current
    setDmgNums(prev => [...prev, { id, text, cls }])
    setTimeout(() => {
      setDmgNums(prev => prev.filter(n => n.id !== id))
    }, 950)
  }, [])

  // ─── CAST handler ─────────────────────────────────────────────────────────────
  // Fixing a ward turns it green (visual, via debounce).
  // Pressing CAST is what actually deals damage — one hit per newly-passing ward.
  // Quiz only unlocks when every ward passes (boss HP = 0).
  const handleCast = useCallback(() => {
    setCastKey(k => k + 1)
    setActiveTab('combat')

    const iframe = checkIframeRef.current
    if (!iframe) return

    iframe.srcdoc = config.buildCheckDoc(code, variantIdx)
    iframe.onload = () => {
      requestAnimationFrame(() => {
        const doc = iframe.contentDocument
        const win = iframe.contentWindow
        if (!doc || !win) return

        const newResults = {}
        config.wards.forEach(w => {
          try { newResults[w.id] = w.test(doc, win, code) } catch { newResults[w.id] = false }
        })

        const prev = wardResultsRef.current
        const newlyPassed = config.wards.filter(w => newResults[w.id] && !prev[w.id])
        newlyPassed.forEach(() => resolveCheckRef.current?.(true))

        wardResultsRef.current = newResults
        setWardResults(newResults)

        if (config.generateOverride) {
          setBrandOverride(config.generateOverride(code))
        }

        const allPass = config.wards.every(w => newResults[w.id])
        if (allPass) {
          setTimeout(() => setShowQuiz(true), 350)
        }
      })
    }
  }, [code, variantIdx, config])

  // ─── Completion ───────────────────────────────────────────────────────────────
  const handleCompletion = useCallback(async () => {
    if (user) {
      await completeQuest(config.questId, config.completionXp, getAnalytics())
    }
    setShowCompletion(true)
  }, [user, completeQuest, config.questId, config.completionXp, getAnalytics])

  // ─── Quiz handlers ────────────────────────────────────────────────────────────
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

  // ─── Fell / respawn ───────────────────────────────────────────────────────────
  const handleRespawn = useCallback(() => {
    respawn()
    setActiveTab('preview')
  }, [respawn])

  // ─── Navigate to next gate ────────────────────────────────────────────────────
  const handleNext = useCallback(() => {
    setShowCompletion(false)
    resetEncounter()
    if (config.nextGate) {
      goto(config.nextGate)
    } else {
      goto('dashboard')
    }
  }, [config.nextGate, goto, resetEncounter])

  // ─── Computed values ──────────────────────────────────────────────────────────
  const enemyPct = Math.max(0, (enemyHP / ENEMY_HP_MAX) * 100)
  const playerPct = Math.max(0, (playerHP / PLAYER_HP_MAX) * 100)
  const playerLow = playerHP <= 30
  const passedCount = Object.values(wardResults).filter(Boolean).length
  const failCount = config.wards.length - passedCount
  const EnemySVG = ENEMY_SVGS[config.enemy.svgVariant] ?? ENEMY_SVGS[1]
  const filename = config.language === 'css' ? 'style.css'
    : (config.language === 'javascript' || config.language === 'js') ? 'app.js'
    : 'index.html'
  const editorLanguage = config.language === 'js' ? 'javascript' : config.language

  // XP display values from profile
  const xp = profile?.totalXp ?? 0
  const xpInLevel = profile?.xpInLevel ?? 0
  const xpNeeded = profile?.xpNeeded ?? 100
  const xpPct = xpNeeded > 0 ? Math.round((xpInLevel / xpNeeded) * 100) : 0
  const xpToNext = profile?.xpNeeded ?? 100
  const level = profile?.level ?? 1
  const displayName = profile?.name ?? user?.email ?? 'K'

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="es-shell">

      {/* Top bar */}
      <header className="es-topbar">
        <button className="es-topbar-back" onClick={() => goto('dashboard')}>← Dashboard</button>
        <div className="es-topbar-center">
          <span className="es-rank-tag">RANK {config.rank} · GATE {String(config.gateNum).padStart(2, '0')}</span>
          <div className="es-gate-title">{config.title}</div>
        </div>
        <div className="es-topbar-xp">
          <span className="es-xp-label">{xpInLevel} / {xpToNext} XP</span>
          <div className="es-xp-track">
            <div className="es-xp-fill" style={{ width: `${xpPct}%` }} />
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="es-body">

        {/* Left rail */}
        <aside className="es-left-rail">
          <div className="es-scene">
            <EnemySVG />
            <span className="es-scene-enemy-name">{config.enemy.name}</span>
          </div>
          <div className="es-narrator">
            <div className="es-narrator-label">▶ HANDLER</div>
            <p className="es-narrator-text">{config.narrator}</p>
          </div>
          {handlerMsg && (
            <div className="es-handler-wrap">
              <HandlerComms message={handlerMsg} />
            </div>
          )}
          <div className="es-scanner">
            <div className="es-scanner-header">
              <span className="es-scanner-label">{config.scannerLabel}</span>
              <span className={`es-scanner-count${failCount === 0 ? ' clear' : ''}`}>
                {failCount === 0 ? 'CLEAR' : `${failCount} ${config.scannerUnit}`}
              </span>
            </div>
            {config.wards.map(w => (
              <div
                key={w.id}
                className={`es-ward${wardResults[w.id] ? ' passed' : ''}`}
                onClick={() => setExpandedHint(expandedHint === w.id ? null : w.id)}
              >
                <div className="es-ward-row">
                  <span className={`es-ward-icon${wardResults[w.id] ? ' pass' : ' fail'}`}>
                    {wardResults[w.id] ? '✓' : config.wardFailIcon}
                  </span>
                  <span className="es-ward-label">{w.label}</span>
                </div>
                {expandedHint === w.id && !wardResults[w.id] && (
                  <div className="es-ward-hint">{w.hint}</div>
                )}
              </div>
            ))}
          </div>
        </aside>

        {/* Editor column */}
        <div className="es-editor-col">
          <div className="es-editor-header">
            <span className="es-editor-filename">{filename}</span>
            <span className={`es-editor-errors${failCount === 0 ? ' clear' : ''}`}>
              {pasteBlocked ? '✕ PASTE BLOCKED — type it' : failCount === 0 ? '✓ all checks pass' : `${failCount} failing`}
            </span>
          </div>
          <div className="es-monaco-wrap" onPasteCapture={onPaste}>
            <Editor
              height="100%"
              language={editorLanguage}
              value={code}
              onChange={val => { trackChange((val ?? '').length); setCode(val ?? '') }}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                lineHeight: 20,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                fontLigatures: true,
                padding: { top: 12 },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                lineNumbers: 'on',
                renderLineHighlight: 'line',
              }}
            />
          </div>
          <div className="es-cast-strip">
            <button
              className="es-cast-btn"
              onClick={handleCast}
              disabled={phase === 'fell'}
            >
              ▶ CAST
            </button>
            <div className="es-cast-bar-wrap">
              {castKey > 0 && <div key={castKey} className="es-cast-bar-fill" />}
            </div>
            <span className={`es-combo-display${combo >= 3 ? ' active' : ''}`}>
              {combo >= 3 ? `×${combo} COMBO` : `×0 COMBO`}
            </span>
          </div>
        </div>

        {/* Combat rail */}
        <aside className="es-combat-rail">
          {/* Enemy HP block */}
          <div className="es-enemy-hp-block">
            <div className="es-enemy-target-label">
              DAEMON TARGET · <span>{config.enemy.name}</span>
            </div>
            <div className="es-hp-track">
              <div className="es-hp-fill es-enemy-fill" style={{ width: `${enemyPct}%` }} />
            </div>
            <span className="es-hp-val">{enemyHP} / {ENEMY_HP_MAX}</span>
          </div>

          {/* Tab toggle */}
          <div className="es-tab-bar">
            <button
              className={`es-tab-btn${activeTab === 'preview' ? ' active' : ''}`}
              onClick={() => setActiveTab('preview')}
            >PREVIEW</button>
            <button
              className={`es-tab-btn${activeTab === 'combat' ? ' active' : ''}`}
              onClick={() => setActiveTab('combat')}
            >COMBAT</button>
          </div>

          {/* Tab content */}
          <div className="es-tab-content">
            {activeTab === 'preview' ? (
              <div className="es-preview-tab">
                <iframe
                  ref={previewIframeRef}
                  title="live preview"
                  className="es-preview-frame"
                  sandbox="allow-scripts"
                />
              </div>
            ) : (
              <div className="es-combat-scene">
                <div className="es-combat-enemy-art">
                  <EnemySVG />
                </div>
                <Daemon ability={config.ability} state={daemonState} animKey={daemonAnimKey} />
                {dmgNums.map(n => (
                  <span key={n.id} className={`es-dmg-num ${n.cls}`}>{n.text}</span>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Bottom HUD */}
      <div className="es-bottom-hud">
        <div className="es-hud-left">
          <span className="es-hud-identity">
            {displayName} · LV.{level}
          </span>
          <div className="es-player-hp-wrap">
            <span className={`es-player-hp-label${playerLow ? ' low' : ''}`}>DAEMON HP</span>
            <div className="es-player-hp-track">
              <div
                className={`es-player-hp-fill${playerLow ? ' low' : ''}`}
                style={{ width: `${playerPct}%` }}
              />
            </div>
            <span className="es-hud-hp-val">{playerHP}/{PLAYER_HP_MAX}</span>
          </div>
        </div>
        <div className="es-hud-center">{config.region} · GATE {String(config.gateNum).padStart(2, '0')}</div>
        <div className="es-hud-right">● HANDLER ON</div>
      </div>

      {/* Offscreen check iframe — positioned offscreen (NOT display:none) so it
          computes real layout: getComputedStyle / getBoundingClientRect /
          scrollWidth all resolve. Per-gate viewport (Gate 08 renders at 390px
          to genuinely test mobile-first) and sandbox (Gate 09 needs
          allow-same-origin to observe script-driven DOM mutations). */}
      <iframe
        ref={checkIframeRef}
        title="check"
        style={{
          position: 'absolute',
          left: '-99999px',
          top: 0,
          width: `${config.checkViewport?.width ?? 1100}px`,
          height: `${config.checkViewport?.height ?? 800}px`,
          border: 0,
          pointerEvents: 'none',
          visibility: 'hidden',
        }}
        sandbox={config.checkSandbox ?? 'allow-scripts allow-same-origin'}
      />

      {/* ─── Overlays ─────────────────────────────────────────────────────────── */}

      {showVignette && (
        <div
          key={vignetteKey}
          className="es-vignette"
          onAnimationEnd={() => setShowVignette(false)}
        />
      )}

      {phase === 'fell' && (
        <div className="es-fell-overlay">
          <div className="es-fell-inner">
            <div className="es-fell-title">DAEMON FELL</div>
            <div className="es-fell-sub">VERA // HANDLER</div>
            <div className="es-fell-progress">
              {passedCount > 0
                ? `${passedCount}/${config.wards.length} checks survived — no progress lost.`
                : 'No progress lost. Respawn and continue.'}
            </div>
            <button className="es-fell-btn" onClick={handleRespawn}>RESPAWN</button>
          </div>
        </div>
      )}

      {showQuiz && (
        <QuestQuiz
          quiz={config.quiz}
          onPass={handleQuizPass}
          onFail={handleQuizFail}
        />
      )}

      {showCompletion && (
        <div className="es-completion-overlay">
          <div className="es-completion-inner">
            <span className="es-completion-chip">{config.completion.chip}</span>
            <div className="es-completion-heading">{config.completion.heading}</div>
            <p
              className="es-completion-body"
              dangerouslySetInnerHTML={{ __html: config.completion.body }}
            />
            <div className="es-completion-rewards">
              {config.completion.rewards.map((r, i) => (
                <div key={i} className="es-completion-reward">
                  <span className="es-completion-reward-label">{r.label}</span>
                  <span className="es-completion-reward-val">{r.value}</span>
                </div>
              ))}
            </div>
            {config.nextGate && (
              <>
                <div className="es-completion-next-label">{config.completion.nextLabel}</div>
                <div className="es-completion-next-card">
                  <span className="es-completion-next-icon">{config.completion.nextIcon}</span>
                  <div>
                    <div className="es-completion-next-title">{config.completion.nextTitle}</div>
                    <div className="es-completion-next-sub">{config.completion.nextSub}</div>
                  </div>
                </div>
              </>
            )}
            <button className="es-completion-btn" onClick={handleNext}>
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

import { useState, useEffect, useRef, useCallback } from 'react'
import './CombatHUD.css'
import { on } from '../lib/combatBus'
import { useCombat } from '../context/CombatContext'
import Daemon from './Daemon'
import HandlerComms from './HandlerComms'
import { getHandlerLine } from '../data/handlerScript'

let _dmgId = 0

export default function CombatHUD({ isCompiling, wrapRef, ability }) {
  const {
    playerHP, enemyHP, combo, phase, respawn,
    PLAYER_HP_MAX, ENEMY_HP_MAX,
  } = useCombat()

  const [dmgNumbers, setDmgNumbers] = useState([])
  const [playerFlash, setPlayerFlash] = useState(false)
  // key trick: remount the vignette div to retrigger CSS animation on repeated hits
  const flashKeyRef = useRef(0)

  const [daemonState, setDaemonState] = useState('idle')
  const [daemonAnimKey, setDaemonAnimKey] = useState(0)

  // Handler comms state
  const [handlerMsg, setHandlerMsg] = useState(null)
  const handlerTimerRef = useRef(null)
  const shownThresholdsRef = useRef(new Set())
  const prevPhaseRef = useRef('idle')

  const showHandler = useCallback((msg) => {
    if (handlerTimerRef.current) clearTimeout(handlerTimerRef.current)
    setHandlerMsg(msg)
    handlerTimerRef.current = setTimeout(() => setHandlerMsg(null), 5000)
  }, [])

  // Trigger handler on phase change (entry message on encounter start)
  useEffect(() => {
    const wasIdle = prevPhaseRef.current === 'idle'
    prevPhaseRef.current = phase
    if (phase === 'active' && wasIdle) {
      shownThresholdsRef.current.clear()
      showHandler(getHandlerLine(ability, 'entry'))
    }
  }, [phase, ability, showHandler])

  // Trigger handler on HP thresholds
  useEffect(() => {
    if (phase !== 'active') return
    if (playerHP <= 30 && !shownThresholdsRef.current.has(30)) {
      shownThresholdsRef.current.add(30)
      showHandler(getHandlerLine(ability, 'low_30'))
    } else if (playerHP <= 60 && !shownThresholdsRef.current.has(60)) {
      shownThresholdsRef.current.add(60)
      showHandler(getHandlerLine(ability, 'low_60'))
    }
  }, [playerHP, phase, ability, showHandler])

  // Cleanup handler timer on unmount
  useEffect(() => {
    return () => { if (handlerTimerRef.current) clearTimeout(handlerTimerRef.current) }
  }, [])

  useEffect(() => {
    const unsubs = [
      on('hit', ({ damage }) => {
        const id = ++_dmgId
        setDmgNumbers(n => [...n, { id, value: `-${damage}`, type: 'hit' }])
        setTimeout(() => setDmgNumbers(n => n.filter(x => x.id !== id)), 950)

        // Screen shake on gate root
        if (wrapRef?.current) {
          wrapRef.current.classList.remove('ch-shake')
          // Force reflow so re-adding the class triggers the animation
          void wrapRef.current.offsetWidth
          wrapRef.current.classList.add('ch-shake')
          setTimeout(() => wrapRef.current?.classList.remove('ch-shake'), 350)
        }

        // Daemon attack
        setDaemonState('attack')
        setDaemonAnimKey(k => k + 1)
        setTimeout(() => setDaemonState('idle'), 500)
      }),

      on('damage', ({ amount }) => {
        const id = ++_dmgId
        setDmgNumbers(n => [...n, { id, value: `-${amount}`, type: 'damage' }])
        setTimeout(() => setDmgNumbers(n => n.filter(x => x.id !== id)), 950)

        // Red vignette flash — remount to retrigger animation
        flashKeyRef.current += 1
        setPlayerFlash(true)
        setTimeout(() => setPlayerFlash(false), 700)

        // Daemon glitch
        setDaemonState('glitch')
        setDaemonAnimKey(k => k + 1)
        setTimeout(() => setDaemonState('idle'), 700)
      }),
    ]
    return () => unsubs.forEach(u => u())
  }, [wrapRef])

  if (phase === 'idle') return null

  const enemyPct  = (enemyHP  / ENEMY_HP_MAX)  * 100
  const playerPct = (playerHP / PLAYER_HP_MAX) * 100
  const playerLow = playerHP <= 30
  const comboVisible = combo >= 3

  return (
    <>
      {/* Cast bar */}
      {isCompiling && (
        <div className="ch-cast-bar">
          <div className="ch-cast-fill" />
        </div>
      )}

      {/* Enemy HP — top right */}
      <div className="ch-enemy-hp">
        <div className="ch-hp-label">DAEMON TARGET</div>
        <div className="ch-hp-track">
          <div
            className={`ch-hp-fill ch-enemy-fill`}
            style={{ width: `${enemyPct}%` }}
          />
        </div>
        <span className="ch-hp-val">{enemyHP} / {ENEMY_HP_MAX}</span>
      </div>

      {/* Player HP — bottom left */}
      <div className="ch-player-hp">
        <div className="ch-hp-label">DAEMON HP</div>
        <div className="ch-hp-track">
          <div
            className={`ch-hp-fill ch-player-fill${playerLow ? ' ch-low' : ''}`}
            style={{ width: `${playerPct}%` }}
          />
        </div>
        <span className="ch-hp-val">{playerHP} / {PLAYER_HP_MAX}</span>
      </div>

      {/* Combo counter */}
      {comboVisible && (
        <div className="ch-combo" key={combo}>
          <span className="ch-combo-count">×{combo}</span>
          <span className="ch-combo-label">COMBO</span>
        </div>
      )}

      {/* Floating damage numbers */}
      {dmgNumbers.map(d => (
        <div
          key={d.id}
          className={`ch-dmg-num ch-dmg-${d.type}`}
        >
          {d.value}
        </div>
      ))}

      {/* Player hit vignette flash */}
      {playerFlash && (
        <div key={flashKeyRef.current} className="ch-vignette" />
      )}

      {/* Daemon — procedural combat construct */}
      <Daemon ability={ability} state={daemonState} animKey={daemonAnimKey} />

      {/* Handler comms panel */}
      <HandlerComms message={handlerMsg} />

      {/* Fall / respawn overlay */}
      {phase === 'fell' && (
        <div className="ch-fell-overlay">
          <div className="ch-fell-inner">
            <div className="ch-fell-title">DAEMON DESTROYED</div>
            <div className="ch-fell-villain">GORGOROTH BLACKBLOOD ENDURES</div>
            <div className="ch-fell-progress">
              Your progress is saved.<br />
              The gate remembers what you fixed.
            </div>
            <button className="ch-fell-btn" onClick={respawn}>
              RESPAWN
            </button>
          </div>
        </div>
      )}
    </>
  )
}

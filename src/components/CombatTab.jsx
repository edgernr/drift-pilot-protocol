import { useState, useEffect } from 'react'
import { on } from '../lib/combatBus'
import { useCombat } from '../context/CombatContext'
import './CombatTab.css'

let _logId = 0

export default function CombatTab({ checks }) {
  const {
    playerHP, enemyHP, combo, phase,
    damagePerCheck, comboMult,
    PLAYER_HP_MAX, ENEMY_HP_MAX,
  } = useCombat()

  const [log, setLog] = useState([])

  useEffect(() => {
    const unsubs = [
      on('hit', ({ damage, newEnemyHP }) => {
        const id = ++_logId
        setLog(l => [
          { id, type: 'hit', text: `HIT · ${damage} dmg dealt · enemy ${newEnemyHP} HP` },
          ...l,
        ].slice(0, 8))
      }),
      on('damage', ({ amount, source, newPlayerHP }) => {
        const id = ++_logId
        const src =
          source === 'idleBleed' ? 'IDLE BLEED' :
          source === 'quiz'      ? 'WRONG ANSWER' :
          source === 'execError' ? 'EXEC ERROR' : 'BUG DETECTED'
        setLog(l => [
          { id, type: 'damage', text: `${src} · -${amount} HP · ${newPlayerHP} remain` },
          ...l,
        ].slice(0, 8))
      }),
    ]
    return () => unsubs.forEach(u => u())
  }, [])

  const enemyPct  = (enemyHP  / ENEMY_HP_MAX)  * 100
  const playerPct = (playerHP / PLAYER_HP_MAX) * 100
  const playerLow = playerHP <= 30
  const passCount = checks.filter(c => c.passed).length

  if (phase === 'idle') {
    return (
      <div className="ctab-idle">
        <span className="ctab-idle-dot" />
        Encounter not active
      </div>
    )
  }

  return (
    <div className="ctab-wrap">

      {/* HP bars */}
      <div className="ctab-bars">
        <div className="ctab-bar-row">
          <span className="ctab-bar-name enemy">ENEMY</span>
          <div className="ctab-bar-track">
            <div className="ctab-bar-fill enemy" style={{ width: `${enemyPct}%` }} />
          </div>
          <span className="ctab-bar-val">{enemyHP}/{ENEMY_HP_MAX}</span>
        </div>
        <div className="ctab-bar-row">
          <span className={`ctab-bar-name player${playerLow ? ' low' : ''}`}>DAEMON</span>
          <div className="ctab-bar-track">
            <div className={`ctab-bar-fill player${playerLow ? ' low' : ''}`} style={{ width: `${playerPct}%` }} />
          </div>
          <span className="ctab-bar-val">{playerHP}/{PLAYER_HP_MAX}</span>
        </div>
        {combo >= 3 && (
          <div className="ctab-combo">
            ×{combo} COMBO &nbsp;·&nbsp; ×{comboMult.toFixed(2)} XP MULT
          </div>
        )}
      </div>

      {/* Check list */}
      <div className="ctab-section">
        <div className="ctab-hd">
          CHECKS &nbsp;·&nbsp; {passCount}/{checks.length} PASSED &nbsp;·&nbsp; {damagePerCheck || '?'} DMG EACH
        </div>
        <div className="ctab-checks">
          {checks.map((c, i) => (
            <div key={c.id || i} className={`ctab-check ${c.passed ? 'pass' : 'fail'}`}>
              <span className="ctab-ck-icon">{c.passed ? '✓' : '✗'}</span>
              <span className="ctab-ck-label">{c.label}</span>
              {c.passed && <span className="ctab-ck-hit">HIT</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Combat log */}
      <div className="ctab-section">
        <div className="ctab-hd">COMBAT LOG</div>
        {log.length === 0 ? (
          <div className="ctab-log-empty">
            No events yet — fix a check to register a hit.
          </div>
        ) : (
          <div className="ctab-log">
            {log.map(e => (
              <div key={e.id} className={`ctab-log-row ${e.type}`}>
                {e.text}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

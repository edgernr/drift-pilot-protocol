import { useCombat } from '../context/CombatContext'
import { ENEMY_SVGS, WraithSVG } from './EnemySVGs'
import './DungeonTab.css'

// ── Component ────────────────────────────────────────────────────────────────────

export default function DungeonTab({ enemy, tier, ability, lore, variant }) {
  const { enemyHP, playerHP, ENEMY_HP_MAX, PLAYER_HP_MAX, phase, combo } = useCombat()

  const enemyPct  = Math.max(0, (enemyHP  / ENEMY_HP_MAX)  * 100)
  const playerPct = Math.max(0, (playerHP / PLAYER_HP_MAX) * 100)
  const playerLow = playerHP <= 30

  const SVGComponent = ENEMY_SVGS[variant] ?? WraithSVG
  const isBoss = tier.includes('BOSS') || tier === 'D'

  return (
    <div className="dtab-wrap">

      {/* ── Enemy header ── */}
      <div className="dtab-enemy-header">
        <span className="dtab-enemy-name">{enemy}</span>
        <span className={`dtab-tier-badge${isBoss ? ' boss' : ''}`}>RANK {tier}</span>
      </div>
      <div className="dtab-hp-row">
        <div className="dtab-hp-track">
          <div className="dtab-hp-fill dtab-enemy-fill" style={{ width: `${enemyPct}%` }} />
        </div>
        <span className="dtab-hp-val">{enemyHP}/{ENEMY_HP_MAX}</span>
      </div>

      {/* ── Arena ── */}
      <div className="dtab-arena">
        <SVGComponent />
        {phase === 'idle' && (
          <div className="dtab-idle-overlay">ENCOUNTER NOT ACTIVE</div>
        )}
      </div>

      {/* ── Ability chip ── */}
      <div className="dtab-ability-row">
        <span className="dtab-ability-label">ABILITY ACTIVE</span>
        <span className="dtab-ability-name">{ability}</span>
        {combo >= 3 && (
          <span className="dtab-combo-chip">×{combo} COMBO</span>
        )}
      </div>

      {/* ── Lore ── */}
      <p className="dtab-lore">{lore}</p>

      {/* ── Player HP ── */}
      <div className="dtab-player-section">
        <div className="dtab-player-header">
          <span className={`dtab-player-label${playerLow ? ' low' : ''}`}>DAEMON HP</span>
          <span className="dtab-hp-val">{playerHP}/{PLAYER_HP_MAX}</span>
        </div>
        <div className="dtab-hp-track">
          <div className={`dtab-hp-fill dtab-player-fill${playerLow ? ' low' : ''}`} style={{ width: `${playerPct}%` }} />
        </div>
      </div>

    </div>
  )
}

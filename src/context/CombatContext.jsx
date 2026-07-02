import { createContext, useContext, useRef, useState } from 'react'
import { emit } from '../lib/combatBus'

const CombatContext = createContext(null)

export const PLAYER_HP_MAX = 100
export const ENEMY_HP_MAX  = 100

// Player damage values (owner-tunable via CLAUDE.md combat defaults)
export const COMBAT_DAMAGE = {
  failedCheck: 15,
  wrongQuiz:   25,
  execError:   10,
  idleBleed:   1,   // per second after 90s idle
}

export const COMBO_TIERS = [
  { min: 8, mult: 1.5  },
  { min: 5, mult: 1.25 },
  { min: 3, mult: 1.1  },
]

export function comboMultiplier(combo) {
  return COMBO_TIERS.find(t => combo >= t.min)?.mult ?? 1
}

export function CombatProvider({ children }) {
  const [playerHP, setPlayerHP] = useState(PLAYER_HP_MAX)
  const [enemyHP,  setEnemyHP]  = useState(ENEMY_HP_MAX)
  const [combo,    setCombo]    = useState(0)
  // idle | active | fell | won
  const [phase,    setPhase]    = useState('idle')

  // Refs so resolvers always read current values (avoids stale-closure issues
  // when checks fire in quick succession via the debounced editor).
  const playerHPRef = useRef(PLAYER_HP_MAX)
  const enemyHPRef  = useRef(ENEMY_HP_MAX)
  const comboRef    = useRef(0)
  const phaseRef    = useRef('idle')
  const dmgPerCheck = useRef(ENEMY_HP_MAX)

  function _setPlayer(val) { playerHPRef.current = val; setPlayerHP(val) }
  function _setEnemy(val)  { enemyHPRef.current  = val; setEnemyHP(val)  }
  function _setCombo(val)  { comboRef.current     = val; setCombo(val)    }
  function _setPhase(val)  { phaseRef.current     = val; setPhase(val)    }

  // Call once per gate with the number of checks it contains.
  // ceil ensures the last hit always reaches exactly 0 even for non-even divisors.
  function startEncounter(checkCount) {
    const dpc = Math.ceil(ENEMY_HP_MAX / Math.max(checkCount, 1))
    dmgPerCheck.current = dpc
    _setPlayer(PLAYER_HP_MAX)
    _setEnemy(ENEMY_HP_MAX)
    _setCombo(0)
    _setPhase('active')
    emit('encounter:start', { checkCount, damagePerCheck: dpc })
  }

  // Call when a check transitions true (passed=true) or false (passed=false).
  function resolveCheck(passed) {
    if (phaseRef.current !== 'active') return
    if (passed) {
      const dpc      = dmgPerCheck.current
      const nextHP   = Math.max(0, enemyHPRef.current - dpc)
      const newCombo = comboRef.current + 1
      _setEnemy(nextHP)
      _setCombo(newCombo)
      emit('hit', { damage: dpc, newEnemyHP: nextHP, combo: newCombo, mult: comboMultiplier(newCombo) })
      if (nextHP === 0) win()
    } else {
      const nextHP = Math.max(0, playerHPRef.current - COMBAT_DAMAGE.failedCheck)
      _setPlayer(nextHP)
      _setCombo(0)
      emit('damage', { amount: COMBAT_DAMAGE.failedCheck, source: 'failedCheck', newPlayerHP: nextHP })
      if (nextHP === 0) fall()
    }
  }

  // Call with the quiz result; wrong answer deals player damage.
  function resolveQuiz(correct) {
    if (!correct) {
      if (phaseRef.current !== 'active') return
      const nextHP = Math.max(0, playerHPRef.current - COMBAT_DAMAGE.wrongQuiz)
      _setPlayer(nextHP)
      _setCombo(0)
      emit('damage', { amount: COMBAT_DAMAGE.wrongQuiz, source: 'wrongQuiz', newPlayerHP: nextHP })
      if (nextHP === 0) fall()
    }
  }

  // Call when the sandbox throws a runtime error.
  function resolveExecError() {
    if (phaseRef.current !== 'active') return
    const nextHP = Math.max(0, playerHPRef.current - COMBAT_DAMAGE.execError)
    _setPlayer(nextHP)
    _setCombo(0)
    emit('damage', { amount: COMBAT_DAMAGE.execError, source: 'execError', newPlayerHP: nextHP })
    if (nextHP === 0) fall()
  }

  // Called by the idle timer (90s inactivity → 1 HP/s bleed).
  function bleedDamage() {
    if (phaseRef.current !== 'active') return
    const nextHP = Math.max(0, playerHPRef.current - COMBAT_DAMAGE.idleBleed)
    _setPlayer(nextHP)
    emit('damage', { amount: COMBAT_DAMAGE.idleBleed, source: 'idleBleed', newPlayerHP: nextHP })
    if (nextHP === 0) fall()
  }

  // Player HP hit 0 — show fell screen, combo reset, no progress lost.
  function fall() {
    _setCombo(0)
    _setPhase('fell')
    emit('encounter:fell', {})
  }

  // All enemy HP drained — encounter won.
  function win() {
    const c = comboRef.current
    _setPhase('won')
    emit('encounter:won', { combo: c, mult: comboMultiplier(c) })
  }

  // Respawn: restore player HP only — enemy HP and check progress are preserved.
  function respawn() {
    _setPlayer(PLAYER_HP_MAX)
    _setCombo(0)
    _setPhase('active')
  }

  // Full reset: use when entering a fresh encounter.
  function resetEncounter() {
    _setPlayer(PLAYER_HP_MAX)
    _setEnemy(ENEMY_HP_MAX)
    _setCombo(0)
    _setPhase('active')
  }

  return (
    <CombatContext.Provider value={{
      playerHP, enemyHP, combo, phase,
      damagePerCheck: dmgPerCheck.current,
      comboMult: comboMultiplier(combo),
      startEncounter, resolveCheck, resolveQuiz, resolveExecError, bleedDamage,
      fall, win, respawn, resetEncounter,
      PLAYER_HP_MAX, ENEMY_HP_MAX, COMBAT_DAMAGE,
    }}>
      {children}
    </CombatContext.Provider>
  )
}

export function useCombat() {
  const ctx = useContext(CombatContext)
  if (!ctx) throw new Error('useCombat must be inside CombatProvider')
  return ctx
}

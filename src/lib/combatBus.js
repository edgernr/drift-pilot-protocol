// Lightweight pub/sub event bus for combat events.
// Consumers: CombatContext (emitter) → juice layer, SFX, VFX (subscribers, wired in Phase 1+).
//
// Events emitted by CombatContext:
//   encounter:start  { checkCount, damagePerCheck }
//   hit              { damage, newEnemyHP, combo, mult }
//   damage           { amount, source, newPlayerHP }   source: failedCheck | wrongQuiz | execError | idleBleed
//   encounter:fell   {}
//   encounter:won    { combo, mult }

const subs = new Map()

export function on(event, handler) {
  if (!subs.has(event)) subs.set(event, new Set())
  subs.get(event).add(handler)
  return () => subs.get(event)?.delete(handler)
}

export function emit(event, payload) {
  subs.get(event)?.forEach(h => h(payload))
}

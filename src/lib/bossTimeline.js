// Boss timeline engine (bible §7: "Scripted boss timeline — generalize to
// config"). Extracted from the play-tested Zero Hour Gorgoroth rig; the
// midpoint (WHERE SHE FELL) and the finale (THE PATCH) run on this too.
//
// Hard-won rules baked in (see PROGRESS.md 2026-07-09):
//  - The OWNER of the timers is stop(). Never guard start() behind a ref that
//    survives React StrictMode's dev double-mount — arm on every effect run,
//    let the cleanup tear down. stop() resets state so re-arming works.
//  - All timers (schedule, intervals, ad-hoc) are tracked and die together.
//
// API:
//   const tl = createBossTimeline(spec, actions)
//   spec = {
//     schedule:  [{ at: ms, action: 'name', args? }],              // one-shots (reschedulable)
//     intervals: [{ after: ms, every: ms, action: 'name', args?,   // repeating
//                   leading: false }],                             // leading: fire once at `after` too
//   }
//   actions = { name: (args) => void }   — the encounter's callbacks (use refs
//                                          inside them; the engine never holds React state)
//   tl.start()                    — arm everything (idempotent until stop)
//   tl.stop()                     — kill every timer; safe as effect cleanup
//   tl.reschedule('name', ms)     — move a scheduled one-shot (escalation)
//   tl.after(ms, fn)              — tracked ad-hoc timeout (dies with stop)
export function createBossTimeline(spec, actions) {
  let timers = []
  let started = false
  const named = new Map() // action name -> timeout id, for reschedulable one-shots

  const push = (id) => { timers.push(id); return id }
  const fire = (name, args) => actions[name]?.(args)

  function start() {
    if (started) return
    started = true
    for (const s of spec.schedule ?? []) {
      named.set(s.action, push(setTimeout(() => fire(s.action, s.args), s.at)))
    }
    for (const iv of spec.intervals ?? []) {
      push(setTimeout(() => {
        if (iv.leading) fire(iv.action, iv.args)
        push(setInterval(() => fire(iv.action, iv.args), iv.every))
      }, iv.after))
    }
  }

  function stop() {
    timers.forEach(id => { clearTimeout(id); clearInterval(id) })
    timers = []
    named.clear()
    started = false
  }

  function reschedule(action, atMs) {
    clearTimeout(named.get(action))
    named.set(action, push(setTimeout(() => fire(action), atMs)))
  }

  function after(ms, fn) {
    return push(setTimeout(fn, ms))
  }

  // Tracked ad-hoc interval — for repeating mechanics whose start time is
  // dynamic (e.g. corruption pulled forward by an escalation trigger).
  function every(everyMs, fn) {
    return push(setInterval(fn, everyMs))
  }

  return { start, stop, reschedule, after, every }
}

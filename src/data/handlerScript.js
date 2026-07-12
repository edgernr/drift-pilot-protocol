export const HANDLER_LINES = {
  'SYNTAX PULSE': {
    entry:  "Gate open. The Document Tomb is live. Fix the HTML structure — your Daemon fights with it.",
    low_60: "Daemon taking hits. Check your tag nesting — unclosed tags drag the whole structure down.",
    low_30: "Critical. Find the mismatched brackets before you fall. One error cascades into three.",
  },
  'SEMANTIC STRIKE': {
    entry:  "The Semantic Scanner locks on meaning, not markup. Replace those divs. Give the code purpose.",
    low_60: "Daemon losing cohesion. The scanner wants semantic elements — header, main, nav, section.",
    low_30: "You're bleeding out. Swap the divs for the right elements. The scanner sees everything.",
  },
  'FORM FORGE': {
    entry:  "The Label Eater hunts orphaned inputs. Wire every field or it consumes them.",
    low_60: "Daemon destabilizing. Every input needs a label with a matching `for` attribute.",
    low_30: "Low integrity. Match your `for` values to your `id` values. Exactly. No shortcuts.",
  },
  'PALETTE CAST': {
    entry:  "The Colorless stripped the district bare. Define the token system and cast the palette back.",
    low_60: "Daemon flickering. Make sure your color variables are declared in :root and applied with var().",
    low_30: "Critical integrity. One hardcoded hex in a rule and the whole system fractures. Check everything.",
  },
  'GRAVITY LOCK': {
    entry:  "District in freefall. The Unaligned knocked everything loose. Wire the flex rules — pull it back.",
    low_60: "Daemon destabilizing. The alignment checks are failing — make sure flex is on the right containers.",
    low_30: "Daemon nearly gone. Focus on the remaining float points before the district takes you with it.",
  },
  'GRID LATTICE': {
    entry:  "Elite hunt. The White Void doesn't fight — it erases whatever has no structure. Put the grid on the container and hold every line.",
    low_60: "Daemon losing ground. The Void pours through gaps — the container defines the tracks, not the cards. Check where your grid actually lives.",
    low_30: "It's taking the floor. Span the bar and footer edge to edge, let auto-fit hold the middle. One open seam and we lose the whole grid.",
  },
  'GHOST STEP': {
    entry:  "The Inert has no pulse — five dead components and a gallery that never learned to breathe. Wire the motion. Named transitions only; a blanket transition dulls every strike you throw.",
    low_60: "Daemon losing rhythm. Check your timing — every transition needs a specific property, a duration, and an easing. If a component still isn't moving, the animation isn't wired to it.",
    low_30: "Critical. You're striking off-beat. Scrub every trace of transition: all from the file and land your keyframes — translateY in from above, one full rotation on the ring. On the beat, Hunter.",
  },
  'STACK BREAK': {
    entry:  "Elite contract. THE STACK crushes anything not built mobile-first. Base styles for small screens — then grow with min-width. Give it nothing to crush.",
    low_60: "Daemon compressing. Check your media direction — max-width queries feed it. Mobile base first, desktop as the upgrade.",
    low_30: "Critical. One fixed width past the viewport and the column takes you. Fluid units, clamp the title, collapse the nav — now.",
  },
  'CONTROL WIRE': {
    entry:  "The Frozen Panel doesn't attack — it refuses. Structure was restoration. This is your first true code: wire it, and the room obeys.",
    low_60: "Daemon taking hits. Dead controls mean dead listeners — check that every addEventListener is on the element that actually exists.",
    low_30: "Critical. Your state variable is the truth, the DOM is the mirror. Stop reading the display — trust the variable and wire the rest.",
  },
  'LIVE FEED': {
    entry:  "Stratum boss. The Static City hoards a signal it was never built to receive. Punch through with fetch() and keep the feed alive — every failure mode you don't handle, it feeds on.",
    low_60: "Daemon taking static. Loading state before the await, error state in the catch. A blank screen is an open wound.",
    low_30: "Critical. The signal WILL break down here — that's the test. try/catch around the fetch, ?. on every nested field. Armor first. Then strike.",
  },
  default: {
    entry:  "Gate active. Your Daemon is compiled. Fight well.",
    low_60: "Your Daemon is taking damage. Read the checks — what does the scanner want that you haven't given it?",
    low_30: "Critical HP. Focus on the remaining checks before your Daemon falls.",
  },
}

export function getHandlerLine(ability, trigger) {
  const set = HANDLER_LINES[ability] || HANDLER_LINES.default
  return set[trigger] || HANDLER_LINES.default[trigger] || ''
}

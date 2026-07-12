// ─── Gate 07 — GHOST FEEDBACK · CONTRACT 007 vs THE INERT ──────────────────────
// Ported verbatim from the legacy Quest7.jsx screen: variant HTML, starter CSS,
// all 7 checks (mixed execution/regex), quiz, and preview assembly are unchanged.
// Only the framing (contract voice, completion copy, ability unlock) is new.

// ─── HTML templates ────────────────────────────────────────────────────────────

const VARIANT_HTML = [
  // Variant 0: Sector components
  `<div class="component-lab">
  <h2 class="lab-title">Component Lab — Sector Zero</h2>

  <div class="lab-section">
    <div class="lab-label">BUTTON</div>
    <button class="btn-primary">Launch Node</button>
    <button class="btn-ghost">Cancel</button>
  </div>

  <div class="lab-section">
    <div class="lab-label">CARD</div>
    <div class="hover-card">
      <div class="card-tag">NODE ALPHA</div>
      <div class="card-heading">Signal Active</div>
      <div class="card-body">All systems nominal. 847 connections maintained.</div>
    </div>
  </div>

  <div class="lab-section">
    <div class="lab-label">INPUT</div>
    <div class="input-wrap">
      <input class="text-input" type="text" placeholder="Enter sector ID..." />
    </div>
  </div>

  <div class="lab-section">
    <div class="lab-label">NOTIFICATION</div>
    <div class="notification">
      <span class="notif-icon">◈</span>
      <span class="notif-text">District Zero sync complete.</span>
    </div>
  </div>

  <div class="lab-section">
    <div class="lab-label">LOADER</div>
    <div class="loader-ring"></div>
  </div>
</div>`,

  // Variant 1: Command components
  `<div class="component-lab">
  <h2 class="lab-title">Component Lab — Command Centre</h2>

  <div class="lab-section">
    <div class="lab-label">BUTTON</div>
    <button class="btn-primary">Deploy Team</button>
    <button class="btn-ghost">Stand Down</button>
  </div>

  <div class="lab-section">
    <div class="lab-label">CARD</div>
    <div class="hover-card">
      <div class="card-tag">OP PHOENIX</div>
      <div class="card-heading">Mission Active</div>
      <div class="card-body">Team Alpha deployed. Objective Alpha cleared.</div>
    </div>
  </div>

  <div class="lab-section">
    <div class="lab-label">INPUT</div>
    <div class="input-wrap">
      <input class="text-input" type="text" placeholder="Operation codename..." />
    </div>
  </div>

  <div class="lab-section">
    <div class="lab-label">NOTIFICATION</div>
    <div class="notification">
      <span class="notif-icon">⟐</span>
      <span class="notif-text">Clearance level upgraded to Delta.</span>
    </div>
  </div>

  <div class="lab-section">
    <div class="lab-label">LOADER</div>
    <div class="loader-ring"></div>
  </div>
</div>`,

  // Variant 2: Reactor components
  `<div class="component-lab">
  <h2 class="lab-title">Component Lab — Reactor Grid</h2>

  <div class="lab-section">
    <div class="lab-label">BUTTON</div>
    <button class="btn-primary">Initiate Core</button>
    <button class="btn-ghost">Emergency Stop</button>
  </div>

  <div class="lab-section">
    <div class="lab-label">CARD</div>
    <div class="hover-card">
      <div class="card-tag">PRIMARY CORE</div>
      <div class="card-heading">Output Stable</div>
      <div class="card-body">Core temperature 18°C. Containment field at 98%.</div>
    </div>
  </div>

  <div class="lab-section">
    <div class="lab-label">INPUT</div>
    <div class="input-wrap">
      <input class="text-input" type="text" placeholder="Reactor ID..." />
    </div>
  </div>

  <div class="lab-section">
    <div class="lab-label">NOTIFICATION</div>
    <div class="notification">
      <span class="notif-icon">※</span>
      <span class="notif-text">Secondary core variance within tolerance.</span>
    </div>
  </div>

  <div class="lab-section">
    <div class="lab-label">LOADER</div>
    <div class="loader-ring"></div>
  </div>
</div>`,
]

// ─── Starting CSS scaffold ─────────────────────────────────────────────────────

export const START_CSS = `/* Gate 07 — Ghost Feedback
   Five components are frozen — alive in HTML but lifeless on screen.
   Add transitions and transforms to make each interaction intentional.

   Checks to pass:
   1. .btn-primary has transition targeting transform (not transition: all)
   2. .btn-primary has transform: scale on :hover
   3. .hover-card has transform: translateY on :hover (negative — lifts up)
   4. .text-input has transition on border-color or outline (not transition: all)
   5. .notification has @keyframes with translateY from negative to 0 (slide in)
   6. .loader-ring has @keyframes rotation (rotate 360deg)
   7. No transition: all anywhere */

* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: system-ui, sans-serif;
  background: #0a0d18;
  color: #e8ecff;
  padding: 40px 24px;
}

.component-lab {
  max-width: 560px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.lab-title {
  font-size: 18px;
  font-weight: 600;
  color: #e8ecff;
  border-bottom: 1px solid rgba(180,200,255,0.08);
  padding-bottom: 16px;
}

.lab-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.lab-label {
  font-size: 9px;
  letter-spacing: 0.14em;
  color: #4a5070;
  font-family: monospace;
}

/* Button */
.btn-primary {
  display: inline-block;
  padding: 10px 22px;
  background: #c0d0e0;
  color: #0a0d18;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  margin-right: 8px;
}

.btn-ghost {
  display: inline-block;
  padding: 10px 22px;
  background: transparent;
  color: #c0d0e0;
  border: 1px solid rgba(192,208,224,0.3);
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
}

/* Card */
.hover-card {
  padding: 20px;
  background: rgba(192,208,224,0.04);
  border: 1px solid rgba(192,208,224,0.12);
  border-radius: 8px;
  cursor: pointer;
}

.card-tag {
  font-size: 9px;
  letter-spacing: 0.12em;
  color: #c0d0e0;
  margin-bottom: 6px;
}

.card-heading {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 6px;
}

.card-body {
  font-size: 13px;
  color: #7a8199;
  line-height: 1.5;
}

/* Input */
.input-wrap { display: flex; }

.text-input {
  width: 100%;
  padding: 10px 14px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(192,208,224,0.15);
  border-radius: 4px;
  color: #e8ecff;
  font-size: 13px;
  outline: none;
}

.text-input::placeholder { color: #4a5070; }

/* Notification */
.notification {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: rgba(192,208,224,0.06);
  border: 1px solid rgba(192,208,224,0.15);
  border-radius: 6px;
  font-size: 13px;
}

.notif-icon { color: #c0d0e0; font-size: 14px; }
.notif-text { color: #b8c0d9; }

/* Loader */
.loader-ring {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 3px solid rgba(192,208,224,0.15);
  border-top-color: #c0d0e0;
}
`

// ─── CSS checks (EXECUTION-BASED where reliable, regex fallback elsewhere) ───────
// Each test runs against the RENDERED iframe (doc + its window) and inspects the
// actual computed styles — so the CSS has to genuinely work. Pseudo-class states
// (:hover / :focus) can't be triggered while building blind, and @keyframes
// shape / the "no transition: all" rule are source-level concerns, so those parts
// fall back to source regex. The raw source is passed as the 3rd arg.

const WARDS = [
  {
    id: 'btn_transition',
    label: 'Button uses targeted transition',
    hint: 'To animate a property change smoothly, declare a transition on the element — naming the specific property, a duration, and an easing. Avoid the shortcut that catches every property at once.',
    // EXECUTION: read the computed transition on the real .btn-primary element.
    test: (doc, win) => {
      const el = doc.querySelector('.btn-primary')
      if (!el) return false
      const cs = win.getComputedStyle(el)
      const prop = (cs.transitionProperty || '').toLowerCase()
      const dur = (cs.transitionDuration || '0s')
      const hasDuration = dur.split(',').some(d => parseFloat(d) > 0)
      // Must target transform specifically — not "all", not nothing.
      return hasDuration && /\btransform\b/.test(prop) && !/\ball\b/.test(prop)
    },
  },
  {
    id: 'btn_scale',
    label: 'Button scales on hover',
    hint: 'Scale is a transform function that grows or shrinks an element relative to its natural size. Apply it on the :hover state — a value slightly above 1.0 gives a subtle enlarge effect.',
    // REGEX FALLBACK: :hover can't be triggered while building blind.
    test: (doc, win, css) => {
      const m = css.match(/\.btn-primary\s*:\s*hover\s*\{([^}]+)\}/)
      return m ? /transform\s*:[^;]*scale\s*\(/.test(m[1]) : false
    },
  },
  {
    id: 'card_lift',
    label: 'Card lifts on hover',
    hint: 'To lift an element upward on hover, use a transform that translates along the vertical axis. Moving up means a value in the negative direction.',
    // REGEX FALLBACK: :hover can't be triggered while building blind.
    test: (doc, win, css) => {
      const m = css.match(/\.hover-card\s*:\s*hover\s*\{([^}]+)\}/)
      return m ? /transform\s*:[^;]*translateY\s*\(\s*-/.test(m[1]) : false
    },
  },
  {
    id: 'input_focus',
    label: 'Input responds to focus',
    hint: 'The input should visually change when focused. Define a transition on a specific visual property — like border color — on the base element, then change that property in the :focus state.',
    // MIXED: execution for the base transition (computed style on the real input),
    // regex for the :focus state change (can't trigger :focus blind).
    test: (doc, win, css) => {
      const el = doc.querySelector('.text-input')
      if (!el) return false
      const cs = win.getComputedStyle(el)
      const prop = (cs.transitionProperty || '').toLowerCase()
      const dur = (cs.transitionDuration || '0s')
      const hasDuration = dur.split(',').some(d => parseFloat(d) > 0)
      const hasTransition = hasDuration && /border|outline/.test(prop) && !/\ball\b/.test(prop)
      const focus = css.match(/\.text-input\s*:\s*focus\s*\{([^}]+)\}/)
      const hasFocusChange = focus ? (/border/.test(focus[1]) || /outline/.test(focus[1])) : false
      return hasTransition && hasFocusChange
    },
  },
  {
    id: 'notif_slide',
    label: 'Notification enters from above',
    hint: 'CSS animations use @keyframes to describe motion over time. To slide something in from above, start it at a position above its natural location and end with no offset. Wire the animation to .notification.',
    // MIXED: execution confirms an animation is actually wired to .notification
    // (computed animation-name resolves to a real keyframes set, not "none");
    // regex confirms the keyframes describe an upward slide (translateY negative).
    test: (doc, win, css) => {
      const el = doc.querySelector('.notification')
      if (!el) return false
      const name = (win.getComputedStyle(el).animationName || 'none').trim()
      const hasAnimation = name !== '' && name !== 'none'
      const hasKeyframes = /@keyframes\s+[\w-]+[^{]*\{[\s\S]*?translateY\s*\(\s*-/.test(css)
      return hasAnimation && hasKeyframes
    },
  },
  {
    id: 'loader_spin',
    label: 'Loader rotates continuously',
    hint: 'A spinner needs to rotate a full turn, forever. Define @keyframes that describes one complete rotation, then apply it to .loader-ring and tell the animation how many times to repeat.',
    // MIXED: execution confirms an animation is wired to .loader-ring (computed
    // animation-name resolves to real keyframes); regex confirms a full 360deg turn.
    test: (doc, win, css) => {
      const el = doc.querySelector('.loader-ring')
      if (!el) return false
      const name = (win.getComputedStyle(el).animationName || 'none').trim()
      const hasAnimation = name !== '' && name !== 'none'
      const hasKeyframes = /@keyframes\s+[\w-]+[^{]*\{[\s\S]*?rotate\s*\(\s*360deg\s*\)/.test(css)
      return hasAnimation && hasKeyframes
    },
  },
  {
    id: 'no_transition_all',
    label: 'No transition: all anywhere',
    hint: '"all" as a transition target can trigger repaints on properties you never intended to animate. Name only the property that actually changes — it\'s faster and intentional.',
    // REGEX FALLBACK: a source-level rule ("never write transition: all") — there's
    // no rendered artifact to inspect, so this stays a source check.
    test: (doc, win, css) => !/transition\s*:\s*all/.test(css),
  },
]

// ─── Quiz ─────────────────────────────────────────────────────────────────────

const QUIZ = {
  question: 'You used ease-out for the button\'s hover-enter transition. Why does that easing feel more natural than a linear transition?',
  options: [
    'ease-out is faster overall — it completes the transition in less total time than linear',
    'ease-out starts fast and slows at the end, matching how physical objects naturally decelerate when coming to rest',
    'ease-out prevents the browser from recalculating layout during the transition, making it more performant',
    'ease-out applies automatically to transform properties — other easing functions only work with opacity and color',
  ],
  correct: 1,
}

// ─── Preview builder ──────────────────────────────────────────────────────────
// Same assembly the legacy screen used for BOTH the visible preview and the
// offscreen check iframe: reset → player CSS → variant HTML.

function buildPreview(css, variantIndex) {
  const html = VARIANT_HTML[variantIndex]
  const reset = `<style>*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; } body { font-family: system-ui, sans-serif; } input { font-family: inherit; } button { font-family: inherit; cursor: pointer; border: none; }</style>`
  return `<!DOCTYPE html><html><head>${reset}<style>${css}</style></head><body>${html}</body></html>`
}

// ─── Solution (machine-verifiable clear — passes all 7 wards on every variant) ──
// Note: the starter's header comment contains the literal text "transition: all"
// (twice) inside the checklist, which ward 7 scans for at source level — so the
// finished solution rewrites that comment. That is the intended legacy behavior:
// clearing ward 7 requires scrubbing the phrase from the file entirely.

const SOLUTION_CSS = `/* Gate 07 — Ghost Feedback — CLEARED
   Every interaction named on purpose: targeted transitions, real keyframes,
   no blanket transition shortcuts anywhere. */

* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: system-ui, sans-serif;
  background: #0a0d18;
  color: #e8ecff;
  padding: 40px 24px;
}

.component-lab {
  max-width: 560px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.lab-title {
  font-size: 18px;
  font-weight: 600;
  color: #e8ecff;
  border-bottom: 1px solid rgba(180,200,255,0.08);
  padding-bottom: 16px;
}

.lab-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.lab-label {
  font-size: 9px;
  letter-spacing: 0.14em;
  color: #4a5070;
  font-family: monospace;
}

/* Button */
.btn-primary {
  display: inline-block;
  padding: 10px 22px;
  background: #c0d0e0;
  color: #0a0d18;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  margin-right: 8px;
  transition: transform 0.15s ease-out;
}

.btn-primary:hover {
  transform: scale(1.05);
}

.btn-ghost {
  display: inline-block;
  padding: 10px 22px;
  background: transparent;
  color: #c0d0e0;
  border: 1px solid rgba(192,208,224,0.3);
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
}

/* Card */
.hover-card {
  padding: 20px;
  background: rgba(192,208,224,0.04);
  border: 1px solid rgba(192,208,224,0.12);
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s ease-out;
}

.hover-card:hover {
  transform: translateY(-4px);
}

.card-tag {
  font-size: 9px;
  letter-spacing: 0.12em;
  color: #c0d0e0;
  margin-bottom: 6px;
}

.card-heading {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 6px;
}

.card-body {
  font-size: 13px;
  color: #7a8199;
  line-height: 1.5;
}

/* Input */
.input-wrap { display: flex; }

.text-input {
  width: 100%;
  padding: 10px 14px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(192,208,224,0.15);
  border-radius: 4px;
  color: #e8ecff;
  font-size: 13px;
  outline: none;
  transition: border-color 0.25s ease;
}

.text-input:focus {
  border-color: rgba(192,208,224,0.6);
}

.text-input::placeholder { color: #4a5070; }

/* Notification */
.notification {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: rgba(192,208,224,0.06);
  border: 1px solid rgba(192,208,224,0.15);
  border-radius: 6px;
  font-size: 13px;
  animation: notif-slide 0.45s ease-out;
}

@keyframes notif-slide {
  from { opacity: 0; transform: translateY(-14px); }
  to   { opacity: 1; transform: translateY(0); }
}

.notif-icon { color: #c0d0e0; font-size: 14px; }
.notif-text { color: #b8c0d9; }

/* Loader */
.loader-ring {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 3px solid rgba(192,208,224,0.15);
  border-top-color: #c0d0e0;
  animation: ring-spin 0.9s linear infinite;
}

@keyframes ring-spin {
  to { transform: rotate(360deg); }
}
`

// ─── Config ───────────────────────────────────────────────────────────────────

export default {
  id: 'gate07',
  gateNum: 7,
  title: 'Ghost Feedback',
  rank: 'C',
  region: 'THE FOUNDRY',
  questId: 'act1-ch07',
  nextGate: 'quest8',
  ability: 'GHOST STEP',
  language: 'css',
  narrator: 'CONTRACT 007 — THE INERT. A dead control gallery: five components, all functional, all lifeless. Buttons that don\'t press, cards that don\'t lift, inputs that don\'t answer — an interface with no pulse. Giving it motion is giving it a heartbeat. Its weak points pulse on a beat: name each transition and strike with real easing. A blanket transition makes your hits sluggish and miss the window. Rhythm rewards precision.',
  enemy: { name: 'The Inert', tier: 'C', lore: 'A dead control gallery — an interface with no pulse, no response, no life. Its weak points pulse on a beat, and only a strike cast with proper easing lands in the window. Giving it motion is giving it a heartbeat — and a heartbeat is something that can stop.', svgVariant: 7 },
  variants: VARIANT_HTML,
  getStarterCode: () => START_CSS,
  buildPreview,
  buildCheckDoc: buildPreview,
  requiresBody: true,
  wards: WARDS,
  wardFailIcon: '!',
  scannerLabel: 'COMPONENT VITALS',
  scannerUnit: 'FROZEN',
  quiz: QUIZ,
  xpPerWard: 50,
  completionXp: 350,
  shardReward: 280,
  solution: SOLUTION_CSS,
  aiTitle: 'Gate 07 — Ghost Feedback',
  aiRequirements: 'Add CSS transitions and transforms to a component library: .btn-primary has targeted transition on transform + scale on :hover, .hover-card has translateY(-Npx) on :hover, .text-input has transition on border-color/outline + visible :focus change, .notification slides in from above using @keyframes translateY, .loader-ring has continuous rotation @keyframes, no transition: all anywhere.',
  completion: {
    entryLabel: 'Contract 007 — Closed',
    icon: '👻',
    chip: 'CONTRACT 007 CLOSED',
    heading: 'The Gallery Has a Pulse.',
    body: 'Buttons press. Cards lift. Inputs answer. The Inert flatlined the moment its interface learned rhythm — the difference between a tool and an experience is a 200ms transition and a single easing curve. <strong>You built that difference. VERA logs the payout and registers a new Daemon ability: GHOST STEP.</strong>',
    rewards: [
      { label: '$SHARD PAYOUT', value: '+280' },
      { label: 'XP LOGGED', value: '+350' },
      { label: 'PROOF OF KILL', value: 'Motion Fragment' },
      { label: 'ABILITY UNLOCKED', value: 'GHOST STEP' },
    ],
    nextLabel: 'NEXT CONTRACT AVAILABLE',
    nextTitle: 'The Collapse',
    nextSub: 'Responsive design · Rank C · Elite hunt',
    nextIcon: '📱',
  },
}

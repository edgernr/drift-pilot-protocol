import { stripComments } from '../../lib/codeUtils.js'

// ─── Shared CSS injected into all preview iframes ─────────────────────────────

const CR_CSS = `
:root{--bg:#0a0d18;--panel:#111524;--border:rgba(180,200,255,.08);--text:#e8ecff;--ink2:#7a8199;--accent:#22d3ee}
body.theme-light{--bg:#f4f6ff;--panel:#e0e8ff;--border:rgba(0,0,100,.08);--text:#0a0d18;--ink2:#405070}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--bg);color:var(--text);font-family:system-ui,sans-serif;padding:12px;transition:background .3s,color .3s;font-size:13px}
h3{font-size:10px;letter-spacing:.1em;color:var(--accent);margin-bottom:10px;font-weight:600}
.cr-sec{background:var(--panel);border:1px solid var(--border);border-radius:5px;padding:12px;margin-bottom:10px}
.xp-disp{font-size:32px;font-weight:700;font-family:monospace;text-align:center;padding:6px;margin-bottom:8px}
.xp-btns{display:flex;gap:8px;justify-content:center}
.xp-btn{padding:5px 18px;background:rgba(255,255,255,.05);border:1px solid rgba(180,200,255,.12);border-radius:3px;color:var(--text);cursor:pointer;font-size:18px}
.xp-btn:active{background:rgba(255,255,255,.12)}
.cr-input{width:100%;padding:6px 9px;background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:3px;color:var(--text);font-size:12px;outline:none}
.cr-input:focus{border-color:var(--accent)}
.cr-list{list-style:none;margin-top:6px}
.cr-list li{padding:4px 8px;font-size:11px;color:var(--ink2);border-bottom:1px solid var(--border)}
.cr-list li.hidden{display:none}
.cr-field{margin-bottom:8px}
.cr-lbl{display:block;font-size:9px;letter-spacing:.08em;color:var(--ink2);margin-bottom:3px}
.cr-err{font-size:9px;color:#f43f5e;min-height:13px;margin-top:2px}
.cr-submit{width:100%;padding:7px;background:var(--accent);border:none;border-radius:3px;color:#0a0d18;font-weight:600;font-size:11px;cursor:pointer}
.cr-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.theme-btn{padding:5px 12px;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:3px;color:var(--text);cursor:pointer;font-size:11px}
#theme-status{font-size:10px;color:var(--ink2)}
#key-log{margin-top:6px;font-size:10px;color:var(--ink2);font-family:monospace;min-height:14px}
`

// ─── HTML templates (same IDs, different EVA City contexts) ───────────────────

const VARIANT_HTML = [
  // Variant 0 — Sector Zero
  `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Sector Zero Control Room</title><style>${CR_CSS}</style></head>
<body><div>
  <div class="cr-sec">
    <h3>⬡ XP COUNTER — SECTOR ZERO</h3>
    <div class="xp-disp" id="xp-count">0</div>
    <div class="xp-btns">
      <button class="xp-btn" id="xp-minus">−</button>
      <button class="xp-btn" id="xp-plus">+</button>
    </div>
  </div>
  <div class="cr-sec">
    <h3>◈ CITIZEN SEARCH</h3>
    <input class="cr-input" id="search-input" type="text" placeholder="Search citizens…" autocomplete="off" />
    <ul class="cr-list" id="citizen-list">
      <li>Alpha-7 · Sector Zero · Seeker</li>
      <li>Bravo-12 · Command Centre · Engineer</li>
      <li>Echo-3 · Reactor Grid · Technician</li>
      <li>Delta-9 · Signal Tower · Operator</li>
      <li>Foxtrot-1 · Vault Sector · Architect</li>
      <li>Gamma-5 · Cipher Node · Analyst</li>
    </ul>
  </div>
  <div class="cr-sec">
    <h3>⟐ CITIZEN REGISTRATION</h3>
    <form id="register-form">
      <div class="cr-field">
        <label class="cr-lbl" for="reg-email">EMAIL</label>
        <input class="cr-input" id="reg-email" type="text" placeholder="seeker@sector.zero" autocomplete="off" />
        <div class="cr-err" id="email-error"></div>
      </div>
      <button class="cr-submit" type="submit">REGISTER CITIZEN</button>
    </form>
  </div>
  <div class="cr-sec">
    <h3>◎ SYSTEM CONTROLS</h3>
    <div class="cr-row">
      <button class="theme-btn" id="theme-toggle">Toggle Theme</button>
      <span id="theme-status">Dark</span>
    </div>
    <div id="key-log">Press any key…</div>
  </div>
</div></body></html>`,

  // Variant 1 — Command Centre
  `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Command Centre Control Room</title><style>${CR_CSS}</style></head>
<body><div>
  <div class="cr-sec">
    <h3>⟐ OP COUNTER — COMMAND HQ</h3>
    <div class="xp-disp" id="xp-count">0</div>
    <div class="xp-btns">
      <button class="xp-btn" id="xp-minus">−</button>
      <button class="xp-btn" id="xp-plus">+</button>
    </div>
  </div>
  <div class="cr-sec">
    <h3>◈ SEEKER SEARCH</h3>
    <input class="cr-input" id="search-input" type="text" placeholder="Search seekers…" autocomplete="off" />
    <ul class="cr-list" id="citizen-list">
      <li>Strike-1 · Ops Division · Lead</li>
      <li>Cipher-4 · Intel Unit · Analyst</li>
      <li>Vault-8 · Archive · Keeper</li>
      <li>Signal-3 · Comms · Operator</li>
      <li>Grid-11 · Infrastructure · Engineer</li>
      <li>Echo-0 · Recon · Scout</li>
    </ul>
  </div>
  <div class="cr-sec">
    <h3>▶ SEEKER ENLIST</h3>
    <form id="register-form">
      <div class="cr-field">
        <label class="cr-lbl" for="reg-email">COMM CHANNEL</label>
        <input class="cr-input" id="reg-email" type="text" placeholder="seeker@command.hq" autocomplete="off" />
        <div class="cr-err" id="email-error"></div>
      </div>
      <button class="cr-submit" type="submit">ENLIST SEEKER</button>
    </form>
  </div>
  <div class="cr-sec">
    <h3>◎ HQ CONTROLS</h3>
    <div class="cr-row">
      <button class="theme-btn" id="theme-toggle">Toggle Display</button>
      <span id="theme-status">Dark Mode</span>
    </div>
    <div id="key-log">Monitor active…</div>
  </div>
</div></body></html>`,

  // Variant 2 — Reactor Grid
  `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Reactor Grid Control Room</title><style>${CR_CSS}</style></head>
<body><div>
  <div class="cr-sec">
    <h3>⚡ CORE OUTPUT — REACTOR GRID</h3>
    <div class="xp-disp" id="xp-count">0</div>
    <div class="xp-btns">
      <button class="xp-btn" id="xp-minus">−</button>
      <button class="xp-btn" id="xp-plus">+</button>
    </div>
  </div>
  <div class="cr-sec">
    <h3>〰 TECHNICIAN SEARCH</h3>
    <input class="cr-input" id="search-input" type="text" placeholder="Search technicians…" autocomplete="off" />
    <ul class="cr-list" id="citizen-list">
      <li>Core-1 · Primary Reactor · Lead Tech</li>
      <li>Coolant-5 · Loop System · Operator</li>
      <li>Field-2 · Containment · Engineer</li>
      <li>Safety-9 · Failsafe · Monitor</li>
      <li>Power-3 · Grid Output · Technician</li>
      <li>Backup-7 · Redundancy · Specialist</li>
    </ul>
  </div>
  <div class="cr-sec">
    <h3>⊕ TECHNICIAN REGISTER</h3>
    <form id="register-form">
      <div class="cr-field">
        <label class="cr-lbl" for="reg-email">CONTACT CHANNEL</label>
        <input class="cr-input" id="reg-email" type="text" placeholder="tech@reactor.grid" autocomplete="off" />
        <div class="cr-err" id="email-error"></div>
      </div>
      <button class="cr-submit" type="submit">ADD TECHNICIAN</button>
    </form>
  </div>
  <div class="cr-sec">
    <h3>※ GRID CONTROLS</h3>
    <div class="cr-row">
      <button class="theme-btn" id="theme-toggle">Toggle Display</button>
      <span id="theme-status">Dark Mode</span>
    </div>
    <div id="key-log">Core status nominal…</div>
  </div>
</div></body></html>`,
]

// ─── Starting JS scaffold ─────────────────────────────────────────────────────

const START_JS = `// Gate 09 — The Control Room
// Wire up the four sections using vanilla JavaScript.
//
// RULE: Never use .innerHTML to display user-entered content.
// Use .textContent instead — it prevents XSS attacks.
//
// Sections to wire:
//   XP COUNTER    — #xp-plus / #xp-minus buttons update #xp-count
//   CITIZEN SEARCH — #search-input filters #citizen-list in real time
//   REGISTRATION  — #register-form validates #reg-email, shows #email-error
//   SYSTEM CONTROLS — #theme-toggle switches theme, #key-log shows keypresses
//
// Checks to pass:
//  1. querySelector or getElementById used
//  2. .textContent = used to write output (not .innerHTML)
//  3. .classList.add / .remove / .toggle used
//  4. addEventListener('click', ...) on a button
//  5. addEventListener('input', ...) that reads .value
//  6. .preventDefault() called on form submit
//  7. let or var state variable initialized to 0
//  8. addEventListener('keydown', ...) on document or an element

`

// ─── Quiz ─────────────────────────────────────────────────────────────────────

const QUIZ = {
  question: 'You stored the XP count in a JavaScript variable AND updated the DOM to show it. Why keep state in a JS variable instead of reading the number back out of the DOM when you need it?',
  options: [
    'The DOM only stores strings, so reading a number back from it requires parseInt() on every access, which can silently fail',
    'The variable is the source of truth — the DOM is just a mirror. Reading state back from the DOM means trusting the display, not the data, which breaks when the DOM is out of sync',
    'Variables are stored in CPU registers while DOM access goes through the render pipeline, making variables significantly faster',
    'It prevents unnecessary re-renders because the browser batches variable updates but processes every DOM read immediately',
  ],
  correct: 1,
}

// ─── JS wards (EXECUTION-BASED where reliable, regex fallback otherwise) ───────
// The student's JS runs inside the shell's offscreen check iframe (checkSandbox:
// allow-scripts + allow-same-origin so we can read the DOM back). Each test
// receives (doc, win, code):
//   doc  — the rendered iframe document AFTER the student's script ran
//   win  — the iframe window
//   code — the raw editor source (the regex wards strip comments first, exactly
//          like the legacy screen — START_JS's comment block literally contains
//          ".preventDefault()" so skipping the strip would false-pass)
// Behaviour wards SIMULATE real interactions (click / input / keydown) and assert
// the DOM actually changed. Checks that can't be reliably simulated (source-only
// facts, or fragile form-submit navigation) stay regex.

const WARDS = [
  {
    id: 'selector',
    label: 'querySelector or getElementById selects elements',
    hint: "Use document.querySelector('#xp-count') or document.getElementById('xp-count') to get a reference to an element before you can change it.",
    // REGEX FALLBACK: which selector API was used leaves no observable DOM trace.
    test: (doc, win, code) => /\b(?:querySelector|getElementById)\s*\(/.test(stripComments(code)),
  },
  {
    id: 'text_content',
    label: '.textContent used to write to the DOM',
    hint: "Once you have an element reference, set element.textContent = yourValue to update what it displays. Unlike innerHTML, textContent treats the value as plain text — no HTML injected.",
    // REGEX FALLBACK: textContent vs innerHTML produces identical rendered text
    // for plain values, so the safe-write distinction isn't observable at runtime.
    test: (doc, win, code) => /\.textContent\s*=/.test(stripComments(code)),
  },
  {
    id: 'class_list',
    label: '.classList.add / .remove / .toggle used',
    hint: "element.classList.toggle('theme-light') flips the class on and off. Also works with .add() and .remove() for one-directional changes.",
    // EXECUTION: clicking the theme toggle must mutate a class somewhere in the DOM.
    test: (doc) => {
      const btn = doc.querySelector('#theme-toggle')
      if (!btn) return false
      const snapshot = () =>
        [...doc.querySelectorAll('*')].map(el => String(el.className || '')).join('|')
      const before = snapshot()
      btn.click()
      // Any element's class set changed as a result of the click → classList was used.
      return snapshot() !== before
    },
  },
  {
    id: 'click_handler',
    label: "addEventListener('click') handles button clicks",
    hint: "Attach a listener: element.addEventListener('click', function(e) { ... }). The callback runs every time the element is clicked.",
    // EXECUTION: clicking #xp-plus must change the #xp-count display.
    test: (doc) => {
      const plus = doc.querySelector('#xp-plus')
      const count = doc.querySelector('#xp-count')
      if (!plus || !count) return false
      const before = count.textContent
      plus.click()
      return count.textContent !== before
    },
  },
  {
    id: 'input_handler',
    label: "addEventListener('input') reads .value as user types",
    hint: "input events fire on every keystroke. Inside the callback, access e.target.value (or the input element's .value directly) to get what was typed so far.",
    // EXECUTION: typing a no-match query must hide list rows (the search filters live).
    test: (doc, win) => {
      const input = doc.querySelector('#search-input')
      const list = doc.querySelector('#citizen-list')
      if (!input || !list) return false
      const rows = [...list.querySelectorAll('li')]
      if (rows.length === 0) return false
      const visible = li => win.getComputedStyle(li).display !== 'none' && !li.hidden
      const beforeVisible = rows.filter(visible).length
      input.value = 'zzqxnomatch9'
      input.dispatchEvent(new win.Event('input', { bubbles: true }))
      const afterVisible = rows.filter(visible).length
      return afterVisible < beforeVisible
    },
  },
  {
    id: 'prevent_default',
    label: '.preventDefault() stops the form page-refresh',
    hint: "Inside a submit listener callback, call e.preventDefault() as the first line. Without it, the browser navigates away on submit and your JS state is destroyed.",
    // REGEX FALLBACK: a real submit inside a sandboxed iframe triggers navigation
    // timing we can't observe reliably while built blind.
    test: (doc, win, code) => /\.preventDefault\s*\(\s*\)/.test(stripComments(code)),
  },
  {
    id: 'state_variable',
    label: 'State variable holds the counter value',
    hint: "Declare: let xp = 0 (or any name). Update that variable in the click handler, then write it to the DOM with textContent. Don't read the number back out of the DOM — trust your variable.",
    // REGEX FALLBACK: a local state variable leaves no DOM trace of its existence.
    test: (doc, win, code) => /\b(?:let|var)\s+\w+\s*=\s*0/.test(stripComments(code)),
  },
  {
    id: 'keydown_handler',
    label: "addEventListener('keydown') captures keyboard input",
    hint: "Attach a keydown listener to document or to an element: document.addEventListener('keydown', function(e) { ... }). The event object's .key property tells you which key was pressed.",
    // EXECUTION: a dispatched keydown must update the #key-log readout.
    test: (doc, win) => {
      const log = doc.querySelector('#key-log')
      if (!log) return false
      const before = log.textContent
      const ev = new win.KeyboardEvent('keydown', { key: 'A', bubbles: true })
      doc.dispatchEvent(ev)
      return log.textContent !== before
    },
  },
]

// ─── Preview / check-doc builder ──────────────────────────────────────────────
// Legacy injection reproduced exactly: the student's JS is wrapped in try/catch
// and inserted as a <script> before </body> of the variant HTML. The same doc
// serves preview and checks (the legacy screen used buildPreview for both).

function buildPreview(js, variantIndex) {
  const safe = `try{\n${js}\n}catch(e){ console.error('JS error:',e.message) }`
  return VARIANT_HTML[variantIndex].replace('</body>', `<script>\n${safe}\n</script>\n</body>`)
}

// ─── Solution (passes all 8 wards on every variant — IDs are shared) ──────────

const SOLUTION = `// CONTRACT 009 — wire the Control Room
let xp = 0

const xpCount = document.getElementById('xp-count')
const plusBtn = document.querySelector('#xp-plus')
const minusBtn = document.querySelector('#xp-minus')

plusBtn.addEventListener('click', function () {
  xp = xp + 1
  xpCount.textContent = xp
})

minusBtn.addEventListener('click', function () {
  xp = xp - 1
  xpCount.textContent = xp
})

const searchInput = document.querySelector('#search-input')
const rows = document.querySelectorAll('#citizen-list li')

searchInput.addEventListener('input', function (e) {
  const query = e.target.value.toLowerCase()
  rows.forEach(function (li) {
    if (li.textContent.toLowerCase().includes(query)) {
      li.classList.remove('hidden')
    } else {
      li.classList.add('hidden')
    }
  })
})

const form = document.querySelector('#register-form')
const emailInput = document.querySelector('#reg-email')
const emailError = document.querySelector('#email-error')

form.addEventListener('submit', function (e) {
  e.preventDefault()
  const value = emailInput.value.trim()
  if (!value.includes('@') || !value.includes('.')) {
    emailError.textContent = 'Enter a valid address.'
  } else {
    emailError.textContent = ''
    emailInput.value = ''
  }
})

const themeBtn = document.querySelector('#theme-toggle')
const themeStatus = document.querySelector('#theme-status')

themeBtn.addEventListener('click', function () {
  document.body.classList.toggle('theme-light')
  themeStatus.textContent = document.body.classList.contains('theme-light') ? 'Light' : 'Dark'
})

const keyLog = document.querySelector('#key-log')

document.addEventListener('keydown', function (e) {
  keyLog.textContent = 'Key pressed: ' + e.key
})
`

// ─── Config ───────────────────────────────────────────────────────────────────

export default {
  id: 'gate09',
  gateNum: 9,
  title: 'The Control Room',
  rank: 'B',
  region: 'THE FOUNDRY',
  questId: 'act1-ch09',
  nextGate: 'quest10',
  ability: 'CONTROL WIRE',
  language: 'js',
  narrator: 'CONTRACT 009 — THE FROZEN PANEL. The command center of the lower Foundry: every monitor dark, every control dead. It doesn\'t attack. It refuses. VERA, quieter than usual: "Structure and paint were restoration work. This is your first true code. Everything below this line, the city obeys you." Wire the dead controls live — selectors, listeners, state. The city stops being something you fix and starts being something that obeys.',
  enemy: { name: 'The Frozen Panel', tier: 'B', lore: 'The command center of the lower Foundry, seized solid — everything dark and unresponsive. It does not strike; it withholds. Every dead monitor, every control that ignores your hand, is the Panel holding the room hostage. It only dies when the room answers to someone else.', svgVariant: 9 },
  variants: VARIANT_HTML,
  getStarterCode: () => START_JS,
  buildPreview,
  buildCheckDoc: (js, variantIndex) => buildPreview(js, variantIndex),
  // The check iframe must execute the student's script AND let us read the DOM
  // back to observe simulated clicks / input / keydown — same sandbox the
  // legacy offscreen iframe used.
  checkSandbox: 'allow-scripts allow-same-origin',
  wards: WARDS,
  wardFailIcon: '!',
  scannerLabel: 'CONTROL ROOM AUDIT',
  scannerUnit: 'FAILING',
  quiz: QUIZ,
  xpPerWard: 50,
  completionXp: 450,
  shardReward: 700,
  solution: SOLUTION,
  aiTitle: 'Gate 09 — The Control Room',
  aiRequirements: 'Vanilla JavaScript DOM manipulation: use querySelector/getElementById to select elements, textContent (not innerHTML) for user-facing content, classList for style toggling, addEventListener for click/input/keydown events, preventDefault() on form submit, and a JS state variable that stays in sync with the DOM.',
  completion: {
    entryLabel: 'Control Room — Online',
    icon: '⬡',
    chip: 'CONTROL ROOM ONLINE',
    heading: 'The City Responds to Operators.',
    body: 'Until tonight you repaired what the Void broke — structure, paint, gravity. Tonight you gave an order and dead machinery obeyed. querySelector, textContent, classList, addEventListener — the primitives behind every interaction the city will ever have. <strong>The city lives because you wired it.</strong>',
    rewards: [
      { label: '$SHARD PAYOUT', value: '+700' },
      { label: 'XP LOGGED', value: '+450' },
      { label: 'ITEM', value: 'JS Operator I' },
      { label: 'ITEM', value: 'Control Room Badge' },
    ],
    nextLabel: 'NEXT CONTRACT AVAILABLE',
    nextTitle: 'Gate 10 — The Static City',
    nextSub: 'Fetch API · Stratum Boss',
    nextIcon: '📡',
  },
}

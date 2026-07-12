import { stripComments } from '../../lib/codeUtils.js'

// ─── Intelligence dashboard HTML (single template — the mechanic is the JS) ───

const TEMPLATE_HTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>EVA City — Intelligence Dashboard</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#0a0d18;color:#e8ecff;font-family:system-ui,sans-serif;padding:12px;font-size:13px}
#loading{text-align:center;padding:30px;color:#7a8199;font-size:13px}
.spinner{display:inline-block;width:18px;height:18px;border:2px solid rgba(180,200,255,.12);border-top-color:#e040fb;border-radius:50%;animation:spin .8s linear infinite;margin-right:8px;vertical-align:middle}
@keyframes spin{to{transform:rotate(360deg)}}
#content-wrap{display:none}
#error-state{display:none;text-align:center;padding:24px}
.err-icon{font-size:24px;margin-bottom:8px}
.err-text{color:#f43f5e;font-size:12px;font-family:monospace;margin-bottom:10px}
.err-retry{padding:5px 14px;background:rgba(240,64,251,.08);border:1px solid rgba(240,64,251,.25);border-radius:3px;color:#e040fb;cursor:pointer;font-size:11px}
.panel{background:#111524;border:1px solid rgba(180,200,255,.08);border-radius:5px;padding:12px;margin-bottom:10px}
.panel h3{font-size:10px;letter-spacing:.1em;color:#e040fb;margin-bottom:10px;font-weight:600}
.field{display:flex;justify-content:space-between;align-items:baseline;padding:5px 0;border-bottom:1px solid rgba(180,200,255,.05);font-size:12px}
.field:last-child{border-bottom:none}
.f-label{color:#7a8199;font-size:9px;letter-spacing:.06em}
.f-value{color:#e8ecff;font-weight:500}
.refresh-bar{background:#111524;border:1px solid rgba(180,200,255,.08);border-radius:5px;padding:9px 12px;display:flex;justify-content:space-between;align-items:center;font-size:10px;color:#7a8199}
#refresh-status{color:#e040fb;font-family:monospace;font-size:10px}
#last-updated{font-size:9px;color:#3a4060}
</style>
</head>
<body>

<div id="loading">
  <span class="spinner"></span>Awaiting signal from outside…
</div>

<div id="error-state">
  <div class="err-icon">⊗</div>
  <div class="err-text" id="error-message">Signal lost. Cannot reach the outside.</div>
  <button class="err-retry" id="retry-btn">Retry Signal</button>
</div>

<div id="content-wrap">
  <div class="panel">
    <h3>◈ INTELLIGENCE RECEIVED</h3>
    <div class="field"><span class="f-label">SIGNAL ID</span><span class="f-value" id="data-id">—</span></div>
    <div class="field"><span class="f-label">CALLSIGN</span><span class="f-value" id="data-name">—</span></div>
    <div class="field"><span class="f-label">SECTOR</span><span class="f-value" id="data-city">—</span></div>
    <div class="field"><span class="f-label">CONTACT</span><span class="f-value" id="data-email">—</span></div>
    <div class="field"><span class="f-label">COMPANY</span><span class="f-value" id="data-company">—</span></div>
  </div>
  <div class="refresh-bar">
    <span id="refresh-status">Auto-refresh not running</span>
    <span id="last-updated">Never updated</span>
  </div>
</div>

</body>
</html>`

// ─── Starting JS scaffold ─────────────────────────────────────────────────────

const START_JS = `// Gate 10 — The Signal from Outside
// Fetch live intelligence from this URL:
//   https://jsonplaceholder.typicode.com/users/1
//
// The dashboard HTML is pre-built. Wire it up:
//   #loading      — show while fetching, hide when done
//   #content-wrap — hide while fetching, show when data arrives
//   #error-state  — show if the fetch fails
//   #data-id, #data-name, #data-city, #data-email, #data-company — fill these
//   #refresh-status — update with next refresh info
//   #last-updated   — update with a timestamp on each fetch
//
// Three failure modes the boss tests:
//   1. Slow connection — your loading state must appear before data arrives
//   2. Failed request  — your error state must appear, not a blank screen
//   3. Partial data    — some fields may be undefined; handle with ?.
//
// Checks to pass:
//  1. fetch() called with the API URL
//  2. async and await both present
//  3. try / catch handles fetch failure
//  4. Loading element manipulated (show/hide)
//  5. Optional chaining (?.) used for nested field access
//  6. setInterval auto-refreshes every 30 seconds

`

// ─── Quiz ─────────────────────────────────────────────────────────────────────

const QUIZ = {
  question: "Your fetch succeeds but the API returns a user with no 'phone' field. Instead of crashing, you show 'Unknown'. What syntax safely accesses a field that might not exist without throwing a TypeError?",
  options: [
    "Wrap every property access in a try/catch — TypeErrors inside catch are silently ignored and the fallback value is returned",
    "Declare all expected fields at the top with let phone = null — this reserves memory for the key and prevents undefined property errors",
    "Optional chaining: data?.phone ?? 'Unknown' — ?. short-circuits to undefined if the parent is null or undefined, and ?? falls back to the default",
    "Convert the JSON object to a string and parse individual fields with .split() to avoid property access entirely",
  ],
  correct: 2,
}

// ─── JS checks ────────────────────────────────────────────────────────────────
// Gate 10 is the STRATUM BOSS — its mechanics are async + real network (fetch to
// JSONPlaceholder), which can't be reliably verified blind. So these checks stay
// SOURCE-based (regex on the student's code, comments stripped). The check iframe
// still genuinely executes the student's code (sandboxed) so the live behavior
// matches what they wrote.

const JS_CHECKS = [
  {
    id: 'fetch_api',
    label: 'fetch() called to request data',
    hint: "Call fetch('https://jsonplaceholder.typicode.com/users/1') — it returns a Promise that resolves to a Response object. Use .json() to parse it.",
    test: code => /\bfetch\s*\(/.test(code),
  },
  {
    id: 'async_await',
    label: 'async function + await used together',
    hint: "Define your fetch function with the async keyword, then await the fetch() call. This pauses the function until the response arrives without blocking the rest of the page.",
    test: code => /\basync\b/.test(code) && /\bawait\b/.test(code),
  },
  {
    id: 'error_handling',
    label: 'try / catch handles fetch errors',
    hint: "Wrap your fetch logic in a try block. The catch(e) block runs if the network is down, the URL is wrong, or the server returns an error — show the error state there.",
    test: code => /\btry\s*\{/.test(code) && /\bcatch\s*\(/.test(code),
  },
  {
    id: 'loading_state',
    label: 'Loading element shown/hidden around the fetch',
    hint: "Show the #loading element at the top of your function (before the await). Hide it once data arrives or an error is caught. Use style.display or classList.",
    test: code => /loading/.test(code) && (/style|display|classList/.test(code)),
  },
  {
    id: 'optional_chain',
    label: 'Optional chaining (?.) handles missing fields',
    hint: "Some API fields are nested: data.address.city. If address is missing, that crashes. Use data?.address?.city to safely get undefined instead of throwing.",
    test: code => /\?\.\w/.test(code),
  },
  {
    id: 'auto_refresh',
    label: 'setInterval auto-refreshes the data',
    hint: "Call setInterval(yourFetchFunction, 30000) after the first fetch to re-run it every 30 seconds automatically.",
    test: code => /\bsetInterval\s*\(/.test(code),
  },
]

// Adapt the source-based checks to the EncounterShell ward signature
// (doc, win, code). The doc/win args are unused — the regex runs on
// stripComments(code), exactly like the legacy screen did.
const WARDS = JS_CHECKS.map(c => ({
  ...c,
  test: (doc, win, code) => c.test(stripComments(code)),
}))

// ─── Preview builder (legacy injection, verbatim) ─────────────────────────────

function buildPreview(js) {
  const safe = `try{\n${js}\n}catch(e){ console.error('JS error:',e.message) }`
  return TEMPLATE_HTML.replace('</body>', `<script>\n${safe}\n</script>\n</body>`)
}

// ─── Solution (must pass all 6 wards — machine-verified per bible §9.6) ──────

const SOLUTION = `const API_URL = 'https://jsonplaceholder.typicode.com/users/1'

const loading = document.getElementById('loading')
const content = document.getElementById('content-wrap')
const errorState = document.getElementById('error-state')
const errorMessage = document.getElementById('error-message')

function setField(id, value) {
  document.getElementById(id).textContent = value ?? 'Unknown'
}

async function loadIntel() {
  loading.style.display = 'block'
  content.style.display = 'none'
  errorState.style.display = 'none'
  try {
    const res = await fetch(API_URL)
    if (!res.ok) throw new Error('Signal rejected: ' + res.status)
    const data = await res.json()
    setField('data-id', data?.id)
    setField('data-name', data?.name)
    setField('data-city', data?.address?.city)
    setField('data-email', data?.email)
    setField('data-company', data?.company?.name)
    setField('last-updated', 'Updated ' + new Date().toLocaleTimeString())
    setField('refresh-status', 'Auto-refresh: every 30s')
    loading.style.display = 'none'
    content.style.display = 'block'
  } catch (err) {
    loading.style.display = 'none'
    errorMessage.textContent = err?.message || 'Signal lost. Cannot reach the outside.'
    errorState.style.display = 'block'
  }
}

document.getElementById('retry-btn').addEventListener('click', loadIntel)

loadIntel()
setInterval(loadIntel, 30000)
`

// ─── Config ───────────────────────────────────────────────────────────────────

export default {
  id: 'gate10',
  gateNum: 10,
  title: 'The Static City',
  rank: 'B',
  region: 'THE FOUNDRY · STRATUM BOSS',
  questId: 'act1-ch10',
  nextGate: null, // CS-7 (stratum break) wires in later — for now completion returns to dashboard, exactly like legacy
  ability: 'LIVE FEED',
  language: 'js',
  narrator: 'VERA, quieter than you\'ve ever heard her: "Contract 010. Stratum boss. The floor of the Foundry is a city frozen mid-frame — cached, dead, hoarding a signal it never learned to receive. It only knows what it was built with." fetch() punches through the wall. async/await waits without blocking. And try/catch is the armor — because down here the signal WILL break, and the city that survives is one that works when it does. Wire the feed. Handle every failure mode. Turn the lights on.',
  enemy: {
    name: 'The Static City',
    tier: 'BOSS',
    lore: 'The floor of the Foundry: an entire city frozen mid-frame, cached and dead. It only knows what it was built with — no signal in, no signal out. Pull it live and data floods in; the city moves for the first time, district by district, until the whole stratum breathes.',
    svgVariant: 10,
  },
  variants: [TEMPLATE_HTML],
  getStarterCode: () => START_JS,
  buildPreview,
  buildCheckDoc: buildPreview,
  wards: WARDS,
  wardFailIcon: '!',
  scannerLabel: 'SIGNAL AUDIT',
  scannerUnit: 'FROZEN',
  quiz: QUIZ,
  xpPerWard: 100,
  completionXp: 600,
  shardReward: 1500,
  solution: SOLUTION,
  aiTitle: 'Gate 10 — The Static City',
  aiRequirements: 'Fetch API with async/await: call fetch() with a URL, use async/await, try/catch error handling, show loading state before data arrives and hide after, use optional chaining (?.) for nested/missing fields, setInterval for 30-second auto-refresh.',
  completion: {
    entryLabel: 'Static City — Breached',
    icon: '📡',
    chip: 'RANK C — LICENSED',
    heading: 'The Foundry breathes.',
    body: 'Stratum boss confirmed dead. The city that only knew what it was built with now reaches outside itself — fetch, async/await, try/catch, optional chaining, the refresh pulse: every piece a layer of armor against a broken world. <strong>The city that survives is one that works when the signal breaks.</strong> The lights are coming on block by block behind you — a whole stratum witnessed, tomb to boss floor, and the Board has a word for climbers like this. One stratum sealed. Eight to go.',
    rewards: [
      { label: '$SHARD PAYOUT', value: '+1500' },
      { label: 'XP LOGGED', value: '+600' },
      { label: 'BOSS CORE', value: 'Static City Core' },
      { label: 'RANK', value: 'C — PROMOTED' },
    ],
  },
}

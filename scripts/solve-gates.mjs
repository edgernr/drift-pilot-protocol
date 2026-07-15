// Solver harness (bible §9.6) — proves every gate config is completable
// end-to-end through the REAL EncounterShell: solution loads as editor code →
// wards pass → CAST → quiz answered → completion overlay appears.
//
// Usage:  node scripts/solve-gates.mjs [gates] [baseUrl]
//   node scripts/solve-gates.mjs                 # all gates 1-10 vs localhost:5173
//   node scripts/solve-gates.mjs 6,7,8           # subset
//   node scripts/solve-gates.mjs all http://localhost:5174
//
// Requires: dev server running (the /__solver route is dev-only), Chrome installed.
import { spawn } from 'node:child_process'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const CHROME = process.env.CHROME_PATH ?? 'c:/Program Files/Google/Chrome/Application/chrome.exe'
const PORT = 9345
const argGates = process.argv[2] && process.argv[2] !== 'all'
  ? process.argv[2].split(',').map(Number)
  : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const BASE = process.argv[3] ?? 'http://localhost:5173'
const TIMEOUT_MS = 30000

// Configs are plain ES modules — import them directly for quiz answers + ward counts.
async function loadConfig(n) {
  const p = resolve(import.meta.dirname, `../src/data/gates/gate${String(n).padStart(2, '0')}.js`)
  return (await import(pathToFileURL(p).href)).default
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--no-first-run',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${process.env.TEMP ?? '/tmp'}\\chrome-solver`,
  '--window-size=1440,900',
  'about:blank',
], { stdio: 'ignore' })

async function getWsUrl() {
  for (let i = 0; i < 30; i++) {
    try {
      const tabs = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()
      const page = tabs.find(t => t.type === 'page' && !t.url.startsWith('chrome-extension'))
      if (page) return page.webSocketDebuggerUrl
    } catch {}
    await sleep(300)
  }
  throw new Error('chrome debug port never came up')
}

const ws = new WebSocket(await getWsUrl())
await new Promise(r => { ws.onopen = r })
let id = 0
const pending = new Map()
ws.onmessage = (e) => {
  const msg = JSON.parse(e.data)
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id) }
}
const send = (method, params = {}) => new Promise((res) => {
  const mid = ++id
  pending.set(mid, res)
  ws.send(JSON.stringify({ id: mid, method, params }))
})
const evaluate = async (expr) => {
  const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true })
  if (r.result?.exceptionDetails) return { __error: r.result.exceptionDetails.text }
  return r.result?.result?.value
}
async function waitFor(expr, timeoutMs, label) {
  const t0 = Date.now()
  while (Date.now() - t0 < timeoutMs) {
    const v = await evaluate(expr)
    if (v) return v
    await sleep(400)
  }
  throw new Error(`timeout waiting for ${label}`)
}

await send('Page.enable')
const results = []

for (const n of argGates) {
  const t0 = Date.now()
  let cfg
  try {
    cfg = await loadConfig(n)
  } catch (e) {
    results.push({ gate: n, ok: false, why: `config import failed: ${e.message}` })
    continue
  }
  const correctOpt = cfg.quiz?.options?.[cfg.quiz.correct]
  try {
    if (!cfg.solution) throw new Error('NO SOLUTION FIELD (rule #6)')
    await send('Page.navigate', { url: `${BASE}/__solver/${n}` })
    // 1. shell mounted (ArenaShell = the universal shell)
    await waitFor(`!!document.querySelector('.ar-strike-btn')`, TIMEOUT_MS, 'shell mount')
    // 2. all wards pass (debounced checks against the solution → '✓ all pass')
    await waitFor(
      `(document.querySelector('.ar-panel-status')?.textContent ?? '').includes('all pass')`,
      TIMEOUT_MS, `wards (last state: see below)`
    )
    // 3. STRIKE (deals damage for every newly-passing ward in one press)
    await evaluate(`document.querySelector('.ar-strike-btn')?.click()`)
    // 4. quiz: pick the correct option, check, submit
    await waitFor(`[...document.querySelectorAll('button')].some(b => b.textContent.includes('Check Answer'))`, TIMEOUT_MS, 'quiz overlay')
    const clicked = await evaluate(
      `(() => { const b = [...document.querySelectorAll('button')].find(x => x.textContent === ${JSON.stringify(correctOpt)}); if (!b) return false; b.click(); return true })()`
    )
    if (!clicked) throw new Error('correct quiz option button not found')
    await evaluate(`[...document.querySelectorAll('button')].find(b => b.textContent.includes('Check Answer'))?.click()`)
    await waitFor(`[...document.querySelectorAll('button')].some(b => b.textContent.includes('Submit Gate'))`, 8000, 'quiz pass state')
    await evaluate(`[...document.querySelectorAll('button')].find(b => b.textContent.includes('Submit Gate'))?.click()`)
    // 5. victory overlay = completability proven (waits out the kill-shot cinematic ~2.3s)
    await waitFor(`!!document.querySelector('.ar-victory-overlay')`, 12000, 'victory overlay')
    results.push({ gate: n, ok: true, ms: Date.now() - t0 })
    console.log(`GATE ${String(n).padStart(2, '0')}  ✅ PASS   (${Date.now() - t0}ms)`)
  } catch (e) {
    const wardState = await evaluate(`document.querySelector('.ar-panel-status')?.textContent ?? '(no shell)'`)
    const failing = await evaluate(
      `[...document.querySelectorAll('.ar-ward')].filter(r => !r.className.includes('passed')).map(r => r.textContent.trim().slice(0, 60))`
    )
    results.push({ gate: n, ok: false, why: e.message, wardState, failing })
    console.log(`GATE ${String(n).padStart(2, '0')}  ❌ FAIL   ${e.message} · wards: ${wardState}`)
    if (Array.isArray(failing) && failing.length) console.log('         ' + failing.join('\n         '))
  }
}

ws.close()
chrome.kill()

const passed = results.filter(r => r.ok).length
console.log(`\n${passed}/${results.length} gates completable`)
process.exit(passed === results.length ? 0 : 1)

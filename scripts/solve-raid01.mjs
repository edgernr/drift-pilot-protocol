// RAID 01 solver harness (rule #6) — proves all five functions of THE BROODGATE
// are completable end-to-end through the REAL Raid01Combat shell: each function's
// `solution` loads as the stored code → wards pass through the live check pipeline
// (rendered offscreen iframe, computed styles, geometry, events) → STRIKE →
// function complete. After five completions the victory overlay must appear.
//
// Usage:  node scripts/solve-raid01.mjs [baseUrl]
// Requires: dev server running (the /__raidsolver route is dev-only), Chrome.
import { spawn } from 'node:child_process'

const CHROME = process.env.CHROME_PATH ?? 'c:/Program Files/Google/Chrome/Application/chrome.exe'
const PORT = 9346
const BASE = process.argv[2] ?? 'http://localhost:5173'
const TIMEOUT_MS = 30000

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--no-first-run',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${process.env.TEMP ?? '/tmp'}\\chrome-raid-solver`,
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

let ok = true
try {
  await send('Page.navigate', { url: `${BASE}/__raidsolver` })
  await waitFor(`!!document.querySelector('.r1-strike-btn')`, TIMEOUT_MS, 'raid shell mount')

  for (let n = 1; n <= 5; n++) {
    const t0 = Date.now()
    // Wait for the STRIKE button with all wards green (solution code is pre-loaded).
    await waitFor(
      `!!document.querySelector('.r1-scanner-count.clear')`,
      TIMEOUT_MS, `wards green (function ${n})`
    )
    // STRIKE and confirm the function completed.
    await waitFor(`!!document.querySelector('.r1-strike-btn:not(:disabled)')`, TIMEOUT_MS, `strike button (function ${n})`)
    await evaluate(`document.querySelector('.r1-strike-btn')?.click()`)
    await waitFor(
      `document.querySelectorAll('.r1-fn-row.done').length >= ${n}`,
      TIMEOUT_MS, `complete ${n} registered`
    )
    const hp = await evaluate(`document.querySelector('.r1-boss-hp-val')?.textContent ?? '?'`)
    console.log(`FUNCTION ${n}/5  ✦ COMPLETE   boss ${String(hp).trim()}   (${Date.now() - t0}ms)`)
  }

  await waitFor(`!!document.querySelector('.r1-victory-overlay')`, 12000, 'victory overlay')
  console.log('\nVARKUL, THE NULLHEART HYDRA — DEFEATED. 5/5 functions machine-verified.')
} catch (e) {
  ok = false
  const state = await evaluate(`({
    completed: document.querySelectorAll('.r1-fn-row.done').length,
    scanner: document.querySelector('.r1-scanner-count')?.textContent ?? '(none)',
    wards: [...document.querySelectorAll('.r1-chip')].map(w => w.textContent.trim().slice(0, 70)),
  })`)
  console.error(`\n❌ RAID SOLVER FAILED: ${e.message}`)
  console.error('   state:', JSON.stringify(state, null, 2))
}

ws.close()
chrome.kill()
process.exit(ok ? 0 : 1)

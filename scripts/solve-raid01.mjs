// RAID 01 solver harness (rule #6) — proves all nine heads of THE BROODGATE are
// severable end-to-end through the REAL Raid01Combat shell: each head's
// `solution` loads as the stored code → CLAIM → wards pass through the live
// check pipeline (rendered offscreen iframe, computed styles, geometry, events)
// → STRIKE → severed. After nine severs the victory overlay must appear.
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
  await waitFor(`!!document.querySelector('.r1-head-row')`, TIMEOUT_MS, 'raid shell mount')

  for (let n = 1; n <= 9; n++) {
    const t0 = Date.now()
    // Claim whatever head is currently selected (the shell auto-advances after
    // each sever; head 1 is selected on mount).
    await waitFor(`!!document.querySelector('.r1-claim-btn')`, TIMEOUT_MS, `claim button (head ${n})`)
    await evaluate(`document.querySelector('.r1-claim-btn')?.click()`)
    // Solution code is pre-loaded; wait for every ward to pass live…
    await waitFor(
      `!!document.querySelector('.r1-scanner-count.clear')`,
      TIMEOUT_MS, `wards green (head ${n})`
    )
    // …then STRIKE and confirm the sever registered.
    await waitFor(`!!document.querySelector('.r1-strike-btn')`, TIMEOUT_MS, `strike button (head ${n})`)
    await evaluate(`document.querySelector('.r1-strike-btn')?.click()`)
    await waitFor(
      `document.querySelectorAll('.r1-head-row.severed').length >= ${n}`,
      TIMEOUT_MS, `sever ${n} registered`
    )
    const hp = await evaluate(`document.querySelector('.r1-boss-hp-val')?.textContent ?? '?'`)
    console.log(`HEAD ${n}/9  ✂ SEVERED   boss ${String(hp).trim()}   (${Date.now() - t0}ms)`)
  }

  await waitFor(`!!document.querySelector('.r1-victory-overlay')`, 12000, 'victory overlay')
  console.log('\nVARKUL, THE NULLHEART HYDRA — DEFEATED. 9/9 heads machine-verified.')
} catch (e) {
  ok = false
  const state = await evaluate(`({
    severed: document.querySelectorAll('.r1-head-row.severed').length,
    scanner: document.querySelector('.r1-scanner-count')?.textContent ?? '(none)',
    wards: [...document.querySelectorAll('.r1-ward')].map(w => w.textContent.trim().slice(0, 70)),
  })`)
  console.error(`\n❌ RAID SOLVER FAILED: ${e.message}`)
  console.error('   state:', JSON.stringify(state, null, 2))
}

ws.close()
chrome.kill()
process.exit(ok ? 0 : 1)

// RAID 01 ward audit — "test the tests".
//
// solve-raid01.mjs proves each function's SOLUTION passes its wards. It cannot
// prove the inverse: that the STARTER (unfixed, bug-ridden) code FAILS them.
// A ward that passes on the starter is a false positive — it green-lights a
// bug the UI claims the hunter fixed, and no solver run will ever catch it.
//
// This script reproduces the production check pipeline exactly (same srcdoc,
// same sandbox, same parent-realm sequential ward evaluation on one rendered
// document) and runs every ward against BOTH starter and solution.
//
//   starter FAIL + solution PASS  → ✓ ward discriminates (good)
//   starter PASS                  → ✗ FALSE POSITIVE (ward proves nothing)
//   solution FAIL                 → ✗ BROKEN (solution can't clear it)
//
// Usage: node scripts/audit-raid01-wards.mjs
import { spawn } from 'node:child_process'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const CHROME = process.env.CHROME_PATH ?? 'c:/Program Files/Google/Chrome/Application/chrome.exe'
const PORT = 9347
const sleep = (ms) => new Promise(r => setTimeout(r, ms))

const { FUNCTIONS } = await import(
  pathToFileURL(resolve(import.meta.dirname, '../src/data/raids/raid01.js')).href
)

const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--no-first-run',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${process.env.TEMP ?? '/tmp'}\\chrome-ward-audit`,
  '--window-size=1440,900', 'about:blank',
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
  const m = JSON.parse(e.data)
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id) }
}
const send = (method, params = {}) => new Promise(res => {
  const mid = ++id
  pending.set(mid, res)
  ws.send(JSON.stringify({ id: mid, method, params }))
})
async function evaluate(expr) {
  const r = await send('Runtime.evaluate', {
    expression: expr, returnByValue: true, awaitPromise: true,
  })
  if (r.result?.exceptionDetails) return { __error: r.result.exceptionDetails.text }
  return r.result?.result?.value
}

await send('Page.enable')
await send('Runtime.enable')

// Host page: one offscreen-rendered iframe, matching production's check frame
// (rendered offscreen — NOT display:none — so layout/computed styles resolve).
await evaluate(`
  document.body.innerHTML = ''
  window.__frame = document.createElement('iframe')
  __frame.setAttribute('sandbox', 'allow-scripts allow-same-origin')
  Object.assign(__frame.style, {
    position: 'absolute', left: '-99999px', top: '0',
    width: '1100px', height: '800px', border: '0', visibility: 'hidden',
  })
  document.body.appendChild(__frame)
  window.__load = (srcdoc) => new Promise(res => {
    __frame.onload = () => requestAnimationFrame(() => res(true))
    __frame.srcdoc = srcdoc
  })
  true
`)

// Wards run sequentially, top-to-bottom, on ONE rendered document — production
// semantics (some wards mutate the doc; later wards depend on that order).
async function runWards(fn, code) {
  const srcdoc = fn.buildCheckDoc(code)
  await evaluate(`__load(${JSON.stringify(srcdoc)})`)
  await sleep(260)   // let the doc's own timers/intervals settle
  const results = {}
  for (const w of fn.wards) {
    const r = await evaluate(`(() => {
      const doc = __frame.contentDocument, win = __frame.contentWindow
      try { return !!(${w.test.toString()})(doc, win, ${JSON.stringify(code)}) }
      catch (e) { return false }
    })()`)
    results[w.id] = r === true
  }
  return results
}

const rows = []
for (const fn of FUNCTIONS) {
  const onStarter = await runWards(fn, fn.starter)
  const onSolution = await runWards(fn, fn.solution)
  for (const w of fn.wards) {
    const s = onStarter[w.id], v = onSolution[w.id]
    rows.push({
      fn: fn.id, ward: w.id, label: w.label,
      starter: s, solution: v,
      verdict: !v ? 'BROKEN' : s ? 'FALSE-POSITIVE' : 'OK',
    })
  }
}

const pad = (s, n) => String(s).padEnd(n).slice(0, n)
console.log(`\n${pad('FN', 4)}${pad('WARD', 20)}${pad('STARTER', 9)}${pad('SOLUTION', 10)}VERDICT`)
console.log('─'.repeat(78))
let lastFn = null
for (const r of rows) {
  if (r.fn !== lastFn) { if (lastFn) console.log(''); lastFn = r.fn }
  const mark = r.verdict === 'OK' ? '✓' : '✗'
  console.log(
    `${pad(r.fn, 4)}${pad(r.ward, 20)}${pad(r.starter ? 'PASS' : 'fail', 9)}` +
    `${pad(r.solution ? 'PASS' : 'FAIL', 10)}${mark} ${r.verdict}`
  )
}

// Independence check: wards asserting the identical thing are not independent
// measures. They pass the starter/solution test above yet still flip green as a
// group, crediting the hunter for bugs they never touched.
const dupes = []
for (const fn of FUNCTIONS) {
  const bySrc = new Map()
  for (const w of fn.wards) {
    const src = w.test.toString().replace(/\s+/g, ' ')
    if (!bySrc.has(src)) bySrc.set(src, [])
    bySrc.get(src).push(w.id)
  }
  for (const ids of bySrc.values()) if (ids.length > 1) dupes.push({ fn: fn.id, ids })
}

const bad = rows.filter(r => r.verdict !== 'OK')
const fp = bad.filter(r => r.verdict === 'FALSE-POSITIVE')
const broken = bad.filter(r => r.verdict === 'BROKEN')
console.log('─'.repeat(78))
console.log(`${rows.length} wards · ${rows.length - bad.length} discriminating · ${fp.length} false-positive · ${broken.length} broken`)
if (fp.length) {
  console.log('\nFALSE POSITIVES (pass on unfixed starter code — the bug they name is never checked):')
  for (const r of fp) console.log(`  ${r.fn}/${r.ward} — ${r.label}`)
}
if (broken.length) {
  console.log('\nBROKEN (the authored solution does not clear them):')
  for (const r of broken) console.log(`  ${r.fn}/${r.ward} — ${r.label}`)
}
if (dupes.length) {
  console.log('\nNOT INDEPENDENT (identical assertions — these flip green together):')
  for (const d of dupes) console.log(`  ${d.fn}: ${d.ids.join(', ')}`)
}

ws.close()
chrome.kill()
process.exit(bad.length || dupes.length ? 1 : 0)

// Route smoke for the Guilds work — drives headless Chrome over CDP (like
// solve-gates.mjs) so the SPA actually renders before we assert.
//   node scripts/smoke-guilds.mjs [baseUrl]
// Anonymous session (fresh user-data-dir): /guild must bounce to login-wrap;
// /guild/:id and /pilot/:id are public and render their own wrappers.
import { spawn } from 'node:child_process'

const CHROME = process.env.CHROME_PATH ?? 'c:/Program Files/Google/Chrome/Application/chrome.exe'
const PORT = 9346
const BASE = process.argv[2] ?? 'http://localhost:5173'
const FAKE = '00000000-0000-0000-0000-000000000000'
const sleep = (ms) => new Promise(r => setTimeout(r, ms))

const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--no-first-run',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${(process.env.TEMP ?? '/tmp')}\\chrome-smoke-cdp`,
  '--window-size=1280,900', 'about:blank',
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
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id) } }
const send = (method, params = {}) => new Promise((res) => { const mid = ++id; pending.set(mid, res); ws.send(JSON.stringify({ id: mid, method, params })) })
const evaluate = async (expr) => {
  const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true })
  return r.result?.result?.value
}
async function waitFor(expr, timeoutMs) {
  const t0 = Date.now()
  while (Date.now() - t0 < timeoutMs) { if (await evaluate(expr)) return true; await sleep(300) }
  return false
}

await send('Page.enable')

const cases = [
  { path: '/guild',              expect: '.login-wrap', label: 'anon /guild → login' },
  { path: `/guild/${FAKE}`,      expect: '.guild-wrap', label: 'public /guild/:id' },
  { path: `/pilot/${FAKE}`,      expect: '.pp-shell',   label: 'public /pilot/:id' },
]

let allOk = true
for (const c of cases) {
  await send('Page.navigate', { url: `${BASE}${c.path}` })
  const ok = await waitFor(`!!document.querySelector('${c.expect}')`, 12000)
  const pathNow = await evaluate('location.pathname')
  console.log(`${ok ? '✅' : '❌'}  ${c.label.padEnd(24)} expect ${c.expect.padEnd(12)} landed=${pathNow}  found=${ok}`)
  if (!ok) allOk = false
}

ws.close()
chrome.kill()
console.log(`\n${allOk ? 'ALL ROUTES OK' : 'SMOKE FAILED'}`)
process.exit(allOk ? 0 : 1)

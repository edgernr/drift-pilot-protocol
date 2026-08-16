// Anonymous backend verification of the Guilds migration — confirms the views
// exist, expose the right columns (and NOT sensitive ones), and that the write
// RPCs exist + reject unauthenticated callers. Uses the app's own (anon) client.
//   node scripts/verify-anon.mjs [baseUrl] [probeUserId]
import { spawn } from 'node:child_process'
const CHROME = process.env.CHROME_PATH ?? 'c:/Program Files/Google/Chrome/Application/chrome.exe'
const PORT = 9351
const BASE = process.argv[2] ?? 'http://localhost:5173'
const PROBE = process.argv[3] ?? null
const TMP = process.env.TEMP ?? '/tmp'
const sleep = (ms) => new Promise(r => setTimeout(r, ms))
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--no-first-run', `--remote-debugging-port=${PORT}`, `--user-data-dir=${TMP}\\chrome-vanon`, 'about:blank'], { stdio: 'ignore' })
async function getWsUrl() { for (let i = 0; i < 40; i++) { try { const t = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json(); const p = t.find(x => x.type === 'page'); if (p) return p.webSocketDebuggerUrl } catch {} await sleep(300) } throw new Error('no chrome') }
const ws = new WebSocket(await getWsUrl()); await new Promise(r => { ws.onopen = r })
let id = 0; const pending = new Map()
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id) } }
const send = (method, params = {}) => new Promise((res) => { const mid = ++id; pending.set(mid, res); ws.send(JSON.stringify({ id: mid, method, params })) })
async function ev(expr) { const r = await send('Runtime.evaluate', { expression: `(async () => { ${expr} })()`, awaitPromise: true, returnByValue: true }); if (r.result?.exceptionDetails) return { __error: r.result.exceptionDetails.exception?.description ?? r.result.exceptionDetails.text }; return r.result?.result?.value }

await send('Page.enable'); await send('Runtime.enable')
await send('Page.navigate', { url: `${BASE}/login` }); await sleep(2500)
const ok = await ev(`window.__sb=(await import('/src/lib/supabase.js')).supabase; return !!window.__sb`)
if (ok !== true) { console.log('❌ could not load client:', ok); ws.close(); chrome.kill(); process.exit(1) }
console.log('✓ app anon client loaded\n')

const out = await ev(`
  const q = async (t, sel) => { const r = await window.__sb.from(t).select(sel).limit(1); return { ok: !r.error, err: r.error?.message ?? null, cols: r.data && r.data[0] ? Object.keys(r.data[0]) : [] }; };
  const dir  = await q('guild_directory', '*');
  const ros  = await q('guild_roster', '*');
  const lead = await q('leaderboard', '*');
  const prof = await q('public_profiles', '*');
  // does public_profiles leak anything sensitive?
  const leakProbe = await window.__sb.from('public_profiles').select('wallet,is_admin,banned_until,stripe_customer_id').limit(1);
  // RPC guard: anon must be rejected by the function's own auth.uid() check
  const guard = await window.__sb.rpc('create_guild', { p_name: 'anon probe', p_tag: 'ANON', p_emblem: {} });
  ${PROBE ? `const probe = await window.__sb.from('public_profiles').select('id,name,avatar,guild_tag,is_banned').eq('id', ${JSON.stringify(PROBE)}).maybeSingle();` : 'const probe = { data: null };'}
  return {
    directory: dir, roster: ros, leaderboard: lead, publicProfiles: prof,
    leakBlocked: !!leakProbe.error, leakErr: leakProbe.error?.message ?? '(NO ERROR — LEAK!)',
    rpcGuard: guard.error?.message ?? '(no error — UNEXPECTED)',
    probe: probe.data,
  };
`)

const line = (label, v) => console.log(label.padEnd(20), v.ok ? '✓ live' : `✗ ${v.err}`, v.cols.length ? `[${v.cols.join(', ')}]` : '')
console.log('── VIEWS (anon-readable) ──')
line('guild_directory', out.directory)
line('guild_roster', out.roster)
line('leaderboard', out.leaderboard)
line('public_profiles', out.publicProfiles)
console.log('\n── SECURITY ──')
console.log('sensitive cols blocked:', out.leakBlocked ? `✓ (${out.leakErr})` : `✗ ${out.leakErr}`)
console.log('anon create_guild guard:', /not authenticated/i.test(out.rpcGuard) ? `✓ rejected ("${out.rpcGuard}")` : `✗ "${out.rpcGuard}"`)
console.log('leaderboard has avatar :', out.leaderboard.cols.includes('avatar') ? '✓' : (out.leaderboard.ok ? '(no rows to introspect)' : '✗'))
if (out.probe) console.log('\nprobe profile row:', JSON.stringify(out.probe))
ws.close(); chrome.kill(); process.exit(0)

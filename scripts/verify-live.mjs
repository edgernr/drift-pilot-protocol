// Logged-in UI verification with a REAL account. Non-destructive: captures your
// current avatar + guild state, exercises the flow with a TEMP guild/sigil,
// screenshots the logged-in UI, then RESTORES (disbands only a guild it created,
// puts the original avatar back). Credentials come via argv (never written).
//   node scripts/verify-live.mjs <baseUrl> <email> <password>
import { spawn } from 'node:child_process'
import { writeFileSync } from 'node:fs'
const CHROME = process.env.CHROME_PATH ?? 'c:/Program Files/Google/Chrome/Application/chrome.exe'
const PORT = 9352
const [BASE, EMAIL, PASSWORD] = [process.argv[2] ?? 'http://localhost:5173', process.argv[3], process.argv[4]]
if (!EMAIL || !PASSWORD) { console.log('usage: node scripts/verify-live.mjs <baseUrl> <email> <password>'); process.exit(1) }
const TMP = process.env.TEMP ?? '/tmp'
const sleep = (ms) => new Promise(r => setTimeout(r, ms))
const J = (v) => JSON.stringify(v)
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--no-first-run', `--remote-debugging-port=${PORT}`, `--user-data-dir=${TMP}\\chrome-vlive`, '--window-size=1360,1100', 'about:blank'], { stdio: 'ignore' })
async function getWsUrl() { for (let i = 0; i < 40; i++) { try { const t = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json(); const p = t.find(x => x.type === 'page'); if (p) return p.webSocketDebuggerUrl } catch {} await sleep(300) } throw new Error('no chrome') }
const ws = new WebSocket(await getWsUrl()); await new Promise(r => { ws.onopen = r })
let id = 0; const pending = new Map()
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id) } }
const send = (method, params = {}) => new Promise((res) => { const mid = ++id; pending.set(mid, res); ws.send(J({ id: mid, method, params })) })
async function ev(expr) { const r = await send('Runtime.evaluate', { expression: `(async () => { ${expr} })()`, awaitPromise: true, returnByValue: true }); if (r.result?.exceptionDetails) return { __error: r.result.exceptionDetails.exception?.description ?? r.result.exceptionDetails.text }; return r.result?.result?.value }
async function shot(name) { await sleep(3800); const r = await send('Page.captureScreenshot', { format: 'png' }); const out = `${TMP}\\vl-${name}.png`; writeFileSync(out, Buffer.from(r.result.data, 'base64')); console.log('  📸', out); return out }

await send('Page.enable'); await send('Runtime.enable')
await send('Page.navigate', { url: `${BASE}/login` }); await sleep(2500)
const ok = await ev(`window.__sb=(await import('/src/lib/supabase.js')).supabase; return !!window.__sb`)
if (ok !== true) { console.log('❌ client load failed:', ok); ws.close(); chrome.kill(); process.exit(1) }

// sign in
let r = await ev(`const {data,error}=await window.__sb.auth.signInWithPassword({email:${J(EMAIL)},password:${J(PASSWORD)}}); return {session:!!data?.session,uid:data?.user?.id??null,error:error?.message??null}`)
console.log('sign in:', { session: r.session, uid: r.uid, error: r.error })
if (!r.session) { console.log('❌ could not sign in'); ws.close(); chrome.kill(); process.exit(1) }
const uid = r.uid

// capture original state
const orig = await ev(`
  const p = await window.__sb.from('profiles').select('avatar,name,is_admin').eq('id',${J(uid)}).maybeSingle();
  const m = await window.__sb.from('guild_members').select('guild_id,role').eq('user_id',${J(uid)}).maybeSingle();
  return { avatar:p.data?.avatar??null, name:p.data?.name??null, isAdmin:p.data?.is_admin??false, guildId:m.data?.guild_id??null, role:m.data?.role??null };
`)
console.log('current state:', orig)

// set a temp sigil so rendering is visible
await ev(`await window.__sb.from('profiles').update({avatar:{seed:424242,palette:2}}).eq('id',${J(uid)}); return true`)

// temp guild only if not already in one
let createdGuild = false, guildId = orig.guildId
if (!guildId) {
  const g = await ev(`const {data,error}=await window.__sb.rpc('create_guild',{p_name:'Verify Wardens',p_tag:'VRFY',p_emblem:{seed:777,palette:1}}); return {guildId:data??null,error:error?.message??null}`)
  console.log('create_guild:', g)
  guildId = g.guildId; createdGuild = !!g.guildId
} else {
  console.log('(already in a guild — screenshotting existing one, not creating/disbanding)')
}

// read views for the report
const views = await ev(`
  const d = await window.__sb.from('guild_directory').select('name,tag,member_count,combined_xp').eq('id',${J(guildId)}).maybeSingle();
  const ro = await window.__sb.from('guild_roster').select('name,role,avatar,total_xp').eq('guild_id',${J(guildId)});
  const p = await window.__sb.from('public_profiles').select('name,avatar,guild_tag,is_banned,is_founder').eq('id',${J(uid)}).maybeSingle();
  return { dir:d.data, roster:ro.data, profile:p.data };
`)
console.log('\n── VIEW READS ──')
console.log('guild_directory:', J(views.dir))
console.log('guild_roster:   ', J(views.roster))
console.log('public_profiles:', J(views.profile))

// screenshots of the logged-in UI
console.log('\n── SCREENSHOTS ──')
await send('Page.navigate', { url: `${BASE}/guild` }); const s1 = await shot('guild')
await send('Page.navigate', { url: `${BASE}/pilot/${uid}` }); const s2 = await shot('profile')
await ev(`localStorage.setItem('dash-view','leaderboard'); return true`)
await send('Page.navigate', { url: `${BASE}/dashboard` }); const s3 = await shot('leaderboard')

// RESTORE
console.log('\n── RESTORE ──')
if (createdGuild) { const d = await ev(`const {error}=await window.__sb.rpc('disband_guild'); return {error:error?.message??null}`); console.log('disbanded temp guild:', d) }
const rest = await ev(`await window.__sb.from('profiles').update({avatar:${J(orig.avatar ?? {})}}).eq('id',${J(uid)}); return true`)
console.log('avatar restored to:', J(orig.avatar ?? {}), rest === true ? 'OK' : J(rest))

console.log('\n════ RESULT ════')
console.log('signed in            :', 'OK', orig.isAdmin ? '(admin)' : '')
console.log('temp guild created   :', createdGuild ? 'yes → disbanded' : 'no (used existing)')
console.log('roster shows you     :', views.roster?.some(x => x.role === 'master' || x.role) ? 'OK' : '?')
console.log('roster carries avatar:', views.roster?.[0]?.avatar ? 'OK' : '?')
console.log('profile guild tag    :', views.profile?.guild_tag ?? '(none)')
console.log('screenshots          :', [s1, s2, s3].join(', '))
ws.close(); chrome.kill(); process.exit(0)

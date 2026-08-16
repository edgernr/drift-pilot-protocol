// Verify the friends + raid-invite + join flow end to end against the LIVE
// database, using two accounts you already own. Creates nothing permanent:
// the temporary warband is deleted and the friendship removed at the end.
//
//   node scripts/verify-friends-flow.mjs <emailA> <pwA> <emailB> <pwB>
//
// A raises a warband and invites B; B accepts and takes a seat. Every step
// goes through the same RPCs and queries the UI uses, so a pass here means the
// buttons in the war room work.
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const [ea, pa, eb, pb] = process.argv.slice(2)
if (!ea || !pa || !eb || !pb) {
  console.log('usage: node scripts/verify-friends-flow.mjs <emailA> <pwA> <emailB> <pwB>')
  process.exit(1)
}
const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
const pick = k => (env.match(new RegExp(`^${k}=(.*)$`, 'm')) || [])[1]?.trim()
const URL_ = pick('VITE_SUPABASE_URL'), KEY = pick('VITE_SUPABASE_ANON_KEY')

let fails = 0
const ok = (c, label, extra = '') => { if (!c) fails++; console.log(`${c ? '✅' : '❌'} ${label}${extra ? ' — ' + extra : ''}`) }

async function signIn(email, password) {
  const sb = createClient(URL_, KEY, { auth: { persistSession: false } })
  const { data, error } = await sb.auth.signInWithPassword({ email, password })
  if (error) throw new Error(`sign in ${email}: ${error.message}`)
  const { data: p } = await sb.from('public_profiles').select('name').eq('id', data.user.id).maybeSingle()
  return { sb, id: data.user.id, name: p?.name ?? '(no name)' }
}

const a = await signIn(ea, pa)
const b = await signIn(eb, pb)
console.log(`A = ${a.name}   B = ${b.name}\n`)

// ── 1. search ──────────────────────────────────────────────────────────────
const { data: found, error: sErr } = await a.sb
  .from('public_profiles').select('user_id:id, name').ilike('name', `%${b.name}%`).limit(8)
ok(!sErr && found?.some(f => f.user_id === b.id), 'A can find B in hunter search', sErr?.message)
ok(found?.[0]?.user_id !== undefined, 'search rows expose user_id (not bare id)')

// ── 2. friendship ──────────────────────────────────────────────────────────
let already = (await a.sb.rpc('list_friends')).data?.some(f => f.friend_id === b.id)
if (!already) {
  const { error } = await a.sb.rpc('send_friend_request', { p_target: b.id })
  ok(!error, 'A sends friend request', error?.message)
  const { data: reqs } = await b.sb.rpc('list_friend_requests')
  const req = reqs?.find(r => r.sender_id === a.id)
  ok(!!req, 'B sees the incoming request')
  if (req) {
    const { error: e2 } = await b.sb.rpc('respond_friend_request', { p_request_id: req.request_id, p_accept: true })
    ok(!e2, 'B accepts it', e2?.message)
  }
} else console.log('… already friends, skipping request step')

const aF = (await a.sb.rpc('list_friends')).data ?? []
ok(aF.some(f => f.friend_id === b.id), 'A lists B as a friend')
ok(aF[0]?.name !== undefined, 'friend rows carry `name` (the UI reads this)')

// ── 3. warband + invite ────────────────────────────────────────────────────
const { data: raid, error: rErr } = await a.sb.from('raids')
  .insert({ name: `VERIFY ${Date.now()}`, created_by: a.id, status: 'bg_lobby', health: 1000 })
  .select().single()
ok(!rErr && raid?.id, 'A raises a warband', rErr?.message)

const { error: mErr } = await a.sb.from('raid_members').insert({ raid_id: raid.id, user_id: a.id, role: 'interface' })
ok(!mErr, 'A claims INTERFACE', mErr?.message)

const { error: iErr } = await a.sb.rpc('invite_to_raid', { p_raid_id: raid.id, p_invitee_id: b.id })
ok(!iErr, 'A invites B', iErr?.message)

const bInv = (await b.sb.rpc('list_my_raid_invites')).data ?? []
const inv = bInv.find(i => i.raid_id === raid.id)
ok(!!inv, 'B sees the raid invite')

const roster = (await a.sb.rpc('list_raid_invites', { p_raid_id: raid.id })).data ?? []
ok(roster.some(i => i.status === 'pending'), 'roster shows it as PENDING')

// ── 4. accept AND join (what the modal does) ───────────────────────────────
if (inv) {
  const { error: e } = await b.sb.rpc('respond_raid_invite', { p_invite_id: inv.invite_id, p_accept: true })
  ok(!e, 'B accepts the invite', e?.message)
}
const { error: seatErr } = await b.sb.from('raid_members').insert({ raid_id: raid.id, user_id: b.id, role: 'signal' })
ok(!seatErr, 'B takes a seat (SIGNAL) — the step the old JOIN button skipped', seatErr?.message)

const members = (await a.sb.from('raid_members').select('user_id, role').eq('raid_id', raid.id)).data ?? []
ok(new Set(members.map(m => m.user_id)).size === 2, 'warband holds 2 distinct hunters',
   `rows=${members.length}`)

const { error: dup } = await b.sb.from('raid_members').insert({ raid_id: raid.id, user_id: b.id, role: 'interface' })
ok(!!dup, 'a role already taken is rejected by the database')

const ids = [...new Set(members.map(m => m.user_id))]
const names = (await b.sb.from('public_profiles').select('id, name').in('id', ids)).data ?? []
ok(names.length === ids.length, 'attachNames resolves every member through the public view')

// ── cleanup ────────────────────────────────────────────────────────────────
await a.sb.from('raids').delete().eq('id', raid.id)
if (!already) await a.sb.rpc('remove_friend', { p_friend_id: b.id })
console.log(`\n${fails ? `❌ ${fails} step(s) FAILED` : '✅ friends → invite → accept → seated: the whole flow works'}`)
process.exit(fails ? 1 : 0)

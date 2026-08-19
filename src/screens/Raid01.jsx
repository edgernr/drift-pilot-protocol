import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useNav } from '../context/NavigationContext'
import Raid01Combat from '../components/Raid01Combat'
import RaidBossVarkul from '../components/RaidBossVarkul'
import WarbandRoster from '../components/WarbandRoster'
import FriendsRail from '../components/FriendsRail'
import InviteAcceptModal from '../components/InviteAcceptModal'
import * as F from '../lib/friends'
import { attachNames } from '../lib/publicProfiles'
import { debounce } from '../lib/debounce'
import {
  RAID01, FUNCTIONS, FUNCTIONS_BY_ID, PHASES, PAYOUTS, ROLES, ROLE_LIST,
  BOSS_HP_MAX, FUNCTION_DAMAGE, PARTY_MIN, PARTY_MAX, ENTRY_COST, INVITE_TTL_MS,
} from '../data/raids/raid01'
import './Raid01.css'

const EXTRA_ROLE_COST = 1000

// ── RAID 01 — THE BROODGATE (live screen, v2 — Sequential Functions) ─────────
// War room (dossier + rules + lobbies) → warband lobby → live combat.
// Five sequential functions, one per specialization. Functions unlock in order
// as the party completes each one together — no head-hopping, no context switch.

const LIVE_STATUSES = ['bg_lobby', 'bg_active']

export default function Raid01() {
  const { goto } = useNav()
  const { user, profile, completeQuest, burnRaidEntry, refundRaidEntry, refreshProfile } = useAuth()
  const isAdmin = profile?.is_admin ?? false
  const spendable = (profile?.totalHunt ?? 0) - (profile?.totalHuntSpent ?? 0)

  const [loading, setLoading] = useState(true)
  const [sealed, setSealed] = useState(false)
  const [raid, setRaid] = useState(null)
  const [members, setMembers] = useState([])
  const [funcs, setFuncs] = useState({})
  const [events, setEvents] = useState([])
  const [openRaids, setOpenRaids] = useState([])
  const [openRaidMembers, setOpenRaidMembers] = useState({})
  const [warbandName, setWarbandName] = useState('')
  const [pickedRoles, setPickedRoles] = useState([])
  const [busy, setBusy] = useState(false)
  const [myInvites, setMyInvites] = useState([])
  const [raidInvites, setRaidInvites] = useState([])   // invites sent for MY lobby
  const [myInvitesOpen, setMyInvitesOpen] = useState(false)
  const [acceptInvite, setAcceptInvite] = useState(null)   // invite being accepted
  // Accepting an invite does NOT put you in the warband — role choice and the
  // entry burn still have to happen. This remembers which lobby to steer the
  // hunter into so the accept actually leads somewhere.
  const [invitedRaid, setInvitedRaid] = useState(null)   // { id, name }
  const [friends, setFriends] = useState([])
  const [myFriendRequests, setMyFriendRequests] = useState([])
  const [friendSearch, setFriendSearch] = useState('')
  const [friendSearchResults, setFriendSearchResults] = useState([])
  const [friendError, setFriendError] = useState(null)
  const [friendNotice, setFriendNotice] = useState(null)
  const [sentRequests, setSentRequests] = useState([])
  const [payoutError, setPayoutError] = useState(null)
  const channelRef = useRef(null)
  const lobbyChannelRef = useRef(null)
  const lobbyReloadRef = useRef(null)

  const myId = user?.id
  const isLeader = raid?.created_by === myId

  // ─── Loaders ─────────────────────────────────────────────────────────────────
  const loadRun = useCallback(async (raidId) => {
    const [{ data: r }, { data: mems }, { data: headRows }, { data: evts }] = await Promise.all([
      supabase.from('raids').select('*').eq('id', raidId).single(),
      supabase.from('raid_members').select('*').eq('raid_id', raidId),
      supabase.from('raid_heads').select('*').eq('raid_id', raidId),
      supabase.from('raid_events').select('*').eq('raid_id', raidId)
        .order('created_at', { ascending: false }).limit(60),
    ])
    if (r) setRaid(r)
    // Names come from the public view, not a profiles embed — see lib/publicProfiles.
    if (mems) setMembers(await attachNames(mems))
    setFuncs(Object.fromEntries((headRows ?? []).map(h => [h.head_id, h])))
    if (evts) setEvents(evts)
  }, [])

  const loadLobbies = useCallback(async () => {
    const { data: raids } = await supabase
      .from('raids').select('*').eq('status', 'bg_lobby').order('created_at', { ascending: false })
    const list = raids ?? []
    setOpenRaids(list)
    if (!list.length) { setOpenRaidMembers({}); return }
    const { data: allMems } = await supabase
      .from('raid_members').select('*').in('raid_id', list.map(r => r.id))
    const named = await attachNames(allMems)
    const grouped = {}
    for (const m of named) {
      if (!grouped[m.raid_id]) grouped[m.raid_id] = []
      grouped[m.raid_id].push(m)
    }
    setOpenRaidMembers(grouped)
  }, [])

  // ─── Realtime ────────────────────────────────────────────────────────────────
  const subscribeRun = useCallback((raidId) => {
    if (channelRef.current) supabase.removeChannel(channelRef.current)
    if (lobbyChannelRef.current) supabase.removeChannel(lobbyChannelRef.current)
    lobbyReloadRef.current?.cancel()
    lobbyChannelRef.current = null
    channelRef.current = supabase
      .channel(`broodgate:${raidId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'raids', filter: `id=eq.${raidId}` },
        payload => { if (payload.new?.id) setRaid(payload.new) })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'raid_heads', filter: `raid_id=eq.${raidId}` },
        payload => {
          if (payload.new?.head_id) setFuncs(prev => ({ ...prev, [payload.new.head_id]: payload.new }))
        })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'raid_members', filter: `raid_id=eq.${raidId}` },
        () => loadRun(raidId))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'raid_events', filter: `raid_id=eq.${raidId}` },
        payload => { if (payload.new) setEvents(e => [payload.new, ...e].slice(0, 60)) })
      .subscribe()
  }, [loadRun])

  // Lobby watch. Two things kept this from scaling past ~20 concurrent hunters:
  //   1. the `raids` listener had no filter, so every row change anywhere woke
  //      every client, and
  //   2. an unfiltered `raid_members` listener meant one warband creation
  //      (1 raid row + N member rows) fired a full 3-query reload per row, on
  //      every connected client.
  // Now: server-side filter, no member listener, debounced handler. Seat counts
  // refresh on the slow poll below instead of on a realtime fan-out.
  const subscribeLobbies = useCallback(() => {
    if (lobbyChannelRef.current) supabase.removeChannel(lobbyChannelRef.current)
    const reload = debounce(loadLobbies, 450)
    lobbyReloadRef.current = reload
    lobbyChannelRef.current = supabase
      // Topic is per-user: a hardcoded topic collides with itself across
      // remounts and can duplicate delivery on one socket.
      .channel(`broodgate-lobby-watch:${myId ?? 'anon'}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'raids', filter: 'status=eq.bg_lobby' },
        reload)
      .subscribe()
  }, [loadLobbies, myId])

  // ─── Init ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return
    let cancelled = false
    ;(async () => {
      try {
        const { error: probeErr } = await supabase.from('raid_heads').select('raid_id').limit(1)
        if (probeErr) { if (!cancelled) { setSealed(true); setLoading(false) }; return }

        const { data: myMems } = await supabase
          .from('raid_members').select('raid_id').eq('user_id', user.id)
        if (myMems?.length) {
          const { data: mine } = await supabase
            .from('raids').select('*')
            .in('id', myMems.map(m => m.raid_id))
            .in('status', LIVE_STATUSES)
            .order('created_at', { ascending: false })
          if (mine?.length && !cancelled) {
            await loadRun(mine[0].id)
            subscribeRun(mine[0].id)
            setLoading(false)
            return
          }
        }
        if (!cancelled) {
          await loadLobbies()
          subscribeLobbies()
          setLoading(false)
        }
      } catch {
        if (!cancelled) { setSealed(true); setLoading(false) }
      }
    })()
    return () => {
      cancelled = true
      lobbyReloadRef.current?.cancel()
      // removeChannel (not unsubscribe) — unsubscribe leaves the channel object
      // on the client's list, so remounts accumulate dead duplicate topics.
      if (channelRef.current) supabase.removeChannel(channelRef.current)
      if (lobbyChannelRef.current) supabase.removeChannel(lobbyChannelRef.current)
    }
  }, [user, loadRun, loadLobbies, subscribeRun, subscribeLobbies])

  // Seat counts used to ride on an unfiltered `raid_members` realtime listener,
  // which is what actually broke at ~20 users. A slow poll while the lobby list
  // is on screen costs ~N/12 queries per second instead of N² reloads per join.
  useEffect(() => {
    if (raid || loading || sealed) return
    const id = setInterval(() => { loadLobbies() }, 12000)
    return () => clearInterval(id)
  }, [raid, loading, sealed, loadLobbies])

  // ─── Invites sent FOR this lobby (who's pending / who declined) ────────────
  const fetchRaidInvites = useCallback(async (raidId) => {
    if (!raidId) { setRaidInvites([]); return }
    const { data } = await F.listRaidInvites(raidId)
    setRaidInvites(data ?? [])
  }, [])

  // Invites the invitee can still act on — silence past the TTL counts as a no.
  const liveInvites = useMemo(
    () => myInvites.filter(i => Date.now() - new Date(i.created_at ?? 0).getTime() < INVITE_TTL_MS),
    [myInvites]
  )

  useEffect(() => {
    if (!raid?.id || raid.status !== 'bg_lobby') { setRaidInvites([]); return }
    fetchRaidInvites(raid.id)
    const ch = supabase
      .channel(`bg-invites:${raid.id}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'raid_invites', filter: `raid_id=eq.${raid.id}` },
        () => fetchRaidInvites(raid.id))
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [raid?.id, raid?.status, fetchRaidInvites])

  // Retire invites nobody answered. Only the sender or the raid leader may
  // cancel, and this client is one of them whenever it's showing the roster —
  // so the seat reopens for everyone instead of being held by silence.
  useEffect(() => {
    if (!raid || raid.status !== 'bg_lobby' || !raidInvites.length) return
    const sweep = async () => {
      const stale = raidInvites.filter(i =>
        i.status === 'pending' &&
        Date.now() - new Date(i.created_at ?? 0).getTime() >= INVITE_TTL_MS
      )
      if (!stale.length) return
      for (const i of stale) {
        try { await F.cancelRaidInvite(i.invite_id) } catch { /* another client got there first */ }
      }
      fetchRaidInvites(raid.id)
    }
    sweep()
    const t = setInterval(sweep, 20000)
    return () => clearInterval(t)
  }, [raid, raidInvites, fetchRaidInvites])

  // Arriving with an invite waiting (e.g. straight from HQ) should surface it,
  // not leave it hidden behind a header button.
  useEffect(() => {
    if (liveInvites.length > 0 && !raid) setMyInvitesOpen(true)
  }, [liveInvites.length, raid])

  // ─── My pending raid invites ──────────────────────────────────────────────
  useEffect(() => {
    if (!user || (raid && raid.status === 'bg_lobby')) return
    let cancelled = false
    const fetchInvites = async () => {
      const { data } = await F.listMyRaidInvites()
      if (!cancelled) setMyInvites(data ?? [])
    }
    fetchInvites()
    const ch = supabase
      .channel('my-raid-invites')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'raid_invites', filter: `invitee_id=eq.${user.id}` },
        fetchInvites)
      .subscribe()
    return () => { cancelled = true; supabase.removeChannel(ch) }
  }, [user, raid])

  // ─── Payouts — per function, automatic, idempotent ──────────────────────────
  const fnDone = useCallback((seq) =>
    FUNCTIONS[seq - 1] && funcs[FUNCTIONS[seq - 1].id]?.status === 'severed', [funcs])

  useEffect(() => {
    if (!raid || !myId || !members.some(m => m.user_id === myId)) return
    const done = profile?.completedQuestIds
    if (!done) return
    // The DB now REJECTS a payout row unless you are a member of that raid AND
    // the function is genuinely severed (supabase/raid_payout_guard.sql). That
    // guard must never eat a legitimate payout in silence, so a refusal is
    // surfaced instead of thrown away.
    const claim = async (suffix, xp) => {
      const key = `raid:${raid.id}${suffix}`
      if (done.has(key)) return
      const ok = await completeQuest(key, xp, {})
      if (!ok) setPayoutError(
        'The Association refused a payout for this function. Your progress is safe — ' +
        'reload the war room, and tell the owner if it keeps happening.'
      )
    }
    if (fnDone(1)) claim(PAYOUTS.f1.suffix, PAYOUTS.f1.xp)
    if (fnDone(2)) claim(PAYOUTS.f2.suffix, PAYOUTS.f2.xp)
    if (fnDone(3)) claim(PAYOUTS.f3.suffix, PAYOUTS.f3.xp)
    if (fnDone(4)) claim(PAYOUTS.f4.suffix, PAYOUTS.f4.xp)
    if (fnDone(5)) claim(PAYOUTS.f5.suffix, PAYOUTS.f5.xp)
  }, [funcs, raid, myId, members, profile?.completedQuestIds, completeQuest, fnDone])

  // ─── Session actions ─────────────────────────────────────────────────────────
  const postEvent = useCallback((type, label) => {
    if (!raid) return
    supabase.from('raid_events').insert({
      raid_id: raid.id, type: `bg_${type}`, label, health_delta: 0, created_by: myId,
    }).then(() => {})
  }, [raid, myId])

  const handleFunctionComplete = useCallback(async (fnId) => {
    if (!raid) return
    await supabase.from('raid_heads').upsert(
      {
        raid_id: raid.id, head_id: fnId, status: 'severed',
        claimed_by: myId,
        severed_by: myId, severed_at: new Date().toISOString(),
      },
      { onConflict: 'raid_id,head_id' }
    )
    const fn = FUNCTIONS_BY_ID[fnId]
    postEvent('sever', `⚔ ${fn?.name ?? fnId} COMPLETE by ${profile?.name ?? 'a hunter'} — VARKUL takes ${FUNCTION_DAMAGE}.`)
  }, [raid, myId, postEvent, profile?.name])

  const handleVictory = useCallback(async () => {
    if (!raid || raid.status === 'bg_complete') return
    await supabase.from('raids')
      .update({ status: 'bg_complete', ended_at: new Date().toISOString() })
      .eq('id', raid.id).eq('status', 'bg_active')
    postEvent('victory', '☠ VARKUL, THE NULLHEART HYDRA — SLAIN. First herald kill on Association record. Payouts clearing.')
  }, [raid, postEvent])

  const loadCode = useCallback(async (fnId) => {
    if (!raid) return null
    const { data } = await supabase
      .from('raid_files').select('content')
      .eq('raid_id', raid.id).eq('role', fnId).eq('path', 'code').maybeSingle()
    return data?.content ?? null
  }, [raid])

  const saveCode = useCallback((fnId, content) => {
    if (!raid) return
    supabase.from('raid_files').upsert(
      { raid_id: raid.id, role: fnId, path: 'code', content, updated_by: myId, updated_at: new Date().toISOString() },
      { onConflict: 'raid_id,role,path' }
    ).then(() => {})
  }, [raid, myId])

  // ─── Lobby actions ───────────────────────────────────────────────────────────
  async function handleCreate() {
    if (!warbandName.trim() || busy) return
    const totalEntry = ENTRY_COST + Math.max(0, pickedRoles.length - 1) * EXTRA_ROLE_COST
    if (pickedRoles.length > 0 && spendable < totalEntry && !isAdmin) return
    setBusy(true)
    try {
      const { data: r, error } = await supabase
        .from('raids')
        .insert({ name: warbandName.trim(), created_by: myId, status: 'bg_lobby', health: BOSS_HP_MAX })
        .select().single()
      if (error || !r) return
      if (pickedRoles.length > 0) {
        const inserts = pickedRoles.map(role => ({ raid_id: r.id, user_id: myId, role }))
        const { error: memErr } = await supabase.from('raid_members').insert(inserts)
        if (memErr) return
        if (!isAdmin) await burnRaidEntry(r.id)
        if (pickedRoles.length > 1 && !isAdmin) {
          const extra = pickedRoles.length - 1
          await supabase.from('gate_unlocks').insert({
            user_id: myId,
            quest_id: `raid-extra:${r.id}`,
            drift_cost: extra * EXTRA_ROLE_COST,
          })
          await refreshProfile()
        }
      }
      setWarbandName('')
      setPickedRoles([])
      await loadRun(r.id)
      subscribeRun(r.id)
    } finally {
      setBusy(false)
    }
  }

  async function handleJoin(raidId) {
    if (busy || pickedRoles.length === 0) return
    const totalEntry = ENTRY_COST + Math.max(0, pickedRoles.length - 1) * EXTRA_ROLE_COST
    if (spendable < totalEntry && !isAdmin) return
    // Seats are counted in PEOPLE, not role rows — one hunter holding three
    // specializations is one hunter, and counting rows made a 2-person party
    // read as "full".
    const seated = new Set((openRaidMembers[raidId] ?? []).map(m => m.user_id)).size
    if (seated >= PARTY_MAX) return
    setBusy(true)
    try {
      const inserts = pickedRoles.map(role => ({ raid_id: raidId, user_id: myId, role }))
      const { error } = await supabase.from('raid_members').insert(inserts)
      if (error) return
      setInvitedRaid(null)
      if (!isAdmin) await burnRaidEntry(raidId)
      if (pickedRoles.length > 1 && !isAdmin) {
        const extra = pickedRoles.length - 1
        await supabase.from('gate_unlocks').insert({
          user_id: myId,
          quest_id: `raid-extra:${raidId}`,
          drift_cost: extra * EXTRA_ROLE_COST,
        })
        await refreshProfile()
      }
      setPickedRoles([])
      await loadRun(raidId)
      subscribeRun(raidId)
    } finally {
      setBusy(false)
    }
  }

  async function handleLeave() {
    if (!raid || busy) return
    setBusy(true)
    try {
      const inLobbyStill = raid.status === 'bg_lobby'
      const refundable = inLobbyStill && !isAdmin
      // Only a lobby can be disbanded. Deleting a LIVE raid would cascade away
      // every other hunter's functions, saved code and progress.
      if (isLeader && inLobbyStill) {
        if (refundable) {
          try { await supabase.rpc('refund_raid_entries', { p_raid_id: raid.id }) } catch { }
          await refundRaidEntry(raid.id)
          await supabase.from('gate_unlocks').delete().eq('user_id', myId).eq('quest_id', `raid-extra:${raid.id}`)
        }
        await supabase.from('raids').delete().eq('id', raid.id)
      } else {
        if (refundable) {
          await refundRaidEntry(raid.id)
          await supabase.from('gate_unlocks').delete().eq('user_id', myId).eq('quest_id', `raid-extra:${raid.id}`)
        }
        await supabase.from('raid_members').delete().eq('raid_id', raid.id).eq('user_id', myId)
      }
      if (channelRef.current) { supabase.removeChannel(channelRef.current); channelRef.current = null }
      setRaid(null); setMembers([]); setFuncs({}); setEvents([])
      await loadLobbies()
      subscribeLobbies()
    } finally {
      setBusy(false)
    }
  }

  // Walk out of a LIVE raid. Without this a stalled party is trapped forever:
  // init reattaches every member to their bg_active raid, so nobody could ever
  // start or join another one. Entry is spent — leaving mid-breach refunds
  // nothing — but progress already paid out stays paid.
  async function handleAbandon() {
    if (!raid || busy) return
    setBusy(true)
    try {
      await supabase.from('raid_members').delete().eq('raid_id', raid.id).eq('user_id', myId)
      await supabase.from('raid_events').insert({
        raid_id: raid.id, type: 'bg_abandon',
        label: `${profile?.name ?? 'A hunter'} walked out of the Broodgate. The Gate stays open for the rest of the party.`,
        health_delta: 0, created_by: myId,
      })
      // Last one out closes the Gate — a member-less raid is dead, not live.
      const { count } = await supabase
        .from('raid_members').select('user_id', { count: 'exact', head: true }).eq('raid_id', raid.id)
      if ((count ?? 0) === 0) {
        await supabase.from('raids')
          .update({ status: 'bg_failed', ended_at: new Date().toISOString() })
          .eq('id', raid.id)
      }
      if (channelRef.current) { supabase.removeChannel(channelRef.current); channelRef.current = null }
      setRaid(null); setMembers([]); setFuncs({}); setEvents([])
      await loadLobbies()
      subscribeLobbies()
    } finally {
      setBusy(false)
    }
  }

  async function handleStart() {
    if (!raid || !isLeader || busy) return
    const hunters = new Set(members.map(m => m.user_id)).size
    const roles = new Set(members.map(m => m.role)).size
    if ((hunters < PARTY_MIN || roles < ROLE_LIST.length) && !isAdmin) return
    setBusy(true)
    try {
      await supabase.from('raids')
        .update({ status: 'bg_active', started_at: new Date().toISOString() })
        .eq('id', raid.id)
      await supabase.from('raid_events').insert({
        raid_id: raid.id, type: 'bg_phase',
        label: 'THE BROODGATE OPENS. FIVE SEQUENTIAL FUNCTIONS: INTERFACE (F1) → SIGNAL (F2) → VAULT (F3) → CIPHER (F4) → ARCHITECT (F5). ONE FUNCTION AT A TIME.',
        health_delta: 0, created_by: myId,
      })
      await loadRun(raid.id)
    } finally {
      setBusy(false)
    }
  }

  // Events passed to combat with bg_ prefix stripped
  const combatEvents = useMemo(
    () => events.map(e => ({ ...e, type: (e.type ?? '').replace(/^bg_/, '') })),
    [events]
  )
  // Rename funcs → functions for the combat component prop
  const combatFuncs = useMemo(() => funcs, [funcs])

  // ─── Friends data ──────────────────────────────────────────────────
  const fetchFriends = useCallback(async () => {
    const { data } = await F.listFriends()
    if (data) setFriends(data)
  }, [])
  const fetchFriendRequests = useCallback(async () => {
    const { data } = await F.listFriendRequests()
    if (data) setMyFriendRequests(data)
  }, [])
  // Outgoing requests: the ADD button's only visible proof of work.
  const fetchSentRequests = useCallback(async () => {
    if (!myId) return
    const { data } = await F.listSentRequests(myId)
    setSentRequests(await attachNames(data ?? [], 'receiver_id'))
  }, [myId])
  useEffect(() => { if (user) { fetchFriends(); fetchFriendRequests(); fetchSentRequests() } },
    [user, fetchFriends, fetchFriendRequests, fetchSentRequests])

  // ─── Render ──────────────────────────────────────────────────────────────────
  if (loading) {
    return <div className="r1w-loading">OPENING THE WAR ROOM…</div>
  }

  // ─── Admin force-complete ──────────────────────────────────────────────────
  async function handleAdminForceComplete() {
    if (!raid || !isAdmin) return
    for (const fn of FUNCTIONS) {
      if (funcs[fn.id]?.status !== 'severed') {
        await supabase.from('raid_heads').upsert(
          { raid_id: raid.id, head_id: fn.id, status: 'severed',
            claimed_by: myId, severed_by: myId, severed_at: new Date().toISOString() },
          { onConflict: 'raid_id,head_id' }
        )
      }
    }
    if (raid.status !== 'bg_complete') {
      await supabase.from('raids')
        .update({ status: 'bg_complete', ended_at: new Date().toISOString() })
        .eq('id', raid.id)
    }
    postEvent('victory', '[ADMIN] Broodgate force-completed — all five functions severed.')
    await loadRun(raid.id)
  }

  async function handleAdminSkipFunction(fnId) {
    if (!raid || !isAdmin) return
    await supabase.from('raid_heads').upsert(
      { raid_id: raid.id, head_id: fnId, status: 'severed',
        claimed_by: myId, severed_by: myId, severed_at: new Date().toISOString() },
      { onConflict: 'raid_id,head_id' }
    )
    postEvent('sever', `[ADMIN] ${FUNCTIONS_BY_ID[fnId]?.name ?? fnId} force-completed.`)
    await loadRun(raid.id)
  }

  const handleFriendSearch = async (q) => {
    setFriendSearch(q)
    if (!q.trim()) { setFriendSearchResults([]); setFriendError(null); return }
    const { data, error } = await F.searchHunters(q.trim(), myId)
    if (error) { setFriendError(F.friendError(error)); setFriendSearchResults([]); return }
    setFriendError(null)
    setFriendSearchResults(data ?? [])
  }

  // Send a request and actually surface the result — the RPC raises readable
  // errors ('Already friends', 'Hunter not found') that were being swallowed.
  const handleAddFriend = async (targetId) => {
    if (!targetId || busy) return
    setBusy(true)
    try {
      const target = friendSearchResults.find(h => h.user_id === targetId)
      const { error } = await F.sendFriendRequest(targetId)
      if (error) { setFriendError(F.friendError(error)); return }
      setFriendError(null)
      // A request is NOT a friendship — say so, or the button looks inert.
      setFriendNotice(`Request sent to ${target?.name ?? 'that hunter'} — waiting on them.`)
      setTimeout(() => setFriendNotice(null), 6000)
      await Promise.all([fetchFriends(), fetchSentRequests()])
    } finally {
      setBusy(false)
    }
  }

  // Active fight (completed raids also show combat so the victory overlay can render)
  if (raid && (raid.status === 'bg_active' || raid.status === 'bg_complete')) {
    return (
      <>
        {payoutError && (
          <div className="r1w-payout-alert" role="alert">
            <span className="r1w-payout-alert-tag">PAYOUT REFUSED</span>
            <span>{payoutError}</span>
            <button className="r1w-payout-alert-x" onClick={() => setPayoutError(null)}>✕</button>
          </div>
        )}
        {isAdmin && (
          <div className="r1w-admin-bar">
            <span className="r1w-admin-tag">ADMIN</span>
            {FUNCTIONS.map(fn => (
              <button key={fn.id} className="r1w-admin-btn" disabled={funcs[fn.id]?.status === 'severed'}
                onClick={() => handleAdminSkipFunction(fn.id)}>
                SKIP {fn.name}
              </button>
            ))}
            <button className="r1w-admin-btn primary" onClick={handleAdminForceComplete}
              disabled={raid.status === 'bg_complete'}>
              ★ COMPLETE ALL
            </button>
          </div>
        )}
        <Raid01Combat
          functions={combatFuncs}
          members={members}
          myId={myId}
          events={combatEvents}
          onComplete={handleFunctionComplete}
          onEvent={postEvent}
          loadCode={loadCode}
          saveCode={saveCode}
          onVictory={handleVictory}
          onExit={() => goto('dashboard')}
          onAbandon={handleAbandon}
        />
      </>
    )
  }

  // War room / lobby
  const myRoleRows = members.filter(m => m.user_id === myId)
  const myRoles = myRoleRows.map(m => ROLES[m.role]).filter(Boolean)
  const inLobby = raid && raid.status === 'bg_lobby'

  // A member ROW is a role, not a person — one hunter can hold several. The
  // breach gate counts distinct hunters (so nobody solos a party raid by
  // buying a second role) and demands every one of the five functions has an
  // owner, which is what makes an extra role worth its Shards.
  const distinctHunters = new Set(members.map(m => m.user_id)).size
  const coveredRoles = new Set(members.map(m => m.role))
  const uncoveredRoles = ROLE_LIST.filter(r => !coveredRoles.has(r.id))
  const partyReady = distinctHunters >= PARTY_MIN && uncoveredRoles.length === 0

  const toggleRole = (roleId) => {
    if (pickedRoles.includes(roleId)) {
      setPickedRoles(pickedRoles.filter(r => r !== roleId))
    } else if (pickedRoles.length < 3) {
      setPickedRoles([...pickedRoles, roleId])
    }
  }

  const totalEntry = ENTRY_COST + Math.max(0, pickedRoles.length - 1) * EXTRA_ROLE_COST
  const canAfford = spendable >= totalEntry || isAdmin

  const joinLabel = pickedRoles.length === 0
    ? 'PICK A SPECIALIZATION'
    : !canAfford
      ? `NEED ${totalEntry} Shards`
      : `JOIN — ${totalEntry} Shards`

  const handleInviteFriend = async (friendId) => {
    if (!raid || busy) return
    setBusy(true)
    try {
      const { error } = await F.inviteToRaid(raid.id, friendId)
      if (error) { setFriendError(F.friendError(error)); return }
      setFriendError(null)
      await fetchRaidInvites(raid.id)
    } finally {
      setBusy(false)
    }
  }

  const handleCancelInvite = async (inviteId) => {
    if (!raid || busy) return
    setBusy(true)
    try {
      const { error } = await F.cancelRaidInvite(inviteId)
      if (error) setFriendError(F.friendError(error))
      await fetchRaidInvites(raid.id)
    } finally {
      setBusy(false)
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="r1w-shell">
      <header className="r1w-topbar">
        <button className="r1w-back" onClick={() => goto('dashboard')}>← Dashboard</button>
        <div className="r1w-topbar-center">
          <span className="r1w-tag">{RAID01.code} · {RAID01.region}</span>
          <div className="r1w-title">{RAID01.title}</div>
        </div>
        <span className="r1w-shard">◈ {spendable.toLocaleString()} Shards</span>
        {inLobby && (
          <span className="r1w-shard" style={{ opacity: 0.5 }}>
            {friends.length} FRIEND{friends.length === 1 ? '' : 'S'}
          </span>
        )}
        {myInvites.length > 0 && (
          <button className="r1w-back invite-pulse"
            onClick={() => setMyInvitesOpen(!myInvitesOpen)}
            style={{ color: '#f5c453', borderColor: '#f5c45340' }}>
            INVITES ({liveInvites.length})
          </button>
        )}
      </header>

      <div className="r1w-body">

        {/* Boss dossier — full width above the two columns */}
        <section className="r1w-dossier">
          <div className="r1w-boss-stage">
            <RaidBossVarkul headStates={{}} phase={1} frame hp={BOSS_HP_MAX} hpMax={BOSS_HP_MAX} />
          </div>
          <div className="r1w-boss-info">
            <span className="r1w-boss-tier">HERALD-CLASS · TIER {RAID01.boss.tier} · NO CONFIRMED KILLS</span>
            <h1 className="r1w-boss-name">{RAID01.boss.name}</h1>
            <p className="r1w-boss-lore">{RAID01.boss.lore}</p>
            <p className="r1w-vera"><span>VERA // WAR ROOM</span>{RAID01.handlerIntro}</p>
          </div>
        </section>

        {sealed ? (
          <section className="r1w-sealed">
            <div className="r1w-sealed-title">⛨ GATE SEALED</div>
            <p>The Broodgate is not yet authorized on this shard. Association engineering must run the
            <code> supabase/raid01.sql</code> migration before hunters can enter.</p>
          </section>
        ) : (
        /* Two columns: the war room on the left, the friends rail always on
           the right. Friends used to be hidden behind a header toggle that
           only worked outside a lobby — which is precisely when you don't
           need it. */
        <div className="r1w-cols">
        <div className="r1w-main-col">

        {/* The roster is ALWAYS on screen — before a warband exists it shows
            the five empty seats you're about to fill, so the shape of the
            party is visible from the moment you walk into the war room. */}
        <WarbandRoster
          title={inLobby ? `WARBAND — ${raid.name}` : 'WARBAND — NOT YET RAISED'}
          hint={inLobby ? null : 'Raise or join a warband below, then invite hunters into these seats.'}
          members={inLobby ? members : []}
          invites={inLobby ? raidInvites : []}
          friends={friends}
          roles={ROLES}
          roleList={ROLE_LIST}
          leaderId={raid?.created_by}
          myId={myId}
          maxSlots={PARTY_MAX}
          partyMin={PARTY_MIN}
          onInvite={inLobby ? handleInviteFriend : null}
          onCancelInvite={handleCancelInvite}
          self={{ user_id: myId, name: profile?.name ?? 'YOU', avatar: profile?.avatar }}
          onSearch={handleFriendSearch}
          searchValue={friendSearch}
          searchResults={friendSearchResults}
          busy={busy}
        />
        {friendError && <div className="r1w-friend-error">{friendError}</div>}

        {inLobby ? (
          <div className="r1w-lobby-panel">
            {/* ── In a warband ─────────────────────────────────────────────── */}
            <div className="r1w-lobby-main">
              <section className="r1w-lobby-section">
                {/* The roster lives above this block now — it is on screen in
                    every war-room state, not only once you're in a lobby. */}

                {/* My roles summary — or pick roles if none yet */}
                {myRoles.length > 0 ? (
                  <div className="r1w-myroles">
                    <span className="r1w-myroles-label">YOUR ROLES</span>
                    <div className="r1w-myroles-list">
                      {myRoles.map(r => (
                        <div key={r.id} className="r1w-myroles-badge" style={{ '--role-c': r.color }}>
                          {r.glyph} {r.label}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : isLeader ? (
                  <div className="r1w-lobby-pick-roles">
                    <span className="r1w-myroles-label">PICK YOUR ROLE(S) — 1st free, extras 1,000 Shards</span>
                    <div className="r1w-lobby-role-cards">
                      {ROLE_LIST.map(r => {
                        const fn = FUNCTIONS.find(f => f.role === r.id)
                        const selected = pickedRoles.includes(r.id)
                        return (
                          <button key={r.id}
                            className={`r1w-role-sm${selected ? ' picked' : ''}${pickedRoles.length >= 3 && !selected ? ' cap' : ''}`}
                            style={{ '--role-c': r.color }}
                            onClick={() => toggleRole(r.id)}
                            disabled={pickedRoles.length >= 3 && !selected}>
                            <span style={{ fontSize: 14 }}>{r.glyph}</span>
                            <span style={{ fontSize: 10, lineHeight: 1.2 }}>{r.label.split(' ')[0]}</span>
                            {fn && <span style={{ fontSize: 8, opacity: 0.6 }}>F{fn.seq}</span>}
                            {selected && <span className="r1w-role-sm-check">✓</span>}
                          </button>
                        )
                      })}
                    </div>
                    {pickedRoles.length > 0 && (
                      <button className="r1w-btn primary" style={{ marginTop: 8, fontSize: 10, padding: '6px 16px' }}
                        disabled={busy}
                        onClick={async () => {
                          const cost = ENTRY_COST + Math.max(0, pickedRoles.length - 1) * EXTRA_ROLE_COST
                          if (spendable < cost && !isAdmin) return
                          setBusy(true)
                          const inserts = pickedRoles.map(role => ({ raid_id: raid.id, user_id: myId, role }))
                          await supabase.from('raid_members').insert(inserts)
                          if (!isAdmin) await burnRaidEntry(raid.id)
                          if (pickedRoles.length > 1 && !isAdmin) {
                            await supabase.from('gate_unlocks').insert({
                              user_id: myId, quest_id: `raid-extra:${raid.id}`,
                              drift_cost: (pickedRoles.length - 1) * EXTRA_ROLE_COST,
                            })
                            await refreshProfile()
                          }
                          setPickedRoles([])
                          setBusy(false)
                          await loadRun(raid.id)
                        }}>
                        CONFIRM ROLES — {totalEntry} Shards
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="r1w-myroles-empty">Leader hasn't picked a specialization yet — waiting…</div>
                )}

                <div className="r1w-lobby-actions">
                  {isLeader ? (
                    <>
                      <button
                        className="r1w-btn primary"
                        disabled={busy || myRoles.length === 0 || (!partyReady && !isAdmin)}
                        onClick={handleStart}
                      >
                        {myRoles.length === 0
                          ? 'PICK YOUR ROLE FIRST'
                          : distinctHunters < PARTY_MIN && !isAdmin
                            ? `NEED ${PARTY_MIN - distinctHunters} MORE HUNTER${PARTY_MIN - distinctHunters === 1 ? '' : 'S'}`
                            : uncoveredRoles.length > 0 && !isAdmin
                              ? `UNCOVERED: ${uncoveredRoles.map(r => r.label.split(' ')[0]).join(', ')}`
                              : '⚔ BREACH THE GATE'}
                      </button>
                      {isAdmin && (
                        <button className="r1w-btn admin" disabled={busy} onClick={handleStart}>
                          ADMIN — BREACH ANYWAY
                        </button>
                      )}
                    </>
                  ) : (
                    <span className="r1w-waiting">WAITING ON WARBAND LEADER TO BREACH…</span>
                  )}
                  <button className="r1w-btn" disabled={busy} onClick={handleLeave}>
                    {isLeader ? 'DISBAND (refunds all)' : 'LEAVE (refund entry)'}
                  </button>
                </div>
              </section>
            </div>

          </div>
        ) : (
          <>
            {/* STEP 1 — pick specializations (multi-select, up to 3) */}
            <section className="r1w-step">
              <div className="r1w-step-head">
                <span className={`r1w-step-num${pickedRoles.length > 0 ? ' done' : ''}`}>
                  {pickedRoles.length > 0 ? '✓' : '01'}
                </span>
                <span className="r1w-step-title">CHOOSE YOUR SPECIALIZATION{pickedRoles.length > 1 ? 'S' : ''}</span>
                <span className="r1w-step-note">
                  {pickedRoles.length === 0
                    ? 'pick up to 3 roles — 1st free, extras 1,000 Shards each'
                    : pickedRoles.length === 1
                      ? '1 role selected — free'
                      : `${pickedRoles.length} roles selected — ${(pickedRoles.length - 1) * EXTRA_ROLE_COST} Shards extra`}
                </span>
              </div>
              <div className="r1w-step-roles">
                  <div className="r1w-roles-grid five">
                {ROLE_LIST.map(r => {
                  const fn = FUNCTIONS.find(f => f.role === r.id)
                  const selected = pickedRoles.includes(r.id)
                  const idx = selected ? pickedRoles.indexOf(r.id) : -1
                  const isExtra = idx > 0
                  return (
                    <button
                      key={r.id}
                      className={`r1w-role-card${selected ? ' picked' : ''}${pickedRoles.length >= 3 && !selected ? ' cap' : ''}`}
                      style={{ '--role-c': r.color }}
                      onClick={() => toggleRole(r.id)}
                      disabled={pickedRoles.length >= 3 && !selected}
                    >
                      <div className="r1w-role-top">
                        <span className="r1w-role-glyph">{r.glyph}</span>
                        <span className="r1w-role-label">{r.label}</span>
                        {selected && idx === 0 && <span className="r1w-role-picked">1st</span>}
                        {isExtra && <span className="r1w-role-picked extra">+{idx * EXTRA_ROLE_COST} $</span>}
                      </div>
                      <div className="r1w-role-owns">{r.owns}</div>
                      <div className="r1w-role-duty">{r.duty}</div>
                      <div className="r1w-role-sec">
                        <span className="r1w-role-sec-k">FUNCTION</span>
                        {fn && <span className="r1w-role-line">{fn.name} (F{fn.seq})</span>}
                      </div>
                      <div className="r1w-role-sec">
                        <span className="r1w-role-sec-k">SKILLS TESTED</span>
                        {r.skills.map(s => <span key={s} className="r1w-role-line dim">{s}</span>)}
                      </div>
                      <div className="r1w-role-flavor"><span>VERA //</span> {r.flavor}</div>
                    </button>
                  )
                })}
              </div>
              {pickedRoles.length > 0 && (
                <div className="r1w-role-summary">
                  <span>
                    {pickedRoles.length} role{pickedRoles.length > 1 ? 's' : ''} selected ·
                    Entry: {ENTRY_COST} Shards ·
                    Extra: {(pickedRoles.length - 1) * EXTRA_ROLE_COST} Shards
                  </span>
                  <span className="r1w-role-total">
                    Total: {totalEntry} Shards
                    {spendable < totalEntry && !isAdmin && <span className="r1w-role-insufficient"> — INSUFFICIENT</span>}
                  </span>
                </div>
              )}
            </div>
        </section>

            {/* STEP 2 — raise or join a warband */}
            <section className="r1w-step">
              <div className="r1w-step-head">
                <span className="r1w-step-num">02</span>
                <span className="r1w-step-title">RAISE OR JOIN A WARBAND</span>
                <span className="r1w-step-note">entry {ENTRY_COST} Shards + {EXTRA_ROLE_COST} Shards per extra role — refunded if you leave before the breach</span>
              </div>
              {invitedRaid && (
                <div className="r1w-invite-banner">
                  <span className="r1w-invite-banner-tag">INVITE ACCEPTED</span>
                  <span className="r1w-invite-banner-text">
                    <strong>{invitedRaid.name}</strong> is holding a slot for you. Pick your
                    specialization above, then hit JOIN on that warband — the entry burns when you join.
                  </span>
                  <button className="r1w-btn tiny" onClick={() => setInvitedRaid(null)}>DISMISS</button>
                </div>
              )}
              {openRaids.length === 0 && (
                <div className="r1w-empty">No warbands forming. Raise your own below (no roles needed to start a lobby).</div>
              )}
              {openRaids.map(r => {
                const mems = openRaidMembers[r.id] ?? []
                const seated = new Set(mems.map(m => m.user_id)).size
                const full = seated >= PARTY_MAX
                // One chip per hunter, listing every role they hold.
                const byHunter = [...new Map(mems.map(m => [m.user_id, m])).values()]
                const rolesOf = (uid) => mems.filter(m => m.user_id === uid)
                return (
                  <div key={r.id} className={`r1w-lobby-card${invitedRaid?.id === r.id ? ' invited' : ''}`}>
                    <div className="r1w-lobby-info">
                      <span className="r1w-lobby-name">{r.name}</span>
                      <span className="r1w-lobby-mems">
                        {byHunter.length ? byHunter.map(m => (
                          <span key={m.user_id} className="r1w-lobby-mem">
                            {rolesOf(m.user_id).map(rr => (
                              <span key={rr.role} style={{ color: ROLES[rr.role]?.color ?? '#3df0e8' }}>
                                {ROLES[rr.role]?.glyph ?? '·'}
                              </span>
                            ))} {m.name}
                          </span>
                        )) : '—'}
                      </span>
                    </div>
                    <span className={`r1w-lobby-count${full ? ' full' : ''}`}>{seated}/{PARTY_MAX}</span>
                    <button
                      className="r1w-btn primary"
                      disabled={busy || full || pickedRoles.length === 0 || !canAfford}
                      onClick={() => handleJoin(r.id)}
                    >
                      {full ? 'WARBAND FULL' : pickedRoles.length === 0 ? 'PICK A ROLE FIRST' : joinLabel}
                    </button>
                  </div>
                )
              })}
              <div className="r1w-create">
                <input
                  className="r1w-input"
                  placeholder="Warband name…"
                  maxLength={40}
                  value={warbandName}
                  onChange={e => setWarbandName(e.target.value)}
                />
                <button
                  className="r1w-btn primary"
                  disabled={busy || !warbandName.trim() || (pickedRoles.length > 0 && !canAfford)}
                  onClick={handleCreate}
                >
                  {!warbandName.trim()
                    ? 'NAME YOUR WARBAND'
                    : pickedRoles.length === 0
                      ? 'RAISE WARBAND (0 Shards — NO ROLE)'
                      : !canAfford
                        ? `NEED ${totalEntry} Shards`
                        : `RAISE WARBAND — ${totalEntry} Shards`}
                </button>
              </div>
            </section>

            {/* STEP 3 — the breach */}
            <section className="r1w-step inert">
              <div className="r1w-step-head">
                <span className="r1w-step-num">03</span>
                <span className="r1w-step-title">BREACH THE GATE</span>
              </div>
              <p className="r1w-step-inert-text">
                The Gate opens from your warband lobby once {PARTY_MIN}+ hunters stand ready.
                Five sequential functions, five specializations, one confirmed kill on Association record — yours.
              </p>
            </section>
          </>
        )}

        {/* ─── Pending raid invites ────────────────────────────────────────── */}
        {myInvitesOpen && liveInvites.length > 0 && (
          <div className="r1w-invite-popup">
            <div className="r1w-invite-popup-head">PENDING RAID INVITES</div>
            {liveInvites.map(inv => (
              <div key={inv.invite_id} className="r1w-invite-row">
                <span className="r1w-invite-from">{inv.sender_name}</span>
                <span className="r1w-invite-raid">→ {inv.raid_name}</span>
                {/* Opens the real join flow: pick a free specialization, burn
                    entry, take the seat. The old button only marked the invite
                    accepted and left you outside the warband. */}
                <button className="r1w-btn" style={{ fontSize: 8, padding: '2px 8px' }}
                  disabled={busy || !!raid}
                  title={raid ? 'Leave your current warband first' : undefined}
                  onClick={() => setAcceptInvite(inv)}>
                  {raid ? 'IN A WARBAND' : 'ACCEPT'}
                </button>
                <button className="r1w-btn" style={{ fontSize: 8, padding: '2px 8px', color: '#ff3d8b', borderColor: '#ff3d8b40' }}
                  disabled={busy}
                  onClick={async () => {
                    setBusy(true)
                    await F.respondRaidInvite(inv.invite_id, false)
                    const { data } = await F.listMyRaidInvites()
                    setMyInvites(data ?? [])
                    setBusy(false)
                  }}>
                  DECLINE
                </button>
              </div>
            ))}
          </div>
        )}

        {acceptInvite && (
          <InviteAcceptModal
            invite={acceptInvite}
            onClose={() => setAcceptInvite(null)}
            onJoined={async (raidId) => {
              setAcceptInvite(null)
              setMyInvitesOpen(false)
              const { data } = await F.listMyRaidInvites()
              setMyInvites(data ?? [])
              await loadRun(raidId)
              subscribeRun(raidId)
            }}
          />
        )}

        {/* Rules of engagement */}
        <section className="r1w-rules">
          <div className="r1w-section-head">RULES OF ENGAGEMENT — READ BEFORE YOU BURN YOUR ENTRY</div>
          <div className="r1w-rules-grid">
            {RAID01.rules.map(r => (
              <div key={r.k} className="r1w-rule">
                <span className="r1w-rule-k">{r.k}</span>
                <span className="r1w-rule-v">{r.v}</span>
              </div>
            ))}
          </div>
        </section>

        {/* The five functions */}
        <section className="r1w-heads">
          <div className="r1w-section-head">THE FIVE FUNCTIONS — WHAT EACH ONE TESTS</div>
          <div className="r1w-heads-grid">
            {FUNCTIONS.map(f => {
              const owner = ROLES[f.role]
              return (
                <div key={f.id} className="r1w-phase-col">
                  <div className="r1w-phase-title" style={{ color: owner?.color ?? '#3df0e8' }}>
                    {f.glyph} {f.name}
                    {owner && (
                      <span className="r1w-phase-owner" style={{ color: owner.color, borderColor: `${owner.color}40` }}>
                        {owner.glyph} {owner.label} (F{f.seq})
                      </span>
                    )}
                  </div>
                  <div className="r1w-phase-sub">{f.brief.skill}</div>
                  <div className="r1w-head-card">
                    <div className="r1w-head-card-name">
                      <span style={{ color: owner?.color ?? '#3df0e8' }}>{f.glyph}</span> {f.name}
                    </div>
                    <div className="r1w-head-card-skill">{f.brief.objective}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
        </div>{/* end .r1w-main-col */}

        <FriendsRail
          friends={friends}
          requests={myFriendRequests}
          sent={sentRequests}
          notice={friendNotice}
          searchValue={friendSearch}
          searchResults={friendSearchResults}
          error={friendError}
          onSearch={handleFriendSearch}
          onAdd={handleAddFriend}
          onRespond={async (reqId, accept) => {
            setBusy(true)
            try {
              const { error } = await F.respondFriendRequest(reqId, accept)
              if (error) setFriendError(F.friendError(error))
              await Promise.all([fetchFriends(), fetchFriendRequests(), fetchSentRequests()])
            } finally { setBusy(false) }
          }}
          onInvite={inLobby ? handleInviteFriend : null}
          partyIds={new Set(members.map(m => m.user_id))}
          invitedIds={new Set(raidInvites.filter(i => i.status === 'pending').map(i => i.invitee_id))}
          busy={busy}
        />
        </div>
        )}
      </div>
    </div>
  )
}

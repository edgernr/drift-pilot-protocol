import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useNav } from '../context/NavigationContext'
import Raid01Combat from '../components/Raid01Combat'
import RaidBossVarkul from '../components/RaidBossVarkul'
import {
  RAID01, HEADS, PHASES, PAYOUTS,
  BOSS_HP_MAX, PARTY_MIN, PARTY_MAX, ENTRY_COST,
} from '../data/raids/raid01'
import './Raid01.css'

// ── RAID 01 — THE BROODGATE (live screen) ─────────────────────────────────────
// War room (dossier + rules + lobbies) → warband lobby → live combat.
// Shared state rides the EXISTING raid tables; Broodgate rows use the bg_*
// status namespace so the legacy 48-hour raid view never sees them.
// Requires the supabase/raid01.sql migration (raid_heads) — until it runs, the
// Gate shows as SEALED (graceful-inert, same pattern as prologue gating).

const LIVE_STATUSES = ['bg_lobby', 'bg_active', 'bg_complete']

export default function Raid01() {
  const { goto } = useNav()
  const { user, profile, completeQuest, burnRaidEntry, refundRaidEntry } = useAuth()
  const isAdmin = profile?.is_admin ?? false
  const spendable = (profile?.totalHunt ?? 0) - (profile?.totalHuntSpent ?? 0)

  const [loading, setLoading] = useState(true)
  const [sealed, setSealed] = useState(false)          // migration not run yet
  const [raid, setRaid] = useState(null)               // my active bg_* raid row
  const [members, setMembers] = useState([])
  const [heads, setHeads] = useState({})               // head_id -> row
  const [events, setEvents] = useState([])
  const [openRaids, setOpenRaids] = useState([])
  const [openRaidMembers, setOpenRaidMembers] = useState({})
  const [warbandName, setWarbandName] = useState('')
  const [busy, setBusy] = useState(false)
  const channelRef = useRef(null)
  const lobbyChannelRef = useRef(null)

  const myId = user?.id
  const isLeader = raid?.created_by === myId

  // ─── Loaders ─────────────────────────────────────────────────────────────────
  const loadRun = useCallback(async (raidId) => {
    const [{ data: r }, { data: mems }, { data: headRows }, { data: evts }] = await Promise.all([
      supabase.from('raids').select('*').eq('id', raidId).single(),
      supabase.from('raid_members').select('*, profiles(name)').eq('raid_id', raidId),
      supabase.from('raid_heads').select('*').eq('raid_id', raidId),
      supabase.from('raid_events').select('*').eq('raid_id', raidId)
        .order('created_at', { ascending: false }).limit(60),
    ])
    if (r) setRaid(r)
    if (mems) setMembers(mems.map(m => ({ ...m, name: m.profiles?.name ?? 'HUNTER' })))
    setHeads(Object.fromEntries((headRows ?? []).map(h => [h.head_id, h])))
    if (evts) setEvents(evts)
  }, [])

  const loadLobbies = useCallback(async () => {
    const { data: raids } = await supabase
      .from('raids').select('*').eq('status', 'bg_lobby').order('created_at', { ascending: false })
    const list = raids ?? []
    setOpenRaids(list)
    if (!list.length) { setOpenRaidMembers({}); return }
    const { data: allMems } = await supabase
      .from('raid_members').select('*, profiles(name)').in('raid_id', list.map(r => r.id))
    const grouped = {}
    for (const m of allMems ?? []) {
      if (!grouped[m.raid_id]) grouped[m.raid_id] = []
      grouped[m.raid_id].push({ ...m, name: m.profiles?.name ?? 'HUNTER' })
    }
    setOpenRaidMembers(grouped)
  }, [])

  // ─── Realtime ────────────────────────────────────────────────────────────────
  const subscribeRun = useCallback((raidId) => {
    channelRef.current?.unsubscribe()
    lobbyChannelRef.current?.unsubscribe(); lobbyChannelRef.current = null
    channelRef.current = supabase
      .channel(`broodgate:${raidId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'raids', filter: `id=eq.${raidId}` },
        payload => { if (payload.new?.id) setRaid(payload.new) })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'raid_heads', filter: `raid_id=eq.${raidId}` },
        payload => {
          if (payload.new?.head_id) setHeads(prev => ({ ...prev, [payload.new.head_id]: payload.new }))
        })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'raid_members', filter: `raid_id=eq.${raidId}` },
        () => loadRun(raidId))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'raid_events', filter: `raid_id=eq.${raidId}` },
        payload => { if (payload.new) setEvents(e => [payload.new, ...e].slice(0, 60)) })
      .subscribe()
  }, [loadRun])

  const subscribeLobbies = useCallback(() => {
    lobbyChannelRef.current?.unsubscribe()
    lobbyChannelRef.current = supabase
      .channel('broodgate-lobby-watch')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'raids' }, loadLobbies)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'raid_members' }, loadLobbies)
      .subscribe()
  }, [loadLobbies])

  // ─── Init: feature-detect migration, then attach ─────────────────────────────
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
      channelRef.current?.unsubscribe()
      lobbyChannelRef.current?.unsubscribe()
    }
  }, [user, loadRun, loadLobbies, subscribeRun, subscribeLobbies])

  // ─── Payouts — automatic, idempotent, per member ─────────────────────────────
  // raid:* quest rows with tier XP (100/300/500) ride the existing raid economy.
  const phaseDone = useCallback((n) =>
    HEADS.filter(h => h.phase === n).every(h => heads[h.id]?.status === 'severed'), [heads])

  useEffect(() => {
    if (!raid || !myId || !members.some(m => m.user_id === myId)) return
    const done = profile?.completedQuestIds
    if (!done) return
    const claim = (suffix, xp) => {
      const key = `raid:${raid.id}${suffix}`
      if (!done.has(key)) completeQuest(key, xp, {})
    }
    if (phaseDone(1)) claim(PAYOUTS.p1.suffix, PAYOUTS.p1.xp)
    if (phaseDone(2)) claim(PAYOUTS.p2.suffix, PAYOUTS.p2.xp)
    if (phaseDone(1) && phaseDone(2) && phaseDone(3)) claim(PAYOUTS.clear.suffix, PAYOUTS.clear.xp)
  }, [heads, raid, myId, members, profile?.completedQuestIds, completeQuest, phaseDone])

  // ─── Session actions (wired into Raid01Combat) ───────────────────────────────
  const postEvent = useCallback((type, label) => {
    if (!raid) return
    supabase.from('raid_events').insert({
      raid_id: raid.id, type: `bg_${type}`, label, health_delta: 0, created_by: myId,
    }).then(() => {})
  }, [raid, myId])

  const handleClaim = useCallback(async (headId) => {
    if (!raid) return
    const current = heads[headId]
    if (current?.status === 'severed') return
    if (current?.status === 'claimed' && current.claimed_by !== myId) return
    await supabase.from('raid_heads').upsert(
      { raid_id: raid.id, head_id: headId, status: 'claimed', claimed_by: myId },
      { onConflict: 'raid_id,head_id' }
    )
    const head = HEADS.find(h => h.id === headId)
    postEvent('claim', `${profile?.name ?? 'A hunter'} claims ${head?.name ?? headId}.`)
  }, [raid, heads, myId, postEvent, profile?.name])

  const handleSever = useCallback(async (headId) => {
    if (!raid) return
    await supabase.from('raid_heads').upsert(
      {
        raid_id: raid.id, head_id: headId, status: 'severed',
        claimed_by: heads[headId]?.claimed_by ?? myId,
        severed_by: myId, severed_at: new Date().toISOString(),
      },
      { onConflict: 'raid_id,head_id' }
    )
    const head = HEADS.find(h => h.id === headId)
    postEvent('sever', `⚔ ${head?.name ?? headId} SEVERED by ${profile?.name ?? 'a hunter'} — VARKUL takes 111.`)
  }, [raid, heads, myId, postEvent, profile?.name])

  const handleVictory = useCallback(async () => {
    if (!raid || raid.status === 'bg_complete') return
    await supabase.from('raids')
      .update({ status: 'bg_complete', ended_at: new Date().toISOString() })
      .eq('id', raid.id).eq('status', 'bg_active')
    postEvent('victory', '☠ VARKUL, THE NULLHEART HYDRA — SLAIN. First herald kill on Association record. Payouts clearing.')
  }, [raid, postEvent])

  const loadCode = useCallback(async (headId) => {
    if (!raid) return null
    const { data } = await supabase
      .from('raid_files').select('content')
      .eq('raid_id', raid.id).eq('role', headId).eq('path', 'code').maybeSingle()
    return data?.content ?? null
  }, [raid])

  const saveCode = useCallback((headId, content) => {
    if (!raid) return
    supabase.from('raid_files').upsert(
      { raid_id: raid.id, role: headId, path: 'code', content, updated_by: myId, updated_at: new Date().toISOString() },
      { onConflict: 'raid_id,role,path' }
    ).then(() => {})
  }, [raid, myId])

  // ─── Lobby actions ───────────────────────────────────────────────────────────
  async function handleCreate() {
    if (!warbandName.trim() || busy) return
    if (spendable < ENTRY_COST && !isAdmin) return
    setBusy(true)
    try {
      const { data: r, error } = await supabase
        .from('raids')
        .insert({ name: warbandName.trim(), created_by: myId, status: 'bg_lobby', health: BOSS_HP_MAX })
        .select().single()
      if (error || !r) return
      await supabase.from('raid_members').insert({ raid_id: r.id, user_id: myId, role: 'hunter' })
      if (!isAdmin) await burnRaidEntry(r.id)
      setWarbandName('')
      await loadRun(r.id)
      subscribeRun(r.id)
    } finally {
      setBusy(false)
    }
  }

  async function handleJoin(raidId) {
    if (busy) return
    if (spendable < ENTRY_COST && !isAdmin) return
    if ((openRaidMembers[raidId]?.length ?? 0) >= PARTY_MAX) return
    setBusy(true)
    try {
      const { error } = await supabase
        .from('raid_members').insert({ raid_id: raidId, user_id: myId, role: 'hunter' })
      if (error) return
      if (!isAdmin) await burnRaidEntry(raidId)
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
      const refundable = raid.status === 'bg_lobby' && !isAdmin
      if (isLeader) {
        if (refundable) {
          try { await supabase.rpc('refund_raid_entries', { p_raid_id: raid.id }) } catch { /* optional RPC */ }
          await refundRaidEntry(raid.id)
        }
        await supabase.from('raids').delete().eq('id', raid.id)
      } else {
        if (refundable) await refundRaidEntry(raid.id)
        await supabase.from('raid_members').delete().eq('raid_id', raid.id).eq('user_id', myId)
      }
      channelRef.current?.unsubscribe()
      setRaid(null); setMembers([]); setHeads({}); setEvents([])
      await loadLobbies()
      subscribeLobbies()
    } finally {
      setBusy(false)
    }
  }

  async function handleStart() {
    if (!raid || !isLeader || busy) return
    if (members.length < PARTY_MIN && !isAdmin) return
    setBusy(true)
    try {
      await supabase.from('raids')
        .update({ status: 'bg_active', started_at: new Date().toISOString() })
        .eq('id', raid.id)
      await supabase.from('raid_events').insert({
        raid_id: raid.id, type: 'bg_phase',
        label: 'THE BROODGATE OPENS. PHASE I — STRUCTURE: three heads of broken markup. Claim your heads and cut.',
        health_delta: 0, created_by: myId,
      })
      await loadRun(raid.id)
    } finally {
      setBusy(false)
    }
  }

  // Events passed to combat with the bg_ prefix stripped (feed styling keys)
  const combatEvents = useMemo(
    () => events.map(e => ({ ...e, type: (e.type ?? '').replace(/^bg_/, '') })),
    [events]
  )
  const combatHeads = useMemo(() => heads, [heads])

  // ─── Render ──────────────────────────────────────────────────────────────────
  if (loading) {
    return <div className="r1w-loading">OPENING THE WAR ROOM…</div>
  }

  // Active fight (or finished fight — victory overlay + payout catch-up)
  if (raid && (raid.status === 'bg_active' || raid.status === 'bg_complete')) {
    return (
      <Raid01Combat
        heads={combatHeads}
        members={members}
        myId={myId}
        events={combatEvents}
        onClaim={handleClaim}
        onSever={handleSever}
        onEvent={postEvent}
        loadCode={loadCode}
        saveCode={saveCode}
        onVictory={handleVictory}
        onExit={() => goto('dashboard')}
      />
    )
  }

  // War room / lobby
  return (
    <div className="r1w-shell">
      <header className="r1w-topbar">
        <button className="r1w-back" onClick={() => goto('dashboard')}>← Dashboard</button>
        <div className="r1w-topbar-center">
          <span className="r1w-tag">{RAID01.code} · {RAID01.region}</span>
          <div className="r1w-title">{RAID01.title}</div>
        </div>
        <span className="r1w-shard">◈ {spendable.toLocaleString()} $SHARD</span>
      </header>

      <div className="r1w-body">

        {/* Boss dossier */}
        <section className="r1w-dossier">
          <div className="r1w-boss-stage">
            <RaidBossVarkul headStates={{}} phase={1} />
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
          <>
            {/* My lobby */}
            {raid && raid.status === 'bg_lobby' && (
              <section className="r1w-mylobby">
                <div className="r1w-section-head">
                  YOUR WARBAND — {raid.name}
                  <span className="r1w-party-count">{members.length} / {PARTY_MAX}</span>
                </div>
                <div className="r1w-roster">
                  {members.map(m => (
                    <div key={m.user_id} className="r1w-roster-row">
                      <span className={`r1w-dot${m.user_id === raid.created_by ? ' leader' : ''}`} />
                      <span className="r1w-roster-name">
                        {m.name}{m.user_id === raid.created_by ? ' — LEADER' : ''}{m.user_id === myId ? ' (YOU)' : ''}
                      </span>
                    </div>
                  ))}
                  {Array.from({ length: Math.max(0, PARTY_MIN - members.length) }).map((_, i) => (
                    <div key={`empty-${i}`} className="r1w-roster-row empty">
                      <span className="r1w-dot empty" />
                      <span className="r1w-roster-name">AWAITING HUNTER — the Gate stays sealed below {PARTY_MIN}</span>
                    </div>
                  ))}
                </div>
                <div className="r1w-lobby-actions">
                  {isLeader && (
                    <button
                      className="r1w-btn primary"
                      disabled={busy || (members.length < PARTY_MIN && !isAdmin)}
                      onClick={handleStart}
                    >
                      {members.length < PARTY_MIN && !isAdmin
                        ? `NEED ${PARTY_MIN - members.length} MORE`
                        : '⚔ BREACH THE GATE'}
                    </button>
                  )}
                  <button className="r1w-btn" disabled={busy} onClick={handleLeave}>
                    {isLeader ? 'DISBAND (refunds all)' : 'LEAVE (refund entry)'}
                  </button>
                </div>
              </section>
            )}

            {/* Open warbands + create */}
            {!raid && (
              <section className="r1w-lobbies">
                <div className="r1w-section-head">OPEN WARBANDS</div>
                {openRaids.length === 0 && (
                  <div className="r1w-empty">No warbands forming. Raise your own.</div>
                )}
                {openRaids.map(r => {
                  const mems = openRaidMembers[r.id] ?? []
                  return (
                    <div key={r.id} className="r1w-lobby-card">
                      <div className="r1w-lobby-info">
                        <span className="r1w-lobby-name">{r.name}</span>
                        <span className="r1w-lobby-mems">
                          {mems.map(m => m.name).join(' · ') || '—'} ({mems.length}/{PARTY_MAX})
                        </span>
                      </div>
                      <button
                        className="r1w-btn primary"
                        disabled={busy || mems.length >= PARTY_MAX || (spendable < ENTRY_COST && !isAdmin)}
                        onClick={() => handleJoin(r.id)}
                      >
                        {spendable < ENTRY_COST && !isAdmin ? 'NEED 1000 $SHARD' : `JOIN — ${ENTRY_COST} $SHARD`}
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
                    disabled={busy || !warbandName.trim() || (spendable < ENTRY_COST && !isAdmin)}
                    onClick={handleCreate}
                  >
                    {spendable < ENTRY_COST && !isAdmin ? 'NEED 1000 $SHARD' : `RAISE WARBAND — ${ENTRY_COST} $SHARD`}
                  </button>
                </div>
              </section>
            )}
          </>
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

        {/* The nine heads */}
        <section className="r1w-heads">
          <div className="r1w-section-head">THE NINE HEADS — WHAT EACH ONE TESTS</div>
          <div className="r1w-heads-grid">
            {PHASES.map(p => (
              <div key={p.n} className="r1w-phase-col">
                <div className="r1w-phase-title" style={{ color: p.color }}>{p.label}</div>
                <div className="r1w-phase-sub">{p.sub}</div>
                {HEADS.filter(h => h.phase === p.n).map(h => (
                  <div key={h.id} className="r1w-head-card">
                    <div className="r1w-head-card-name">
                      <span style={{ color: p.color }}>{h.glyph}</span> {h.name}
                    </div>
                    <div className="r1w-head-card-skill">{h.brief.skill}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNav } from '../context/NavigationContext'
import { supabase } from '../lib/supabase'
import './AdminCommand.css'

/*
 * ASSOCIATION COMMAND — the admin ops room, extracted from Dashboard.jsx's
 * embedded admin view into its own lazy-loaded route (/admin, is_admin guard).
 *
 * P0 panels (launch ops): live-ops stat strip · season funnel (per-contract
 * completions) · anti-cheat review queue · hunter management · bug triage.
 * Funnel counts aggregate client-side for now — move to a SQL view when
 * quest_completions outgrows a single select (noted in the panel header).
 */

const GATE_NAMES = {
  'act1-ch01': 'The Document Tomb',
  'act1-ch02': 'The Semantic Crypt',
  'act1-ch03': 'The Registry Hall',
  'act1-ch04': 'Paint the City',
  'act1-ch05': 'The Gravity Anchor',
  'act1-ch06': 'The Infinite Grid',
  'act1-ch07': 'Ghost Feedback',
  'act1-ch08': 'The Collapse',
  'act1-ch09': 'The Control Room',
  'act1-ch10': 'The Static City',
}
const CONTRACT_IDS = Object.keys(GATE_NAMES)
const GATE_SHORT = Object.fromEntries(
  Object.entries(GATE_NAMES).map(([id, name]) => [id, `Gate ${id.slice(-2)} — ${name}`])
)

function fmtTime(s) { if (!s) return '—'; return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` }

export default function AdminCommand() {
  const { user, profile, loading, clearFlag, toggleSubscription, banPilot, suspendPilot, voidClear } = useAuth()
  const { goto } = useNav()

  const [flaggedRows, setFlaggedRows] = useState([])
  const [allPilots, setAllPilots] = useState([])
  const [bugReports, setBugReports] = useState([])
  const [banDurations, setBanDurations] = useState({})
  const [modDur, setModDur] = useState({})  // per-row suspend/ban duration select (review queue + registry)
  const [funnel, setFunnel] = useState(null)
  const [ops, setOps] = useState(null)
  const [armDelete, setArmDelete] = useState(null) // bug id armed for delete (two-click confirm)
  const [sharedIp, setSharedIp] = useState([])
  const [sharedFp, setSharedFp] = useState([])
  const [botRows, setBotRows] = useState([])
  const [dupes, setDupes] = useState([])

  const isAdmin = !!profile?.is_admin

  useEffect(() => {
    if (!isAdmin) return
    const midnight = new Date()
    midnight.setHours(0, 0, 0, 0)
    const iso = midnight.toISOString()
    Promise.all([
      supabase.from('quest_completions').select('user_id, quest_id, time_taken, paste_count, completed_at').eq('flagged', true).order('completed_at', { ascending: false }),
      // Emails and moderation columns come from a SECURITY DEFINER RPC that
      // re-checks is_admin in the DATABASE — the `if (!isAdmin) return` above is
      // decoration any signed-in user can step around. Falls back to the direct
      // read until supabase/admin_roster_rpc.sql has been run, so this screen
      // never goes blank mid-migration.
      supabase.rpc('admin_list_pilots').then(res => res.error
        ? supabase.from('profiles').select('id, name, is_subscribed, is_admin, banned_until, suspended_until, suspend_reason, prologue_done, dupe_flag, normalized_email, created_at').order('name')
        : res),
      supabase.from('bug_reports').select('id, user_id, description, view, url, user_agent, status, created_at').order('created_at', { ascending: false }),
      // Funnel source — client aggregate; becomes a SQL view at scale.
      supabase.from('quest_completions').select('quest_id'),
      supabase.from('quest_completions').select('user_id', { count: 'exact', head: true }).gte('completed_at', iso),
      // Anti-abuse signals (tables/views ship in supabase/anti_abuse.sql — degrade to [] pre-migration).
      supabase.from('account_links_ip').select('*').order('account_count', { ascending: false }).limit(50),
      supabase.from('account_links_fp').select('*').order('account_count', { ascending: false }).limit(50),
      supabase.from('security_events').select('created_at, kind, ip, fingerprint, bot_score, signals, user_id').gt('bot_score', 40).order('created_at', { ascending: false }).limit(50),
    ]).then(([flagged, pilots, bugs, allCompletions, clearsToday, ip, fp, bots]) => {
      const pilotRows = pilots.data ?? []
      setFlaggedRows(flagged.data ?? [])
      setAllPilots(pilotRows)
      setBugReports(bugs.data ?? [])
      setSharedIp(ip?.data ?? [])
      setSharedFp(fp?.data ?? [])
      setBotRows(bots?.data ?? [])
      setDupes(pilotRows.filter(p => p.dupe_flag))
      const counts = {}
      for (const r of allCompletions.data ?? []) counts[r.quest_id] = (counts[r.quest_id] ?? 0) + 1
      setFunnel(counts)
      setOps({
        clearsToday: clearsToday.count ?? 0,
        signupsToday: pilotRows.filter(p => p.created_at && p.created_at >= iso).length,
        hunters: pilotRows.length,
        passHolders: pilotRows.filter(p => p.is_subscribed).length,
        prologueDone: pilotRows.filter(p => p.prologue_done === true).length,
      })
    })
  }, [isAdmin])

  // ── Guards ──
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (!profile) return null
  if (!profile.is_admin) return <Navigate to="/dashboard" replace />

  const funnelMax = funnel ? Math.max(1, ...CONTRACT_IDS.map(id => funnel[id] ?? 0)) : 1
  const prologuePct = ops && ops.hunters > 0 ? Math.round((ops.prologueDone / ops.hunters) * 100) : 0

  return (
    <div className="ac-wrap">
      {/* ── Header ── */}
      <header className="ac-header">
        <button className="ac-back" onClick={() => goto('dashboard')}>← HQ</button>
        <div className="ac-title-block">
          <span className="ac-kicker">HUNTER ASSOCIATION · RESTRICTED</span>
          <h1 className="ac-title">ASSOCIATION COMMAND</h1>
        </div>
        <span className="ac-crest">⬡</span>
      </header>

      {/* ── P0 · Live ops strip ── */}
      <section className="ac-stats">
        {[
          { label: 'SIGNUPS TODAY', value: ops?.signupsToday, tone: 'cyan' },
          { label: 'CLEARS TODAY', value: ops?.clearsToday, tone: 'cyan' },
          { label: 'PROLOGUE RATE', value: ops ? `${prologuePct}%` : null, tone: 'gold' },
          { label: 'HUNTERS', value: ops?.hunters, tone: 'gold' },
          { label: 'PASS HOLDERS', value: ops?.passHolders, tone: 'gold' },
          { label: 'FLAGGED', value: flaggedRows.length, tone: flaggedRows.length > 0 ? 'magenta' : 'cyan' },
        ].map(s => (
          <div key={s.label} className={`ac-stat ac-stat-${s.tone}`}>
            <span className="ac-stat-value">{s.value ?? '…'}</span>
            <span className="ac-stat-label">{s.label}</span>
          </div>
        ))}
      </section>

      {/* ── P0 · Season funnel ── */}
      <section className="ac-panel">
        <div className="ac-panel-head">
          <h2>THE CLIMB — FUNNEL</h2>
          <span className="ac-panel-note">completions per contract · stratum 1</span>
        </div>
        <div className="ac-funnel">
          {CONTRACT_IDS.map(id => {
            const n = funnel?.[id] ?? 0
            return (
              <div key={id} className="ac-funnel-row">
                <span className="ac-funnel-label">{GATE_SHORT[id]}</span>
                <div className="ac-funnel-track">
                  <div className="ac-funnel-fill" style={{ width: `${(n / funnelMax) * 100}%` }} />
                </div>
                <span className="ac-funnel-count">{funnel ? n : '…'}</span>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── P0 · Anti-cheat review queue ── */}
      <section className="ac-panel">
        <div className="ac-panel-head">
          <h2>ANTI-CHEAT — REVIEW QUEUE</h2>
          <span className={`ac-panel-note${flaggedRows.length ? ' hot' : ''}`}>{flaggedRows.length} flagged</span>
        </div>
        {flaggedRows.length === 0 ? (
          <div className="ac-empty">No flagged completions. The Board sleeps well tonight.</div>
        ) : (
          <div className="ac-table">
            <div className="ac-row ac-row-head ac-grid-flags">
              <span>Hunter</span><span>Contract</span><span>Time</span><span>Pastes</span><span>Date</span><span></span>
            </div>
            {flaggedRows.map((row, i) => (
              <div key={`${row.user_id}-${row.quest_id}`} className="ac-row ac-grid-flags">
                <span className="ac-strong">{allPilots.find(p => p.id === row.user_id)?.name ?? 'Unknown'}</span>
                <span>{GATE_SHORT[row.quest_id] ?? row.quest_id}</span>
                <span className={row.time_taken < 90 ? 'ac-hot' : ''}>{fmtTime(row.time_taken)}</span>
                <span className={row.paste_count > 0 ? 'ac-hot' : ''}>{row.paste_count ?? 0}</span>
                <span className="ac-dim">{new Date(row.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                <span className="ac-inline ac-flag-actions">
                  <button className="ac-btn" title="Legit — remove the flag"
                    onClick={async () => {
                      const ok = await clearFlag(row.user_id, row.quest_id)
                      if (ok) setFlaggedRows(r => r.filter((_, j) => j !== i))
                    }}>Clear</button>
                  <button className="ac-btn ac-btn-hot" title="Delete this clear — reverses XP + $SHARD"
                    onClick={async () => {
                      const ok = await voidClear(row.user_id, row.quest_id)
                      if (ok) setFlaggedRows(r => r.filter((_, j) => j !== i))
                    }}>Void</button>
                  <button className="ac-btn" title="Suspend 7 days (can log in, can't earn)"
                    onClick={async () => {
                      const ok = await suspendPilot(row.user_id, '7d', 'flagged gate clear')
                      if (ok) setAllPilots(ps => ps.map(pl => pl.id === row.user_id
                        ? { ...pl, suspended_until: new Date(Date.now() + 604800000).toISOString(), suspend_reason: 'flagged gate clear' } : pl))
                    }}>Suspend</button>
                  <button className="ac-btn ac-btn-hot" title="Ban 30 days"
                    onClick={async () => {
                      const ok = await banPilot(row.user_id, '30d', 'flagged gate clear')
                      if (ok) setAllPilots(ps => ps.map(pl => pl.id === row.user_id
                        ? { ...pl, banned_until: new Date(Date.now() + 2592000000).toISOString() } : pl))
                    }}>Ban</button>
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Hunter management (ported) ── */}
      <section className="ac-panel">
        <div className="ac-panel-head">
          <h2>HUNTER REGISTRY</h2>
          <span className="ac-panel-note">{allPilots.length} licensed</span>
        </div>
        <div className="ac-table">
          <div className="ac-row ac-row-head ac-grid-pilots">
            <span>Hunter</span><span>Season Pass</span><span>Ban Status</span><span>Actions</span>
          </div>
          {allPilots.map((p, i) => {
            const banned = p.banned_until && (p.banned_until === '2099-01-01T00:00:00Z' || new Date(p.banned_until) > new Date())
            const suspended = p.suspended_until && (p.suspended_until === '2099-01-01T00:00:00Z' || new Date(p.suspended_until) > new Date())
            const banExpiry = banned && p.banned_until !== '2099-01-01T00:00:00Z'
              ? new Date(p.banned_until).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              : null
            return (
              <div key={p.id} className="ac-row ac-grid-pilots">
                <span className="ac-strong">
                  {p.name ?? 'Unnamed'}
                  {p.is_admin && <span className="ac-chip">ADMIN</span>}
                  {suspended && <span className="ac-chip ac-chip-warn" title={p.suspend_reason ?? ''}>SUSPENDED</span>}
                  {p.dupe_flag && <span className="ac-chip ac-chip-warn">DUPE</span>}
                  {p.prologue_done === false && <span className="ac-chip ac-chip-dim">PRE-FALL</span>}
                </span>
                <span className="ac-inline">
                  {p.is_subscribed ? <span className="ac-lime">✓</span> : <span className="ac-dim">—</span>}
                  <button
                    className="ac-btn"
                    onClick={async () => {
                      const ok = await toggleSubscription(p.id, p.is_subscribed)
                      if (ok) setAllPilots(ps => ps.map((pl, j) => j === i ? { ...pl, is_subscribed: !pl.is_subscribed } : pl))
                    }}
                  >
                    {p.is_subscribed ? 'Revoke' : 'Grant'}
                  </button>
                </span>
                <span>
                  {banned
                    ? <span className="ac-ban-chip">🚫 {banExpiry ? `Until ${banExpiry}` : 'Permanent'}</span>
                    : <span className="ac-dim">—</span>}
                </span>
                <span className="ac-inline">
                  {!banned && (
                    <select
                      className="ac-select"
                      value={banDurations[p.id] ?? '24h'}
                      onChange={e => setBanDurations(d => ({ ...d, [p.id]: e.target.value }))}
                    >
                      <option value="1h">1 hour</option>
                      <option value="24h">24 hours</option>
                      <option value="7d">7 days</option>
                      <option value="30d">30 days</option>
                      <option value="permanent">Permanent</option>
                    </select>
                  )}
                  <button
                    className={`ac-btn${suspended ? ' ac-btn-lime' : ''}`}
                    title={suspended ? 'Lift suspension' : 'Suspend (can log in, can\'t earn) for the selected duration'}
                    onClick={async () => {
                      if (suspended) {
                        const ok = await suspendPilot(p.id, 'unsuspend')
                        if (ok) setAllPilots(ps => ps.map((pl, j) => j === i ? { ...pl, suspended_until: null, suspend_reason: null } : pl))
                      } else {
                        const dur = banDurations[p.id] ?? '24h'
                        const ok = await suspendPilot(p.id, dur, 'admin action')
                        if (ok) {
                          const until = dur === 'permanent' ? '2099-01-01T00:00:00Z'
                            : new Date(Date.now() + { '1h': 3600000, '24h': 86400000, '7d': 604800000, '30d': 2592000000 }[dur]).toISOString()
                          setAllPilots(ps => ps.map((pl, j) => j === i ? { ...pl, suspended_until: until, suspend_reason: 'admin action' } : pl))
                        }
                      }
                    }}
                  >
                    {suspended ? 'Unsuspend' : 'Suspend'}
                  </button>
                  <button
                    className={`ac-btn${banned ? ' ac-btn-lime' : ' ac-btn-hot'}`}
                    onClick={async () => {
                      const dur = banned ? 'unban' : (banDurations[p.id] ?? '24h')
                      const ok = await banPilot(p.id, dur, 'admin action')
                      if (ok) {
                        let newBannedUntil = null
                        if (dur !== 'unban') {
                          newBannedUntil = dur === 'permanent' ? '2099-01-01T00:00:00Z'
                            : new Date(Date.now() + { '1h': 3600000, '24h': 86400000, '7d': 604800000, '30d': 2592000000 }[dur]).toISOString()
                        }
                        setAllPilots(ps => ps.map((pl, j) => j === i ? { ...pl, banned_until: newBannedUntil } : pl))
                      }
                    }}
                  >
                    {banned ? 'Unban' : 'Ban'}
                  </button>
                </span>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Multi-account: shared IP / device ── */}
      <section className="ac-panel">
        <div className="ac-panel-head">
          <h2>SHARED SIGNALS — SUSPECTED MULTI-ACCOUNTS</h2>
          <span className={`ac-panel-note${(sharedIp.length + sharedFp.length) ? ' hot' : ''}`}>
            {sharedIp.length} IP · {sharedFp.length} device
          </span>
        </div>
        {(sharedIp.length + sharedFp.length) === 0 ? (
          <div className="ac-empty">No shared IP/device clusters. (Needs supabase/anti_abuse.sql + telemetry.)</div>
        ) : (
          <div className="ac-table">
            <div className="ac-row ac-row-head ac-grid-shared">
              <span>Signal</span><span>Accounts</span><span>Hunters</span><span>Last seen</span>
            </div>
            {[...sharedIp.map(r => ({ ...r, sig: 'IP', key: 'ip:' + r.ip_hash })),
              ...sharedFp.map(r => ({ ...r, sig: 'DEVICE', key: 'fp:' + r.fingerprint }))].map(r => (
              <div key={r.key} className="ac-row ac-grid-shared">
                <span className="ac-hot">{r.sig}</span>
                <span className="ac-strong">{r.account_count}</span>
                <span className="ac-dim">{(r.user_ids ?? []).map(id => allPilots.find(p => p.id === id)?.name ?? id.slice(0, 8)).join(', ')}</span>
                <span className="ac-dim">{r.last_seen ? new Date(r.last_seen).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Bot watch ── */}
      <section className="ac-panel">
        <div className="ac-panel-head">
          <h2>BOT WATCH</h2>
          <span className={`ac-panel-note${botRows.length ? ' hot' : ''}`}>{botRows.length} high-score events</span>
        </div>
        {botRows.length === 0 ? (
          <div className="ac-empty">No high bot-score signups. (Needs supabase/anti_abuse.sql + telemetry.)</div>
        ) : (
          <div className="ac-table">
            <div className="ac-row ac-row-head ac-grid-bots">
              <span>When</span><span>Kind</span><span>Score</span><span>IP</span><span>Signals</span>
            </div>
            {botRows.map((b, i) => (
              <div key={i} className="ac-row ac-grid-bots">
                <span className="ac-dim">{new Date(b.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                <span>{b.kind}</span>
                <span className={b.bot_score >= 80 ? 'ac-hot' : ''}>{b.bot_score}</span>
                <span className="ac-dim">{b.ip ?? '—'}</span>
                <span className="ac-dim">{JSON.stringify(b.signals ?? {}).slice(0, 60)}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Bug triage (ported) ── */}
      <section className="ac-panel">
        <div className="ac-panel-head">
          <h2>BUG TRIAGE</h2>
          <span className={`ac-panel-note${bugReports.filter(b => b.status === 'new').length ? ' hot' : ''}`}>
            {bugReports.filter(b => b.status === 'new').length} new
          </span>
        </div>
        {bugReports.length === 0 ? (
          <div className="ac-empty">No bug reports.</div>
        ) : (
          <div className="ac-table">
            <div className="ac-row ac-row-head ac-grid-bugs">
              <span>Description</span><span>Hunter</span><span>View</span><span>Date</span><span>Status</span><span></span>
            </div>
            {bugReports.map((b, i) => (
              <div key={b.id} className="ac-row ac-grid-bugs">
                <span>
                  <span className="ac-strong">{b.description}</span>
                  <span className="ac-sub">{b.user_agent?.slice(0, 60)}…</span>
                </span>
                <span>{allPilots.find(p => p.id === b.user_id)?.name ?? 'Unknown'}</span>
                <span className="ac-dim">{b.view ?? '—'}</span>
                <span className="ac-dim">{new Date(b.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                <select
                  className={`ac-select ac-status-${b.status}`}
                  value={b.status}
                  onChange={async e => {
                    const newStatus = e.target.value
                    await supabase.from('bug_reports').update({ status: newStatus }).eq('id', b.id)
                    setBugReports(rs => rs.map((r, j) => j === i ? { ...r, status: newStatus } : r))
                  }}
                >
                  <option value="new">New</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="fixed">Fixed</option>
                </select>
                {armDelete === b.id ? (
                  <button
                    className="ac-btn ac-btn-hot"
                    onClick={async () => {
                      const { error } = await supabase.from('bug_reports').delete().eq('id', b.id)
                      if (!error) setBugReports(rs => rs.filter(r => r.id !== b.id))
                      setArmDelete(null)
                    }}
                  >
                    Sure?
                  </button>
                ) : (
                  <button
                    className="ac-btn"
                    title="Delete report"
                    onClick={() => {
                      setArmDelete(b.id)
                      setTimeout(() => setArmDelete(a => (a === b.id ? null : a)), 2500)
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

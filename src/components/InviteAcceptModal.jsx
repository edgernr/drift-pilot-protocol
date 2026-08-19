import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import * as F from '../lib/friends'
import {
  ROLE_LIST, FUNCTIONS, ENTRY_COST, PARTY_MAX,
} from '../data/raids/raid01'
import './InviteAcceptModal.css'

const EXTRA_ROLE_COST = 1000

// ── ACCEPT A RAID INVITE ─────────────────────────────────────────────────────
// Accepting used to only flip raid_invites.status to 'accepted' — the hunter
// was never added to the warband, so the button said JOIN and did nothing.
// Joining genuinely requires three things the RPC can't decide for you:
// which specialization(s) you take, the Shards entry burn, and the
// raid_members rows. This modal does all three, in an order that fails safe.
export default function InviteAcceptModal({ invite, onClose, onJoined }) {
  const { profile, user, burnRaidEntry, refreshProfile } = useAuth()
  const isAdmin = profile?.is_admin ?? false
  const spendable = (profile?.totalHunt ?? 0) - (profile?.totalHuntSpent ?? 0)

  const [taken, setTaken] = useState(null)      // roles already claimed in that raid
  const [headcount, setHeadcount] = useState(0) // distinct hunters already in
  const [picked, setPicked] = useState([])
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    const { data, error: e } = await supabase
      .from('raid_members').select('user_id, role').eq('raid_id', invite.raid_id)
    if (e) { setError(e.message); setTaken(new Set()); return }
    setTaken(new Set((data ?? []).map(m => m.role)))
    setHeadcount(new Set((data ?? []).map(m => m.user_id)).size)
  }, [invite.raid_id])

  useEffect(() => { load() }, [load])

  const total = picked.length ? ENTRY_COST + (picked.length - 1) * EXTRA_ROLE_COST : 0
  const canAfford = isAdmin || spendable >= total
  const full = headcount >= PARTY_MAX

  const toggle = (id) => {
    setError(null)
    setPicked(p => p.includes(id) ? p.filter(x => x !== id) : (p.length < 3 ? [...p, id] : p))
  }

  async function accept() {
    if (!picked.length || busy || !canAfford || full) return
    setBusy(true)
    setError(null)
    try {
      // 1. Consume the invite FIRST — it validates that the invite is yours,
      //    still pending, and that the raid is still a lobby.
      const { error: rErr } = await F.respondRaidInvite(invite.invite_id, true)
      if (rErr) { setError(F.friendError(rErr)); return }

      // 2. Claim the seats. UNIQUE(raid_id, role) is what settles a race with
      //    another hunter picking the same specialization a moment earlier.
      const { error: mErr } = await supabase
        .from('raid_members')
        .insert(picked.map(role => ({ raid_id: invite.raid_id, user_id: user.id, role })))
      if (mErr) {
        setError('Someone just took one of those roles — pick again from the war room.')
        await load()
        return
      }

      // 3. Pay. Entry first, then the extra-role surcharge.
      if (!isAdmin) {
        await burnRaidEntry(invite.raid_id)
        if (picked.length > 1) {
          await supabase.from('gate_unlocks').insert({
            user_id: user.id,
            quest_id: `raid-extra:${invite.raid_id}`,
            drift_cost: (picked.length - 1) * EXTRA_ROLE_COST,
          })
        }
        await refreshProfile()
      }

      onJoined?.(invite.raid_id)
    } finally {
      setBusy(false)
    }
  }

  const free = ROLE_LIST.filter(r => !taken?.has(r.id))

  return (
    <div className="iam-backdrop" onClick={onClose}>
      <div className="iam" onClick={e => e.stopPropagation()}>
        <div className="iam-head">
          <div>
            <span className="iam-kicker">RAID INVITE</span>
            <div className="iam-title">{invite.raid_name}</div>
            <div className="iam-from">{invite.sender_name} wants you in their warband</div>
          </div>
          <button className="iam-x" onClick={onClose}>✕</button>
        </div>

        {taken === null ? (
          <div className="iam-loading">READING THE WARBAND…</div>
        ) : full ? (
          <div className="iam-blocked">That warband is already at {PARTY_MAX} hunters.</div>
        ) : (
          <>
            <div className="iam-section-label">
              PICK YOUR SPECIALIZATION{picked.length > 1 ? 'S' : ''} — 1st free, extras {EXTRA_ROLE_COST.toLocaleString()} Shards
            </div>

            <div className="iam-roles">
              {ROLE_LIST.map(r => {
                const isTaken = taken.has(r.id)
                const sel = picked.includes(r.id)
                const fn = FUNCTIONS.find(f => f.role === r.id)
                return (
                  <button
                    key={r.id}
                    className={`iam-role${sel ? ' picked' : ''}${isTaken ? ' taken' : ''}`}
                    style={{ '--rc': r.color }}
                    disabled={isTaken || busy}
                    onClick={() => toggle(r.id)}
                    title={isTaken ? 'Already claimed by another hunter' : r.owns}
                  >
                    <span className="iam-role-glyph">{r.glyph}</span>
                    <span className="iam-role-label">{r.label.split(' ')[0]}</span>
                    <span className="iam-role-fn">{fn ? `F${fn.seq}` : ''}</span>
                    {isTaken && <span className="iam-role-taken">TAKEN</span>}
                    {sel && <span className="iam-role-check">✓</span>}
                  </button>
                )
              })}
            </div>

            {free.length === 0 && (
              <div className="iam-blocked">Every specialization in that warband is claimed.</div>
            )}

            <div className="iam-cost">
              <span>
                {picked.length === 0
                  ? 'Pick at least one specialization'
                  : `${picked.length} role${picked.length > 1 ? 's' : ''} · entry ${ENTRY_COST.toLocaleString()}` +
                    (picked.length > 1 ? ` + ${((picked.length - 1) * EXTRA_ROLE_COST).toLocaleString()} extra` : '')}
              </span>
              <span className={`iam-total${!canAfford ? ' short' : ''}`}>
                {total.toLocaleString()} Shards
                {!canAfford && ' — INSUFFICIENT'}
              </span>
            </div>

            {error && <div className="iam-error">{error}</div>}

            <div className="iam-actions">
              <button className="iam-btn" disabled={busy} onClick={onClose}>NOT NOW</button>
              <button
                className="iam-btn primary"
                disabled={busy || !picked.length || !canAfford}
                onClick={accept}
              >
                {busy ? 'JOINING…' : 'ACCEPT & JOIN'}
              </button>
            </div>
            <div className="iam-note">
              Entry is refunded in full if you leave before the breach.
            </div>
          </>
        )}
      </div>
    </div>
  )
}

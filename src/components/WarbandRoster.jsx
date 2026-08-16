import { useEffect, useMemo, useState } from 'react'
import HunterSigil from './HunterSigil'
import { INVITE_TTL_MS } from '../data/raids/raid01'
import './WarbandRoster.css'

const mmss = (ms) => {
  const s = Math.max(0, Math.ceil(ms / 1000))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

// ── WARBAND ROSTER ───────────────────────────────────────────────────────────
// The party at a glance: who is IN, who was INVITED and hasn't answered, who
// DECLINED, and which of the five specializations still has nobody on it.
//
// One card per PERSON, not per role row — a hunter holding three roles is one
// hunter, and showing them three times is what made the old roster misleading.
//
// Slot states: filled · pending (invite out) · declined · empty (invite here).

const STATUS = {
  filled:   { tag: 'IN PARTY',  cls: 'filled' },
  self:     { tag: 'YOU — READY', cls: 'filled' },
  pending:  { tag: 'INVITED',   cls: 'pending' },
  declined: { tag: 'DECLINED',  cls: 'declined' },
  empty:    { tag: 'OPEN SLOT', cls: 'empty' },
}

function Slot({ slot, leaderId, myId, onCancel, onInviteClick, canInvite, busy }) {
  const s = STATUS[slot.kind]
  const isLeader = slot.userId && slot.userId === leaderId
  const isMe = slot.userId && slot.userId === myId

  if (slot.kind === 'empty') {
    // Before a warband exists there is nothing to invite INTO, so the seat is
    // shown but inert rather than opening a picker that can't do anything.
    if (!canInvite) {
      return (
        <div className="wr-card wr-empty inert">
          <span className="wr-empty-plus">·</span>
          <span className="wr-empty-label">EMPTY</span>
          <span className="wr-slot-tag">{s.tag}</span>
        </div>
      )
    }
    return (
      <button className="wr-card wr-empty" onClick={onInviteClick} disabled={busy}>
        <span className="wr-empty-plus">+</span>
        <span className="wr-empty-label">INVITE</span>
        <span className="wr-slot-tag">{s.tag}</span>
      </button>
    )
  }

  return (
    <div className={`wr-card ${s.cls}${isMe ? ' me' : ''}`}>
      {isLeader && <span className="wr-crown" title="Warband leader">♛</span>}

      <div className="wr-portrait">
        <HunterSigil config={slot.avatar} name={slot.name} size={62} />
        {slot.kind === 'pending' && <span className="wr-portrait-veil">…</span>}
        {slot.kind === 'declined' && <span className="wr-portrait-veil declined">✕</span>}
      </div>

      <div className="wr-name" style={slot.color ? { color: slot.color } : undefined}>
        {slot.name}{isMe && <span className="wr-you"> (YOU)</span>}
      </div>

      {/* every specialization this hunter is carrying */}
      <div className="wr-roles">
        {slot.roles?.length
          ? slot.roles.map(r => (
              <span key={r.id} className="wr-role-pip" style={{ '--rc': r.color }} title={`${r.label} — ${r.owns}`}>
                {r.glyph}
              </span>
            ))
          : <span className="wr-role-pip none" title="No specialization yet">·</span>}
      </div>

      <span className={`wr-slot-tag ${s.cls}`}>{s.tag}</span>

      {/* An unanswered invite runs on a clock — three minutes, then the seat
          reopens. Showing it counting down is the whole point. */}
      {slot.kind === 'pending' && slot.msLeft != null && (
        <span className={`wr-timer${slot.msLeft < 30000 ? ' urgent' : ''}`}>
          {mmss(slot.msLeft)}
        </span>
      )}

      {slot.kind === 'pending' && onCancel && (
        <button className="wr-mini" disabled={busy} onClick={() => onCancel(slot.inviteId)}>
          CANCEL
        </button>
      )}
      {slot.kind === 'declined' && onInviteClick && (
        <button className="wr-mini" disabled={busy} onClick={onInviteClick}>
          RE-INVITE
        </button>
      )}
    </div>
  )
}

export default function WarbandRoster({
  members = [],
  invites = [],
  friends = [],
  roles = {},          // ROLES map from raid01
  roleList = [],       // ROLE_LIST
  leaderId,
  myId,
  maxSlots = 5,
  partyMin = 2,
  onInvite,
  onCancelInvite,
  title,               // heading shown above the rail
  hint,                // one-line note under the rail
  self = null,         // { user_id, name, avatar } — you always hold a seat
  onSearch,            // (q) => void — hunter search inside the picker
  searchValue = '',
  searchResults = [],
  busy = false,
}) {
  const [picking, setPicking] = useState(false)
  const canInvite = typeof onInvite === 'function'

  // Tick once a second while any invite is still counting down.
  const [now, setNow] = useState(() => Date.now())
  const hasPending = invites.some(i => i.status === 'pending')
  useEffect(() => {
    if (!hasPending) return
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [hasPending])

  // Group role rows into one entry per hunter.
  const people = useMemo(() => {
    const by = new Map()
    for (const m of members) {
      if (!by.has(m.user_id)) {
        by.set(m.user_id, {
          kind: 'filled', userId: m.user_id, name: m.name ?? 'HUNTER',
          avatar: m.avatar ?? null, color: m.username_color ?? null, roles: [],
        })
      }
      const r = roles[m.role]
      if (r) by.get(m.user_id).roles.push(r)
    }
    return [...by.values()]
  }, [members, roles])

  const inParty = new Set(people.map(p => p.userId))
  const age = (i) => now - new Date(i.created_at ?? 0).getTime()
  const live = invites.filter(i => i.status === 'pending' && !inParty.has(i.invitee_id) && age(i) < INVITE_TTL_MS)
  const timedOut = invites.filter(i => i.status === 'pending' && !inParty.has(i.invitee_id) && age(i) >= INVITE_TTL_MS)

  const pending = live.map(i => ({
    kind: 'pending', userId: i.invitee_id, inviteId: i.invite_id,
    name: i.name ?? 'HUNTER', avatar: i.avatar ?? null, roles: [],
    msLeft: INVITE_TTL_MS - age(i),
  }))
  // Silence counts as a refusal — an ignored invite frees its seat.
  const declined = [
    ...invites.filter(i => i.status === 'declined' && !inParty.has(i.invitee_id))
      .map(i => ({ ...i, why: 'declined' })),
    ...timedOut.map(i => ({ ...i, why: 'expired' })),
  ].map(i => ({
    kind: 'declined', userId: i.invitee_id, inviteId: i.invite_id,
    name: i.name ?? 'HUNTER', avatar: i.avatar ?? null, roles: [], why: i.why,
  }))

  // You are the first hunter in your own warband: hold seat one even before
  // the lobby exists, so the party always has a visible anchor.
  const seatedSelf = self && !inParty.has(self.user_id)
    ? [{ kind: 'self', userId: self.user_id, name: self.name ?? 'YOU', avatar: self.avatar ?? null, roles: [] }]
    : []

  // Declined/expired invites do NOT hold a seat — otherwise a couple of
  // refusals fill the rail and there is no open slot left to invite anyone
  // else. They go to the strip underneath, where they can be re-invited.
  const slots = [...seatedSelf, ...people, ...pending].slice(0, maxSlots)
  while (slots.length < maxSlots) slots.push({ kind: 'empty', key: `e${slots.length}` })

  // Role coverage — the Gate will not open until all five are owned.
  const covered = new Set(members.map(m => m.role))
  const uncovered = roleList.filter(r => !covered.has(r.id))
  const hunters = Math.max(people.length, seatedSelf.length)

  // Friends who aren't already in the party or holding a live invite.
  const alreadyOut = new Set([...inParty, ...pending.map(p => p.userId), self?.user_id].filter(Boolean))
  const invitable = friends.filter(f => !alreadyOut.has(f.friend_id))
  const searchable = (searchResults ?? []).filter(h => !alreadyOut.has(h.user_id))

  return (
    <div className="wr-wrap">
      <div className="wr-head">
        <span className="wr-head-title">{title ?? 'WARBAND'}</span>
        <span className={`wr-head-count${hunters >= partyMin ? ' ok' : ''}`}>
          {hunters}/{maxSlots} HUNTERS
        </span>
        <span className={`wr-head-count${uncovered.length === 0 ? ' ok' : ' warn'}`}>
          {covered.size}/{roleList.length} ROLES
        </span>
      </div>

      <div className="wr-rail">
        {slots.map((slot, i) => (
          <Slot
            key={slot.userId ?? slot.key ?? i}
            slot={slot}
            leaderId={leaderId}
            myId={myId}
            busy={busy}
            canInvite={canInvite}
            onCancel={onCancelInvite}
            onInviteClick={() => setPicking(true)}
          />
        ))}
      </div>

      {hint && <div className="wr-hint">{hint}</div>}

      {declined.length > 0 && (
        <div className="wr-declined-strip">
          <span className="wr-declined-label">TURNED IT DOWN</span>
          {declined.map(d => (
            <span key={d.inviteId} className="wr-declined-chip">
              {d.name}
              <span className="wr-declined-why">{d.why === 'expired' ? 'no answer' : 'said no'}</span>
              <button
                className="wr-declined-again"
                disabled={busy}
                onClick={() => onInvite?.(d.userId)}
                title={`Invite ${d.name} again`}
              >ASK AGAIN</button>
            </span>
          ))}
        </div>
      )}

      {/* All five functions and who holds them — showing only the UNCLAIMED
          ones hid the half that matters: who's actually covering what. */}
      <div className="wr-board">
        <div className="wr-board-label">FUNCTIONS</div>
        <div className="wr-board-grid">
          {roleList.map(r => {
            const holder = members.find(m => m.role === r.id)
            const held = !!holder
            return (
              <div
                key={r.id}
                className={`wr-board-role${held ? ' held' : ''}`}
                style={{ '--rc': r.color }}
                title={r.owns}
              >
                <span className="wr-board-glyph">{r.glyph}</span>
                <span className="wr-board-name">{r.label.split(' ')[0]}</span>
                <span className={`wr-board-holder${held ? '' : ' open'}`}>
                  {held ? (holder.user_id === myId ? 'YOU' : holder.name ?? 'HUNTER') : 'OPEN'}
                </span>
              </div>
            )
          })}
        </div>
        {uncovered.length > 0 && (
          <div className="wr-board-note">
            {uncovered.length} function{uncovered.length > 1 ? 's' : ''} still unclaimed — the Gate
            stays sealed until every one has an owner.
          </div>
        )}
      </div>

      {/* Friend picker */}
      {picking && (
        <div className="wr-picker-backdrop" onClick={() => setPicking(false)}>
          <div className="wr-picker" onClick={e => e.stopPropagation()}>
            <div className="wr-picker-head">
              <span>INVITE A HUNTER</span>
              <button className="wr-picker-x" onClick={() => setPicking(false)}>✕</button>
            </div>
            {onSearch && (
              <input
                className="wr-picker-search"
                placeholder="Search any hunter by name…"
                value={searchValue}
                onChange={e => onSearch(e.target.value)}
                autoFocus
              />
            )}

            <div className="wr-picker-list">
              {/* Search hits first — you can invite a hunter you haven't
                  friended yet; they just have to answer within 3 minutes. */}
              {searchValue.trim() && (
                searchable.length > 0 ? (
                  <>
                    <div className="wr-picker-group">SEARCH</div>
                    {searchable.map(h => (
                      <button
                        key={h.user_id}
                        className="wr-picker-row"
                        disabled={busy}
                        onClick={async () => { await onInvite?.(h.user_id); setPicking(false) }}
                      >
                        <HunterSigil config={h.avatar} name={h.name} size={30} />
                        <span className="wr-picker-name">{h.name ?? 'Hunter'}</span>
                        <span className="wr-picker-go">INVITE →</span>
                      </button>
                    ))}
                  </>
                ) : (
                  <div className="wr-picker-empty">No hunter by that name.</div>
                )
              )}

              {invitable.length > 0 && (
                <>
                  <div className="wr-picker-group">FRIENDS</div>
                  {invitable.map(f => (
                    <button
                      key={f.friend_id}
                      className="wr-picker-row"
                      disabled={busy}
                      onClick={async () => { await onInvite?.(f.friend_id); setPicking(false) }}
                    >
                      <HunterSigil config={f.avatar} name={f.name} size={30} />
                      <span className="wr-picker-name">{f.name ?? 'Hunter'}</span>
                      <span className="wr-picker-go">INVITE →</span>
                    </button>
                  ))}
                </>
              )}

              {invitable.length === 0 && !searchValue.trim() && (
                <div className="wr-picker-empty">
                  {friends.length === 0
                    ? 'No friends yet — search above to invite any hunter by name.'
                    : 'Every friend is already in the warband or holds a live invite.'}
                </div>
              )}
            </div>
            <div className="wr-picker-foot">Invites expire after 3 minutes of silence.</div>
          </div>
        </div>
      )}
    </div>
  )
}

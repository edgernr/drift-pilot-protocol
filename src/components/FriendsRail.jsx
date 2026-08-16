import HunterSigil from './HunterSigil'
import './FriendsRail.css'

// ── FRIENDS RAIL ─────────────────────────────────────────────────────────────
// One friends surface for the whole war room: incoming requests, your friends
// (with a one-click INVITE once you're in a warband), and the add-hunter
// search. Replaces the two competing implementations that used to exist — a
// header-toggled sidebar and a second copy buried in the role-picker step —
// neither of which was visible in a lobby, which is exactly when you want to
// pull people in.

export default function FriendsRail({
  friends = [],
  requests = [],
  sent = [],           // requests you've sent that are still unanswered
  searchValue = '',
  searchResults = [],
  error = null,
  notice = null,       // transient "request sent" confirmation
  onSearch,
  onAdd,
  onRespond,
  onInvite,            // null when not in a warband
  partyIds = new Set(),
  invitedIds = new Set(),
  busy = false,
}) {
  const friendIds = new Set(friends.map(f => f.friend_id))
  const sentIds = new Set(sent.map(s => s.receiver_id))

  return (
    <aside className="fr-rail">

      {/* ── Incoming requests ── */}
      {requests.length > 0 && (
        <section className="fr-block">
          <div className="fr-title">
            REQUESTS <span className="fr-count">{requests.length}</span>
          </div>
          {requests.map(r => (
            <div key={r.request_id} className="fr-row">
              <HunterSigil config={r.avatar} name={r.name} size={28} />
              <div className="fr-row-info">
                <span className="fr-row-name">{r.name ?? 'Hunter'}</span>
                <span className="fr-row-sub">wants to be friends</span>
              </div>
              <div className="fr-row-actions">
                <button className="fr-btn ok" disabled={busy}
                  onClick={() => onRespond?.(r.request_id, true)}>✓</button>
                <button className="fr-btn no" disabled={busy}
                  onClick={() => onRespond?.(r.request_id, false)}>✕</button>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* ── Your friends ── */}
      <section className="fr-block">
        <div className="fr-title">
          FRIENDS {friends.length > 0 && <span className="fr-count">{friends.length}</span>}
        </div>
        {friends.length === 0 ? (
          <div className="fr-empty">No friends yet — search below to add hunters.</div>
        ) : friends.map(f => {
          const inParty = partyIds.has(f.friend_id)
          const invited = invitedIds.has(f.friend_id)
          return (
            <div key={f.friend_id} className="fr-row">
              <HunterSigil config={f.avatar} name={f.name} size={28} />
              <div className="fr-row-info">
                <span className="fr-row-name">{f.name ?? 'Hunter'}</span>
                {inParty && <span className="fr-row-sub in">in your warband</span>}
                {!inParty && invited && <span className="fr-row-sub pending">invite pending</span>}
              </div>
              {onInvite && !inParty && (
                <button
                  className="fr-btn wide"
                  disabled={busy || invited}
                  onClick={() => onInvite(f.friend_id)}
                >
                  {invited ? 'SENT' : 'INVITE'}
                </button>
              )}
            </div>
          )
        })}
        {!onInvite && friends.length > 0 && (
          <div className="fr-note">Raise or join a warband to invite them.</div>
        )}
      </section>

      {/* ── Sent requests — proof the ADD button did something ── */}
      {sent.length > 0 && (
        <section className="fr-block">
          <div className="fr-title">
            AWAITING REPLY <span className="fr-count pend">{sent.length}</span>
          </div>
          {sent.map(s => (
            <div key={s.receiver_id} className="fr-row">
              <HunterSigil config={s.avatar} name={s.name} size={28} />
              <div className="fr-row-info">
                <span className="fr-row-name">{s.name ?? 'Hunter'}</span>
                <span className="fr-row-sub pending">request sent — waiting on them</span>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* ── Add hunters ── */}
      <section className="fr-block">
        <div className="fr-title">ADD HUNTER</div>
        <input
          className="fr-search"
          placeholder="Search by name…"
          value={searchValue}
          onChange={e => onSearch?.(e.target.value)}
        />
        {notice && <div className="fr-notice">{notice}</div>}
        {error && <div className="fr-error">{error}</div>}
        {!error && searchValue.trim() && searchResults.length === 0 && (
          <div className="fr-empty">No hunter by that name.</div>
        )}
        {searchResults.map(h => {
          const already = friendIds.has(h.user_id)
          const requested = sentIds.has(h.user_id)
          return (
            <div key={h.user_id} className="fr-row">
              <HunterSigil config={h.avatar} name={h.name} size={28} />
              <div className="fr-row-info">
                <span className="fr-row-name">{h.name ?? 'Hunter'}</span>
                {requested && <span className="fr-row-sub pending">request pending</span>}
              </div>
              <button
                className="fr-btn wide"
                disabled={busy || already || requested}
                onClick={() => onAdd?.(h.user_id)}
              >
                {already ? 'FRIENDS' : requested ? 'SENT' : '+ ADD'}
              </button>
            </div>
          )
        })}
      </section>
    </aside>
  )
}

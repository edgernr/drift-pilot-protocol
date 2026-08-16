import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import * as F from '../lib/friends'
import './FriendsPanel.css'

export default function FriendsPanel({ userId, onClose, onInvite, raidId }) {
  const [tab, setTab] = useState('friends')
  const [friends, setFriends] = useState([])
  const [requests, setRequests] = useState([])
  const [searchQ, setSearchQ] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [raids, setRaids] = useState(null)
  const [myRaid, setMyRaid] = useState(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  const load = useCallback(async () => {
    const [{ data: f }, { data: r }] = await Promise.all([
      listFriends(),
      listFriendRequests(),
    ])
    if (mountedRef.current) {
      if (f) setFriends(f)
      if (r) setRequests(r)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleSend = useCallback(async (targetId) => {
    setBusy(true); setError(null)
    const { error: e } = await F.sendFriendRequest(targetId)
    if (e) { setError(F.friendError(e)); setBusy(false); return }
    setSearchQ(''); setSearchResults([])
    await load()
    setBusy(false)
  }, [load])

  const handleRespond = useCallback(async (reqId, accept) => {
    setBusy(true); setError(null)
    const { error: e } = await F.respondFriendRequest(reqId, accept)
    if (e) { setError(F.friendError(e)); setBusy(false); return }
    await load()
    setBusy(false)
  }, [load])

  const handleRemove = useCallback(async (friendId) => {
    setBusy(true); setError(null)
    const { error: e } = await F.removeFriend(friendId)
    if (e) { setError(F.friendError(e)); setBusy(false); return }
    await load()
    setBusy(false)
  }, [load])

  const handleSearch = useCallback(async (q) => {
    setSearchQ(q)
    if (!q.trim()) { setSearchResults([]); return }
    setBusy(true)
    const { data } = await supabase
      .from('public_profiles').select('id, name, avatar, username_color, guild_name, guild_tag')
      .ilike('name', `%${q}%`).limit(8)
    if (mountedRef.current) setSearchResults(data ?? [])
    setBusy(false)
  }, [])

  return (
    <div className="fp-overlay" onClick={onClose}>
      <div className="fp-modal" onClick={e => e.stopPropagation()}>
        <div className="fp-head">
          <span className="fp-title">HUNTER NETWORK</span>
          <button className="fp-close" onClick={onClose}>✕</button>
        </div>

        <div className="fp-tabs">
          {['friends', 'requests', 'add'].map(t => (
            <button
              key={t}
              className={`fp-tab${tab === t ? ' active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t === 'friends' && `FRIENDS (${friends.length})`}
              {t === 'requests' && `REQUESTS (${requests.length})`}
              {t === 'add' && 'ADD HUNTER'}
            </button>
          ))}
        </div>

        {error && <div className="fp-error">{error}</div>}

        {tab === 'friends' && (
          <div className="fp-list">
            {friends.length === 0 && <div className="fp-empty">No friends yet. Add hunters to build your network.</div>}
            {friends.map(f => (
              <div key={f.friend_id} className="fp-row">
                <span className="fp-row-name">{f.name}</span>
                {onInvite && (
                  <button className="fp-btn" disabled={busy} onClick={() => onInvite(f.friend_id, f.name)}>
                    INVITE
                  </button>
                )}
                <button className="fp-btn danger" disabled={busy} onClick={() => handleRemove(f.friend_id)}>
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === 'requests' && (
          <div className="fp-list">
            {requests.length === 0 && <div className="fp-empty">No pending friend requests.</div>}
            {requests.map(r => (
              <div key={r.request_id} className="fp-row">
                <span className="fp-row-name">{r.name}</span>
                <button className="fp-btn primary" disabled={busy} onClick={() => handleRespond(r.request_id, true)}>
                  ACCEPT
                </button>
                <button className="fp-btn danger" disabled={busy} onClick={() => handleRespond(r.request_id, false)}>
                  DECLINE
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === 'add' && (
          <div className="fp-add">
            <input
              className="fp-input"
              placeholder="Search by hunter name…"
              value={searchQ}
              onChange={e => handleSearch(e.target.value)}
              autoFocus
            />
            <div className="fp-list">
              {searchResults.map(h => {
                const already = friends.some(f => f.friend_id === h.id)
                return (
                  <div key={h.id} className="fp-row">
                    <span className="fp-row-name">
                      {h.name}
                      {h.guild_tag && <span className="fp-row-guild"> [{h.guild_tag}]</span>}
                    </span>
                    {h.id === userId ? (
                      <span className="fp-row-self">YOU</span>
                    ) : already ? (
                      <span className="fp-row-self">FRIEND</span>
                    ) : (
                      <button className="fp-btn primary" disabled={busy} onClick={() => handleSend(h.id)}>
                        ADD
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

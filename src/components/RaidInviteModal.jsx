import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import * as F from '../lib/friends'
import './FriendsPanel.css'

export default function RaidInviteModal({ raidId, userId, guildId, members, onClose }) {
  const [tab, setTab] = useState('friends')
  const [friends, setFriends] = useState([])
  const [guildMembers, setGuildMembers] = useState([])
  const [invites, setInvites] = useState([])
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null)
  const [searchQ, setSearchQ] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  const memberIds = new Set(members.map(m => m.user_id))

  const load = useCallback(async () => {
    const [{ data: f }, { data: ri }] = await Promise.all([
      F.listFriends(),
      raidId ? F.listRaidInvites(raidId) : Promise.resolve({ data: [] }),
    ])
    if (mountedRef.current) {
      if (f) setFriends(f.filter(x => !memberIds.has(x.friend_id)))
      if (ri) setInvites(ri)
    }
  }, [raidId, memberIds])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (!guildId) { setGuildMembers([]); return }
    supabase.from('guild_roster')
      .select('user_id, name, avatar, role')
      .eq('guild_id', guildId)
      .then(({ data }) => {
        if (mountedRef.current)
          setGuildMembers((data ?? []).filter(m => !memberIds.has(m.user_id) && m.user_id !== userId))
      })
  }, [guildId, userId, memberIds])

  const handleInvite = useCallback(async (targetId, targetName) => {
    setBusy(true); setMsg(null)
    const { error: e } = await F.inviteToRaid(raidId, targetId)
    if (e) { setMsg({ type: 'error', text: F.friendError(e) }); setBusy(false); return }
    setMsg({ type: 'ok', text: `${targetName} invited` })
    await load()
    setBusy(false)
  }, [raidId, load])

  const handleCancel = useCallback(async (inviteId) => {
    setBusy(true)
    await F.cancelRaidInvite(inviteId)
    await load()
    setBusy(false)
  }, [load])

  const handleSearch = useCallback(async (q) => {
    setSearchQ(q)
    if (!q.trim()) { setSearchResults([]); return }
    const { data } = await supabase
      .from('public_profiles').select('id, name, avatar, username_color, guild_name, guild_tag')
      .ilike('name', `%${q}%`).limit(8)
    if (mountedRef.current)
      setSearchResults((data ?? []).filter(h => !memberIds.has(h.id)))
  }, [memberIds])

  const pendingInviteeIds = new Set(invites.filter(i => i.status === 'pending').map(i => i.invitee_id))

  return (
    <div className="fp-overlay" onClick={onClose}>
      <div className="fp-modal" style={{ width: 520 }}>
        <div className="fp-head">
          <span className="fp-title">INVITE HUNTERS</span>
          <button className="fp-close" onClick={onClose}>✕</button>
        </div>

        <div className="fp-tabs">
          <button className={`fp-tab${tab === 'friends' ? ' active' : ''}`} onClick={() => setTab('friends')}>
            FRIENDS ({friends.length})
          </button>
          {guildId && (
            <button className={`fp-tab${tab === 'guild' ? ' active' : ''}`} onClick={() => setTab('guild')}>
              GUILD ({guildMembers.length})
            </button>
          )}
          <button className={`fp-tab${tab === 'search' ? ' active' : ''}`} onClick={() => setTab('search')}>
            SEARCH
          </button>
          <button className={`fp-tab${tab === 'invites' ? ' active' : ''}`} onClick={() => setTab('invites')}>
            INVITES ({invites.filter(i => i.status === 'pending').length})
          </button>
        </div>

        {msg && (
          <div className="fp-error" style={{ color: msg.type === 'ok' ? '#3df0e8' : undefined }}>
            {msg.text}
          </div>
        )}

        {tab === 'friends' && (
          <div className="fp-list">
            {friends.length === 0 && <div className="fp-empty">No friends available to invite.</div>}
            {friends.map(f => (
              <div key={f.friend_id} className="fp-row">
                <span className="fp-row-name">{f.name}</span>
                {pendingInviteeIds.has(f.friend_id) ? (
                  <span className="fp-row-self">INVITED</span>
                ) : (
                  <button className="fp-btn primary" disabled={busy} onClick={() => handleInvite(f.friend_id, f.name)}>
                    INVITE
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === 'guild' && (
          <div className="fp-list">
            {guildMembers.length === 0 && <div className="fp-empty">No guild members available to invite.</div>}
            {guildMembers.map(m => (
              <div key={m.user_id} className="fp-row">
                <span className="fp-row-name">{m.name}</span>
                <span className="fp-row-guild">{m.role}</span>
                {pendingInviteeIds.has(m.user_id) ? (
                  <span className="fp-row-self">INVITED</span>
                ) : (
                  <button className="fp-btn primary" disabled={busy} onClick={() => handleInvite(m.user_id, m.name)}>
                    INVITE
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === 'search' && (
          <div className="fp-add">
            <input
              className="fp-input"
              placeholder="Search any hunter by name…"
              value={searchQ}
              onChange={e => handleSearch(e.target.value)}
              autoFocus
            />
            <div className="fp-list">
              {searchResults.map(h => (
                <div key={h.id} className="fp-row">
                  <span className="fp-row-name">
                    {h.name}
                    {h.guild_tag && <span className="fp-row-guild"> [{h.guild_tag}]</span>}
                  </span>
                  {pendingInviteeIds.has(h.id) ? (
                    <span className="fp-row-self">INVITED</span>
                  ) : (
                    <button className="fp-btn primary" disabled={busy} onClick={() => handleInvite(h.id, h.name)}>
                      INVITE
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'invites' && (
          <div className="fp-list">
            {invites.length === 0 && <div className="fp-empty">No invites sent yet.</div>}
            {invites.map(i => (
              <div key={i.invite_id} className="fp-row">
                <span className="fp-row-name">{i.name}</span>
                <span className={`fp-row-self`} style={{
                  color: i.status === 'pending' ? '#f5c453' : i.status === 'accepted' ? '#3df0e8' : '#ff3d8b80'
                }}>
                  {i.status === 'pending' ? 'PENDING' : i.status === 'accepted' ? 'JOINED' : 'DECLINED'}
                </span>
                {i.status === 'pending' && (
                  <button className="fp-btn danger" disabled={busy} onClick={() => handleCancel(i.invite_id)}>
                    CANCEL
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

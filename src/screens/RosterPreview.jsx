import { useState } from 'react'
import WarbandRoster from '../components/WarbandRoster'
import FriendsRail from '../components/FriendsRail'
import { ROLES, ROLE_LIST, PARTY_MAX, PARTY_MIN } from '../data/raids/raid01'
import '../screens/Raid01.css'

/*
 * RosterPreview — DEV-ONLY visual harness for WarbandRoster (see App.jsx,
 * gated on import.meta.env.DEV). The war room lives behind auth, so this is
 * how the roster gets looked at with every slot state on screen at once:
 * leader, self, multi-role, pending invite, declined invite, empty slot.
 */
const MEMBERS = [
  { user_id: 'u1', role: 'interface', name: 'MAYA K',  avatar: { seed: 4821, palette: 0 } },
  { user_id: 'u1', role: 'signal',    name: 'MAYA K',  avatar: { seed: 4821, palette: 0 } },
  { user_id: 'u2', role: 'vault',     name: 'JIN S',   avatar: { seed: 991, palette: 2 } },
  { user_id: 'u3', role: 'cipher',    name: 'ARIS T',  avatar: null },
]
const INVITES = [
  // live invite — ~2m10s left on the 3-minute clock
  { invite_id: 'i1', invitee_id: 'u4', name: 'NOAH V', avatar: { seed: 77, palette: 3 },
    status: 'pending', created_at: new Date(Date.now() - 50_000).toISOString() },
  // ignored past the TTL — counts as a refusal, seat reopened
  { invite_id: 'i3', invitee_id: 'u7', name: 'MORGAN X', avatar: null,
    status: 'pending', created_at: new Date(Date.now() - 5 * 60_000).toISOString() },
  { invite_id: 'i2', invitee_id: 'u5', name: 'VESPER H', avatar: { seed: 512, palette: 4 }, status: 'declined' },
]
const FRIENDS = [
  { friend_id: 'u6', name: 'LYRA M',   avatar: { seed: 300, palette: 1 } },
  { friend_id: 'u7', name: 'MORGAN X', avatar: null },
  { friend_id: 'u4', name: 'NOAH V',   avatar: { seed: 77, palette: 3 } },
]

const REQUESTS = [
  { request_id: 'r1', sender_id: 'u8', name: 'CRANE L', avatar: { seed: 88, palette: 1 } },
]

export default function RosterPreview() {
  const [q, setQ] = useState('')
  const results = q.trim()
    ? [{ user_id: 'u9', name: 'SERA F', avatar: { seed: 640, palette: 2 } },
       { user_id: 'u6', name: 'LYRA M', avatar: { seed: 300, palette: 1 } }]
    : []

  return (
    <div className="r1w-shell">
      <div className="r1w-body">
        {/* Mirrors the real war room: content column + persistent friends rail */}
        <div className="r1w-cols">
          <div className="r1w-main-col">
            {/* NOT in a warband — what a first-time hunter actually sees */}
            <WarbandRoster
              title="WARBAND — NOT YET RAISED"
              hint="Raise or join a warband below, then invite hunters into these seats."
              members={[]}
              invites={[]}
              friends={FRIENDS}
              roles={ROLES}
              roleList={ROLE_LIST}
              myId="u2"
              self={{ user_id: 'u2', name: 'JIN S', avatar: { seed: 991, palette: 2 } }}
              maxSlots={PARTY_MAX}
              partyMin={PARTY_MIN}
              onInvite={null}
              onCancelInvite={() => {}}
            />

            {/* Role picker — the grid that was overflowing the page */}
            <section className="r1w-step">
              <div className="r1w-step-head">
                <span className="r1w-step-num">01</span>
                <span className="r1w-step-title">CHOOSE YOUR SPECIALIZATION</span>
              </div>
              <div className="r1w-step-roles">
                <div className="r1w-roles-grid five">
                  {ROLE_LIST.map(r => (
                    <button key={r.id} className="r1w-role-card" style={{ '--role-c': r.color }}>
                      <div className="r1w-role-card-head">
                        <span className="r1w-role-glyph" style={{ color: r.color }}>{r.glyph}</span>
                        <span className="r1w-role-label">{r.label}</span>
                      </div>
                      <div className="r1w-role-owns" style={{ color: `${r.color}c0` }}>{r.owns}</div>
                      <div className="r1w-role-duty">{r.duty}</div>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section className="r1w-lobby-section">
              <div className="r1w-lobby-section-head">
                <span className="r1w-lobby-section-title">IN A WARBAND — THE LAST SHIFT</span>
              </div>
              <WarbandRoster
                members={MEMBERS}
                invites={INVITES}
                friends={FRIENDS}
                roles={ROLES}
                roleList={ROLE_LIST}
                leaderId="u1"
                myId="u2"
                maxSlots={PARTY_MAX}
                partyMin={PARTY_MIN}
                onInvite={async () => {}}
                onCancelInvite={() => {}}
                onSearch={setQ}
                searchValue={q}
                searchResults={results}
              />
            </section>
          </div>

          <FriendsRail
            friends={FRIENDS}
            requests={REQUESTS}
            searchValue={q}
            searchResults={results}
            onSearch={setQ}
            onAdd={() => {}}
            onRespond={() => {}}
            onInvite={() => {}}
            partyIds={new Set(['u1', 'u2', 'u3'])}
            invitedIds={new Set(['u4'])}
          />
        </div>
      </div>
    </div>
  )
}

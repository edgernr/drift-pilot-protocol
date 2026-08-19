import { useState } from 'react'
import './HunterSidebar.css'
import { useAuth } from '../context/AuthContext'
import { useNav } from '../context/NavigationContext'
import HunterSigil from './HunterSigil'

function fmt(n) { return (n ?? 0).toLocaleString() }

// Shared navigation rail for the standalone routes (guild dashboard, public
// profiles) so they aren't dead-ends. Renders ONLY for logged-in users — anon
// visitors to a public profile/guild still get a clean, full-width page.
//
// Dashboard "tabs" (home/skill-tree/raids/wallet/leaderboard) live inside the
// Dashboard screen's own `view` state, which it seeds from localStorage on mount
// (Dashboard.jsx). So from here we stash the target view then navigate to
// /dashboard — the correct tab is already selected on arrival.
export default function HunterSidebar({ active }) {
  const { user, profile, logout } = useAuth()
  const { goto } = useNav()
  const [open, setOpen] = useState(false)

  if (!user) return null

  const isAdmin = !!profile?.is_admin
  const tag = profile?.guild?.tag
  const balance = (profile?.totalHunt ?? 0) - (profile?.totalHuntSpent ?? 0)

  const openTab = (v) => { localStorage.setItem('dash-view', v); setOpen(false); goto('dashboard') }
  const go = (screen) => { setOpen(false); goto(screen) }

  return (
    <>
      <button className="hs-burger" onClick={() => setOpen(o => !o)} aria-label="Menu">☰</button>
      {open && <div className="hs-backdrop" onClick={() => setOpen(false)} />}

      <aside className={`hs-rail${open ? ' open' : ''}`}>
        <div className="hs-logo" onClick={() => go('landing')}>
          <svg width="140" height="34" viewBox="0 0 172 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="VOID SHARDS">
            <path d="M13 2L23 16L13 38L3 16Z" stroke="#f5c453" strokeWidth="1.4" strokeLinejoin="round"/>
            <path d="M13 2L23 16L13 18Z" fill="#f5c45330"/>
            <path d="M13 2L3 16L13 18Z" fill="#f5c45318"/>
            <path d="M23 16L13 38L13 18Z" fill="#f5c4530d"/>
            <path d="M3 16L13 38L13 18Z" fill="#f5c45516"/>
            <path d="M3 16H23" stroke="#f5c45340" strokeWidth="0.6"/>
            <path d="M13 2L16.5 7.5" stroke="white" strokeWidth="0.7" strokeLinecap="round" strokeOpacity="0.5"/>
            <text x="31" y="28" fontFamily="'Saira Condensed','Arial Narrow',Arial,sans-serif" fontSize="22" fontWeight="700" letterSpacing="1.5" fill="#eaf6f5">VOID</text>
            <text x="90" y="28" fontFamily="'Saira Condensed','Arial Narrow',Arial,sans-serif" fontSize="22" fontWeight="700" letterSpacing="1.5" fill="#3df0e8">SHARDS</text>
          </svg>
        </div>

        <div className="hs-group">
          <div className="hs-label">Hunter HQ</div>
          <div className="hs-list">
            <a onClick={() => openTab('home')}><span className="hs-ic">◈</span> Dashboard</a>
            <a onClick={() => openTab('skill-tree')}><span className="hs-ic">⟐</span> Skill Tree</a>
            <a onClick={() => openTab('raids')}><span className="hs-ic">※</span> Raids</a>
          </div>
        </div>

        <div className="hs-group">
          <div className="hs-label">Rewards</div>
          <div className="hs-list">
            <a onClick={() => openTab('wallet')}><span className="hs-ic">$</span> Shards Wallet</a>
            <a onClick={() => openTab('leaderboard')}><span className="hs-ic">♦</span> Leaderboard</a>
          </div>
        </div>

        <div className="hs-group">
          <div className="hs-label">Guild</div>
          <div className="hs-list">
            <a className={active === 'guild' ? 'active' : ''} onClick={() => go('guild')}>
              <span className="hs-ic">⬡</span> {tag ? <>Guild <span className="hs-tag">[{tag}]</span></> : 'Guilds'}
            </a>
          </div>
        </div>

        {isAdmin && (
          <div className="hs-group">
            <div className="hs-label">Admin</div>
            <div className="hs-list">
              <a onClick={() => go('dashboard/admin')}><span className="hs-ic">⬡</span> Association Command</a>
            </div>
          </div>
        )}

        <div className="hs-spacer" />

        <div className="hs-profile" onClick={() => go(`pilot/${user.id}`)} title="Your public profile">
          <div className="hs-avatar"><HunterSigil config={profile?.avatar} name={profile?.name} size="100%" /></div>
          <div className="hs-profile-meta">
            <div className="hs-profile-name">{profile?.name ?? 'Hunter'}</div>
            <div className="hs-profile-bal">{fmt(balance)} Shards</div>
          </div>
        </div>
        <a className="hs-logout" onClick={() => { setOpen(false); logout() }}>Sign out</a>
      </aside>
    </>
  )
}

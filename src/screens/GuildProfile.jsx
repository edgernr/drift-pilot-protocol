import { useState, useEffect } from 'react'
import './Guild.css'
import { useParams } from 'react-router-dom'
import { useNav } from '../context/NavigationContext'
import HunterSigil from '../components/HunterSigil'
import { computeLevelData, USERNAME_COLORS } from '../context/AuthContext'
import * as G from '../lib/guilds'

const ROLE_RANK  = { master: 0, officer: 1, member: 2 }
const ROLE_LABEL = { master: 'MASTER', officer: 'OFFICER', member: 'MEMBER' }
function fmtNum(n) { return (n ?? 0).toLocaleString() }
function fmtDate(iso) { return iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '' }

// Public, read-only guild page (/guild/:id). Reads the anon-granted views.
export default function GuildProfile() {
  const { id } = useParams()
  const { goto } = useNav()
  const [guild, setGuild]     = useState(null)
  const [roster, setRoster]   = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let alive = true
    async function load() {
      const [{ data: g }, { data: r }] = await Promise.all([G.fetchGuild(id), G.fetchRoster(id)])
      if (!alive) return
      if (!g) { setNotFound(true); setLoading(false); return }
      setGuild(g)
      setRoster((r ?? []).slice().sort((a, b) =>
        (ROLE_RANK[a.role] - ROLE_RANK[b.role]) || (Number(b.total_xp) - Number(a.total_xp))))
      setLoading(false)
    }
    load()
    return () => { alive = false }
  }, [id])

  if (loading) return <div className="guild-wrap"><div className="g-state">LOADING GUILD…</div></div>
  if (notFound) return (
    <div className="guild-wrap">
      <div className="g-state">
        <div style={{ fontSize: 32, marginBottom: 8 }}>⊘</div>
        GUILD NOT FOUND
        <div style={{ marginTop: 16 }}><a className="g-back" onClick={() => goto('landing')}>← voidshards.net</a></div>
      </div>
    </div>
  )

  return (
    <div className="guild-wrap">
      <header className="g-header">
        <a className="g-back" onClick={() => goto('landing')}>← voidshards.net</a>
        <h1 className="g-title">{guild.name} <span className="g-tag g-tag-lg">[{guild.tag}]</span></h1>
        <p className="g-subtitle">Association-licensed guild</p>
      </header>

      <div className="g-grid">
        <section className="g-panel g-guild-hero">
          <div className="g-hero-emblem"><HunterSigil config={guild.emblem} name={guild.name} size="100%" variant="emblem" /></div>
          <div className="g-hero-meta">
            {guild.description && <p className="g-hero-desc">{guild.description}</p>}
            <div className="g-stats">
              <div className="g-stat"><div className="g-stat-val">{guild.member_count}/{guild.member_cap}</div><div className="g-stat-lbl">MEMBERS</div></div>
              <div className="g-stat"><div className="g-stat-val" style={{ color: 'var(--g-cyan)' }}>{fmtNum(guild.combined_xp)}</div><div className="g-stat-lbl">COMBINED XP</div></div>
              <div className="g-stat"><div className="g-stat-val" style={{ color: 'var(--g-gold)' }}>{fmtNum(guild.combined_clears)}</div><div className="g-stat-lbl">GATES CLEARED</div></div>
            </div>
          </div>
        </section>

        <div className="g-col">
          {guild.motd && (
            <section className="g-panel g-motd">
              <div className="g-panel-head"><h2>MESSAGE OF THE DAY</h2></div>
              <p className="g-motd-text">{guild.motd}</p>
            </section>
          )}
          <section className="g-panel">
            <div className="g-panel-head"><h2>ROSTER</h2><span className="g-count">{roster.length}</span></div>
            <div className="g-roster">
              {roster.map(m => {
                const ld = computeLevelData(Number(m.total_xp))
                const color = USERNAME_COLORS[m.username_color]?.value
                return (
                  <div key={m.user_id} className="g-member" onClick={() => goto(`pilot/${m.user_id}`)}>
                    <div className="g-member-sigil"><HunterSigil config={m.avatar} name={m.name} size="100%" /></div>
                    <div className="g-member-meta">
                      <div className="g-member-name" style={color ? { color } : undefined}>{m.name}{m.is_founder && <span className="g-founder">◈</span>}</div>
                      <div className="g-member-sub">LV.{ld.level} {ld.label} · joined {fmtDate(m.joined_at)}</div>
                    </div>
                    <span className={`g-role g-role-${m.role}`}>{ROLE_LABEL[m.role]}</span>
                  </div>
                )
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

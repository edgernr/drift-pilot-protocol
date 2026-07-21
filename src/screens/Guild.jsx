import { useState, useEffect, useCallback } from 'react'
import './Guild.css'
import { useAuth, computeLevelData, USERNAME_COLORS } from '../context/AuthContext'
import { useNav } from '../context/NavigationContext'
import HunterSigil, { SIGIL_PALETTES } from '../components/HunterSigil'
import { useGuildPresence } from '../hooks/useGuildPresence'
import * as G from '../lib/guilds'

const ROLE_RANK  = { master: 0, officer: 1, member: 2 }
const ROLE_LABEL = { master: 'MASTER', officer: 'OFFICER', member: 'MEMBER' }
function randomSeed() { return Math.floor(Math.random() * 1e9) }
function fmtNum(n) { return (n ?? 0).toLocaleString() }
function fmtDate(iso) { return iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '' }

export default function Guild() {
  const { user, profile, refreshProfile } = useAuth()
  const { goto } = useNav()

  // shared UI state
  const [busy, setBusy]   = useState(false)
  const [err, setErr]     = useState(null)
  const [toast, setToast] = useState(null)
  const [confirmLeave, setConfirmLeave] = useState(false)

  // no-guild data
  const [directory, setDirectory] = useState(null)
  const [invites, setInvites]     = useState([])
  const [applied, setApplied]     = useState(() => new Set())
  const [search, setSearch]       = useState('')

  // create form
  const [cName, setCName] = useState('')
  const [cTag, setCTag]   = useState('')
  const [emblem, setEmblem] = useState(() => ({ seed: randomSeed(), palette: 0 }))

  // in-guild data
  const [guild, setGuild]   = useState(null)
  const [roster, setRoster] = useState([])
  const [applications, setApplications] = useState([])

  const guildId = profile?.guildId ?? null
  const onlineIds = useGuildPresence(guildId, user?.id)

  const flash = useCallback((msg) => { setToast(msg); setTimeout(() => setToast(null), 2600) }, [])

  const load = useCallback(async () => {
    if (!profile) return
    if (profile.guildId) {
      const canManage = profile.guildRole === 'master' || profile.guildRole === 'officer'
      const [{ data: g }, { data: r }, apps] = await Promise.all([
        G.fetchGuild(profile.guildId),
        G.fetchRoster(profile.guildId),
        canManage ? G.fetchApplications(profile.guildId) : Promise.resolve({ data: [] }),
      ])
      setGuild(g ?? null)
      setRoster((r ?? []).slice().sort((a, b) =>
        (ROLE_RANK[a.role] - ROLE_RANK[b.role]) || (Number(b.total_xp) - Number(a.total_xp))))
      setApplications(apps?.data ?? [])
    } else {
      const [{ data: dir }, { data: inv }] = await Promise.all([
        G.fetchDirectory(),
        G.fetchMyInvites(user.id),
      ])
      setDirectory(dir ?? [])
      setInvites(inv ?? [])
    }
  }, [profile?.guildId, user?.id])   // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load() }, [load])

  // ── actions ────────────────────────────────────────────────────────────────
  async function run(fn, { after } = {}) {
    setBusy(true); setErr(null)
    const { error } = await fn()
    setBusy(false)
    if (error) { setErr(G.guildError(error)); return false }
    if (after) await after()
    return true
  }

  async function handleCreate(e) {
    e.preventDefault()
    const ok = await run(() => G.createGuild(cName, cTag, emblem), {
      after: async () => { await refreshProfile(); flash('Guild founded'); setCName(''); setCTag('') },
    })
    if (!ok) return
  }
  async function handleApply(gid) {
    const ok = await run(() => G.applyToGuild(gid))
    if (ok) { setApplied(s => new Set(s).add(gid)); flash('Application sent') }
  }
  async function handleAcceptInvite(reqId) {
    await run(() => G.respondRequest(reqId, true), { after: async () => { await refreshProfile(); flash('Joined guild') } })
  }
  async function handleDeclineInvite(reqId) {
    await run(() => G.respondRequest(reqId, false), { after: load })
  }
  async function handleLeave() {
    await run(() => G.leaveGuild(), { after: async () => { setConfirmLeave(false); await refreshProfile(); flash('Left guild') } })
  }

  // ── management (P3) ──
  async function handleInvite(uid) {
    await run(() => G.inviteToGuild(guildId, uid), { after: async () => { flash('Invite sent'); await load() } })
  }
  async function handleRespondApp(reqId, accept) {
    await run(() => G.respondRequest(reqId, accept), { after: load })
  }
  async function handleKick(uid) {
    await run(() => G.kickMember(uid), { after: async () => { flash('Removed from guild'); await load() } })
  }
  async function handleSetRole(uid, role) {
    await run(() => G.setRole(uid, role), { after: load })
  }
  async function handleTransfer(uid) {
    await run(() => G.transferMaster(uid), { after: async () => { await refreshProfile(); flash('Leadership transferred'); await load() } })
  }
  async function handleDisband() {
    await run(() => G.disbandGuild(), { after: async () => { await refreshProfile(); flash('Guild disbanded') } })
  }
  function handleSaveMotd(text) {
    return run(() => G.setMotd(text), { after: async () => { flash('MOTD updated'); await load() } })
  }
  function handleSaveMeta(description, emblemCfg) {
    return run(() => G.updateGuildMeta(description, emblemCfg), { after: async () => { flash('Guild updated'); await load() } })
  }
  function handleRename(name, tag) {
    return run(() => G.renameGuild(name, tag), { after: async () => { flash('Guild renamed'); await load() } })
  }

  // ── render ───────────────────────────────────────────────────────────────
  if (!profile) return (
    <div className="guild-wrap"><div className="g-state">LOADING GUILD RECORDS…</div></div>
  )

  const filtered = (directory ?? []).filter(g => {
    const q = search.trim().toLowerCase()
    return !q || g.name.toLowerCase().includes(q) || g.tag.toLowerCase().includes(q)
  })

  return (
    <div className="guild-wrap">
      <header className="g-header">
        <a className="g-back" onClick={() => goto('dashboard')}>← Seeker HQ</a>
        <h1 className="g-title">GUILDS</h1>
        <p className="g-subtitle">Licensed hunter crews of the Association.</p>
      </header>

      {err && <div className="g-error" onClick={() => setErr(null)}>{err} <span className="g-error-x">✕</span></div>}
      {toast && <div className="g-toast">{toast}</div>}

      {guildId ? (
        // ══════════ IN A GUILD ══════════
        <GuildHome
          guild={guild} roster={roster} profile={profile} onlineIds={onlineIds}
          goto={goto} busy={busy} confirmLeave={confirmLeave}
          setConfirmLeave={setConfirmLeave} onLeave={handleLeave}
          mgmt={{
            applications,
            onInvite: handleInvite, onRespondApp: handleRespondApp, onKick: handleKick,
            onSetRole: handleSetRole, onTransfer: handleTransfer, onDisband: handleDisband,
            onSaveMotd: handleSaveMotd, onSaveMeta: handleSaveMeta, onRename: handleRename,
          }}
        />
      ) : (
        // ══════════ NO GUILD ══════════
        <div className="g-grid">
          <section className="g-panel g-found">
            <div className="g-panel-head"><h2>FORM A GUILD</h2><span className="g-free">FREE TO FOUND</span></div>
            <p className="g-pitch">Rally a crew under your own banner. As master you can invite hunters, appoint officers, and set the guild's mark. The Association licenses it; the tower remembers it.</p>
            <form className="g-form" onSubmit={handleCreate}>
              <div className="g-emblem-pick">
                <div className="g-emblem-preview">
                  <HunterSigil config={emblem} name={cName || 'GUILD'} size="100%" variant="emblem" />
                </div>
                <div className="g-emblem-controls">
                  <div className="g-swatches">
                    {SIGIL_PALETTES.map((p, i) => (
                      <button key={p.key} type="button" title={p.key}
                        onClick={() => setEmblem(e => ({ ...e, palette: i }))}
                        className={`g-swatch${emblem.palette === i ? ' sel' : ''}`}
                        style={{ background: p.accent }} />
                    ))}
                  </div>
                  <button type="button" className="g-btn g-btn-ghost" onClick={() => setEmblem(e => ({ ...e, seed: randomSeed() }))}>⟳ Reroll emblem</button>
                </div>
              </div>
              <div className="g-field-row">
                <label className="g-field">
                  <span className="g-label">Guild name</span>
                  <input className="g-input" value={cName} maxLength={24}
                    onChange={e => setCName(e.target.value)} placeholder="Void Wardens" />
                </label>
                <label className="g-field g-field-tag">
                  <span className="g-label">Tag</span>
                  <input className="g-input g-input-tag" value={cTag} maxLength={5}
                    onChange={e => setCTag(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                    placeholder="VWARD" />
                </label>
              </div>
              <button className="g-btn g-btn-primary" type="submit" disabled={busy || cName.trim().length < 3 || cTag.length < 2}>
                {busy ? 'Founding…' : 'Found Guild'}
              </button>
            </form>
          </section>

          <div className="g-col">
            {invites.length > 0 && (
              <section className="g-panel">
                <div className="g-panel-head"><h2>INVITATIONS</h2><span className="g-count">{invites.length}</span></div>
                <div className="g-invite-list">
                  {invites.map(iv => (
                    <div key={iv.id} className="g-invite">
                      <div className="g-emblem-sm"><HunterSigil config={iv.guilds?.emblem} name={iv.guilds?.name} size="100%" variant="emblem" /></div>
                      <div className="g-invite-meta">
                        <div className="g-invite-name">{iv.guilds?.name}</div>
                        <div className="g-tag">[{iv.guilds?.tag}]</div>
                      </div>
                      <div className="g-invite-actions">
                        <button className="g-btn g-btn-primary g-btn-sm" disabled={busy} onClick={() => handleAcceptInvite(iv.id)}>Accept</button>
                        <button className="g-btn g-btn-ghost g-btn-sm" disabled={busy} onClick={() => handleDeclineInvite(iv.id)}>Decline</button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="g-panel">
              <div className="g-panel-head"><h2>DIRECTORY</h2>
                <input className="g-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search guilds…" />
              </div>
              {directory === null ? (
                <div className="g-state">Loading directory…</div>
              ) : filtered.length === 0 ? (
                <div className="g-state">No guilds yet. Found the first one.</div>
              ) : (
                <div className="g-dir-list">
                  {filtered.map(g => (
                    <div key={g.id} className="g-dir-row">
                      <div className="g-emblem-sm"><HunterSigil config={g.emblem} name={g.name} size="100%" variant="emblem" /></div>
                      <div className="g-dir-meta">
                        <div className="g-dir-name">{g.name} <span className="g-tag">[{g.tag}]</span></div>
                        <div className="g-dir-sub">{g.member_count}/{g.member_cap} hunters · {fmtNum(g.combined_xp)} XP</div>
                      </div>
                      {applied.has(g.id)
                        ? <span className="g-applied">Applied ✓</span>
                        : <button className="g-btn g-btn-ghost g-btn-sm" disabled={busy || g.member_count >= g.member_cap}
                            onClick={() => handleApply(g.id)}>{g.member_count >= g.member_cap ? 'Full' : 'Apply'}</button>}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      )}
    </div>
  )
}

// ── In-guild overview + roster + management ──────────────────────────────────
function GuildHome({ guild, roster, profile, onlineIds, goto, busy, confirmLeave, setConfirmLeave, onLeave, mgmt }) {
  const myRole = profile?.guildRole
  const canManage = myRole === 'master' || myRole === 'officer'
  const isMaster = myRole === 'master'

  const [arm, setArm] = useState(null)              // "kind:uid" two-click confirm key
  const [motdDraft, setMotdDraft] = useState(null)  // null = not editing
  const [inviteQ, setInviteQ] = useState('')
  const [inviteResults, setInviteResults] = useState([])

  useEffect(() => {
    if (!canManage) return
    const q = inviteQ.trim()
    if (q.length < 2) { setInviteResults([]); return }
    let alive = true
    G.searchHunters(q).then(({ data }) => { if (alive) setInviteResults((data ?? []).filter(u => u.id !== profile.id)) })
    return () => { alive = false }
  }, [inviteQ, canManage, profile.id])

  function armTwoClick(key) {
    setArm(key)
    setTimeout(() => setArm(a => (a === key ? null : a)), 2600)
  }
  const armed = (k) => arm === k

  if (!guild) return <div className="g-state">Loading your guild…</div>

  return (
    <div className="g-grid">
      <section className="g-panel g-guild-hero">
        <div className="g-hero-emblem"><HunterSigil config={guild.emblem} name={guild.name} size="100%" variant="emblem" /></div>
        <div className="g-hero-meta">
          <div className="g-hero-name">{guild.name} <span className="g-tag g-tag-lg">[{guild.tag}]</span></div>
          <div className="g-hero-role">Your rank · <span className={`g-role g-role-${myRole}`}>{ROLE_LABEL[myRole]}</span></div>
          {guild.description && <p className="g-hero-desc">{guild.description}</p>}
          <div className="g-stats">
            <div className="g-stat"><div className="g-stat-val">{guild.member_count}/{guild.member_cap}</div><div className="g-stat-lbl">MEMBERS</div></div>
            <div className="g-stat"><div className="g-stat-val" style={{ color: 'var(--g-cyan)' }}>{fmtNum(guild.combined_xp)}</div><div className="g-stat-lbl">COMBINED XP</div></div>
            <div className="g-stat"><div className="g-stat-val" style={{ color: 'var(--g-gold)' }}>{fmtNum(guild.combined_clears)}</div><div className="g-stat-lbl">GATES CLEARED</div></div>
          </div>
        </div>
      </section>

      <div className="g-col">
        {/* MOTD — editable for officers/master */}
        <section className="g-panel g-motd">
          <div className="g-panel-head"><h2>MESSAGE OF THE DAY</h2>
            {canManage && motdDraft === null && <button className="g-btn g-btn-ghost g-btn-sm" style={{ marginLeft: 'auto' }} onClick={() => setMotdDraft(guild.motd ?? '')}>Edit</button>}
          </div>
          {motdDraft === null ? (
            <p className="g-motd-text">{guild.motd || <span style={{ color: 'var(--g-ink-faint)' }}>No message set.</span>}</p>
          ) : (
            <div className="g-edit">
              <textarea className="g-textarea" maxLength={280} value={motdDraft} onChange={e => setMotdDraft(e.target.value)} placeholder="Rally your crew…" />
              <div className="g-edit-actions">
                <button className="g-btn g-btn-primary g-btn-sm" disabled={busy} onClick={async () => { if (await mgmt.onSaveMotd(motdDraft)) setMotdDraft(null) }}>Save</button>
                <button className="g-btn g-btn-ghost g-btn-sm" onClick={() => setMotdDraft(null)}>Cancel</button>
              </div>
            </div>
          )}
        </section>

        {/* Invite + applications */}
        {canManage && (
          <section className="g-panel">
            <div className="g-panel-head"><h2>MANAGE</h2></div>
            <div className="g-field" style={{ position: 'relative' }}>
              <span className="g-label">Invite a hunter</span>
              <input className="g-input" value={inviteQ} onChange={e => setInviteQ(e.target.value)} placeholder="Search by name…" />
              {inviteResults.length > 0 && (
                <div className="g-invite-drop">
                  {inviteResults.map(u => (
                    <div key={u.id} className="g-invite-opt">
                      <div className="g-emblem-sm" style={{ width: 28, height: 28 }}><HunterSigil config={u.avatar} name={u.name} size="100%" /></div>
                      <span className="g-invite-opt-name">{u.name}</span>
                      <button className="g-btn g-btn-ghost g-btn-sm" disabled={busy} onClick={() => { mgmt.onInvite(u.id); setInviteQ('') }}>Invite</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {mgmt.applications.length > 0 && (
              <div style={{ marginTop: 14 }}>
                <span className="g-label">Applications ({mgmt.applications.length})</span>
                <div className="g-invite-list" style={{ marginTop: 8 }}>
                  {mgmt.applications.map(app => (
                    <div key={app.id} className="g-invite">
                      <div className="g-emblem-sm"><HunterSigil config={app.public_profiles?.avatar} name={app.public_profiles?.name} size="100%" /></div>
                      <div className="g-invite-meta"><div className="g-invite-name">{app.public_profiles?.name ?? 'Seeker'}</div></div>
                      <div className="g-invite-actions">
                        <button className="g-btn g-btn-primary g-btn-sm" disabled={busy} onClick={() => mgmt.onRespondApp(app.id, true)}>Accept</button>
                        <button className="g-btn g-btn-ghost g-btn-sm" disabled={busy} onClick={() => mgmt.onRespondApp(app.id, false)}>Decline</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        <section className="g-panel">
          <div className="g-panel-head"><h2>ROSTER</h2><span className="g-count">{roster.length}</span></div>
          <div className="g-roster">
            {roster.map(m => {
              const ld = computeLevelData(Number(m.total_xp))
              const color = USERNAME_COLORS[m.username_color]?.value
              const online = onlineIds.has(m.user_id)
              const isSelf = m.user_id === profile.id
              const canKick = canManage && !isSelf && m.role !== 'master' && (isMaster || m.role === 'member')
              const canRole = isMaster && !isSelf && m.role !== 'master'
              const canXfer = isMaster && !isSelf && m.role !== 'master'
              return (
                <div key={m.user_id} className={`g-member${isSelf ? ' me' : ''}`}>
                  <div className="g-member-sigil" style={{ cursor: 'pointer' }} onClick={() => goto(`pilot/${m.user_id}`)}>
                    <HunterSigil config={m.avatar} name={m.name} size="100%" />
                    <span className={`g-presence${online ? ' on' : ''}`} title={online ? 'Online' : 'Offline'} />
                  </div>
                  <div className="g-member-meta" style={{ cursor: 'pointer' }} onClick={() => goto(`pilot/${m.user_id}`)}>
                    <div className="g-member-name" style={color ? { color } : undefined}>
                      {m.name}{m.is_founder && <span className="g-founder" title="Founder">◈</span>}
                    </div>
                    <div className="g-member-sub">LV.{ld.level} {ld.label} · joined {fmtDate(m.joined_at)}</div>
                  </div>
                  <span className={`g-role g-role-${m.role}`}>{ROLE_LABEL[m.role]}</span>
                  {(canKick || canRole || canXfer) && (
                    <div className="g-member-actions">
                      {canRole && (m.role === 'member'
                        ? <button className="g-mact" disabled={busy} title="Promote to officer" onClick={() => mgmt.onSetRole(m.user_id, 'officer')}>▲</button>
                        : <button className="g-mact" disabled={busy} title="Demote to member" onClick={() => mgmt.onSetRole(m.user_id, 'member')}>▼</button>)}
                      {canXfer && (armed(`xfer:${m.user_id}`)
                        ? <button className="g-mact g-mact-hot" disabled={busy} onClick={() => { mgmt.onTransfer(m.user_id); setArm(null) }}>Sure?</button>
                        : <button className="g-mact" title="Transfer leadership" onClick={() => armTwoClick(`xfer:${m.user_id}`)}>★</button>)}
                      {canKick && (armed(`kick:${m.user_id}`)
                        ? <button className="g-mact g-mact-hot" disabled={busy} onClick={() => { mgmt.onKick(m.user_id); setArm(null) }}>Sure?</button>
                        : <button className="g-mact" title="Remove from guild" onClick={() => armTwoClick(`kick:${m.user_id}`)}>✕</button>)}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {isMaster && (
          <MasterSettings guild={guild} busy={busy} mgmt={mgmt} armed={armed} armTwoClick={armTwoClick} setArm={setArm} />
        )}

        <div className="g-leave">
          {confirmLeave ? (
            <>
              <span className="g-leave-warn">{myRole === 'master' ? 'As master, leaving disbands the guild if you are alone, or requires a transfer first.' : 'Leave this guild?'}</span>
              <button className="g-btn g-btn-danger g-btn-sm" disabled={busy} onClick={onLeave}>Confirm</button>
              <button className="g-btn g-btn-ghost g-btn-sm" onClick={() => setConfirmLeave(false)}>Cancel</button>
            </>
          ) : (
            <button className="g-btn g-btn-ghost g-btn-sm" onClick={() => setConfirmLeave(true)}>Leave guild</button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Master-only settings: emblem/description, rename (cooldown), disband ──────
function MasterSettings({ guild, busy, mgmt, armed, armTwoClick, setArm }) {
  const [show, setShow] = useState(false)
  const [name, setName] = useState(guild.name)
  const [tag, setTag]   = useState(guild.tag)
  const [desc, setDesc] = useState(guild.description ?? '')
  const [emblem, setEmblem] = useState(guild.emblem?.seed != null ? guild.emblem : { seed: randomSeed(), palette: 0 })

  return (
    <section className="g-panel">
      <div className="g-panel-head"><h2>GUILD SETTINGS</h2>
        <button className="g-btn g-btn-ghost g-btn-sm" style={{ marginLeft: 'auto' }} onClick={() => setShow(s => !s)}>{show ? 'Close' : 'Open'}</button>
      </div>
      {show && (
        <div className="g-settings">
          <div className="g-emblem-pick">
            <div className="g-emblem-preview"><HunterSigil config={emblem} name={name} size="100%" variant="emblem" /></div>
            <div className="g-emblem-controls">
              <div className="g-swatches">
                {SIGIL_PALETTES.map((p, i) => (
                  <button key={p.key} type="button" className={`g-swatch${emblem.palette === i ? ' sel' : ''}`} style={{ background: p.accent }} onClick={() => setEmblem(e => ({ ...e, palette: i }))} />
                ))}
              </div>
              <button type="button" className="g-btn g-btn-ghost g-btn-sm" onClick={() => setEmblem(e => ({ ...e, seed: randomSeed() }))}>⟳ Reroll emblem</button>
            </div>
          </div>
          <label className="g-field">
            <span className="g-label">Description</span>
            <textarea className="g-textarea" maxLength={1000} value={desc} onChange={e => setDesc(e.target.value)} placeholder="What is your guild about?" />
          </label>
          <button className="g-btn g-btn-primary g-btn-sm" disabled={busy} onClick={() => mgmt.onSaveMeta(desc, emblem)}>Save emblem & description</button>

          <div className="g-divider2" />
          <div className="g-field-row">
            <label className="g-field"><span className="g-label">Rename</span>
              <input className="g-input" maxLength={24} value={name} onChange={e => setName(e.target.value)} />
            </label>
            <label className="g-field g-field-tag"><span className="g-label">Tag</span>
              <input className="g-input g-input-tag" maxLength={5} value={tag} onChange={e => setTag(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))} />
            </label>
          </div>
          <button className="g-btn g-btn-ghost g-btn-sm" disabled={busy} onClick={() => mgmt.onRename(name, tag)}>Rename guild · 7-day cooldown</button>

          <div className="g-divider2" />
          {armed('disband')
            ? <button className="g-btn g-btn-danger g-btn-sm" disabled={busy} onClick={() => { mgmt.onDisband(); setArm(null) }}>Confirm disband — permanent</button>
            : <button className="g-btn g-btn-danger g-btn-sm" onClick={() => armTwoClick('disband')}>Disband guild</button>}
        </div>
      )}
    </section>
  )
}

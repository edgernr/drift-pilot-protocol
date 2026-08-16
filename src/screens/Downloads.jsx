import { useState, useEffect } from 'react'
import { useNav } from '../context/NavigationContext'
import { useAuth } from '../context/AuthContext'

// Installers are published to GitHub Releases by the desktop-release CI workflow.
// NOTE: the repo/releases must be PUBLIC for these (unauthenticated) reads to work.
const REPO = 'edgernr/hunter-protocol'
const RELEASES_PAGE = `https://github.com/${REPO}/releases`

const OS_TARGETS = [
  { key: 'win',   label: 'Windows', icon: '⊞', sub: 'Windows 10/11 · .exe installer', match: (n) => /\.exe$/i.test(n) },
  { key: 'mac',   label: 'macOS',   icon: '', sub: 'Apple Silicon · unzip → Applications', match: (n) => /\.dmg$/i.test(n) || (/\.zip$/i.test(n) && /(mac|darwin|osx)/i.test(n)) },
  { key: 'linux', label: 'Linux',   icon: '🐧', sub: 'AppImage · .deb also available', match: (n) => /\.appimage$/i.test(n) },
]

function detectOS() {
  const ua = (navigator.userAgent || '') + ' ' + (navigator.platform || '')
  if (/Win/i.test(ua)) return 'win'
  if (/Mac|iPhone|iPad/i.test(ua)) return 'mac'
  if (/Linux|Android/i.test(ua)) return 'linux'
  return null
}

function fmtSize(bytes) {
  if (!bytes) return ''
  return `${Math.round(bytes / 1048576)} MB`
}

export default function Downloads() {
  const { goto } = useNav()
  const { user } = useAuth()
  const [state, setState] = useState({ status: 'loading', release: null })
  const myOS = detectOS()

  useEffect(() => {
    let alive = true
    fetch(`https://api.github.com/repos/${REPO}/releases/latest`, { headers: { Accept: 'application/vnd.github+json' } })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => { if (alive) setState({ status: 'ok', release: data }) })
      .catch(() => { if (alive) setState({ status: 'empty', release: null }) })
    return () => { alive = false }
  }, [])

  const assets = state.release?.assets ?? []
  const version = state.release?.tag_name || state.release?.name || ''
  const assetFor = (target) => assets.find(a => target.match(a.name))

  return (
    <div className="container" style={{ maxWidth: 980, paddingTop: 110, paddingBottom: 80 }}>
      <nav className="nav">
        <div className="logo" style={{ cursor: 'pointer' }} onClick={() => goto('landing')}>
          <img src="/LOGO.svg" alt="VOID SHARDS" style={{ height: 40 }} />
          <span className="chip chip-teal" style={{ fontSize: 9, padding: '2px 8px' }}>BETA</span>
        </div>
        <ul>
          <li><a href="/#worlds">Worlds</a></li>
          <li><a href="/#pricing">Pricing</a></li>
          <li><a href="/#academy" style={{ color: 'var(--builder-gold, oklch(0.86 0.19 80))' }}>Academy</a></li>
          <li><a href="#" onClick={(e) => e.preventDefault()} style={{ color: 'var(--teal)' }}>Download</a></li>
        </ul>
        {user
          ? <button className="btn btn-ghost btn-sm" onClick={() => goto('dashboard')}>Dashboard →</button>
          : <button className="btn btn-ghost btn-sm" onClick={() => goto('signup')}>Sign Up / Log In →</button>
        }
      </nav>
        <div className="eyebrow" style={{ color: 'var(--teal)', fontFamily: 'var(--f-mono)', fontSize: 12, letterSpacing: '0.16em' }}>DESKTOP APP</div>
        <h1 style={{ fontSize: 40, margin: '10px 0 8px' }}>
          Download <span className="gradient-text">Void Shards</span>
        </h1>
        <p style={{ color: 'var(--ink-2)', maxWidth: 620, lineHeight: 1.6 }}>
          The full academy and raids as a native desktop app — with offline-friendly loading, a streak tray indicator, and automatic updates.
          {version && <> Current version <strong style={{ color: 'var(--ink-1)' }}>{version}</strong>.</>}
        </p>

        {state.status === 'loading' && (
          <p style={{ marginTop: 28, fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--ink-3)' }}>⟳ Fetching the latest release…</p>
        )}

        {state.status === 'empty' && (
          <div className="panel" style={{ marginTop: 28, padding: 20 }}>
            <p style={{ color: 'var(--ink-2)', lineHeight: 1.6, margin: 0 }}>
              Builds are being prepared. Check the{' '}
              <a href={RELEASES_PAGE} target="_blank" rel="noreferrer" style={{ color: 'var(--teal)' }}>releases page</a>{' '}
              for the latest installers.
            </p>
          </div>
        )}

        {state.status === 'ok' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginTop: 32 }}>
            {OS_TARGETS.map(t => {
              const asset = assetFor(t)
              const mine = myOS === t.key
              return (
                <div key={t.key} className="panel" style={{
                  padding: 22, display: 'flex', flexDirection: 'column', gap: 10,
                  border: mine ? '1px solid var(--teal)' : '1px solid var(--line)',
                  boxShadow: mine ? '0 0 24px oklch(0.78 0.13 195 / 0.18)' : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 26 }}>{t.icon}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 16 }}>{t.label}{mine && <span style={{ color: 'var(--teal)', fontFamily: 'var(--f-mono)', fontSize: 10, marginLeft: 8 }}>YOUR OS</span>}</div>
                      <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-3)' }}>{t.sub}</div>
                    </div>
                  </div>
                  {asset ? (
                    <a className="btn btn-primary" href={asset.browser_download_url} style={{ textAlign: 'center' }}>
                      Download {fmtSize(asset.size) && `· ${fmtSize(asset.size)}`}
                    </a>
                  ) : (
                    <a className="btn btn-ghost" href={RELEASES_PAGE} target="_blank" rel="noreferrer" style={{ textAlign: 'center' }}>
                      Not in this release — see releases
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {(state.status === 'ok' || state.status === 'empty') && (
          <div style={{ marginTop: 28, fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-3)', lineHeight: 1.8 }}>
            <div>The app <strong style={{ color: 'var(--ink-2)' }}>auto-updates</strong> — install once and new versions arrive on launch.</div>
            <div>Installers are currently <strong style={{ color: 'var(--ink-2)' }}>unsigned</strong>. <strong style={{ color: 'var(--ink-2)' }}>Windows:</strong> <em>More info → Run anyway</em>. <strong style={{ color: 'var(--ink-2)' }}>macOS:</strong> if it says "damaged / can&apos;t be opened", run <code>xattr -cr &quot;/Applications/Void Shards.app&quot;</code> in Terminal (or System Settings → Privacy &amp; Security → <em>Open Anyway</em>) — it&apos;s the unsigned-app quarantine, not a corrupt file.</div>
            <div style={{ marginTop: 6 }}>All builds: <a href={RELEASES_PAGE} target="_blank" rel="noreferrer" style={{ color: 'var(--teal)' }}>{RELEASES_PAGE}</a></div>
          </div>
        )}
    </div>
  )
}

import { useCallback, useRef } from 'react'
import './HunterBrowser.css'

// ── Hunter Browser ────────────────────────────────────────────────────────────
// Diegetic in-game browser window — Association field-issue build. Floats over
// the arena, draggable by its title bar (same drag pattern as the code panel).
// Stays MOUNTED while closed (visibility:hidden, not display:none): the
// INSTANCE iframe is the shell's console-capture source and must keep executing
// and computing layout even when the window is out of sight.
//   INSTANCE     — live render of the player's code (srcdoc set by ArenaShell)
//   FIELD MANUAL — authored per-gate lesson (config.guide) + external links

function regionSlug(region) {
  const last = (region || 'gate').split('·').pop().trim()
  return last.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export default function HunterBrowser({ config, open, tab, onTab, onClose, onReload, frameRef }) {
  const winRef = useRef(null)

  // Drag by title bar — locks to absolute px on mousedown so there's no jump
  // when the default top/right anchoring is cleared on first move.
  const onDragStart = useCallback((e) => {
    if (e.target.closest('button')) return
    e.preventDefault()
    const win = winRef.current
    if (!win) return
    const rect       = win.getBoundingClientRect()
    const parentRect = (win.offsetParent ?? document.body).getBoundingClientRect()
    const initLeft = rect.left - parentRect.left
    const initTop  = rect.top  - parentRect.top
    win.style.left   = `${initLeft}px`
    win.style.top    = `${initTop}px`
    win.style.right  = 'auto'
    win.style.bottom = 'auto'
    const startX = e.clientX - initLeft
    const startY = e.clientY - initTop
    const onMove = (me) => {
      win.style.left = `${me.clientX - startX}px`
      win.style.top  = `${me.clientY - startY}px`
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [])

  const url = tab === 'guide'
    ? `vera://field-manual/${config.guide?.slug ?? config.id}`
    : `gate://${regionSlug(config.region)}/${config.id}/instance`

  return (
    <div className={`hb-window${open ? '' : ' hb-hidden'}`} ref={winRef}>

      {/* Title bar */}
      <div className="hb-titlebar" onMouseDown={onDragStart}>
        <span className="hb-title-dot" />
        <span className="hb-title-text">HUNTER BROWSER — ASSOCIATION FIELD BUILD</span>
        <button className="hb-close" onClick={onClose} title="Close (Ctrl+B)">✕</button>
      </div>

      {/* Tab strip */}
      <div className="hb-tabstrip">
        <button
          className={`hb-tab${tab === 'instance' ? ' active' : ''}`}
          onClick={() => onTab('instance')}
        >
          <span className="hb-tab-glyph">◈</span> INSTANCE
        </button>
        {config.guide && (
          <button
            className={`hb-tab${tab === 'guide' ? ' active' : ''}`}
            onClick={() => onTab('guide')}
          >
            <span className="hb-tab-glyph gold">✦</span> FIELD MANUAL
          </button>
        )}
      </div>

      {/* Address bar */}
      <div className="hb-addressbar">
        <button className="hb-reload" onClick={onReload} title="Reload instance">⟳</button>
        <span className="hb-url">{url}</span>
        <span className="hb-warded">◉ WARDED</span>
      </div>

      {/* Body — the iframe hides (never unmounts) while the manual is open */}
      <div className="hb-body">
        <iframe
          ref={frameRef}
          title="hunter browser instance"
          className={`hb-frame${tab === 'instance' ? '' : ' hb-frame-hidden'}`}
          sandbox="allow-scripts"
        />
        {tab === 'guide' && config.guide && <GuidePane guide={config.guide} />}
      </div>
    </div>
  )
}

function GuidePane({ guide }) {
  return (
    <div className="hb-guide">
      <div className="hb-guide-kicker">ASSOCIATION FIELD MANUAL · {guide.tag ?? 'FM-00'}</div>
      <h1 className="hb-guide-title">{guide.title}</h1>
      {guide.intro && <p className="hb-guide-intro">{guide.intro}</p>}
      {guide.sections.map((s, i) => (
        <section className="hb-guide-section" key={i}>
          <h2 className="hb-guide-heading">{s.heading}</h2>
          {/* body is config-authored HTML — same trust level as completion.body */}
          <p className="hb-guide-body" dangerouslySetInnerHTML={{ __html: s.body }} />
          {s.code && <pre className="hb-guide-code"><code>{s.code}</code></pre>}
        </section>
      ))}
      {guide.links?.length > 0 && (
        <div className="hb-guide-links">
          <div className="hb-guide-links-head">EXTERNAL ARCHIVES — OPENS OUTSIDE THE GATE</div>
          {guide.links.map((l, i) => (
            <a
              key={i}
              className="hb-guide-link"
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="hb-guide-link-arrow">↗</span>
              <span>
                <span className="hb-guide-link-label">{l.label}</span>
                {l.note && <span className="hb-guide-link-note">{l.note}</span>}
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

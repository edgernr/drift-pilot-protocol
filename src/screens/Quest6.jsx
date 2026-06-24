import { useState, useRef, useCallback, useEffect } from 'react'
import './Quest.css'
import './Quest6.css'
import Editor from '@monaco-editor/react'
import { useNav } from '../context/NavigationContext'
import { useAuth } from '../context/AuthContext'
import { useQuestAnalytics } from '../hooks/useQuestAnalytics'
import QuestQuiz from './QuestQuiz'
import { supabase } from '../lib/supabase'

// ─── HTML templates ────────────────────────────────────────────────────────────

const VARIANT_HTML = [
  // Variant 0: Sector Dashboard
  `<div class="dashboard">
  <div class="top-bar"><span class="tb-logo">◈ EVA CITY</span><span class="tb-status">● SYSTEMS NOMINAL</span></div>
  <nav class="sidebar">
    <a class="side-link active" href="#">Overview</a>
    <a class="side-link" href="#">Districts</a>
    <a class="side-link" href="#">Signals</a>
    <a class="side-link" href="#">Vault</a>
    <a class="side-link" href="#">Settings</a>
  </nav>
  <main class="content-area">
    <h1 class="content-title">District Overview</h1>
    <p class="content-sub">All sectors reporting. Last sync: 06:44 UTC</p>
    <div class="card-grid">
      <div class="card"><div class="card-label">NODE ALPHA</div><div class="card-val">ONLINE</div><div class="card-desc">847 connections active</div></div>
      <div class="card"><div class="card-label">NODE BETA</div><div class="card-val">DEGRADED</div><div class="card-desc">3 channels offline</div></div>
      <div class="card"><div class="card-label">NODE GAMMA</div><div class="card-val">ONLINE</div><div class="card-desc">Full capacity reached</div></div>
      <div class="card"><div class="card-label">NODE DELTA</div><div class="card-val">STANDBY</div><div class="card-desc">Awaiting handshake</div></div>
      <div class="card"><div class="card-label">NODE EPSILON</div><div class="card-val">ONLINE</div><div class="card-desc">Routing optimised</div></div>
      <div class="card"><div class="card-label">NODE ZETA</div><div class="card-val">ONLINE</div><div class="card-desc">All checks cleared</div></div>
    </div>
  </main>
  <footer class="footer">◈ Void Shards — District Control System v4.1</footer>
</div>`,

  // Variant 1: Command Dashboard
  `<div class="dashboard">
  <div class="top-bar"><span class="tb-logo">⟐ COMMAND HQ</span><span class="tb-status">● OPS ACTIVE</span></div>
  <nav class="sidebar">
    <a class="side-link active" href="#">Operations</a>
    <a class="side-link" href="#">Intel</a>
    <a class="side-link" href="#">Deploy</a>
    <a class="side-link" href="#">Archive</a>
    <a class="side-link" href="#">Config</a>
  </nav>
  <main class="content-area">
    <h1 class="content-title">Mission Control</h1>
    <p class="content-sub">3 active operations. Zero casualties. Last update: 14:20 UTC</p>
    <div class="card-grid">
      <div class="card"><div class="card-label">OP PHOENIX</div><div class="card-val">ACTIVE</div><div class="card-desc">Team Alpha — 94% strength</div></div>
      <div class="card"><div class="card-label">OP NIGHTFALL</div><div class="card-val">STANDBY</div><div class="card-desc">Awaiting intel clearance</div></div>
      <div class="card"><div class="card-label">OP GRIDLOCK</div><div class="card-val">COMPLETE</div><div class="card-desc">All objectives cleared</div></div>
      <div class="card"><div class="card-label">OP VOIDGATE</div><div class="card-val">PENDING</div><div class="card-desc">Clearance required</div></div>
      <div class="card"><div class="card-label">OP CIPHER</div><div class="card-val">ACTIVE</div><div class="card-desc">Encryption in progress</div></div>
      <div class="card"><div class="card-label">OP SIGNAL</div><div class="card-val">ONLINE</div><div class="card-desc">Broadcast confirmed</div></div>
    </div>
  </main>
  <footer class="footer">⟐ Command Centre — Secure Operations Platform v2.8</footer>
</div>`,

  // Variant 2: Reactor Dashboard
  `<div class="dashboard">
  <div class="top-bar"><span class="tb-logo">※ REACTOR GRID</span><span class="tb-status">● CORES STABLE</span></div>
  <nav class="sidebar">
    <a class="side-link active" href="#">Cores</a>
    <a class="side-link" href="#">Cooling</a>
    <a class="side-link" href="#">Power</a>
    <a class="side-link" href="#">Safety</a>
    <a class="side-link" href="#">Logs</a>
  </nav>
  <main class="content-area">
    <h1 class="content-title">Reactor Status</h1>
    <p class="content-sub">6 monitoring stations. All readings within tolerance. 09:15 UTC</p>
    <div class="card-grid">
      <div class="card"><div class="card-label">PRIMARY CORE</div><div class="card-val">STABLE</div><div class="card-desc">100% output — nominal</div></div>
      <div class="card"><div class="card-label">SECONDARY CORE</div><div class="card-val">FLUCTUATING</div><div class="card-desc">±12% variance detected</div></div>
      <div class="card"><div class="card-label">COOLANT LOOP</div><div class="card-val">OPTIMAL</div><div class="card-desc">18°C across all channels</div></div>
      <div class="card"><div class="card-label">CONTAINMENT</div><div class="card-val">STRONG</div><div class="card-desc">Field at 98% capacity</div></div>
      <div class="card"><div class="card-label">POWER OUTPUT</div><div class="card-val">ONLINE</div><div class="card-desc">Grid load at 108%</div></div>
      <div class="card"><div class="card-label">SAFETY SYSTEM</div><div class="card-val">ACTIVE</div><div class="card-desc">All failsafes armed</div></div>
    </div>
  </main>
  <footer class="footer">※ Reactor Grid — Core Monitoring System v3.0</footer>
</div>`,
]

// ─── Starting CSS scaffold ─────────────────────────────────────────────────────

const START_CSS = `/* Gate 06 — The Infinite Grid
   Build EVA City's district dashboard using CSS Grid only.
   The HTML is pre-built. Your CSS defines the layout.

   Checks to pass:
   1. .dashboard uses display: grid (outer container)
   2. Grid defines a 240px sidebar column (grid-template-columns: 240px ...)
   3. .top-bar spans full width (grid-column: 1 / -1)
   4. .card-grid uses auto-fit (responsive columns without media queries)
   5. .card-grid uses minmax() for fluid column sizing
   6. .footer spans full width (grid-column: 1 / -1)
   7. No @media that changes grid-template-columns */

* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: system-ui, sans-serif;
  background: #0a0d18;
  color: #e8ecff;
  min-height: 100vh;
}

/* Outer dashboard layout — build with CSS Grid */
.dashboard {
  min-height: 100vh;
}

/* Top bar — must span full grid width */
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
  background: #111524;
  border-bottom: 1px solid rgba(180,200,255,0.08);
}

.tb-logo { font-weight: 700; font-size: 14px; letter-spacing: 0.06em; }
.tb-status { font-size: 11px; color: #22d3ee; letter-spacing: 0.08em; }

/* Sidebar navigation */
.sidebar {
  padding: 24px 16px;
  background: #0d1020;
  border-right: 1px solid rgba(180,200,255,0.06);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.side-link {
  display: block;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 13px;
  color: #7a8199;
  text-decoration: none;
  transition: color 0.2s, background 0.2s;
}

.side-link.active { color: #e8ecff; background: rgba(255,255,255,0.05); }
.side-link:hover { color: #b8c0d9; }

/* Main content area */
.content-area {
  padding: 32px;
  overflow: auto;
}

.content-title { font-size: 24px; font-weight: 600; margin-bottom: 6px; }
.content-sub { font-size: 13px; color: #7a8199; margin-bottom: 28px; }

/* Card grid — responsive without media queries */
.card-grid {
  gap: 16px;
}

.card {
  padding: 20px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(180,200,255,0.08);
  border-radius: 8px;
}

.card-label { font-size: 10px; letter-spacing: 0.1em; color: #4a5070; margin-bottom: 6px; }
.card-val { font-size: 18px; font-weight: 600; margin-bottom: 4px; }
.card-desc { font-size: 12px; color: #7a8199; }

/* Footer — must span full grid width */
.footer {
  padding: 16px 24px;
  font-size: 11px;
  color: #4a5070;
  letter-spacing: 0.06em;
  border-top: 1px solid rgba(180,200,255,0.06);
  background: #0d1020;
}
`

// ─── Quiz ─────────────────────────────────────────────────────────────────────

const QUIZ = {
  question: 'Your card grid stays responsive across all viewport sizes without any media queries. What makes that possible?',
  options: [
    'CSS Grid automatically detects screen size and adjusts column count using built-in breakpoint logic',
    'auto-fit combined with minmax lets the browser fit as many columns as possible at the minimum size, and stretches them to fill remaining space',
    'The fr unit makes columns fluid — they automatically collapse to one column when the screen is too narrow',
    'repeat(3, 1fr) creates three columns that shrink proportionally on smaller screens',
  ],
  correct: 1,
}

// ─── CSS checks (EXECUTION-BASED) ───────────────────────────────────────────────
// Each test runs against the RENDERED iframe (doc + its window) — it inspects the
// actual computed styles / real element geometry, so the CSS has to genuinely work.
// Two checks stay source-based (regex on `css`) by their nature: minmax() resolves to
// raw px tracks in computed values (undetectable post-render), and "no @media on grid
// columns" is purely a source-shape rule. Those keep the original regex tests.

const CSS_CHECKS = [
  {
    id: 'grid_container',
    label: 'Grid container established',
    hint: 'CSS Grid is activated on the parent — not the children. To create the dashboard grid, set the display mode on the outermost wrapper element.',
    // EXECUTION: the rendered .dashboard must actually be a grid container.
    test: (doc, win) => {
      const el = doc.querySelector('.dashboard')
      return !!el && win.getComputedStyle(el).display === 'grid'
    },
  },
  {
    id: 'sidebar_width',
    label: 'Sidebar fixed width defined',
    hint: 'Use grid-template-columns on .dashboard to define the column widths. The sidebar needs a fixed pixel value; the content area should fill the remaining space.',
    // EXECUTION: the resolved column track list must include a 240px track. The browser
    // reports grid-template-columns as resolved pixel widths, so a 240px sidebar column
    // shows up literally as "240px" in the computed track string.
    test: (doc, win) => {
      const el = doc.querySelector('.dashboard')
      if (!el) return false
      const cs = win.getComputedStyle(el)
      if (cs.display !== 'grid') return false
      return /(^|\s)240px(\s|$)/.test(cs.gridTemplateColumns)
    },
  },
  {
    id: 'topbar_span',
    label: 'Top bar spans full width',
    hint: 'To make a grid item stretch across every column, use grid-column with a starting line of 1 and a special end value that always means "the last line" regardless of column count.',
    // EXECUTION: a full-width (1 / -1) top bar renders as wide as the whole dashboard
    // grid, not just the sidebar/first column. Compare real rendered widths.
    test: (doc, win) => {
      const dash = doc.querySelector('.dashboard')
      const bar = doc.querySelector('.top-bar')
      if (!dash || !bar) return false
      if (win.getComputedStyle(dash).display !== 'grid') return false
      const dashW = dash.getBoundingClientRect().width
      const barW = bar.getBoundingClientRect().width
      return dashW > 0 && barW >= dashW - 2
    },
  },
  {
    id: 'auto_fit',
    label: 'Card grid uses auto-fit',
    hint: 'Instead of a fixed number of columns, CSS Grid can calculate how many will fit automatically. There\'s a keyword used inside repeat() that means "as many columns as will fit." Look it up.',
    // EXECUTION: auto-fit produces multiple resolved column tracks in a wide container,
    // and the cards actually sit side-by-side (multiple cards share a row top). A single
    // fixed/one-column grid would fail this.
    test: (doc, win) => {
      const grid = doc.querySelector('.card-grid')
      if (!grid) return false
      const cs = win.getComputedStyle(grid)
      if (cs.display !== 'grid') return false
      const tracks = cs.gridTemplateColumns.trim().split(/\s+/).filter(Boolean)
      if (tracks.length < 2) return false
      const cards = grid.querySelectorAll('.card')
      if (cards.length >= 2) {
        return Math.abs(cards[0].getBoundingClientRect().top - cards[1].getBoundingClientRect().top) < 5
      }
      return true
    },
  },
  {
    id: 'minmax',
    label: 'Card columns use minmax()',
    hint: 'When using auto-fit, each column needs a size range — a floor it won\'t shrink below, and a ceiling it can grow to. One CSS function defines both bounds in a single expression.',
    // REGEX FALLBACK: minmax() resolves to plain px tracks in computed styles, so it
    // can't be reliably detected post-render. Keep the original source-based test.
    test: (doc, win, css) => /minmax\s*\(/.test(css),
  },
  {
    id: 'footer_span',
    label: 'Footer spans full width',
    hint: 'The footer should span edge to edge, just like the top bar. The same grid-column technique that stretches items across all columns applies here too.',
    // EXECUTION: a full-width (1 / -1) footer renders as wide as the whole dashboard grid.
    test: (doc, win) => {
      const dash = doc.querySelector('.dashboard')
      const foot = doc.querySelector('.footer')
      if (!dash || !foot) return false
      if (win.getComputedStyle(dash).display !== 'grid') return false
      const dashW = dash.getBoundingClientRect().width
      const footW = foot.getBoundingClientRect().width
      return dashW > 0 && footW >= dashW - 2
    },
  },
  {
    id: 'no_grid_media',
    label: 'No media queries on grid columns',
    hint: 'If auto-fit and minmax are set up correctly, the columns reflow automatically at any screen width — adding a media query to override grid-template-columns means something else isn\'t quite right.',
    // REGEX FALLBACK: this is a pure source-shape rule (don't override grid columns inside
    // an @media). Nothing in the rendered output reveals it — keep the source-based test.
    test: (doc, win, css) => {
      const mediaBlocks = css.match(/@media[^{]*\{[^}]+\}/g) ?? []
      return !mediaBlocks.some(b => /grid-template-columns/.test(b))
    },
  },
]

// ─── Preview builder ──────────────────────────────────────────────────────────

function buildPreview(css, variantIndex) {
  const html = VARIANT_HTML[variantIndex]
  const reset = `<style>*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; } body { font-family: system-ui, sans-serif; } a { text-decoration: none; }</style>`
  return `<!DOCTYPE html><html><head>${reset}<style>${css}</style></head><body>${html}</body></html>`
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Quest6() {
  const { goto } = useNav()
  const { completeQuest } = useAuth()
  const { onPaste, trackChange, getAnalytics, pasteBlocked } = useQuestAnalytics()

  const [variantIdx] = useState(() => Math.floor(Math.random() * 3))
  const [cssCode, setCssCode] = useState(START_CSS)
  const [tab, setTab] = useState('code')
  const [quizOpen, setQuizOpen] = useState(false)
  const [activating, setActivating] = useState(false)
  const [dungeonEntry, setDungeonEntry] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [xpPopKey, setXpPopKey] = useState(0)
  const [xpPopText, setXpPopText] = useState('')
  const [aiReview, setAiReview] = useState(null)
  const [checks, setChecks] = useState(() => CSS_CHECKS.map(c => ({ ...c, passed: false })))

  const iframeRef = useRef(null)        // visible preview (on Preview tab)
  const checkIframeRef = useRef(null)   // offscreen iframe used to run the checks
  const prevPassRef = useRef(0)

  const passCount = checks.filter(c => c.passed).length
  const allPassed = passCount === CSS_CHECKS.length
  const xpEarned = passCount * 50
  const xpPct = (xpEarned / 350) * 100
  const failCount = CSS_CHECKS.length - passCount
  const bossHpPct = (failCount / CSS_CHECKS.length) * 100

  const updatePreview = useCallback((css) => {
    if (!iframeRef.current) return
    iframeRef.current.srcdoc = buildPreview(css, variantIdx)
  }, [variantIdx])

  useEffect(() => {
    if (tab === 'preview') updatePreview(cssCode)
  }, [cssCode, tab, updatePreview])

  // Run the execution-based checks against the offscreen iframe whenever the CSS settles.
  const runChecks = useCallback(() => {
    const iframe = checkIframeRef.current
    const doc = iframe?.contentDocument
    const win = iframe?.contentWindow
    if (!doc || !win || !doc.querySelector('.dashboard')) return
    const results = CSS_CHECKS.map(c => {
      let passed = false
      try { passed = !!c.test(doc, win, cssCode) } catch { passed = false }
      return { ...c, passed }
    })
    setChecks(results)
    const newPass = results.filter(r => r.passed).length
    if (newPass > prevPassRef.current) {
      setXpPopText(`+${(newPass - prevPassRef.current) * 50} XP`)
      setXpPopKey(k => k + 1)
    }
    prevPassRef.current = newPass
  }, [cssCode])

  useEffect(() => {
    const iframe = checkIframeRef.current
    if (!iframe) return
    const t = setTimeout(() => {
      iframe.onload = () => requestAnimationFrame(runChecks)
      iframe.srcdoc = buildPreview(cssCode, variantIdx)
    }, 350)
    return () => clearTimeout(t)
  }, [cssCode, variantIdx, runChecks])

  useEffect(() => {
    if (!allPassed) { setAiReview(null); return }
    setAiReview('loading')
    supabase.functions.invoke('grade-code', {
      body: {
        code: cssCode,
        quest_title: 'Gate 06 — The Infinite Grid',
        requirements: 'Build a CSS Grid dashboard layout: outer .dashboard uses display:grid with a 240px sidebar column, .top-bar spans full width (grid-column: 1 / -1), .card-grid uses repeat(auto-fit, minmax()) for responsive columns without media queries, .footer spans full width.',
        language: 'css',
      },
    }).then(({ data }) => setAiReview(data ?? null)).catch(() => setAiReview(null))
  }, [allPassed]) // eslint-disable-line react-hooks/exhaustive-deps

  const statusText = pasteBlocked
    ? '⊘ Paste disabled — type the code'
    : allPassed
    ? 'Grid sealed — engage the void lock'
    : `${failCount} check${failCount !== 1 ? 's' : ''} failing`

  function handleCssChange(value) {
    const val = value ?? ''
    setCssCode(val)
    trackChange(val.length)
  }

  // Monaco anti-cheat paste block. Monaco reads the clipboard directly on Ctrl/Cmd+V
  // (Clipboard API), bypassing the DOM 'paste' event — so we must override the paste
  // KEYBINDING, not just listen for paste events. Belt-and-suspenders: also block the
  // raw paste/drop DOM events (right-click, middle-click, drag-drop).
  function handleEditorMount(editor, monaco) {
    const flash = () => { try { onPaste({ preventDefault() {} }) } catch { /* best-effort */ } }
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV, flash)
    editor.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.Insert, flash)
    const dom = editor.getDomNode?.()
    if (dom) {
      const stop = (e) => { e.preventDefault(); e.stopPropagation(); flash() }
      dom.addEventListener('paste', stop, true)
      dom.addEventListener('drop', stop, true)
    }
  }

  function handleActivate() {
    if (!allPassed || activating) return
    setActivating(true)
    setTimeout(() => setQuizOpen(true), 600)
  }

  function handleQuizPass() {
    setQuizOpen(false)
    setTimeout(() => setDungeonEntry(true), 750)
    setTimeout(() => { setDungeonEntry(false); setModalOpen(true) }, 3350)
  }

  const slotClass = ['dq6-grid-seal', allPassed ? 'ready' : 'locked', activating ? 'activating' : ''].filter(Boolean).join(' ')

  return (
    <div className="dq-wrap dq-wrap-g6">

      {/* Offscreen iframe that actually runs the student's CSS for the checks */}
      <iframe
        ref={checkIframeRef}
        title="checks"
        aria-hidden="true"
        tabIndex={-1}
        style={{ position: 'fixed', left: -10000, top: 0, width: 1100, height: 800, border: 0, opacity: 0, pointerEvents: 'none' }}
      />

      <div className="dq-topbar">
        <span className="dq-back" onClick={() => goto('dashboard')}>← Dashboard</span>
        <div className="dq-topbar-center">
          <span className="dq-chapter">RANK D GATE · GATE 06 · BOSS</span>
          <span className="dq-title-label">The Infinite Grid</span>
        </div>
        <div className="dq-xp-row">
          <div className="dq-xp-bar-wrap">
            <div className="dq-xp-fill" style={{ width: `${xpPct}%` }} />
          </div>
          <span className="dq-xp-text">{xpEarned} / 350 XP</span>
        </div>
      </div>

      <div className="dq-main">

        {/* ── Left panel ──────────────────────────────────────────────────── */}
        <aside className="dq-brief">

          <div className="dq-scene-art">
            <div className="dq-scene-torch left" />
            <div className="dq-scene-torch right" />
            <div className={`dq6-scene-void${allPassed ? ' sealed' : ''}`}>
              {[0,1,2,3,4,5,6,7,8].map(i => (
                <div key={i} className={`dq6-tile dq6-tile-${i+1}${i < passCount ? ' lit' : ''}`} />
              ))}
              <div className={`dq6-mist${allPassed ? ' gone' : ''}`} />
            </div>
          </div>

          {/* Boss HP — White Void */}
          {!allPassed && (
            <div className="dq6-boss-hp">
              <div className="dq6-boss-name">
                <span className="dq6-boss-title">BOSS — THE WHITE VOID</span>
                <span className="dq6-boss-status">{failCount > 0 ? `${failCount} GAPS` : 'DEFEATED'}</span>
              </div>
              <div className="dq6-boss-bar">
                <div className="dq6-boss-bar-fill" style={{ width: `${bossHpPct}%` }} />
              </div>
            </div>
          )}

          <div className="dq-narrator-box">
            <div className="dq-narrator-label">▶ NARRATOR</div>
            <p className="dq-narrator-text">
              The White Void expands wherever structure is absent.
              Build the district dashboard with CSS Grid — fixed sidebar, responsive card grid, full-width header and footer.{' '}
              <strong>Seal every gap. Give the Void nowhere to grow.</strong>
            </p>
          </div>

          <div>
            <div className="dq-section-label">
              GRID INTEGRITY —{' '}
              <span style={{ color: allPassed ? 'var(--lime)' : 'oklch(0.62 0.22 25)' }}>
                {allPassed ? 'ALL CLEAR' : `${failCount} FAILING`}
              </span>
            </div>
            <ul className="dq-objectives">
              {CSS_CHECKS.map((chk, i) => {
                const ok = checks[i]?.passed
                return (
                  <li key={chk.id} className={ok ? 'done' : 'error'}>
                    <div className="dq-obj-box dq6-obj-box">{ok ? '✓' : '!'}</div>
                    <div>
                      <span>{chk.label}</span>
                      {!ok && <div className="dq-error-hint">{chk.hint}</div>}
                    </div>
                  </li>
                )
              })}
            </ul>
            {aiReview === 'loading' && <div style={{ marginTop: 10, fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.04em' }}>⟳ AI reviewing…</div>}
            {aiReview && aiReview !== 'loading' && (
              <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 6, background: aiReview.passed ? 'rgba(132,204,22,0.06)' : 'rgba(232,67,147,0.06)', borderLeft: `2px solid ${aiReview.passed ? 'var(--lime)' : 'var(--magenta)'}`, fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-2)', lineHeight: 1.7 }}>
                <span style={{ color: aiReview.passed ? 'var(--lime)' : 'var(--magenta)', fontWeight: 700, marginRight: 6 }}>AI</span>{aiReview.feedback}
              </div>
            )}
          </div>

          <div className="dq-rewards">
            <div className="dq-reward eva"><div className="l">REWARD</div><div className="v">+400 SHARD</div></div>
            <div className="dq-reward xp"><div className="l">XP</div><div className="v">+500</div></div>
          </div>
        </aside>

        {/* ── Right panel ─────────────────────────────────────────────────── */}
        <div className="dq-editor-wrap">

          <div className="dq-tabs">
            <div className={`dq-tab${tab === 'code' ? ' active' : ''}`} onClick={() => setTab('code')}>
              styles.css <span className="dq-dot" />
            </div>
            <div className={`dq-tab${tab === 'preview' ? ' active' : ''}`} onClick={() => { setTab('preview'); updatePreview(cssCode) }}>
              Live Preview
            </div>
            <div className="dq-status">{statusText}</div>
          </div>

          <div className={`dq-editor-pane${tab === 'code' ? ' active' : ''}`}>
            <div className="dq-editor-inner" style={{ height: '100%', minHeight: 460 }}>
              <Editor
                height="100%"
                language="css"
                value={cssCode}
                onChange={handleCssChange}
                onMount={handleEditorMount}
                theme="vs-dark"
                options={{
                  fontSize: 13,
                  fontFamily: 'JetBrains Mono, Fira Code, monospace',
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  lineNumbers: 'on',
                  tabSize: 2,
                  wordWrap: 'on',
                  automaticLayout: true,
                  renderLineHighlight: 'line',
                  contextmenu: false,
                  smoothScrolling: true,
                }}
              />
            </div>
            <div className="dq-editor-footer">
              <div className="dq-editor-status">
                <div className={`dq-dot-green${!allPassed ? ' error' : ''}`} />
                <span>{statusText}</span>
              </div>
              <span key={xpPopKey} className={`dq-xp-pop${xpPopText ? ' pop' : ''}`}>{xpPopText}</span>
            </div>
          </div>

          {tab === 'preview' && (
            <iframe ref={iframeRef} className="dq6-preview-frame" title="Grid Preview" sandbox="allow-scripts" />
          )}

          {/* Grid Seal slot */}
          <div className={`dq6-slot-wrap${allPassed ? ' ready' : ''}`}>
            <div className="dq6-slot-label">
              {allPassed
                ? '⬛ VOID REPELLED — engage the grid seal'
                : `⊗ VOID ACTIVE — ${failCount} gap${failCount !== 1 ? 's' : ''} remaining`}
            </div>
            <div className={slotClass} onClick={handleActivate} />
          </div>

        </div>
      </div>

      {/* ── Quiz ──────────────────────────────────────────────────────────── */}
      {quizOpen && <QuestQuiz quiz={QUIZ} onPass={handleQuizPass} />}

      {/* ── Dungeon entry ─────────────────────────────────────────────────── */}
      {dungeonEntry && (
        <div className="dq-dungeon-entry">
          <div className="dq-de-corridor">
            <div className="dq-de-in1"><div className="dq-de-in2" /></div>
          </div>
          <div className="dq-de-torch left" />
          <div className="dq-de-torch right" />
          <div className="dq-de-xp">+500 XP</div>
          <div className="dq-de-label">The White Void — Defeated</div>
        </div>
      )}

      {/* ── Completion modal ──────────────────────────────────────────────── */}
      <div className={`dq-complete-modal${modalOpen ? ' open' : ''}`}>
        <div className="dq-complete-inner">
          <span className="dq-badge-icon">⬛</span>
          <div className="dq-complete-chip">VOID DEFEATED</div>
          <h2>The White Void Retreats.</h2>
          <p>
            Every gap sealed. The grid holds at all viewports.
            No media queries — just auto-fit and minmax doing exactly what they were built for.{' '}
            <strong>The district grid is infinite.</strong>
          </p>
          <div className="dq-complete-rewards">
            <div className="r"><div className="l">$SHARD EARNED</div><div className="v">+400</div></div>
            <div className="r"><div className="l">XP GAINED</div><div className="v">+500</div></div>
            <div className="r"><div className="l">ITEM</div><div className="v">Void Fragment</div></div>
            <div className="r"><div className="l">ITEM</div><div className="v">Grid Seal I</div></div>
          </div>
          <div className="dq-next-quest">
            <div className="dq-nq-label">GATE 07 UNLOCKED</div>
            <div className="dq-nq-card" onClick={async () => { await completeQuest('act1-ch06', 500, getAnalytics()); goto('quest7') }} style={{ cursor: 'pointer' }}>
              <span className="dq-nq-emoji">👻</span>
              <div>
                <div className="dq-nq-title">Gate 07 — Ghost Feedback</div>
                <div className="dq-nq-sub">CSS transitions + transforms · Rank C</div>
              </div>
              <span className="dq-nq-arrow">→</span>
            </div>
          </div>
          <button
            className="btn btn-primary"
            onClick={async () => { await completeQuest('act1-ch06', 500, getAnalytics()); goto('dashboard') }}
          >
            Continue →
          </button>
        </div>
      </div>

    </div>
  )
}

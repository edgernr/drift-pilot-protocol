import { useState, useRef, useCallback, useEffect } from 'react'
import './Quest.css'
import './Quest8.css'
import Editor from '@monaco-editor/react'
import { useNav } from '../context/NavigationContext'
import { useAuth } from '../context/AuthContext'
import { useQuestAnalytics } from '../hooks/useQuestAnalytics'
import QuestQuiz from './QuestQuiz'
import { supabase } from '../lib/supabase'

// ─── HTML templates (viewport meta already included) ──────────────────────────

const VARIANT_HTML = [
  // Variant 0: Sector Zero — Mobile Page
  `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Sector Zero</title>
</head>
<body>
<div class="page-wrap">
  <nav class="site-nav">
    <div class="nav-brand">◈ SECTOR ZERO</div>
    <input class="nav-toggle" type="checkbox" id="nav-toggle" />
    <label class="nav-burger" for="nav-toggle">☰</label>
    <ul class="nav-menu">
      <li><a href="#">Overview</a></li>
      <li><a href="#">Districts</a></li>
      <li><a href="#">Signals</a></li>
      <li><a href="#">Vault</a></li>
    </ul>
  </nav>

  <section class="hero">
    <h1 class="hero-title">District Zero</h1>
    <p class="hero-sub">Deploy. Monitor. Own your sector.</p>
    <a class="hero-cta" href="#">Get Started</a>
  </section>

  <section class="features">
    <div class="feature-card"><div class="fc-icon">⬡</div><h3>Data Vault</h3><p>Encrypted storage. Zero exposure.</p></div>
    <div class="feature-card"><div class="fc-icon">◈</div><h3>Signal Tower</h3><p>Real-time broadcast. Full reach.</p></div>
    <div class="feature-card"><div class="fc-icon">⟐</div><h3>Cipher Node</h3><p>Auth layer. All access verified.</p></div>
    <div class="feature-card"><div class="fc-icon">▶</div><h3>Mission Board</h3><p>Active ops. Live status updates.</p></div>
  </section>

  <section class="testimonials">
    <div class="testimonial"><blockquote>"Sector Zero gave us the infrastructure to scale."</blockquote><cite>— Pilot Alpha</cite></div>
    <div class="testimonial"><blockquote>"The signal system is unmatched in the district."</blockquote><cite>— Unit 7</cite></div>
  </section>

  <footer class="footer">◈ Drift Protocol — Sector Zero v4.1 · All rights reserved</footer>
</div>
</body>
</html>`,

  // Variant 1: Command Centre — Mobile Page
  `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Command Centre</title>
</head>
<body>
<div class="page-wrap">
  <nav class="site-nav">
    <div class="nav-brand">⟐ COMMAND HQ</div>
    <input class="nav-toggle" type="checkbox" id="nav-toggle" />
    <label class="nav-burger" for="nav-toggle">☰</label>
    <ul class="nav-menu">
      <li><a href="#">Operations</a></li>
      <li><a href="#">Intel</a></li>
      <li><a href="#">Deploy</a></li>
      <li><a href="#">Archive</a></li>
    </ul>
  </nav>

  <section class="hero">
    <h1 class="hero-title">Command Centre</h1>
    <p class="hero-sub">Full mission control. Real-time across all ops.</p>
    <a class="hero-cta" href="#">Open HQ</a>
  </section>

  <section class="features">
    <div class="feature-card"><div class="fc-icon">▶</div><h3>Op Control</h3><p>Manage active operations from HQ.</p></div>
    <div class="feature-card"><div class="fc-icon">◎</div><h3>Intel Feed</h3><p>Live intel. Updated every 60 seconds.</p></div>
    <div class="feature-card"><div class="fc-icon">✓</div><h3>Results</h3><p>Mission outcomes logged in real time.</p></div>
    <div class="feature-card"><div class="fc-icon">⊕</div><h3>Deploy</h3><p>One-click team deployment protocols.</p></div>
  </section>

  <section class="testimonials">
    <div class="testimonial"><blockquote>"Command Centre cut our response time by 40%."</blockquote><cite>— Strike Lead Alpha</cite></div>
    <div class="testimonial"><blockquote>"Intel feed is the backbone of all our operations."</blockquote><cite>— Unit 12</cite></div>
  </section>

  <footer class="footer">⟐ Command Centre — Secure Operations Platform v2.8</footer>
</div>
</body>
</html>`,

  // Variant 2: Reactor Grid — Mobile Page
  `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reactor Grid</title>
</head>
<body>
<div class="page-wrap">
  <nav class="site-nav">
    <div class="nav-brand">※ REACTOR GRID</div>
    <input class="nav-toggle" type="checkbox" id="nav-toggle" />
    <label class="nav-burger" for="nav-toggle">☰</label>
    <ul class="nav-menu">
      <li><a href="#">Cores</a></li>
      <li><a href="#">Cooling</a></li>
      <li><a href="#">Power</a></li>
      <li><a href="#">Safety</a></li>
    </ul>
  </nav>

  <section class="hero">
    <h1 class="hero-title">Reactor Grid</h1>
    <p class="hero-sub">Core systems stable. Containment holding.</p>
    <a class="hero-cta" href="#">Monitor Cores</a>
  </section>

  <section class="features">
    <div class="feature-card"><div class="fc-icon">⚡</div><h3>Primary Core</h3><p>100% output. All systems nominal.</p></div>
    <div class="feature-card"><div class="fc-icon">〰</div><h3>Coolant Loop</h3><p>18°C across all channels.</p></div>
    <div class="feature-card"><div class="fc-icon">⊕</div><h3>Containment</h3><p>Field at 98%. No breaches detected.</p></div>
    <div class="feature-card"><div class="fc-icon">◎</div><h3>Safety Systems</h3><p>All failsafes armed and verified.</p></div>
  </section>

  <section class="testimonials">
    <div class="testimonial"><blockquote>"Reactor Grid monitoring gave us confidence at scale."</blockquote><cite>— Core Engineer Gamma</cite></div>
    <div class="testimonial"><blockquote>"The safety system has zero false positives."</blockquote><cite>— Containment Unit 3</cite></div>
  </section>

  <footer class="footer">※ Reactor Grid — Core Monitoring System v3.0</footer>
</div>
</body>
</html>`,
]

// ─── Starting CSS scaffold ─────────────────────────────────────────────────────

const START_CSS = `/* Gate 08 — The Collapse
   Build the sector page mobile-first.
   The HTML is pre-built with a viewport meta tag already included.
   Write CSS that starts mobile and scales up — not the other way around.

   Checks to pass:
   1. @media (min-width: ...) used — NOT max-width (mobile-first direction)
   2. Base grid is 1 column; @media expands to 4 columns
   3. Navigation collapses: .nav-menu hidden by default, shown via :checked sibling
   4. clamp() used at least once for fluid sizing
   5. No element with a fixed width wider than viewport (no overflow risk)
   6. Desktop layout uses min-width media query at 768px or higher
   7. Hero section scales with clamp() or relative units (not fixed px heights) */

* { box-sizing: border-box; margin: 0; padding: 0; }

/* Mobile base styles first */
body {
  font-family: system-ui, sans-serif;
  background: #0a0d18;
  color: #e8ecff;
}

.page-wrap {
  max-width: 1100px;
  margin: 0 auto;
}

/* Navigation — mobile collapsed by default */
.site-nav {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  padding: 14px 20px;
  background: #111524;
  border-bottom: 1px solid rgba(180,200,255,0.08);
  position: relative;
}

.nav-brand {
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.08em;
  flex: 1;
}

/* Checkbox toggle — hidden */
.nav-toggle {
  display: none;
}

/* Burger icon — visible on mobile */
.nav-burger {
  font-size: 20px;
  cursor: pointer;
  color: #b8c0d9;
  padding: 4px;
}

/* Nav menu hidden on mobile */
.nav-menu {
  width: 100%;
  list-style: none;
  display: none;
  flex-direction: column;
  padding: 8px 0;
  gap: 4px;
}

.nav-menu a {
  display: block;
  padding: 8px 12px;
  color: #b8c0d9;
  text-decoration: none;
  font-size: 14px;
}

/* Hero section */
.hero {
  padding: 48px 20px;
  text-align: center;
}

.hero-title {
  margin-bottom: 12px;
}

.hero-sub {
  color: #b8c0d9;
  margin-bottom: 24px;
}

.hero-cta {
  display: inline-block;
  padding: 12px 28px;
  background: #22d3ee;
  color: #0a0d18;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 600;
}

/* Features — single column base */
.features {
  padding: 40px 20px;
  display: grid;
  gap: 16px;
}

.feature-card {
  padding: 24px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(180,200,255,0.1);
  border-radius: 8px;
}

.fc-icon { font-size: 28px; margin-bottom: 12px; }
.feature-card h3 { font-size: 16px; font-weight: 600; margin-bottom: 8px; }
.feature-card p { font-size: 13px; color: #7a8199; line-height: 1.5; }

/* Testimonials */
.testimonials {
  padding: 40px 20px;
  display: grid;
  gap: 16px;
}

.testimonial {
  padding: 20px 24px;
  background: rgba(255,255,255,0.03);
  border-left: 2px solid rgba(180,200,255,0.2);
  border-radius: 0 6px 6px 0;
}

.testimonial blockquote { font-size: 14px; color: #b8c0d9; margin-bottom: 8px; font-style: italic; }
.testimonial cite { font-size: 12px; color: #4a5070; }

/* Footer */
.footer {
  padding: 20px;
  font-size: 11px;
  color: #4a5070;
  letter-spacing: 0.06em;
  text-align: center;
  border-top: 1px solid rgba(180,200,255,0.06);
}
`

// ─── Quiz ─────────────────────────────────────────────────────────────────────

const QUIZ = {
  question: 'You built mobile styles first and added desktop overrides in min-width media queries. Why is that order significant?',
  options: [
    'It reduces CSS file size because mobile styles are simpler, and browsers download less code on mobile connections',
    'It ensures mobile devices only receive and apply styles relevant to them — desktop overrides are skipped if the min-width condition is never met',
    'It prevents desktop browsers from rendering mobile styles, which would cause layout errors on large screens',
    'It is required by the CSS specification — browsers ignore max-width queries on mobile devices',
  ],
  correct: 1,
}

// ─── CSS checks (mixed: execution where reliable, regex fallback otherwise) ──────
// Gate 08 is mobile-first responsive — the HARDEST to execution-check, because most
// requirements (min-width direction, clamp() usage, breakpoint thresholds) are
// authoring-intent that the browser flattens away once rendered (clamp() resolves to
// px, media-query direction can't be told apart at a single viewport). Verifying those
// by execution while built BLIND risks an UNCOMPLETABLE gate, so per the gate rules we
// KEEP their original regex tests. The one requirement that IS a genuine rendered
// result — "nothing overflows the viewport" — is converted to a real execution check
// against the offscreen iframe.
//
// Each test receives (doc, win, css). Regex checks ignore doc/win and read `css`.

const CSS_CHECKS = [
  {
    id: 'min_width',
    label: 'min-width queries used',
    hint: 'Mobile-first means base styles are for small screens, and overrides kick in as screens get wider — not narrower. Which direction should your media condition check?',
    mode: 'regex',
    test: (doc, win, css) => /@media[^{]*min-width/.test(css) && !/@media[^{]*max-width/.test(css),
  },
  {
    id: 'grid_one_col',
    label: 'Grid starts single column',
    hint: 'CSS Grid defaults to a single column when no column template is set. Define the base as one track, then use a media query to expand the number of columns for larger screens.',
    mode: 'regex',
    test: (doc, win, css) => {
      const base = css.match(/\.features\s*\{([^}]+)\}/)
      if (!base) return false
      const baseHas1col = /grid-template-columns\s*:\s*1fr/.test(base[1]) ||
        !/grid-template-columns/.test(base[1])
      // Detect a multi-column .features rule inside ANY min-width @media block,
      // regardless of other rules present in that block (idiomatic mobile-first).
      const mediaHasMulti = /@media[^{]*min-width[\s\S]*?\.features\s*\{[^}]*grid-template-columns[^}]*(?:repeat|[2-9])[^}]*\}/.test(css)
      return baseHas1col && mediaHasMulti
    },
  },
  {
    id: 'nav_collapse',
    label: 'Navigation collapses on mobile',
    hint: 'The HTML already has a hidden checkbox and a burger label wired up. In CSS, there\'s a combinator that selects a sibling element that follows a :checked element. How do you combine :checked with a sibling selector?',
    mode: 'regex',
    test: (doc, win, css) => /nav-toggle\s*:\s*checked[^{]*~[^{]*nav-menu/.test(css) ||
      /#nav-toggle\s*:\s*checked[^{]*~[^{]*\.nav-menu/.test(css) ||
      /\.nav-toggle\s*:\s*checked[^{]*~[^{]*\.nav-menu/.test(css),
  },
  {
    id: 'clamp_used',
    label: 'clamp() used for fluid sizing',
    hint: 'There\'s a CSS function that locks a value between a minimum and maximum while allowing a preferred middle value — often viewport-based — to scale between them.',
    mode: 'regex',
    test: (doc, win, css) => /clamp\s*\(/.test(css),
  },
  {
    id: 'no_overflow',
    label: 'No fixed widths wider than viewport',
    hint: 'Fixed pixel widths that exceed the viewport width force horizontal scrolling on small screens. Fluid elements should use relative units or a max-width so they adapt to the available space.',
    mode: 'exec',
    // EXECUTION: render the page in the narrow offscreen iframe and confirm the
    // document doesn't scroll horizontally. A genuine rendered-result test —
    // any over-wide fixed element would push scrollWidth past the viewport.
    test: (doc, win) => {
      const de = doc.documentElement
      const body = doc.body
      if (!de || !body) return false
      const viewport = de.clientWidth
      if (!viewport) return false
      const overflow = Math.max(de.scrollWidth, body.scrollWidth) - viewport
      return overflow <= 2 // 2px tolerance for sub-pixel rounding
    },
  },
  {
    id: 'desktop_breakpoint',
    label: 'Desktop breakpoint at 768px+',
    hint: 'Your expanded desktop layout needs a threshold — a specific viewport width where it kicks in. Write a min-width media query at 768px or higher to contain those overrides.',
    mode: 'regex',
    test: (doc, win, css) => /@media[^{]*min-width\s*:\s*(?:768|800|900|960|1024|1100|1200)px/.test(css),
  },
  {
    id: 'fluid_hero',
    label: 'Hero title uses fluid sizing',
    hint: 'A truly responsive title shouldn\'t be locked to a fixed pixel size. Use a relative unit or a function that lets the size scale fluidly between a minimum and maximum.',
    mode: 'regex',
    test: (doc, win, css) => {
      const m = css.match(/\.hero-title\s*\{([^}]+)\}/)
      if (!m) return false
      return /font-size\s*:[^;]*(?:clamp|rem|em|vw)/.test(m[1])
    },
  },
]

// ─── Preview builder ──────────────────────────────────────────────────────────

function buildPreview(css, variantIndex) {
  const fullHtml = VARIANT_HTML[variantIndex]
  // Inject CSS before closing </head>
  return fullHtml.replace('</head>', `<style>${css}</style></head>`)
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Quest8() {
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
  // Gate 08 stores 500 XP via completeQuest('act1-ch08', 500, ...).
  // Displayed XP total must match the stored value.
  const GATE_XP = 500
  const xpPerCheck = GATE_XP / CSS_CHECKS.length
  const xpEarned = allPassed ? GATE_XP : Math.round(passCount * xpPerCheck)
  const xpPct = (xpEarned / GATE_XP) * 100
  const failCount = CSS_CHECKS.length - passCount
  const bossHpPct = (failCount / CSS_CHECKS.length) * 100

  const updatePreview = useCallback((css) => {
    if (!iframeRef.current) return
    iframeRef.current.srcdoc = buildPreview(css, variantIdx)
  }, [variantIdx])

  useEffect(() => {
    if (tab === 'preview') updatePreview(cssCode)
  }, [cssCode, tab, updatePreview])

  // Run the checks against the offscreen iframe whenever the CSS settles.
  // Execution checks read the RENDERED result (doc + win); regex-fallback checks read
  // the raw source. Every test gets (doc, win, css) — `cssCode` is captured from this
  // callback's closure, which is the exact source the iframe was just told to render.
  const runChecks = useCallback(() => {
    const iframe = checkIframeRef.current
    const doc = iframe?.contentDocument
    const win = iframe?.contentWindow
    // The page must have actually rendered before any exec check can run.
    if (!doc || !win || !doc.querySelector('.page-wrap')) return
    const results = CSS_CHECKS.map(c => {
      let passed = false
      try { passed = !!c.test(doc, win, cssCode) } catch { passed = false }
      return { ...c, passed }
    })
    setChecks(results)
    const newPass = results.filter(r => r.passed).length
    if (newPass > prevPassRef.current) {
      const gained = Math.round(newPass * xpPerCheck) - Math.round(prevPassRef.current * xpPerCheck)
      setXpPopText(`+${gained} XP`)
      setXpPopKey(k => k + 1)
    }
    prevPassRef.current = newPass
  }, [cssCode, xpPerCheck])

  // Debounced: render the student's CSS into the offscreen iframe, then check.
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
        quest_title: 'Gate 08 — The Collapse',
        requirements: 'Build mobile-first responsive CSS: use min-width media queries only, features grid starts at 1 column then expands with min-width, nav collapses using checkbox:checked ~ .nav-menu, clamp() used for fluid sizing, hero-title uses fluid font-size, no fixed widths causing overflow.',
        language: 'css',
      },
    }).then(({ data }) => setAiReview(data ?? null)).catch(() => setAiReview(null))
  }, [allPassed]) // eslint-disable-line react-hooks/exhaustive-deps

  const statusText = pasteBlocked
    ? '⊘ Paste disabled — type the code'
    : allPassed
    ? 'Stack collapsed — mobile gate sealed'
    : `${failCount} check${failCount !== 1 ? 's' : ''} failing — THE STACK feeds`

  function handleCssChange(value) {
    const val = value ?? ''
    setCssCode(val)
    trackChange(val.length)
    // XP-pop is fired from runChecks once the iframe re-renders and re-evaluates.
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

  const slotClass = ['dq8-mobile-gate', allPassed ? 'ready' : 'locked', activating ? 'activating' : ''].filter(Boolean).join(' ')

  return (
    <div className="dq-wrap dq-wrap-g8">

      {/* Offscreen iframe that actually renders the student's CSS for the exec checks.
          Sized to a NARROW mobile viewport so the overflow check is a real mobile test.
          No sandbox attribute → stays same-origin readable (no scripts run here). */}
      <iframe
        ref={checkIframeRef}
        title="checks"
        aria-hidden="true"
        tabIndex={-1}
        style={{ position: 'fixed', left: -10000, top: 0, width: 390, height: 1400, border: 0, opacity: 0, pointerEvents: 'none' }}
      />

      <div className="dq-topbar">
        <span className="dq-back" onClick={() => goto('dashboard')}>← Dashboard</span>
        <div className="dq-topbar-center">
          <span className="dq-chapter">RANK C GATE · GATE 08 · BOSS</span>
          <span className="dq-title-label">The Collapse</span>
        </div>
        <div className="dq-xp-row">
          <div className="dq-xp-bar-wrap">
            <div className="dq-xp-fill" style={{ width: `${xpPct}%` }} />
          </div>
          <span className="dq-xp-text">{xpEarned} / {GATE_XP} XP</span>
        </div>
      </div>

      <div className="dq-main">

        {/* ── Left panel ──────────────────────────────────────────────────── */}
        <aside className="dq-brief">

          <div className="dq-scene-art">
            <div className="dq-scene-torch left" />
            <div className="dq-scene-torch right" />
            <div className={`dq8-scene-stack${allPassed ? ' collapsed' : ''}`}>
              {[6,5,4,3,2,1,0].map(i => (
                <div key={i} className={`dq8-panel${i < failCount ? ' crushing' : ' cleared'}`} />
              ))}
            </div>
          </div>

          {/* Boss HP — The Stack */}
          <div className="dq8-boss-hp">
            <div className="dq8-boss-name">
              <span className="dq8-boss-title">BOSS — THE STACK</span>
              <span className="dq8-boss-status" style={{ color: failCount > 0 ? 'oklch(0.78 0.17 50)' : 'var(--lime)' }}>
                {failCount > 0 ? `${failCount} PANELS` : 'COLLAPSED'}
              </span>
            </div>
            <div className="dq8-boss-bar">
              <div className="dq8-boss-bar-fill" style={{ width: `${bossHpPct}%` }} />
            </div>
          </div>

          <div className="dq-narrator-box">
            <div className="dq-narrator-label">▶ NARRATOR</div>
            <p className="dq-narrator-text">
              THE STACK crushes everything that wasn&apos;t built for mobile first.
              Write base styles for small screens. Then scale up with min-width queries.{' '}
              <strong>Build it right and THE STACK has nothing to crush.</strong>
            </p>
          </div>

          <div>
            <div className="dq-section-label">
              MOBILE AUDIT —{' '}
              <span style={{ color: allPassed ? 'var(--lime)' : 'oklch(0.62 0.22 25)' }}>
                {allPassed ? 'ALL CLEAR' : `${failCount} FAILING`}
              </span>
            </div>
            <ul className="dq-objectives">
              {CSS_CHECKS.map((chk, i) => {
                const ok = checks[i]?.passed
                return (
                  <li key={chk.id} className={ok ? 'done' : 'error'}>
                    <div className="dq-obj-box dq8-obj-box">{ok ? '✓' : '!'}</div>
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
            <div className="dq-reward eva"><div className="l">REWARD</div><div className="v">+400 DRIFT</div></div>
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
            <iframe ref={iframeRef} className="dq8-preview-frame" title="Responsive Preview" sandbox="allow-scripts" />
          )}

          {/* Mobile Gate slot */}
          <div className={`dq8-slot-wrap${allPassed ? ' ready' : ''}`}>
            <div className="dq8-slot-label">
              {allPassed
                ? '📱 STACK DEFEATED — seal the mobile gate'
                : `⊗ STACK ACTIVE — ${failCount} check${failCount !== 1 ? 's' : ''} feeding the collapse`}
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
          <div className="dq-de-label">The Stack — Collapsed</div>
        </div>
      )}

      {/* ── Completion modal ──────────────────────────────────────────────── */}
      <div className={`dq-complete-modal${modalOpen ? ' open' : ''}`}>
        <div className="dq-complete-inner">
          <span className="dq-badge-icon">📱</span>
          <div className="dq-complete-chip">THE STACK COLLAPSED</div>
          <h2>The District Renders on Every Screen.</h2>
          <p>
            Mobile base. Desktop upgrade. No max-width overrides.
            THE STACK had nothing to crush because you built it right the first time.{' '}
            <strong>That&apos;s mobile-first by design.</strong>
          </p>
          <div className="dq-complete-rewards">
            <div className="r"><div className="l">$HUNT EARNED</div><div className="v">+400</div></div>
            <div className="r"><div className="l">XP GAINED</div><div className="v">+500</div></div>
            <div className="r"><div className="l">ITEM</div><div className="v">Stack Fragment</div></div>
            <div className="r"><div className="l">ITEM</div><div className="v">Responsive License I</div></div>
          </div>
          <div className="dq-next-quest">
            <div className="dq-nq-label">WORLD 02 COMPLETE — WORLD 03 UNLOCKED</div>
            <div className="dq-nq-card" onClick={async () => { await completeQuest('act1-ch08', 500, getAnalytics()); goto('quest9') }} style={{ cursor: 'pointer' }}>
              <span className="dq-nq-emoji">⬡</span>
              <div>
                <div className="dq-nq-title">Gate 09 — The Control Room</div>
                <div className="dq-nq-sub">JavaScript DOM · World 03 · The Living Layer</div>
              </div>
            </div>
          </div>
          <button
            className="btn btn-primary"
            onClick={async () => { await completeQuest('act1-ch08', 500, getAnalytics()); goto('dashboard') }}
          >
            Continue →
          </button>
        </div>
      </div>

    </div>
  )
}

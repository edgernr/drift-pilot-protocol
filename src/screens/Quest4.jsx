import { useState, useRef, useCallback, useEffect } from 'react'
import './Quest.css'
import './Quest4.css'
import Editor from '@monaco-editor/react'
import { useNav } from '../context/NavigationContext'
import { useAuth } from '../context/AuthContext'
import { useQuestAnalytics } from '../hooks/useQuestAnalytics'
import QuestQuiz from './QuestQuiz'
import { supabase } from '../lib/supabase'

// ─── HTML templates — same class names across all variants ────────────────────

const VARIANT_HTML = [
  // Variant 0: Sector Zero — District Status
  `<div class="city-wrap">
  <header class="city-header">
    <div class="city-logo">◈ SECTOR ZERO</div>
    <nav class="city-nav">
      <a class="nav-link" href="#">Status</a>
      <a class="nav-link" href="#">Systems</a>
      <a class="nav-link" href="#">Alerts</a>
    </nav>
  </header>
  <main class="city-main">
    <h1 class="page-title">District Status Report</h1>
    <p class="page-sub">Last synchronised: 06:44 UTC</p>
    <div class="card-grid">
      <div class="status-card status-card--ok">
        <div class="card-label">POWER GRID</div>
        <div class="card-value">STABLE</div>
        <div class="card-sub">108% capacity</div>
      </div>
      <div class="status-card status-card--alert">
        <div class="card-label">SIGNAL TOWER</div>
        <div class="card-value">DEGRADED</div>
        <div class="card-sub">3 nodes offline</div>
      </div>
      <div class="status-card status-card--ok">
        <div class="card-label">VAULT ACCESS</div>
        <div class="card-value">SECURE</div>
        <div class="card-sub">All checkpoints clear</div>
      </div>
      <div class="status-card status-card--warning">
        <div class="card-label">DATA FLOW</div>
        <div class="card-value">THROTTLED</div>
        <div class="card-sub">42% throughput</div>
      </div>
    </div>
    <table class="data-table">
      <thead><tr><th>System</th><th>Uptime</th><th>Status</th></tr></thead>
      <tbody>
        <tr><td>Auth Gateway</td><td>99.2%</td><td class="td-ok">ONLINE</td></tr>
        <tr><td>District Router</td><td>97.1%</td><td class="td-warn">SLOW</td></tr>
        <tr><td>Cipher Node</td><td>100%</td><td class="td-ok">ONLINE</td></tr>
      </tbody>
    </table>
  </main>
</div>`,

  // Variant 1: Command Centre — Mission Board
  `<div class="city-wrap">
  <header class="city-header">
    <div class="city-logo">⟐ COMMAND CENTRE</div>
    <nav class="city-nav">
      <a class="nav-link" href="#">Operations</a>
      <a class="nav-link" href="#">Intel</a>
      <a class="nav-link" href="#">Deploy</a>
    </nav>
  </header>
  <main class="city-main">
    <h1 class="page-title">Active Mission Board</h1>
    <p class="page-sub">Cycle updated: 14:20 UTC</p>
    <div class="card-grid">
      <div class="status-card status-card--ok">
        <div class="card-label">OP PHOENIX</div>
        <div class="card-value">ACTIVE</div>
        <div class="card-sub">Team Alpha deployed</div>
      </div>
      <div class="status-card status-card--alert">
        <div class="card-label">OP NIGHTFALL</div>
        <div class="card-value">DELAYED</div>
        <div class="card-sub">Awaiting intel</div>
      </div>
      <div class="status-card status-card--ok">
        <div class="card-label">OP GRIDLOCK</div>
        <div class="card-value">COMPLETE</div>
        <div class="card-sub">Objectives cleared</div>
      </div>
      <div class="status-card status-card--warning">
        <div class="card-label">OP VOIDGATE</div>
        <div class="card-value">PENDING</div>
        <div class="card-sub">Clearance required</div>
      </div>
    </div>
    <table class="data-table">
      <thead><tr><th>Unit</th><th>Strength</th><th>Status</th></tr></thead>
      <tbody>
        <tr><td>Strike Team Alpha</td><td>94%</td><td class="td-ok">DEPLOYED</td></tr>
        <tr><td>Intel Unit 7</td><td>71%</td><td class="td-warn">STANDBY</td></tr>
        <tr><td>Support Grid</td><td>100%</td><td class="td-ok">READY</td></tr>
      </tbody>
    </table>
  </main>
</div>`,

  // Variant 2: Reactor Grid — System Monitor
  `<div class="city-wrap">
  <header class="city-header">
    <div class="city-logo">※ REACTOR GRID</div>
    <nav class="city-nav">
      <a class="nav-link" href="#">Cores</a>
      <a class="nav-link" href="#">Cooling</a>
      <a class="nav-link" href="#">Alerts</a>
    </nav>
  </header>
  <main class="city-main">
    <h1 class="page-title">Core Systems Monitor</h1>
    <p class="page-sub">Last scan: 09:15 UTC</p>
    <div class="card-grid">
      <div class="status-card status-card--ok">
        <div class="card-label">PRIMARY CORE</div>
        <div class="card-value">STABLE</div>
        <div class="card-sub">100% output</div>
      </div>
      <div class="status-card status-card--warning">
        <div class="card-label">SECONDARY CORE</div>
        <div class="card-value">FLUCTUATING</div>
        <div class="card-sub">±12% variance</div>
      </div>
      <div class="status-card status-card--ok">
        <div class="card-label">COOLANT LOOP</div>
        <div class="card-value">OPTIMAL</div>
        <div class="card-sub">18°C nominal</div>
      </div>
      <div class="status-card status-card--alert">
        <div class="card-label">CONTAINMENT</div>
        <div class="card-value">WEAK</div>
        <div class="card-sub">Field at 67%</div>
      </div>
    </div>
    <table class="data-table">
      <thead><tr><th>Component</th><th>Load</th><th>Status</th></tr></thead>
      <tbody>
        <tr><td>Core Processor</td><td>88%</td><td class="td-ok">NOMINAL</td></tr>
        <tr><td>Energy Distributor</td><td>64%</td><td class="td-warn">REDUCED</td></tr>
        <tr><td>Thermal Regulator</td><td>100%</td><td class="td-ok">NOMINAL</td></tr>
      </tbody>
    </table>
  </main>
</div>`,
]

// ─── Starting CSS scaffold ─────────────────────────────────────────────────────

const START_CSS = `/* EVA City — Color Protocol
   Establish the design system. Style the city. Never hardcode again.

   Phase 01: Define custom properties in :root
   Phase 02: Style every component using var(--your-variable)

   Checks to pass:
   1. :root block with custom properties
   2. 3+ color variables (any color values)
   3. 2+ spacing/size variables (px, rem, em, %, vh/vw)
   4. var(--...) used in rules outside :root
   5. Zero #hex colors outside :root
   6. .city-header styled with at least one var()
   7. .status-card styled with at least one var()
   8. @media responsive breakpoint */

:root {
  /* Colors */

  /* Spacing */

  /* Typography */
}

/* City wrapper */
.city-wrap {

}

/* Header */
.city-header {

}

.city-logo {

}

.city-nav {

}

.nav-link {

}

/* Page content */
.city-main {

}

.page-title {

}

.page-sub {

}

/* Card grid */
.card-grid {

}

/* Status cards */
.status-card {

}

.status-card--ok {

}

.status-card--alert {

}

.status-card--warning {

}

.card-label {

}

.card-value {

}

.card-sub {

}

/* Table */
.data-table {

}

.data-table th,
.data-table td {

}

.td-ok {

}

.td-warn {

}

/* Responsive */
@media (max-width: 768px) {

}
`

// ─── Quiz ─────────────────────────────────────────────────────────────────────

const QUIZ = {
  question: 'You change --primary-color in :root from teal to magenta. What happens to every element using var(--primary-color)?',
  options: [
    'Every element using var(--primary-color) instantly inherits the new value',
    'Nothing — you need to re-declare the variable in each rule that uses it',
    'Only elements inside the :root block are affected',
    'The browser throws a syntax error — custom properties cannot be reassigned',
  ],
  correct: 0,
}

// ─── CSS checks (EXECUTION-BASED where it's reliable to render) ─────────────────
// Each test receives (doc, win, css):
//   • doc / win — the RENDERED offscreen iframe + its window, so checks can read the
//     real computed styles / applied results of the student's CSS.
//   • css       — the raw source, for the rules that can ONLY be verified from source
//     (declaration counts, "no #hex", media-query presence) and so stay regex.
//
// Mix per the gate guidance: computed-style for applied results (header/card styled,
// var() actually consumed); regex for declaration/no-hex/media-query rules that are
// invisible in computed styles or depend on the viewport.

// A computed style counts as "actually applied" when it isn't the browser default.
function isMeaningful(prop, value) {
  if (!value) return false
  const v = value.trim().toLowerCase()
  switch (prop) {
    case 'background-color':
      return v !== 'rgba(0, 0, 0, 0)' && v !== 'transparent'
    case 'color':
      // default text color in our reset is the UA black — anything else is styled
      return v !== 'rgb(0, 0, 0)' && v !== ''
    case 'padding':
      return v !== '0px' && v !== ''
    case 'border-top-width':
    case 'border-bottom-width':
      return v !== '0px' && v !== ''
    case 'border-radius':
      return v !== '0px' && v !== ''
    default:
      return false
  }
}

// Does the student's rule for `selector` both (a) reference a var() AND (b) actually
// render a non-default style on that element? That's a genuine execution check that a
// variable-driven rule took effect — with the regex var() guard keeping it completable.
function styledWithVar(doc, win, css, selector) {
  const ruleHasVar = new RegExp(
    selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\{[^}]*var\\s*\\(\\s*--[^)]+\\)[^}]*\\}'
  ).test(css)
  if (!ruleHasVar) return false
  const el = doc.querySelector(selector)
  if (!el) return false
  const cs = win.getComputedStyle(el)
  return (
    isMeaningful('background-color', cs.backgroundColor) ||
    isMeaningful('color', cs.color) ||
    isMeaningful('padding', cs.padding) ||
    isMeaningful('border-top-width', cs.borderTopWidth) ||
    isMeaningful('border-bottom-width', cs.borderBottomWidth) ||
    isMeaningful('border-radius', cs.borderTopLeftRadius)
  )
}

const CSS_CHECKS = [
  {
    // Source-only: the existence of a :root declaration block is invisible in
    // computed styles, so this stays regex.
    id: 'root_vars',
    label: ':root custom properties declared',
    hint: 'Custom properties must be declared inside a special selector that targets the document root — making them available to every rule on the page. That selector is a CSS pseudo-class.',
    mode: 'regex',
    test: (doc, win, css) => /:root\s*\{[^}]*--[a-z]/.test(css),
  },
  {
    // Source-only: counting declared color variables can't be read from computed
    // styles — regex.
    id: 'color_tokens',
    label: 'Color system: 3+ color variables',
    hint: 'Color variables need actual color values. Any valid CSS color format works. Make sure you have at least three separate color properties defined in your root block.',
    mode: 'regex',
    test: (doc, win, css) => {
      const rootBlock = css.match(/:root\s*\{([^}]+)\}/)
      if (!rootBlock) return false
      const lines = rootBlock[1].split('\n').filter(l => l.includes('--') && l.includes(':'))
      return lines.filter(l => {
        const v = l.slice(l.indexOf(':') + 1)
        return /#[0-9a-fA-F]{3,8}/.test(v) ||
          /oklch\s*\(|rgba?\s*\(|hsla?\s*\(/.test(v) ||
          /\b(?:white|black|red|blue|green|gray|grey|cyan|pink|purple|orange|yellow|transparent)\b/i.test(v)
      }).length >= 3
    },
  },
  {
    // Source-only: counting declared spacing variables — regex.
    id: 'spacing_tokens',
    label: 'Spacing system: 2+ size variables',
    hint: 'Spacing variables hold size values in a CSS length unit. Think about padding, gap, or margin values you\'ll reuse — define at least two of them.',
    mode: 'regex',
    test: (doc, win, css) => {
      const rootBlock = css.match(/:root\s*\{([^}]+)\}/)
      if (!rootBlock) return false
      const lines = rootBlock[1].split('\n').filter(l => l.includes('--') && l.includes(':'))
      return lines.filter(l => /[\d.]+(?:px|rem|em|%|vh|vw)/.test(l.slice(l.indexOf(':') + 1))).length >= 2
    },
  },
  {
    // EXECUTION: at least one rule outside :root must actually consume a variable and
    // render a real style. We confirm a var()-bearing rule on a known element (header
    // or card) genuinely applied; regex on the non-root source is the fallback so the
    // gate stays completable for any other var()-consuming rule.
    id: 'var_used',
    label: 'Variables applied with var()',
    hint: 'To reference a custom property in a CSS rule, there\'s a function that takes the variable name as its argument. That function name is three letters long.',
    mode: 'exec',
    test: (doc, win, css) => {
      if (styledWithVar(doc, win, css, '.city-header')) return true
      if (styledWithVar(doc, win, css, '.status-card')) return true
      if (styledWithVar(doc, win, css, '.city-wrap')) return true
      if (styledWithVar(doc, win, css, '.nav-link')) return true
      // Fallback: any var() usage outside :root keeps the gate completable.
      return /var\s*\(\s*--/.test(css.replace(/:root\s*\{[^}]+\}/, ''))
    },
  },
  {
    // Source-only: "no #hex outside :root" cannot be seen in computed styles (the
    // browser normalises everything to rgb) — regex, per gate guidance.
    id: 'no_hex_rules',
    label: 'Zero hardcoded #hex in rules',
    hint: 'Hardcoded color values directly in class rules defeat the purpose of a design system — you\'d need to change them in every rule. Every color used in a rule should come from a variable.',
    mode: 'regex',
    test: (doc, win, css) => !/#[0-9a-fA-F]{3,8}/.test(css.replace(/:root\s*\{[^}]+\}/, '')),
  },
  {
    // EXECUTION: the .city-header rule must reference a var() AND actually render a
    // non-default style on the element (background / color / padding / border).
    id: 'header_styled',
    label: '.city-header styled with variables',
    hint: 'Find the .city-header element in the HTML, then write a CSS rule targeting it. Apply at least one of your defined variables to a visual property like background or color.',
    mode: 'exec',
    test: (doc, win, css) => styledWithVar(doc, win, css, '.city-header'),
  },
  {
    // EXECUTION: the .status-card rule must reference a var() AND actually render a
    // non-default style on the element.
    id: 'card_styled',
    label: '.status-card styled with variables',
    hint: 'Find the .status-card element in the HTML and write a CSS rule for it. Apply at least one of your defined variables — the card should look styled, not bare.',
    mode: 'exec',
    test: (doc, win, css) => styledWithVar(doc, win, css, '.status-card'),
  },
  {
    // Viewport-dependent: a @media (max-width) breakpoint only fires at a narrow
    // viewport, which we can't reliably reproduce blind in a fixed offscreen frame —
    // keep regex so the gate stays completable.
    id: 'responsive',
    label: 'Responsive @media breakpoint added',
    hint: 'A media query wraps rules that only apply when a condition is met — like the viewport being a certain width. Write one that makes the layout adapt for different screen sizes.',
    mode: 'regex',
    test: (doc, win, css) => /@media\s*\([^)]*(?:max|min)-width[^)]*\)/.test(css),
  },
]

// ─── Brand override — dynamically targets the player's own color variables ────

function generateOverride(css) {
  const rootBlock = css.match(/:root\s*\{([^}]+)\}/)
  if (!rootBlock) return ''
  const lines = rootBlock[1].split('\n').filter(l => l.includes('--') && l.includes(':'))
  const colorLines = lines.filter(l => {
    const v = l.slice(l.indexOf(':') + 1)
    return /#[0-9a-fA-F]{3,8}/.test(v) ||
      /oklch\s*\(|rgba?\s*\(|hsla?\s*\(/.test(v) ||
      /\b(?:white|black|red|blue|green|gray|grey|cyan|pink|purple|orange|yellow)\b/i.test(v)
  })
  if (colorLines.length === 0) return ''
  const OVERRIDE_PALETTE = [
    'oklch(0.72 0.28 340)',
    'oklch(0.12 0.04 340)',
    'oklch(0.92 0.04 340)',
    'oklch(0.50 0.22 310)',
    'oklch(0.35 0.14 330)',
  ]
  const overrides = colorLines.slice(0, 5).map((line, i) => {
    const prop = line.match(/(--[a-z][a-z0-9-]*)/)?.[1]
    return prop ? `  ${prop}: ${OVERRIDE_PALETTE[i % OVERRIDE_PALETTE.length]};` : ''
  }).filter(Boolean)
  return `:root {\n${overrides.join('\n')}\n}`
}

// ─── Preview builder ──────────────────────────────────────────────────────────

function buildPreview(css, variantIndex, override = '') {
  const html = VARIANT_HTML[variantIndex]
  const reset = `<style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, -apple-system, sans-serif; }
    a { text-decoration: none; }
    table { border-collapse: collapse; width: 100%; }
  </style>`
  const overrideBlock = override ? `<style>${override}</style>` : ''
  return `<!DOCTYPE html><html><head>${reset}<style>${css}</style>${overrideBlock}</head><body>${html}</body></html>`
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Quest4() {
  const { goto } = useNav()
  const { completeQuest } = useAuth()
  const { onPaste, trackChange, getAnalytics, pasteBlocked } = useQuestAnalytics()

  const [variantIdx] = useState(() => Math.floor(Math.random() * 3))
  const [cssCode, setCssCode] = useState(START_CSS)
  const [tab, setTab] = useState('code')
  const [quizOpen, setQuizOpen] = useState(false)
  const [activating, setActivating] = useState(false)
  const [brandOverride, setBrandOverride] = useState('')
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
  const xpEarned = passCount * 30
  const xpPct = (xpEarned / 240) * 100
  const failCount = CSS_CHECKS.length - passCount

  const updatePreview = useCallback((css, override = '') => {
    if (!iframeRef.current) return
    iframeRef.current.srcdoc = buildPreview(css, variantIdx, override)
  }, [variantIdx])

  useEffect(() => {
    if (tab === 'preview') updatePreview(cssCode, brandOverride)
  }, [cssCode, tab, brandOverride, updatePreview])

  // Run the checks against the offscreen iframe whenever the CSS settles. Execution
  // checks read the rendered computed styles; regex checks read the raw source.
  const runChecks = useCallback(() => {
    const iframe = checkIframeRef.current
    const doc = iframe?.contentDocument
    const win = iframe?.contentWindow
    if (!doc || !win || !doc.querySelector('.city-wrap')) return
    const results = CSS_CHECKS.map(c => {
      let passed = false
      try { passed = !!c.test(doc, win, cssCode) } catch { passed = false }
      return { ...c, passed }
    })
    setChecks(results)
    const newPass = results.filter(r => r.passed).length
    if (newPass > prevPassRef.current) {
      setXpPopText(`+${(newPass - prevPassRef.current) * 30} XP`)
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
      body: { code: cssCode, quest_title: 'Gate 04 — Paint the City', requirements: 'Write a CSS design system using custom properties: define color and spacing variables in :root, use var() throughout all rules, no hardcoded hex values outside :root, include a @media breakpoint.', language: 'css' },
    }).then(({ data }) => setAiReview(data ?? null)).catch(() => setAiReview(null))
  }, [allPassed]) // eslint-disable-line react-hooks/exhaustive-deps

  const statusText = pasteBlocked
    ? '⊘ Paste disabled — type your design system'
    : allPassed
    ? 'Protocol ready — activate the override'
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
    setTab('preview')
    updatePreview(cssCode, '')
    const override = generateOverride(cssCode)
    setTimeout(() => {
      setBrandOverride(override)
      if (iframeRef.current) iframeRef.current.srcdoc = buildPreview(cssCode, variantIdx, override)
    }, 700)
    setTimeout(() => setQuizOpen(true), 2000)
  }

  function handleQuizPass() {
    setQuizOpen(false)
    setTimeout(() => setDungeonEntry(true), 750)
    setTimeout(() => { setDungeonEntry(false); setModalOpen(true) }, 3350)
  }

  const slotClass = [
    'dq4-protocol-slot',
    allPassed ? 'ready' : 'locked',
    activating ? 'activating' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className="dq-wrap dq-wrap-g4">

      {/* Offscreen iframe that actually renders the student's CSS for the checks */}
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
          <span className="dq-chapter">RANK E GATE · GATE 04</span>
          <span className="dq-title-label">Paint the City</span>
        </div>
        <div className="dq-xp-row">
          <div className="dq-xp-bar-wrap">
            <div className="dq-xp-fill" style={{ width: `${xpPct}%` }} />
          </div>
          <span className="dq-xp-text">{xpEarned} / 240 XP</span>
        </div>
      </div>

      <div className="dq-main">

        {/* ── Left panel ──────────────────────────────────────────────────── */}
        <aside className="dq-brief">

          <div className="dq-scene-art">
            <div className="dq-scene-torch left" />
            <div className="dq-scene-torch right" />
            <div className={`dq4-scene-matrix${allPassed ? ' complete' : ''}`}>
              {CSS_CHECKS.map((c, i) => (
                <div key={c.id} className={`dq4-swatch dq4-swatch-${i + 1}${checks[i]?.passed ? ' lit' : ''}`} />
              ))}
            </div>
          </div>

          <div className="dq-narrator-box">
            <div className="dq-narrator-label">▶ NARRATOR</div>
            <p className="dq-narrator-text">
              847 shades of "the same green." One brand update. 200 files broken.
              Define the Color Protocol — custom properties for every visual decision.{' '}
              <strong>Then activate the override. The city rewrites itself.</strong>
            </p>
          </div>

          <div>
            <div className="dq-section-label">
              COLOR AUDIT —{' '}
              <span style={{ color: allPassed ? 'var(--lime)' : 'oklch(0.62 0.22 25)' }}>
                {allPassed ? 'ALL CLEAR' : `${failCount} FAILING`}
              </span>
            </div>
            <ul className="dq-objectives">
              {CSS_CHECKS.map((chk, i) => {
                const ok = checks[i]?.passed
                return (
                  <li key={chk.id} className={ok ? 'done' : 'error'}>
                    <div className="dq-obj-box dq4-obj-box">{ok ? '✓' : '!'}</div>
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
            <div className="dq-reward eva"><div className="l">REWARD</div><div className="v">+195 DRIFT</div></div>
            <div className="dq-reward xp"><div className="l">XP</div><div className="v">+240</div></div>
          </div>
        </aside>

        {/* ── Right panel ─────────────────────────────────────────────────── */}
        <div className="dq-editor-wrap">

          <div className="dq-tabs">
            <div
              className={`dq-tab${tab === 'code' ? ' active' : ''}`}
              onClick={() => setTab('code')}
            >
              styles.css <span className="dq-dot" />
            </div>
            <div
              className={`dq-tab${tab === 'preview' ? ' active' : ''}`}
              onClick={() => { setTab('preview'); updatePreview(cssCode, brandOverride) }}
            >
              Live Preview
              {brandOverride && <span className="dq4-override-chip">OVERRIDE</span>}
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
            <iframe
              ref={iframeRef}
              className="dq4-preview-frame"
              title="CSS Live Preview"
              sandbox="allow-scripts"
            />
          )}

          {/* Protocol Override slot */}
          <div className={`dq4-slot-wrap${allPassed ? ' ready' : ''}`}>
            <div className="dq4-slot-label">
              {brandOverride
                ? '⊕ PROTOCOL OVERRIDE ACTIVE — the cascade updated the entire city'
                : allPassed
                ? '⊕ PROTOCOL READY — click to activate the override'
                : `⊗ PROTOCOL LOCKED — ${failCount} condition${failCount !== 1 ? 's' : ''} failing`}
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
          <div className="dq-de-xp">+240 XP</div>
          <div className="dq-de-label">Color Protocol — Established</div>
        </div>
      )}

      {/* ── Completion modal ──────────────────────────────────────────────── */}
      <div className={`dq-complete-modal${modalOpen ? ' open' : ''}`}>
        <div className="dq-complete-inner">
          <span className="dq-badge-icon">🎨</span>
          <div className="dq-complete-chip">PROTOCOL ESTABLISHED</div>
          <h2>Color Protocol Established.</h2>
          <p>
            847 hardcoded values collapsed into a single source of truth.
            You changed five variables and the entire city shifted.{' '}
            <strong>That&apos;s the cascade working the way it was designed.</strong>
          </p>
          <div className="dq-complete-rewards">
            <div className="r"><div className="l">$DRIFT EARNED</div><div className="v">+195</div></div>
            <div className="r"><div className="l">XP GAINED</div><div className="v">+240</div></div>
            <div className="r"><div className="l">ITEM</div><div className="v">Color Protocol</div></div>
            <div className="r"><div className="l">RANK</div><div className="v">CSS Architect I</div></div>
          </div>
          <div className="dq-next-quest">
            <div className="dq-nq-label">GATE 05 UNLOCKED</div>
            <div className="dq-nq-card" onClick={async () => { await completeQuest('act1-ch04', 240, getAnalytics()); goto('quest5') }} style={{ cursor: 'pointer' }}>
              <span className="dq-nq-emoji">⚓</span>
              <div>
                <div className="dq-nq-title">Gate 05 — The Gravity Anchor</div>
                <div className="dq-nq-sub">Flexbox layouts · Rank D</div>
              </div>
              <span className="dq-nq-arrow">→</span>
            </div>
          </div>
          <button
            className="btn btn-primary"
            onClick={async () => { await completeQuest('act1-ch04', 240, getAnalytics()); goto('dashboard') }}
          >
            Continue →
          </button>
        </div>
      </div>

    </div>
  )
}

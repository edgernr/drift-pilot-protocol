import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import './Quest.css'
import './Quest4.css'
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

const VARIANT_NAMES = [
  'Sector Zero — District Status',
  'Command Centre — Mission Board',
  'Reactor Grid — System Monitor',
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

// ─── CSS checks ───────────────────────────────────────────────────────────────

const CSS_CHECKS = [
  {
    id: 'root_vars',
    label: ':root custom properties declared',
    hint: 'Open a :root { } block and declare at least one -- custom property inside',
    test: css => /:root\s*\{[^}]*--[a-z]/.test(css),
  },
  {
    id: 'color_tokens',
    label: 'Color system: 3+ color variables',
    hint: 'Define 3+ custom properties with color values — #hex, oklch(), rgb(), hsl(), or named colors',
    test: css => {
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
    id: 'spacing_tokens',
    label: 'Spacing system: 2+ size variables',
    hint: 'Define 2+ custom properties with size values — 8px, 1rem, 16px, 100%, etc.',
    test: css => {
      const rootBlock = css.match(/:root\s*\{([^}]+)\}/)
      if (!rootBlock) return false
      const lines = rootBlock[1].split('\n').filter(l => l.includes('--') && l.includes(':'))
      return lines.filter(l => /[\d.]+(?:px|rem|em|%|vh|vw)/.test(l.slice(l.indexOf(':') + 1))).length >= 2
    },
  },
  {
    id: 'var_used',
    label: 'Variables applied with var()',
    hint: 'Use var(--your-variable) inside CSS rules outside :root',
    test: css => /var\s*\(\s*--/.test(css.replace(/:root\s*\{[^}]+\}/, '')),
  },
  {
    id: 'no_hex_rules',
    label: 'Zero hardcoded #hex in rules',
    hint: 'All #hex colors must live in :root — class rules must reference var(--...) only',
    test: css => !/#[0-9a-fA-F]{3,8}/.test(css.replace(/:root\s*\{[^}]+\}/, '')),
  },
  {
    id: 'header_styled',
    label: '.city-header styled with variables',
    hint: 'Add a .city-header { } rule that uses at least one var(--...)',
    test: css => /\.city-header\s*\{[^}]*var\s*\(\s*--[^)]+\)[^}]*\}/.test(css),
  },
  {
    id: 'card_styled',
    label: '.status-card styled with variables',
    hint: 'Add a .status-card { } rule that uses at least one var(--...)',
    test: css => /\.status-card\s*\{[^}]*var\s*\(\s*--[^)]+\)[^}]*\}/.test(css),
  },
  {
    id: 'responsive',
    label: 'Responsive @media breakpoint added',
    hint: 'Add a @media (max-width: ...) or @media (min-width: ...) block',
    test: css => /@media\s*\([^)]*(?:max|min)-width[^)]*\)/.test(css),
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

function lineNumbers(text) {
  const n = text.split('\n').length
  return Array.from({ length: n }, (_, i) => <div key={i}>{i + 1}</div>)
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

  const iframeRef = useRef(null)
  const cssLnRef = useRef(null)
  const cssTaRef = useRef(null)

  const checks = useMemo(
    () => CSS_CHECKS.map(c => ({ ...c, passed: c.test(cssCode) })),
    [cssCode]
  )
  const passCount = checks.filter(c => c.passed).length
  const allPassed = passCount === CSS_CHECKS.length
  const xpEarned = passCount * 25
  const xpPct = (xpEarned / 200) * 100
  const failCount = CSS_CHECKS.length - passCount

  const updatePreview = useCallback((css, override = '') => {
    if (!iframeRef.current) return
    iframeRef.current.srcdoc = buildPreview(css, variantIdx, override)
  }, [variantIdx])

  useEffect(() => {
    if (tab === 'preview') updatePreview(cssCode, brandOverride)
  }, [cssCode, tab, brandOverride, updatePreview])

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

  function handleCssChange(e) {
    const val = e.target.value
    const prevPassed = passCount
    setCssCode(val)
    trackChange(val.length)
    const newPassed = CSS_CHECKS.filter(c => c.test(val)).length
    if (newPassed > prevPassed) {
      setXpPopText(`+${(newPassed - prevPassed) * 25} XP`)
      setXpPopKey(k => k + 1)
    }
  }

  function syncScroll(taRef, lnRef) {
    if (taRef.current && lnRef.current) lnRef.current.scrollTop = taRef.current.scrollTop
  }

  function handleTabKey(e) {
    if (e.key !== 'Tab') return
    e.preventDefault()
    const ta = e.target
    const s = ta.selectionStart, en = ta.selectionEnd
    const next = ta.value.slice(0, s) + '  ' + ta.value.slice(en)
    setCssCode(next)
    requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = s + 2 })
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
          <span className="dq-xp-text">{xpEarned} / 200 XP</span>
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
            <div className="dq-reward eva"><div className="l">REWARD</div><div className="v">+200 DRIFT</div></div>
            <div className="dq-reward xp"><div className="l">XP</div><div className="v">+200</div></div>
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
            <div className="dq-editor-inner">
              <div className="dq-line-numbers" ref={cssLnRef}>{lineNumbers(cssCode)}</div>
              <textarea
                ref={cssTaRef}
                className="dq-textarea"
                value={cssCode}
                onChange={handleCssChange}
                onKeyDown={handleTabKey}
                onPaste={onPaste}
                onScroll={() => syncScroll(cssTaRef, cssLnRef)}
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
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
          <div className="dq-de-xp">+200 XP</div>
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
            <div className="r"><div className="l">$DRIFT EARNED</div><div className="v">+200</div></div>
            <div className="r"><div className="l">XP GAINED</div><div className="v">+200</div></div>
            <div className="r"><div className="l">ITEM</div><div className="v">Color Protocol</div></div>
            <div className="r"><div className="l">RANK</div><div className="v">CSS Architect I</div></div>
          </div>
          <div className="dq-next-quest">
            <div className="dq-nq-label">GATE 05 UNLOCKED</div>
            <div className="dq-nq-card">
              <span className="dq-nq-emoji">📐</span>
              <div>
                <div className="dq-nq-title">Gate 05</div>
                <div className="dq-nq-sub">Coming Soon</div>
              </div>
              <span className="dq-nq-arrow">→</span>
            </div>
          </div>
          <button
            className="btn btn-primary"
            onClick={async () => { await completeQuest('act1-ch04', 200, getAnalytics()); goto('dashboard') }}
          >
            Continue →
          </button>
        </div>
      </div>

    </div>
  )
}

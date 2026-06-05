import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import './Quest.css'
import './Quest5.css'
import { useNav } from '../context/NavigationContext'
import { useAuth } from '../context/AuthContext'
import { useQuestAnalytics } from '../hooks/useQuestAnalytics'
import QuestQuiz from './QuestQuiz'
import { supabase } from '../lib/supabase'

// ─── HTML templates ────────────────────────────────────────────────────────────

const VARIANT_HTML = [
  // Variant 0: Sector Zero
  `<div class="layout-wrap">
  <nav class="site-nav">
    <div class="nav-brand">◈ SECTOR ZERO</div>
    <div class="nav-links">
      <a class="nav-link" href="#">Docs</a>
      <a class="nav-link" href="#">Status</a>
      <a class="nav-link" href="#">API</a>
    </div>
    <a class="nav-cta" href="#">Launch →</a>
  </nav>
  <section class="hero-section">
    <div class="hero-content">
      <h1 class="hero-title">Sector Zero</h1>
      <p class="hero-sub">Deploy. Monitor. Own your sector.</p>
      <button class="hero-btn">Get Started</button>
    </div>
  </section>
  <div class="card-row">
    <div class="card"><div class="card-icon">⬡</div><div class="card-title">Data Vault</div><div class="card-body">Encrypted storage layer. Zero exposure risk.</div></div>
    <div class="card"><div class="card-icon">◈</div><div class="card-title">Signal Tower</div><div class="card-body">Real-time broadcast to the full district network.</div></div>
    <div class="card"><div class="card-icon">⟐</div><div class="card-title">Cipher Node</div><div class="card-body">Auth layer. All access verified and logged.</div></div>
  </div>
  <div class="two-col">
    <div class="col-main"><h2 class="col-title">District Intelligence</h2><p class="col-body">Full operational overview. All 12 sectors reporting nominal status.</p></div>
    <div class="col-aside"><div class="stat-label">NODES ONLINE</div><div class="stat-value">847</div></div>
  </div>
</div>`,

  // Variant 1: Command Centre
  `<div class="layout-wrap">
  <nav class="site-nav">
    <div class="nav-brand">⟐ COMMAND CENTRE</div>
    <div class="nav-links">
      <a class="nav-link" href="#">Ops</a>
      <a class="nav-link" href="#">Intel</a>
      <a class="nav-link" href="#">Deploy</a>
    </div>
    <a class="nav-cta" href="#">Secure →</a>
  </nav>
  <section class="hero-section">
    <div class="hero-content">
      <h1 class="hero-title">Command Centre</h1>
      <p class="hero-sub">Mission control for the entire district grid.</p>
      <button class="hero-btn">Open HQ</button>
    </div>
  </section>
  <div class="card-row">
    <div class="card"><div class="card-icon">▶</div><div class="card-title">Op Phoenix</div><div class="card-body">Active mission. Team Alpha deployed. 94% strength.</div></div>
    <div class="card"><div class="card-icon">◎</div><div class="card-title">Op Nightfall</div><div class="card-body">Awaiting intel clearance. Standby protocol active.</div></div>
    <div class="card"><div class="card-icon">✓</div><div class="card-title">Op Gridlock</div><div class="card-body">Objectives cleared. District secured.</div></div>
  </div>
  <div class="two-col">
    <div class="col-main"><h2 class="col-title">Mission Overview</h2><p class="col-body">Three active operations. One complete. Zero casualties recorded.</p></div>
    <div class="col-aside"><div class="stat-label">ACTIVE OPS</div><div class="stat-value">3</div></div>
  </div>
</div>`,

  // Variant 2: Reactor Grid
  `<div class="layout-wrap">
  <nav class="site-nav">
    <div class="nav-brand">※ REACTOR GRID</div>
    <div class="nav-links">
      <a class="nav-link" href="#">Cores</a>
      <a class="nav-link" href="#">Cooling</a>
      <a class="nav-link" href="#">Alerts</a>
    </div>
    <a class="nav-cta" href="#">Monitor →</a>
  </nav>
  <section class="hero-section">
    <div class="hero-content">
      <h1 class="hero-title">Reactor Grid</h1>
      <p class="hero-sub">Core systems nominal. Containment holding.</p>
      <button class="hero-btn">View Cores</button>
    </div>
  </section>
  <div class="card-row">
    <div class="card"><div class="card-icon">⚡</div><div class="card-title">Primary Core</div><div class="card-body">100% output. All systems stable and nominal.</div></div>
    <div class="card"><div class="card-icon">〰</div><div class="card-title">Coolant Loop</div><div class="card-body">18°C nominal. Flow rate optimal across all channels.</div></div>
    <div class="card"><div class="card-icon">⊕</div><div class="card-title">Containment</div><div class="card-body">Field at 98%. No breaches detected in last 72h.</div></div>
  </div>
  <div class="two-col">
    <div class="col-main"><h2 class="col-title">System Report</h2><p class="col-body">All three reactor cores operational. Last inspection 6 hours ago.</p></div>
    <div class="col-aside"><div class="stat-label">UPTIME</div><div class="stat-value">99.9%</div></div>
  </div>
</div>`,
]

// ─── Starting CSS scaffold ─────────────────────────────────────────────────────

const START_CSS = `/* Gate 05 — The Gravity Anchor
   District layout collapsed when the absolute anchors failed.
   Restore flow using Flexbox only.

   The HTML is pre-built. Your job is the CSS.
   .nav-brand::after uses position: absolute — that one is legitimate, leave it.

   Checks to pass:
   1. .site-nav uses display: flex
   2. .nav-links uses display: flex
   3. .nav-cta has margin-left: auto (pushes it to the far right)
   4. .card-row uses display: flex
   5. .two-col uses display: flex
   6. .hero-section uses display: flex + justify-content: center + align-items: center */

* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: system-ui, sans-serif;
  background: #0a0d18;
  color: #e8ecff;
  min-height: 100vh;
}

/* Layout wrapper */
.layout-wrap {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 24px;
}

/* The one legitimate absolute element */
.nav-brand {
  position: relative;
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.08em;
}
.nav-brand::after {
  content: '●';
  position: absolute;
  top: -3px;
  right: -10px;
  color: #22d3ee;
  font-size: 5px;
}

/* Nav — add Flexbox here */
.site-nav {
  padding: 16px 0;
  border-bottom: 1px solid rgba(180,200,255,0.08);
  align-items: center;
}

.nav-links {
  gap: 24px;
}

.nav-link {
  font-size: 13px;
  color: #b8c0d9;
  text-decoration: none;
}

/* Push this item to the far right */
.nav-cta {
  font-size: 13px;
  font-weight: 600;
  color: #22d3ee;
  text-decoration: none;
  padding: 6px 14px;
  border: 1px solid #22d3ee;
  border-radius: 4px;
}

/* Hero — center content both axes */
.hero-section {
  min-height: 260px;
  padding: 60px 0;
}

.hero-content { text-align: center; }
.hero-title { font-size: 40px; font-weight: 700; margin-bottom: 12px; }
.hero-sub { font-size: 16px; color: #b8c0d9; margin-bottom: 24px; }
.hero-btn {
  padding: 10px 24px;
  background: #22d3ee;
  color: #0a0d18;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
}

/* Cards — equal height row */
.card-row {
  padding: 40px 0;
  gap: 16px;
}

.card {
  flex: 1;
  padding: 24px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(180,200,255,0.1);
  border-radius: 8px;
}

.card-icon { font-size: 24px; margin-bottom: 12px; }
.card-title { font-weight: 600; margin-bottom: 8px; }
.card-body { font-size: 13px; color: #7a8199; line-height: 1.5; }

/* Two-column layout */
.two-col {
  padding: 40px 0;
  gap: 40px;
  border-top: 1px solid rgba(180,200,255,0.08);
  align-items: center;
}

.col-main { flex: 1; }
.col-title { font-size: 22px; font-weight: 600; margin-bottom: 12px; }
.col-body { font-size: 14px; color: #b8c0d9; line-height: 1.6; }

.col-aside { flex-shrink: 0; text-align: right; }
.stat-label { font-size: 10px; letter-spacing: 0.1em; color: #4a5070; margin-bottom: 4px; }
.stat-value { font-size: 48px; font-weight: 700; color: #22d3ee; }
`

// ─── Quiz ─────────────────────────────────────────────────────────────────────

const QUIZ = {
  question: 'Your nav has brand + links grouped on the left, and one item alone on the right. How did you achieve that without adding a wrapper or changing the HTML?',
  options: [
    'justify-content: space-between on the nav distributes all items, pushing the last one to the far right automatically',
    'margin-left: auto on .nav-cta consumes all available space before it, pushing it to the far right',
    'order: -1 on the brand reverses flex flow, naturally placing items on opposite ends',
    'flex-direction: row-reverse and reversed HTML order puts items on opposite sides',
  ],
  correct: 1,
}

// ─── CSS checks ───────────────────────────────────────────────────────────────

const CSS_CHECKS = [
  {
    id: 'nav_flex',
    label: 'Navigation anchored to flow',
    hint: 'Flexbox is activated on the parent container, not the children. To arrange .site-nav\'s children in a row, apply the flex display mode to .site-nav itself.',
    test: css => {
      const m = css.match(/\.site-nav\s*\{([^}]+)\}/)
      return m ? /display\s*:\s*flex/.test(m[1]) : false
    },
  },
  {
    id: 'nav_links_flex',
    label: 'Nav links in a row',
    hint: 'The .nav-links element is the parent of the individual links. To make those links sit side by side in a row, turn .nav-links itself into a flex container.',
    test: css => {
      const m = css.match(/\.nav-links\s*\{([^}]+)\}/)
      return m ? /display\s*:\s*flex/.test(m[1]) : false
    },
  },
  {
    id: 'nav_push',
    label: 'Nav item pushed to edge',
    hint: 'In flexbox, a margin set to auto on one side of an item consumes all remaining free space in that direction — effectively pushing the element to the opposite end.',
    test: css => {
      const m = css.match(/\.nav-cta\s*\{([^}]+)\}/)
      return m ? /margin-left\s*:\s*auto/.test(m[1]) : false
    },
  },
  {
    id: 'card_flex',
    label: 'Card row established',
    hint: 'The .card-row element is the parent of all the cards. Making it a flex container will arrange its children side by side horizontally.',
    test: css => {
      const m = css.match(/\.card-row\s*\{([^}]+)\}/)
      return m ? /display\s*:\s*flex/.test(m[1]) : false
    },
  },
  {
    id: 'two_col_flex',
    label: 'Two columns using flex',
    hint: 'A two-column layout — main content beside a sidebar — is a classic flexbox pattern. Apply it to the wrapper that contains both columns.',
    test: css => {
      const m = css.match(/\.two-col\s*\{([^}]+)\}/)
      return m ? /display\s*:\s*flex/.test(m[1]) : false
    },
  },
  {
    id: 'hero_center',
    label: 'Hero centered both axes',
    hint: 'Centering content both horizontally and vertically in a flex container requires two separate alignment properties — one controls the main axis, the other controls the cross axis.',
    test: css => {
      const m = css.match(/\.hero-section\s*\{([^}]+)\}/)
      if (!m) return false
      return /display\s*:\s*flex/.test(m[1]) && /justify-content\s*:\s*center/.test(m[1]) && /align-items\s*:\s*center/.test(m[1])
    },
  },
]

// ─── Preview builder ──────────────────────────────────────────────────────────

function buildPreview(css, variantIndex) {
  const html = VARIANT_HTML[variantIndex]
  const reset = `<style>*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; } body { font-family: system-ui, sans-serif; } a { text-decoration: none; }</style>`
  return `<!DOCTYPE html><html><head>${reset}<style>${css}</style></head><body>${html}</body></html>`
}

function lineNumbers(text) {
  const n = text.split('\n').length
  return Array.from({ length: n }, (_, i) => <div key={i}>{i + 1}</div>)
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Quest5() {
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

  const iframeRef = useRef(null)
  const cssLnRef = useRef(null)
  const cssTaRef = useRef(null)

  const checks = useMemo(
    () => CSS_CHECKS.map(c => ({ ...c, passed: c.test(cssCode) })),
    [cssCode]
  )
  const passCount = checks.filter(c => c.passed).length
  const allPassed = passCount === CSS_CHECKS.length
  const xpEarned = passCount * 40
  const xpPct = (xpEarned / 240) * 100
  const failCount = CSS_CHECKS.length - passCount

  const updatePreview = useCallback((css) => {
    if (!iframeRef.current) return
    iframeRef.current.srcdoc = buildPreview(css, variantIdx)
  }, [variantIdx])

  useEffect(() => {
    if (tab === 'preview') updatePreview(cssCode)
  }, [cssCode, tab, updatePreview])

  useEffect(() => {
    if (!allPassed) { setAiReview(null); return }
    setAiReview('loading')
    supabase.functions.invoke('grade-code', {
      body: {
        code: cssCode,
        quest_title: 'Gate 05 — The Gravity Anchor',
        requirements: 'Use Flexbox to recreate a district layout: nav with display:flex, nav-links with display:flex, nav-cta with margin-left:auto to push right, card-row with display:flex, two-col with display:flex, hero-section centered with display:flex + justify-content:center + align-items:center.',
        language: 'css',
      },
    }).then(({ data }) => setAiReview(data ?? null)).catch(() => setAiReview(null))
  }, [allPassed]) // eslint-disable-line react-hooks/exhaustive-deps

  const statusText = pasteBlocked
    ? '⊘ Paste disabled — type the code'
    : allPassed
    ? 'Gravity restored — deploy the anchor'
    : `${failCount} check${failCount !== 1 ? 's' : ''} failing`

  function handleCssChange(e) {
    const val = e.target.value
    const prevPassed = passCount
    setCssCode(val)
    trackChange(val.length)
    const newPassed = CSS_CHECKS.filter(c => c.test(val)).length
    if (newPassed > prevPassed) {
      setXpPopText(`+${(newPassed - prevPassed) * 40} XP`)
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
    setTimeout(() => setQuizOpen(true), 600)
  }

  function handleQuizPass() {
    setQuizOpen(false)
    setTimeout(() => setDungeonEntry(true), 750)
    setTimeout(() => { setDungeonEntry(false); setModalOpen(true) }, 3350)
  }

  const slotClass = ['dq5-gravity-slot', allPassed ? 'ready' : 'locked', activating ? 'activating' : ''].filter(Boolean).join(' ')

  return (
    <div className="dq-wrap dq-wrap-g5">

      <div className="dq-topbar">
        <span className="dq-back" onClick={() => goto('dashboard')}>← Dashboard</span>
        <div className="dq-topbar-center">
          <span className="dq-chapter">RANK D GATE · GATE 05</span>
          <span className="dq-title-label">The Gravity Anchor</span>
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
            <div className={`dq5-scene-anchor${allPassed ? ' deployed' : ''}`}>
              <div className="dq5-anchor-hub" />
              {[0,1,2,3,4,5].map(i => (
                <div key={i} className={`dq5-arm dq5-arm-${i+1}${checks[i]?.passed ? ' lit' : ''}`} />
              ))}
            </div>
          </div>

          <div className="dq-narrator-box">
            <div className="dq-narrator-label">▶ NARRATOR</div>
            <p className="dq-narrator-text">
              District Zero&apos;s layout collapsed when the absolute anchors failed.
              Every element drifted. Restore the flow.{' '}
              <strong>Deploy the gravity anchor using Flexbox only.</strong>
            </p>
          </div>

          <div>
            <div className="dq-section-label">
              FLOW DIAGNOSTIC —{' '}
              <span style={{ color: allPassed ? 'var(--lime)' : 'oklch(0.62 0.22 25)' }}>
                {allPassed ? 'ALL CLEAR' : `${failCount} FAILING`}
              </span>
            </div>
            <ul className="dq-objectives">
              {CSS_CHECKS.map((chk, i) => {
                const ok = checks[i]?.passed
                return (
                  <li key={chk.id} className={ok ? 'done' : 'error'}>
                    <div className="dq-obj-box dq5-obj-box">{ok ? '✓' : '!'}</div>
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
            <div className="dq-reward eva"><div className="l">REWARD</div><div className="v">+225 DRIFT</div></div>
            <div className="dq-reward xp"><div className="l">XP</div><div className="v">+280</div></div>
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
            <iframe ref={iframeRef} className="dq5-preview-frame" title="Flexbox Preview" sandbox="allow-scripts" />
          )}

          {/* Gravity Lock slot */}
          <div className={`dq5-slot-wrap${allPassed ? ' ready' : ''}`}>
            <div className="dq5-slot-label">
              {allPassed
                ? '⚓ GRAVITY RESTORED — deploy the anchor'
                : `⊗ ANCHOR LOCKED — ${failCount} condition${failCount !== 1 ? 's' : ''} failing`}
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
          <div className="dq-de-xp">+280 XP</div>
          <div className="dq-de-label">Gravity Anchor — Deployed</div>
        </div>
      )}

      {/* ── Completion modal ──────────────────────────────────────────────── */}
      <div className={`dq-complete-modal${modalOpen ? ' open' : ''}`}>
        <div className="dq-complete-inner">
          <span className="dq-badge-icon">⚓</span>
          <div className="dq-complete-chip">GRAVITY RESTORED</div>
          <h2>Gravity Anchor Deployed.</h2>
          <p>
            Every element was drifting. Now they flow.
            The nav pushes its item right without touching the HTML.{' '}
            <strong>That&apos;s margin-left: auto at work.</strong>
          </p>
          <div className="dq-complete-rewards">
            <div className="r"><div className="l">$DRIFT EARNED</div><div className="v">+225</div></div>
            <div className="r"><div className="l">XP GAINED</div><div className="v">+280</div></div>
            <div className="r"><div className="l">ITEM</div><div className="v">Gravity Anchor Fragment</div></div>
            <div className="r"><div className="l">ITEM</div><div className="v">Flex License I</div></div>
          </div>
          <div className="dq-next-quest">
            <div className="dq-nq-label">GATE 06 UNLOCKED</div>
            <div className="dq-nq-card" onClick={async () => { await completeQuest('act1-ch05', 280, getAnalytics()); goto('quest6') }} style={{ cursor: 'pointer' }}>
              <span className="dq-nq-emoji">⬛</span>
              <div>
                <div className="dq-nq-title">Gate 06 — The Infinite Grid</div>
                <div className="dq-nq-sub">CSS Grid layouts · Rank D</div>
              </div>
              <span className="dq-nq-arrow">→</span>
            </div>
          </div>
          <button
            className="btn btn-primary"
            onClick={async () => { await completeQuest('act1-ch05', 280, getAnalytics()); goto('dashboard') }}
          >
            Continue →
          </button>
        </div>
      </div>

    </div>
  )
}

import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import './Quest.css'
import './Quest7.css'
import { useNav } from '../context/NavigationContext'
import { useAuth } from '../context/AuthContext'
import { useQuestAnalytics } from '../hooks/useQuestAnalytics'
import QuestQuiz from './QuestQuiz'
import { supabase } from '../lib/supabase'

// ─── HTML templates ────────────────────────────────────────────────────────────

const VARIANT_HTML = [
  // Variant 0: Sector components
  `<div class="component-lab">
  <h2 class="lab-title">Component Lab — Sector Zero</h2>

  <div class="lab-section">
    <div class="lab-label">BUTTON</div>
    <button class="btn-primary">Launch Node</button>
    <button class="btn-ghost">Cancel</button>
  </div>

  <div class="lab-section">
    <div class="lab-label">CARD</div>
    <div class="hover-card">
      <div class="card-tag">NODE ALPHA</div>
      <div class="card-heading">Signal Active</div>
      <div class="card-body">All systems nominal. 847 connections maintained.</div>
    </div>
  </div>

  <div class="lab-section">
    <div class="lab-label">INPUT</div>
    <div class="input-wrap">
      <input class="text-input" type="text" placeholder="Enter sector ID..." />
    </div>
  </div>

  <div class="lab-section">
    <div class="lab-label">NOTIFICATION</div>
    <div class="notification">
      <span class="notif-icon">◈</span>
      <span class="notif-text">District Zero sync complete.</span>
    </div>
  </div>

  <div class="lab-section">
    <div class="lab-label">LOADER</div>
    <div class="loader-ring"></div>
  </div>
</div>`,

  // Variant 1: Command components
  `<div class="component-lab">
  <h2 class="lab-title">Component Lab — Command Centre</h2>

  <div class="lab-section">
    <div class="lab-label">BUTTON</div>
    <button class="btn-primary">Deploy Team</button>
    <button class="btn-ghost">Stand Down</button>
  </div>

  <div class="lab-section">
    <div class="lab-label">CARD</div>
    <div class="hover-card">
      <div class="card-tag">OP PHOENIX</div>
      <div class="card-heading">Mission Active</div>
      <div class="card-body">Team Alpha deployed. Objective Alpha cleared.</div>
    </div>
  </div>

  <div class="lab-section">
    <div class="lab-label">INPUT</div>
    <div class="input-wrap">
      <input class="text-input" type="text" placeholder="Operation codename..." />
    </div>
  </div>

  <div class="lab-section">
    <div class="lab-label">NOTIFICATION</div>
    <div class="notification">
      <span class="notif-icon">⟐</span>
      <span class="notif-text">Clearance level upgraded to Delta.</span>
    </div>
  </div>

  <div class="lab-section">
    <div class="lab-label">LOADER</div>
    <div class="loader-ring"></div>
  </div>
</div>`,

  // Variant 2: Reactor components
  `<div class="component-lab">
  <h2 class="lab-title">Component Lab — Reactor Grid</h2>

  <div class="lab-section">
    <div class="lab-label">BUTTON</div>
    <button class="btn-primary">Initiate Core</button>
    <button class="btn-ghost">Emergency Stop</button>
  </div>

  <div class="lab-section">
    <div class="lab-label">CARD</div>
    <div class="hover-card">
      <div class="card-tag">PRIMARY CORE</div>
      <div class="card-heading">Output Stable</div>
      <div class="card-body">Core temperature 18°C. Containment field at 98%.</div>
    </div>
  </div>

  <div class="lab-section">
    <div class="lab-label">INPUT</div>
    <div class="input-wrap">
      <input class="text-input" type="text" placeholder="Reactor ID..." />
    </div>
  </div>

  <div class="lab-section">
    <div class="lab-label">NOTIFICATION</div>
    <div class="notification">
      <span class="notif-icon">※</span>
      <span class="notif-text">Secondary core variance within tolerance.</span>
    </div>
  </div>

  <div class="lab-section">
    <div class="lab-label">LOADER</div>
    <div class="loader-ring"></div>
  </div>
</div>`,
]

const VARIANT_NAMES = ['Sector Zero', 'Command Centre', 'Reactor Grid']

// ─── Starting CSS scaffold ─────────────────────────────────────────────────────

const START_CSS = `/* Gate 07 — Ghost Feedback
   Five components are frozen — alive in HTML but lifeless on screen.
   Add transitions and transforms to make each interaction intentional.

   Checks to pass:
   1. .btn-primary has transition targeting transform (not transition: all)
   2. .btn-primary has transform: scale on :hover
   3. .hover-card has transform: translateY on :hover (negative — lifts up)
   4. .text-input has transition on border-color or outline (not transition: all)
   5. .notification has @keyframes with translateY from negative to 0 (slide in)
   6. .loader-ring has @keyframes rotation (rotate 360deg)
   7. No transition: all anywhere */

* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: system-ui, sans-serif;
  background: #0a0d18;
  color: #e8ecff;
  padding: 40px 24px;
}

.component-lab {
  max-width: 560px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.lab-title {
  font-size: 18px;
  font-weight: 600;
  color: #e8ecff;
  border-bottom: 1px solid rgba(180,200,255,0.08);
  padding-bottom: 16px;
}

.lab-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.lab-label {
  font-size: 9px;
  letter-spacing: 0.14em;
  color: #4a5070;
  font-family: monospace;
}

/* Button */
.btn-primary {
  display: inline-block;
  padding: 10px 22px;
  background: #c0d0e0;
  color: #0a0d18;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  margin-right: 8px;
}

.btn-ghost {
  display: inline-block;
  padding: 10px 22px;
  background: transparent;
  color: #c0d0e0;
  border: 1px solid rgba(192,208,224,0.3);
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
}

/* Card */
.hover-card {
  padding: 20px;
  background: rgba(192,208,224,0.04);
  border: 1px solid rgba(192,208,224,0.12);
  border-radius: 8px;
  cursor: pointer;
}

.card-tag {
  font-size: 9px;
  letter-spacing: 0.12em;
  color: #c0d0e0;
  margin-bottom: 6px;
}

.card-heading {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 6px;
}

.card-body {
  font-size: 13px;
  color: #7a8199;
  line-height: 1.5;
}

/* Input */
.input-wrap { display: flex; }

.text-input {
  width: 100%;
  padding: 10px 14px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(192,208,224,0.15);
  border-radius: 4px;
  color: #e8ecff;
  font-size: 13px;
  outline: none;
}

.text-input::placeholder { color: #4a5070; }

/* Notification */
.notification {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: rgba(192,208,224,0.06);
  border: 1px solid rgba(192,208,224,0.15);
  border-radius: 6px;
  font-size: 13px;
}

.notif-icon { color: #c0d0e0; font-size: 14px; }
.notif-text { color: #b8c0d9; }

/* Loader */
.loader-ring {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 3px solid rgba(192,208,224,0.15);
  border-top-color: #c0d0e0;
}
`

// ─── Quiz ─────────────────────────────────────────────────────────────────────

const QUIZ = {
  question: 'You used ease-out for the button\'s hover-enter transition. Why does that easing feel more natural than a linear transition?',
  options: [
    'ease-out is faster overall — it completes the transition in less total time than linear',
    'ease-out starts fast and slows at the end, matching how physical objects naturally decelerate when coming to rest',
    'ease-out prevents the browser from recalculating layout during the transition, making it more performant',
    'ease-out applies automatically to transform properties — other easing functions only work with opacity and color',
  ],
  correct: 1,
}

// ─── CSS checks ───────────────────────────────────────────────────────────────

const CSS_CHECKS = [
  {
    id: 'btn_transition',
    label: 'Button uses targeted transition',
    hint: 'To animate a property change smoothly, declare a transition on the element — naming the specific property, a duration, and an easing. Avoid the shortcut that catches every property at once.',
    test: css => {
      const m = css.match(/\.btn-primary\s*\{([^}]+)\}/)
      if (!m) return false
      return /transition\s*:[^;]*transform/.test(m[1]) && !/transition\s*:\s*all/.test(m[1])
    },
  },
  {
    id: 'btn_scale',
    label: 'Button scales on hover',
    hint: 'Scale is a transform function that grows or shrinks an element relative to its natural size. Apply it on the :hover state — a value slightly above 1.0 gives a subtle enlarge effect.',
    test: css => {
      const m = css.match(/\.btn-primary\s*:\s*hover\s*\{([^}]+)\}/)
      return m ? /transform\s*:[^;]*scale\s*\(/.test(m[1]) : false
    },
  },
  {
    id: 'card_lift',
    label: 'Card lifts on hover',
    hint: 'To lift an element upward on hover, use a transform that translates along the vertical axis. Moving up means a value in the negative direction.',
    test: css => {
      const m = css.match(/\.hover-card\s*:\s*hover\s*\{([^}]+)\}/)
      return m ? /transform\s*:[^;]*translateY\s*\(\s*-/.test(m[1]) : false
    },
  },
  {
    id: 'input_focus',
    label: 'Input responds to focus',
    hint: 'The input should visually change when focused. Define a transition on a specific visual property — like border color — on the base element, then change that property in the :focus state.',
    test: css => {
      const base = css.match(/\.text-input\s*\{([^}]+)\}/)
      const focus = css.match(/\.text-input\s*:\s*focus\s*\{([^}]+)\}/)
      if (!base || !focus) return false
      const hasTransition = /transition\s*:[^;]*(?:border|outline)/.test(base[1]) && !/transition\s*:\s*all/.test(base[1])
      const hasFocusChange = /border/.test(focus[1]) || /outline/.test(focus[1])
      return hasTransition && hasFocusChange
    },
  },
  {
    id: 'notif_slide',
    label: 'Notification enters from above',
    hint: 'CSS animations use @keyframes to describe motion over time. To slide something in from above, start it at a position above its natural location and end with no offset. Wire the animation to .notification.',
    test: css => {
      const hasKeyframes = /@keyframes\s+\w+[^{]*\{[^}]*translateY\s*\(\s*-/.test(css)
      const hasAnimation = /\.notification\s*\{[^}]*animation\s*:/.test(css)
      return hasKeyframes && hasAnimation
    },
  },
  {
    id: 'loader_spin',
    label: 'Loader rotates continuously',
    hint: 'A spinner needs to rotate a full turn, forever. Define @keyframes that describes one complete rotation, then apply it to .loader-ring and tell the animation how many times to repeat.',
    test: css => {
      const hasKeyframes = /@keyframes\s+\w+[^{]*\{[^}]*rotate\s*\(\s*360deg\s*\)/.test(css)
      const hasAnimation = /\.loader-ring\s*\{[^}]*animation\s*:/.test(css)
      return hasKeyframes && hasAnimation
    },
  },
  {
    id: 'no_transition_all',
    label: 'No transition: all anywhere',
    hint: '"all" as a transition target can trigger repaints on properties you never intended to animate. Name only the property that actually changes — it\'s faster and intentional.',
    test: css => !/transition\s*:\s*all/.test(css),
  },
]

// ─── Preview builder ──────────────────────────────────────────────────────────

function buildPreview(css, variantIndex) {
  const html = VARIANT_HTML[variantIndex]
  const reset = `<style>*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; } body { font-family: system-ui, sans-serif; } input { font-family: inherit; } button { font-family: inherit; cursor: pointer; border: none; }</style>`
  return `<!DOCTYPE html><html><head>${reset}<style>${css}</style></head><body>${html}</body></html>`
}

function lineNumbers(text) {
  const n = text.split('\n').length
  return Array.from({ length: n }, (_, i) => <div key={i}>{i + 1}</div>)
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Quest7() {
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
  const xpEarned = passCount * 50
  const xpPct = (xpEarned / 350) * 100
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
        quest_title: 'Gate 07 — Ghost Feedback',
        requirements: 'Add CSS transitions and transforms to a component library: .btn-primary has targeted transition on transform + scale on :hover, .hover-card has translateY(-Npx) on :hover, .text-input has transition on border-color/outline + visible :focus change, .notification slides in from above using @keyframes translateY, .loader-ring has continuous rotation @keyframes, no transition: all anywhere.',
        language: 'css',
      },
    }).then(({ data }) => setAiReview(data ?? null)).catch(() => setAiReview(null))
  }, [allPassed]) // eslint-disable-line react-hooks/exhaustive-deps

  const statusText = pasteBlocked
    ? '⊘ Paste disabled — type the code'
    : allPassed
    ? 'Figures awakened — transmit the signal'
    : `${failCount} component${failCount !== 1 ? 's' : ''} still frozen`

  function handleCssChange(e) {
    const val = e.target.value
    const prevPassed = passCount
    setCssCode(val)
    trackChange(val.length)
    const newPassed = CSS_CHECKS.filter(c => c.test(val)).length
    if (newPassed > prevPassed) {
      setXpPopText(`+${(newPassed - prevPassed) * 50} XP`)
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

  const slotClass = ['dq7-ghost-signal', allPassed ? 'ready' : 'locked', activating ? 'activating' : ''].filter(Boolean).join(' ')

  return (
    <div className="dq-wrap dq-wrap-g7">

      <div className="dq-topbar">
        <span className="dq-back" onClick={() => goto('dashboard')}>← Dashboard</span>
        <div className="dq-topbar-center">
          <span className="dq-chapter">RANK C GATE · GATE 07</span>
          <span className="dq-title-label">Ghost Feedback</span>
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
            <div className={`dq7-scene-figures${allPassed ? ' alive' : ''}`}>
              {[0,1,2,3,4,5,6].map(i => (
                <div key={i} className={`dq7-figure dq7-figure-${i+1}${checks[i]?.passed ? ' awake' : ''}`} />
              ))}
            </div>
          </div>

          <div className="dq-narrator-box">
            <div className="dq-narrator-label">▶ NARRATOR</div>
            <p className="dq-narrator-text">
              Five components. All functional. All dead.
              Buttons don&apos;t press. Cards don&apos;t lift. Inputs don&apos;t respond.{' '}
              <strong>Add the transitions that make interfaces feel alive.</strong>
            </p>
          </div>

          <div>
            <div className="dq-section-label">
              COMPONENT VITALS —{' '}
              <span style={{ color: allPassed ? 'var(--lime)' : 'oklch(0.62 0.22 25)' }}>
                {allPassed ? 'ALL ALIVE' : `${failCount} FROZEN`}
              </span>
            </div>
            <ul className="dq-objectives">
              {CSS_CHECKS.map((chk, i) => {
                const ok = checks[i]?.passed
                return (
                  <li key={chk.id} className={ok ? 'done' : 'error'}>
                    <div className="dq-obj-box dq7-obj-box">{ok ? '✓' : '!'}</div>
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
            <div className="dq-reward eva"><div className="l">REWARD</div><div className="v">+280 DRIFT</div></div>
            <div className="dq-reward xp"><div className="l">XP</div><div className="v">+350</div></div>
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
            <iframe ref={iframeRef} className="dq7-preview-frame" title="Motion Preview" sandbox="allow-scripts" />
          )}

          {/* Ghost Signal slot */}
          <div className={`dq7-slot-wrap${allPassed ? ' ready' : ''}`}>
            <div className="dq7-slot-label">
              {allPassed
                ? '👻 SIGNAL LIVE — transmit ghost feedback'
                : `⊗ SIGNAL DEAD — ${failCount} component${failCount !== 1 ? 's' : ''} still frozen`}
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
          <div className="dq-de-xp">+350 XP</div>
          <div className="dq-de-label">Ghost Feedback — Activated</div>
        </div>
      )}

      {/* ── Completion modal ──────────────────────────────────────────────── */}
      <div className={`dq-complete-modal${modalOpen ? ' open' : ''}`}>
        <div className="dq-complete-inner">
          <span className="dq-badge-icon">👻</span>
          <div className="dq-complete-chip">FEEDBACK RESTORED</div>
          <h2>The City Remembers How to Feel.</h2>
          <p>
            Buttons press. Cards lift. Inputs respond.
            The difference between a tool and an experience
            is a 200ms transition and a single easing curve.{' '}
            <strong>You built that difference.</strong>
          </p>
          <div className="dq-complete-rewards">
            <div className="r"><div className="l">$DRIFT EARNED</div><div className="v">+280</div></div>
            <div className="r"><div className="l">XP GAINED</div><div className="v">+350</div></div>
            <div className="r"><div className="l">ITEM</div><div className="v">Motion Fragment</div></div>
            <div className="r"><div className="l">ITEM</div><div className="v">Ghost Signal I</div></div>
          </div>
          <div className="dq-next-quest">
            <div className="dq-nq-label">GATE 08 UNLOCKED</div>
            <div className="dq-nq-card" onClick={async () => { await completeQuest('act1-ch07', 350, getAnalytics()); goto('quest8') }} style={{ cursor: 'pointer' }}>
              <span className="dq-nq-emoji">📱</span>
              <div>
                <div className="dq-nq-title">Gate 08 — The Collapse</div>
                <div className="dq-nq-sub">Responsive design · Rank C · Boss</div>
              </div>
              <span className="dq-nq-arrow">→</span>
            </div>
          </div>
          <button
            className="btn btn-primary"
            onClick={async () => { await completeQuest('act1-ch07', 350, getAnalytics()); goto('dashboard') }}
          >
            Continue →
          </button>
        </div>
      </div>

    </div>
  )
}

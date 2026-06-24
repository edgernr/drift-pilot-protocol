import { useState, useRef, useCallback, useEffect } from 'react'
import './Quest.css'
import './Quest9.css'
import Editor from '@monaco-editor/react'
import { useNav } from '../context/NavigationContext'
import { useAuth } from '../context/AuthContext'
import { useQuestAnalytics } from '../hooks/useQuestAnalytics'
import QuestQuiz from './QuestQuiz'
import GateAIHint from '../components/GateAIHint'
import { supabase } from '../lib/supabase'
import { stripComments } from '../lib/codeUtils'

// ─── Shared CSS injected into all preview iframes ─────────────────────────────

const CR_CSS = `
:root{--bg:#0a0d18;--panel:#111524;--border:rgba(180,200,255,.08);--text:#e8ecff;--ink2:#7a8199;--accent:#22d3ee}
body.theme-light{--bg:#f4f6ff;--panel:#e0e8ff;--border:rgba(0,0,100,.08);--text:#0a0d18;--ink2:#405070}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--bg);color:var(--text);font-family:system-ui,sans-serif;padding:12px;transition:background .3s,color .3s;font-size:13px}
h3{font-size:10px;letter-spacing:.1em;color:var(--accent);margin-bottom:10px;font-weight:600}
.cr-sec{background:var(--panel);border:1px solid var(--border);border-radius:5px;padding:12px;margin-bottom:10px}
.xp-disp{font-size:32px;font-weight:700;font-family:monospace;text-align:center;padding:6px;margin-bottom:8px}
.xp-btns{display:flex;gap:8px;justify-content:center}
.xp-btn{padding:5px 18px;background:rgba(255,255,255,.05);border:1px solid rgba(180,200,255,.12);border-radius:3px;color:var(--text);cursor:pointer;font-size:18px}
.xp-btn:active{background:rgba(255,255,255,.12)}
.cr-input{width:100%;padding:6px 9px;background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:3px;color:var(--text);font-size:12px;outline:none}
.cr-input:focus{border-color:var(--accent)}
.cr-list{list-style:none;margin-top:6px}
.cr-list li{padding:4px 8px;font-size:11px;color:var(--ink2);border-bottom:1px solid var(--border)}
.cr-list li.hidden{display:none}
.cr-field{margin-bottom:8px}
.cr-lbl{display:block;font-size:9px;letter-spacing:.08em;color:var(--ink2);margin-bottom:3px}
.cr-err{font-size:9px;color:#f43f5e;min-height:13px;margin-top:2px}
.cr-submit{width:100%;padding:7px;background:var(--accent);border:none;border-radius:3px;color:#0a0d18;font-weight:600;font-size:11px;cursor:pointer}
.cr-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.theme-btn{padding:5px 12px;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:3px;color:var(--text);cursor:pointer;font-size:11px}
#theme-status{font-size:10px;color:var(--ink2)}
#key-log{margin-top:6px;font-size:10px;color:var(--ink2);font-family:monospace;min-height:14px}
`

// ─── HTML templates (same IDs, different EVA City contexts) ───────────────────

const VARIANT_HTML = [
  // Variant 0 — Sector Zero
  `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Sector Zero Control Room</title><style>${CR_CSS}</style></head>
<body><div>
  <div class="cr-sec">
    <h3>⬡ XP COUNTER — SECTOR ZERO</h3>
    <div class="xp-disp" id="xp-count">0</div>
    <div class="xp-btns">
      <button class="xp-btn" id="xp-minus">−</button>
      <button class="xp-btn" id="xp-plus">+</button>
    </div>
  </div>
  <div class="cr-sec">
    <h3>◈ CITIZEN SEARCH</h3>
    <input class="cr-input" id="search-input" type="text" placeholder="Search citizens…" autocomplete="off" />
    <ul class="cr-list" id="citizen-list">
      <li>Alpha-7 · Sector Zero · Seeker</li>
      <li>Bravo-12 · Command Centre · Engineer</li>
      <li>Echo-3 · Reactor Grid · Technician</li>
      <li>Delta-9 · Signal Tower · Operator</li>
      <li>Foxtrot-1 · Vault Sector · Architect</li>
      <li>Gamma-5 · Cipher Node · Analyst</li>
    </ul>
  </div>
  <div class="cr-sec">
    <h3>⟐ CITIZEN REGISTRATION</h3>
    <form id="register-form">
      <div class="cr-field">
        <label class="cr-lbl" for="reg-email">EMAIL</label>
        <input class="cr-input" id="reg-email" type="text" placeholder="seeker@sector.zero" autocomplete="off" />
        <div class="cr-err" id="email-error"></div>
      </div>
      <button class="cr-submit" type="submit">REGISTER CITIZEN</button>
    </form>
  </div>
  <div class="cr-sec">
    <h3>◎ SYSTEM CONTROLS</h3>
    <div class="cr-row">
      <button class="theme-btn" id="theme-toggle">Toggle Theme</button>
      <span id="theme-status">Dark</span>
    </div>
    <div id="key-log">Press any key…</div>
  </div>
</div></body></html>`,

  // Variant 1 — Command Centre
  `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Command Centre Control Room</title><style>${CR_CSS}</style></head>
<body><div>
  <div class="cr-sec">
    <h3>⟐ OP COUNTER — COMMAND HQ</h3>
    <div class="xp-disp" id="xp-count">0</div>
    <div class="xp-btns">
      <button class="xp-btn" id="xp-minus">−</button>
      <button class="xp-btn" id="xp-plus">+</button>
    </div>
  </div>
  <div class="cr-sec">
    <h3>◈ SEEKER SEARCH</h3>
    <input class="cr-input" id="search-input" type="text" placeholder="Search seekers…" autocomplete="off" />
    <ul class="cr-list" id="citizen-list">
      <li>Strike-1 · Ops Division · Lead</li>
      <li>Cipher-4 · Intel Unit · Analyst</li>
      <li>Vault-8 · Archive · Keeper</li>
      <li>Signal-3 · Comms · Operator</li>
      <li>Grid-11 · Infrastructure · Engineer</li>
      <li>Echo-0 · Recon · Scout</li>
    </ul>
  </div>
  <div class="cr-sec">
    <h3>▶ SEEKER ENLIST</h3>
    <form id="register-form">
      <div class="cr-field">
        <label class="cr-lbl" for="reg-email">COMM CHANNEL</label>
        <input class="cr-input" id="reg-email" type="text" placeholder="seeker@command.hq" autocomplete="off" />
        <div class="cr-err" id="email-error"></div>
      </div>
      <button class="cr-submit" type="submit">ENLIST SEEKER</button>
    </form>
  </div>
  <div class="cr-sec">
    <h3>◎ HQ CONTROLS</h3>
    <div class="cr-row">
      <button class="theme-btn" id="theme-toggle">Toggle Display</button>
      <span id="theme-status">Dark Mode</span>
    </div>
    <div id="key-log">Monitor active…</div>
  </div>
</div></body></html>`,

  // Variant 2 — Reactor Grid
  `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Reactor Grid Control Room</title><style>${CR_CSS}</style></head>
<body><div>
  <div class="cr-sec">
    <h3>⚡ CORE OUTPUT — REACTOR GRID</h3>
    <div class="xp-disp" id="xp-count">0</div>
    <div class="xp-btns">
      <button class="xp-btn" id="xp-minus">−</button>
      <button class="xp-btn" id="xp-plus">+</button>
    </div>
  </div>
  <div class="cr-sec">
    <h3>〰 TECHNICIAN SEARCH</h3>
    <input class="cr-input" id="search-input" type="text" placeholder="Search technicians…" autocomplete="off" />
    <ul class="cr-list" id="citizen-list">
      <li>Core-1 · Primary Reactor · Lead Tech</li>
      <li>Coolant-5 · Loop System · Operator</li>
      <li>Field-2 · Containment · Engineer</li>
      <li>Safety-9 · Failsafe · Monitor</li>
      <li>Power-3 · Grid Output · Technician</li>
      <li>Backup-7 · Redundancy · Specialist</li>
    </ul>
  </div>
  <div class="cr-sec">
    <h3>⊕ TECHNICIAN REGISTER</h3>
    <form id="register-form">
      <div class="cr-field">
        <label class="cr-lbl" for="reg-email">CONTACT CHANNEL</label>
        <input class="cr-input" id="reg-email" type="text" placeholder="tech@reactor.grid" autocomplete="off" />
        <div class="cr-err" id="email-error"></div>
      </div>
      <button class="cr-submit" type="submit">ADD TECHNICIAN</button>
    </form>
  </div>
  <div class="cr-sec">
    <h3>※ GRID CONTROLS</h3>
    <div class="cr-row">
      <button class="theme-btn" id="theme-toggle">Toggle Display</button>
      <span id="theme-status">Dark Mode</span>
    </div>
    <div id="key-log">Core status nominal…</div>
  </div>
</div></body></html>`,
]

// ─── Starting JS scaffold ─────────────────────────────────────────────────────

const START_JS = `// Gate 09 — The Control Room
// Wire up the four sections using vanilla JavaScript.
//
// RULE: Never use .innerHTML to display user-entered content.
// Use .textContent instead — it prevents XSS attacks.
//
// Sections to wire:
//   XP COUNTER    — #xp-plus / #xp-minus buttons update #xp-count
//   CITIZEN SEARCH — #search-input filters #citizen-list in real time
//   REGISTRATION  — #register-form validates #reg-email, shows #email-error
//   SYSTEM CONTROLS — #theme-toggle switches theme, #key-log shows keypresses
//
// Checks to pass:
//  1. querySelector or getElementById used
//  2. .textContent = used to write output (not .innerHTML)
//  3. .classList.add / .remove / .toggle used
//  4. addEventListener('click', ...) on a button
//  5. addEventListener('input', ...) that reads .value
//  6. .preventDefault() called on form submit
//  7. let or var state variable initialized to 0
//  8. addEventListener('keydown', ...) on document or an element

`

// ─── Quiz ─────────────────────────────────────────────────────────────────────

const QUIZ = {
  question: 'You stored the XP count in a JavaScript variable AND updated the DOM to show it. Why keep state in a JS variable instead of reading the number back out of the DOM when you need it?',
  options: [
    'The DOM only stores strings, so reading a number back from it requires parseInt() on every access, which can silently fail',
    'The variable is the source of truth — the DOM is just a mirror. Reading state back from the DOM means trusting the display, not the data, which breaks when the DOM is out of sync',
    'Variables are stored in CPU registers while DOM access goes through the render pipeline, making variables significantly faster',
    'It prevents unnecessary re-renders because the browser batches variable updates but processes every DOM read immediately',
  ],
  correct: 1,
}

// ─── JS checks (EXECUTION-BASED where reliable, regex fallback otherwise) ───────
// The student's JS is run inside an offscreen iframe (sandbox allow-scripts +
// allow-same-origin so we can read it back). Each test receives (doc, win, code):
//   doc  — the rendered iframe document AFTER the student's script ran
//   win  — the iframe window
//   code — the comment-stripped source (used for the source-only checks)
// Behaviour checks SIMULATE real interactions (click / input / keydown) and assert
// the DOM actually changed. Checks that can't be reliably simulated while built
// blind (source-only facts, or fragile form-submit navigation) stay regex.

const JS_CHECKS = [
  {
    id: 'selector',
    label: 'querySelector or getElementById selects elements',
    hint: "Use document.querySelector('#xp-count') or document.getElementById('xp-count') to get a reference to an element before you can change it.",
    // REGEX FALLBACK: which selector API was used leaves no observable DOM trace.
    test: (doc, win, code) => /\b(?:querySelector|getElementById)\s*\(/.test(code),
  },
  {
    id: 'text_content',
    label: '.textContent used to write to the DOM',
    hint: "Once you have an element reference, set element.textContent = yourValue to update what it displays. Unlike innerHTML, textContent treats the value as plain text — no HTML injected.",
    // REGEX FALLBACK: textContent vs innerHTML produces identical rendered text
    // for plain values, so the safe-write distinction isn't observable at runtime.
    test: (doc, win, code) => /\.textContent\s*=/.test(code),
  },
  {
    id: 'class_list',
    label: '.classList.add / .remove / .toggle used',
    hint: "element.classList.toggle('theme-light') flips the class on and off. Also works with .add() and .remove() for one-directional changes.",
    // EXECUTION: clicking the theme toggle must mutate a class somewhere in the DOM.
    test: (doc) => {
      const btn = doc.querySelector('#theme-toggle')
      if (!btn) return false
      const snapshot = () =>
        [...doc.querySelectorAll('*')].map(el => String(el.className || '')).join('|')
      const before = snapshot()
      btn.click()
      // Any element's class set changed as a result of the click → classList was used.
      return snapshot() !== before
    },
  },
  {
    id: 'click_handler',
    label: "addEventListener('click') handles button clicks",
    hint: "Attach a listener: element.addEventListener('click', function(e) { ... }). The callback runs every time the element is clicked.",
    // EXECUTION: clicking #xp-plus must change the #xp-count display.
    test: (doc) => {
      const plus = doc.querySelector('#xp-plus')
      const count = doc.querySelector('#xp-count')
      if (!plus || !count) return false
      const before = count.textContent
      plus.click()
      return count.textContent !== before
    },
  },
  {
    id: 'input_handler',
    label: "addEventListener('input') reads .value as user types",
    hint: "input events fire on every keystroke. Inside the callback, access e.target.value (or the input element's .value directly) to get what was typed so far.",
    // EXECUTION: typing a no-match query must hide list rows (the search filters live).
    test: (doc, win) => {
      const input = doc.querySelector('#search-input')
      const list = doc.querySelector('#citizen-list')
      if (!input || !list) return false
      const rows = [...list.querySelectorAll('li')]
      if (rows.length === 0) return false
      const visible = li => win.getComputedStyle(li).display !== 'none' && !li.hidden
      const beforeVisible = rows.filter(visible).length
      input.value = 'zzqxnomatch9'
      input.dispatchEvent(new win.Event('input', { bubbles: true }))
      const afterVisible = rows.filter(visible).length
      return afterVisible < beforeVisible
    },
  },
  {
    id: 'prevent_default',
    label: '.preventDefault() stops the form page-refresh',
    hint: "Inside a submit listener callback, call e.preventDefault() as the first line. Without it, the browser navigates away on submit and your JS state is destroyed.",
    // REGEX FALLBACK: a real submit inside a sandboxed iframe triggers navigation
    // timing we can't observe reliably while built blind.
    test: (doc, win, code) => /\.preventDefault\s*\(\s*\)/.test(code),
  },
  {
    id: 'state_variable',
    label: 'State variable holds the counter value',
    hint: "Declare: let xp = 0 (or any name). Update that variable in the click handler, then write it to the DOM with textContent. Don't read the number back out of the DOM — trust your variable.",
    // REGEX FALLBACK: a local state variable leaves no DOM trace of its existence.
    test: (doc, win, code) => /\b(?:let|var)\s+\w+\s*=\s*0/.test(code),
  },
  {
    id: 'keydown_handler',
    label: "addEventListener('keydown') captures keyboard input",
    hint: "Attach a keydown listener to document or to an element: document.addEventListener('keydown', function(e) { ... }). The event object's .key property tells you which key was pressed.",
    // EXECUTION: a dispatched keydown must update the #key-log readout.
    test: (doc, win) => {
      const log = doc.querySelector('#key-log')
      if (!log) return false
      const before = log.textContent
      const ev = new win.KeyboardEvent('keydown', { key: 'A', bubbles: true })
      doc.dispatchEvent(ev)
      return log.textContent !== before
    },
  },
]

// ─── Preview builder ──────────────────────────────────────────────────────────

function buildPreview(js, variantIndex) {
  const safe = `try{\n${js}\n}catch(e){ console.error('JS error:',e.message) }`
  return VARIANT_HTML[variantIndex].replace('</body>', `<script>\n${safe}\n</script>\n</body>`)
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Quest9() {
  const { goto } = useNav()
  const { completeQuest } = useAuth()
  const { onPaste, trackChange, getAnalytics, pasteBlocked } = useQuestAnalytics()

  const [variantIdx] = useState(() => Math.floor(Math.random() * 3))
  const [jsCode, setJsCode] = useState(START_JS)
  const [tab, setTab] = useState('code')
  const [quizOpen, setQuizOpen] = useState(false)
  const [activating, setActivating] = useState(false)
  const [dungeonEntry, setDungeonEntry] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [xpPopKey, setXpPopKey] = useState(0)
  const [xpPopText, setXpPopText] = useState('')
  const [aiReview, setAiReview] = useState(null)
  const [checks, setChecks] = useState(() => JS_CHECKS.map(c => ({ ...c, passed: false })))

  const iframeRef = useRef(null)        // visible preview (on Preview tab)
  const checkIframeRef = useRef(null)   // offscreen iframe that runs the student JS
  const prevPassRef = useRef(0)

  const passCount = checks.filter(c => c.passed).length
  const allPassed = passCount === JS_CHECKS.length
  const xpEarned = passCount * 50
  const xpPct = (xpEarned / 400) * 100

  const updatePreview = useCallback((js) => {
    if (!iframeRef.current) return
    iframeRef.current.srcdoc = buildPreview(js, variantIdx)
  }, [variantIdx])

  // Run the checks against the offscreen iframe (which has already executed the
  // student's JS). Behaviour checks simulate clicks / input / keydown and assert
  // the DOM changed; the source-only checks read the comment-stripped code.
  const runChecks = useCallback(() => {
    const iframe = checkIframeRef.current
    const doc = iframe?.contentDocument
    const win = iframe?.contentWindow
    if (!doc || !win || !doc.querySelector('#xp-count')) return
    const stripped = stripComments(jsCode)
    const results = JS_CHECKS.map(c => {
      let passed = false
      try { passed = !!c.test(doc, win, stripped) } catch { passed = false }
      return { ...c, passed }
    })
    setChecks(results)
    const newPass = results.filter(r => r.passed).length
    if (newPass > prevPassRef.current) {
      setXpPopText(`+${(newPass - prevPassRef.current) * 50} XP`)
      setXpPopKey(k => k + 1)
    }
    prevPassRef.current = newPass
  }, [jsCode])

  // Debounced render: reload the offscreen iframe with the latest JS, then run
  // the checks once it has loaded and the student's script has executed.
  useEffect(() => {
    const iframe = checkIframeRef.current
    if (!iframe) return
    const t = setTimeout(() => {
      iframe.onload = () => requestAnimationFrame(runChecks)
      iframe.srcdoc = buildPreview(jsCode, variantIdx)
    }, 350)
    return () => clearTimeout(t)
  }, [jsCode, variantIdx, runChecks])

  useEffect(() => {
    if (!allPassed) { setAiReview(null); return }
    setAiReview('loading')
    supabase.functions.invoke('grade-code', {
      body: {
        code: jsCode,
        quest_title: 'Gate 09 — The Control Room',
        requirements: 'Vanilla JavaScript DOM manipulation: use querySelector/getElementById to select elements, textContent (not innerHTML) for user-facing content, classList for style toggling, addEventListener for click/input/keydown events, preventDefault() on form submit, and a JS state variable that stays in sync with the DOM.',
        language: 'javascript',
      },
    }).then(({ data }) => setAiReview(data ?? null)).catch(() => setAiReview(null))
  }, [allPassed]) // eslint-disable-line react-hooks/exhaustive-deps

  const statusText = pasteBlocked
    ? '⊘ Paste disabled — type the code'
    : allPassed
    ? 'All systems wired — Control Room online'
    : `${JS_CHECKS.length - passCount} check${JS_CHECKS.length - passCount !== 1 ? 's' : ''} failing`

  function handleJsChange(value) {
    const val = value ?? ''
    setJsCode(val)
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

  const slotClass = ['dq9-control-slot', allPassed ? 'ready' : 'locked', activating ? 'activating' : ''].filter(Boolean).join(' ')

  return (
    <div className="dq-wrap dq-wrap-g9">

      {/* Offscreen iframe that actually runs the student's JS for the checks.
          allow-scripts so the script executes; allow-same-origin so we can read
          the rendered DOM back to verify behaviour. */}
      <iframe
        ref={checkIframeRef}
        title="checks"
        aria-hidden="true"
        tabIndex={-1}
        sandbox="allow-scripts allow-same-origin"
        style={{ position: 'fixed', left: -10000, top: 0, width: 1100, height: 800, border: 0, opacity: 0, pointerEvents: 'none' }}
      />

      <div className="dq-topbar">
        <span className="dq-back" onClick={() => goto('dashboard')}>← Dashboard</span>
        <div className="dq-topbar-center">
          <span className="dq-chapter">RANK B GATE · GATE 09 · WORLD 03</span>
          <span className="dq-title-label">The Control Room</span>
        </div>
        <div className="dq-xp-row">
          <div className="dq-xp-bar-wrap">
            <div className="dq-xp-fill" style={{ width: `${xpPct}%` }} />
          </div>
          <span className="dq-xp-text">{xpEarned} / 400 XP</span>
        </div>
      </div>

      <div className="dq-main">

        {/* ── Left panel ──────────────────────────────────────────────────── */}
        <aside className="dq-brief">

          <div className="dq-scene-art">
            <div className="dq-scene-torch left" />
            <div className="dq-scene-torch right" />
            <div className={`dq9-scene-monitors${allPassed ? ' online' : ''}`}>
              {checks.map((c, i) => (
                <div key={i} className={`dq9-monitor${c.passed ? ' active' : ''}`} />
              ))}
            </div>
          </div>

          <div className="dq-narrator-box">
            <div className="dq-narrator-label">▶ NARRATOR</div>
            <p className="dq-narrator-text">
              The city needs logic. <code>querySelector</code> targets any element.{' '}
              <code>textContent</code> writes safely — <code>innerHTML</code> opens a door
              attackers walk through. A state variable is the source of truth.{' '}
              <strong>The DOM is just a mirror.</strong>
            </p>
          </div>

          <div>
            <div className="dq-section-label">
              CONTROL ROOM AUDIT —{' '}
              <span style={{ color: allPassed ? 'var(--lime)' : 'oklch(0.62 0.22 25)' }}>
                {allPassed ? 'ALL CLEAR' : `${JS_CHECKS.length - passCount} FAILING`}
              </span>
            </div>
            <ul className="dq-objectives">
              {JS_CHECKS.map((chk, i) => {
                const ok = checks[i]?.passed
                return (
                  <li key={chk.id} className={ok ? 'done' : 'error'}>
                    <div className="dq-obj-box dq9-obj-box">{ok ? '✓' : '!'}</div>
                    <div>
                      <span>{chk.label}</span>
                      {!ok && <div className="dq-error-hint">{chk.hint}</div>}
                    </div>
                  </li>
                )
              })}
            </ul>
            {aiReview === 'loading' && (
              <div style={{ marginTop: 10, fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.04em' }}>
                ⟳ AI reviewing…
              </div>
            )}
            {aiReview && aiReview !== 'loading' && (
              <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 6, background: aiReview.passed ? 'rgba(132,204,22,0.06)' : 'rgba(232,67,147,0.06)', borderLeft: `2px solid ${aiReview.passed ? 'var(--lime)' : 'var(--magenta)'}`, fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-2)', lineHeight: 1.7 }}>
                <span style={{ color: aiReview.passed ? 'var(--lime)' : 'var(--magenta)', fontWeight: 700, marginRight: 6 }}>AI</span>{aiReview.feedback}
              </div>
            )}
            <GateAIHint code={jsCode} checks={checks} gateId="g09" lang="javascript" done={modalOpen} />
          </div>

          <div className="dq-rewards">
            <div className="dq-reward eva"><div className="l">REWARD</div><div className="v">+700 SHARD</div></div>
            <div className="dq-reward xp"><div className="l">XP</div><div className="v">+450</div></div>
          </div>
        </aside>

        {/* ── Right panel ─────────────────────────────────────────────────── */}
        <div className="dq-editor-wrap">

          <div className="dq-tabs">
            <div className={`dq-tab${tab === 'code' ? ' active' : ''}`} onClick={() => setTab('code')}>
              script.js <span className="dq-dot" />
            </div>
            <div
              className={`dq-tab${tab === 'preview' ? ' active' : ''}`}
              onClick={() => { setTab('preview'); updatePreview(jsCode) }}
            >
              Live Preview <span style={{ opacity: 0.5, fontSize: 9 }}>⟳ run</span>
            </div>
            <div className="dq-status">{statusText}</div>
          </div>

          <div className={`dq-editor-pane${tab === 'code' ? ' active' : ''}`}>
            <div className="dq-editor-inner" style={{ height: '100%', minHeight: 460 }}>
              <Editor
                height="100%"
                language="javascript"
                value={jsCode}
                onChange={handleJsChange}
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
            <iframe ref={iframeRef} className="dq9-preview-frame" title="Control Room Preview" sandbox="allow-scripts" />
          )}

          {/* Control Room slot */}
          <div className={`dq9-slot-wrap${allPassed ? ' ready' : ''}`}>
            <div className="dq9-slot-label">
              {allPassed
                ? '⬡ CONTROL ROOM ONLINE — engage the slot'
                : `⊗ ${JS_CHECKS.length - passCount} check${JS_CHECKS.length - passCount !== 1 ? 's' : ''} failing — room offline`}
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
          <div className="dq-de-xp">+450 XP</div>
          <div className="dq-de-label">Control Room — Online</div>
        </div>
      )}

      {/* ── Completion modal ──────────────────────────────────────────────── */}
      <div className={`dq-complete-modal${modalOpen ? ' open' : ''}`}>
        <div className="dq-complete-inner">
          <span className="dq-badge-icon">⬡</span>
          <div className="dq-complete-chip">CONTROL ROOM ONLINE</div>
          <h2>The City Responds to Operators.</h2>
          <p>
            DOM manipulation is the bridge between logic and interface.
            querySelector, textContent, classList, addEventListener — these are the
            primitives that make every interaction possible.{' '}
            <strong>The city lives because you wired it.</strong>
          </p>
          <div className="dq-complete-rewards">
            <div className="r"><div className="l">$SHARD EARNED</div><div className="v">+700</div></div>
            <div className="r"><div className="l">XP GAINED</div><div className="v">+450</div></div>
            <div className="r"><div className="l">ITEM</div><div className="v">JS Operator I</div></div>
            <div className="r"><div className="l">ITEM</div><div className="v">Control Room Badge</div></div>
          </div>
          <div className="dq-next-quest">
            <div className="dq-nq-label">NEXT GATE</div>
            <div className="dq-nq-card" onClick={async () => { await completeQuest('act1-ch09', 450, getAnalytics()); goto('quest10') }} style={{ cursor: 'pointer' }}>
              <span className="dq-nq-emoji">📡</span>
              <div>
                <div className="dq-nq-title">Gate 10 — The Static City</div>
                <div className="dq-nq-sub">Fetch API · Final Boss · World 03</div>
              </div>
            </div>
          </div>
          <button
            className="btn btn-primary"
            onClick={async () => { await completeQuest('act1-ch09', 450, getAnalytics()); goto('dashboard') }}
          >
            Continue →
          </button>
        </div>
      </div>

    </div>
  )
}

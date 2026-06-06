import { useState, useRef, useCallback, useEffect } from 'react'
import './Quest.css'
import Editor from '@monaco-editor/react'
import { useNav } from '../context/NavigationContext'
import { useAuth } from '../context/AuthContext'
import { useQuestAnalytics } from '../hooks/useQuestAnalytics'
import QuestQuiz from './QuestQuiz'
import { supabase } from '../lib/supabase'

const VARIANTS = [
  `<html>
<head>
  <title>EVA City Emergency Broadcast</title>
</head>
<body>

  <h1>EMERGENCY — Sector Zero

  <p><strong>All pilots: report to designated shelters immediately.</p></strong>

  <p>This transmission originates from EVA Command.</p>

  <a href="shelter-protocol.html">→ Access Shelter Protocol<a>

</body>`,

  `<html>
<head>
  <title>EVA City — Pilot Registry Notice</title>
</head>
<body>

  <h1>NOTICE — Identity Verification Pending

  <p><strong>Your registry entry has expired and requires immediate renewal.</p></strong>

  <p>Report to EVA Command processing centre within 48 hours.</p>

  <a href="registry-renewal.html">→ Begin Registry Renewal<a>

</body>`,

  `<html>
<head>
  <title>EVA City — Sector Seven Dispatch</title>
</head>
<body>

  <h1>DISPATCH — Reactor Anomaly Confirmed

  <p><strong>All sublevel crews must evacuate via emergency corridors immediately.</p></strong>

  <p>Automated containment systems are now active. Await further orders.</p>

  <a href="containment-status.html">→ Check Containment Status<a>

</body>`,
]

const QUIZ = {
  question: 'Why does the browser display broken HTML without showing any errors?',
  options: [
    'Browsers have built-in error correction and silently fix issues for you',
    'HTML errors only appear in the browser console, not the page',
    'The browser downloads a separate validator script on each load',
    'HTML has no official specification for handling malformed code',
  ],
  correct: 0,
}

// ─── Error checks (EXECUTION-BASED where reliable) ──────────────────────────────
// Each test runs against the RENDERED iframe (doc + its window) — it inspects the
// actual parsed DOM, so the markup has to genuinely repair, not just match text.
// A few structural repairs (unclosed <h1>, mis-nested <strong>/<p>) get silently
// "fixed" by the browser's error-recovery in ways that look identical in the DOM
// whether or not the student fixed them — those keep their original regex test as a
// reliable fallback so the gate always stays completable.

const ERROR_CHECKS = [
  {
    id: 'doctype',
    label: 'Missing DOCTYPE declaration',
    hint: 'Every HTML document starts with a special declaration on line 1 that tells the browser it\'s working with modern HTML. It comes before the html tag and begins with an exclamation mark.',
    // EXECUTION: a real DOCTYPE puts the parsed document into standards mode and
    // produces a <!DOCTYPE html> node; without it the doc parses in quirks mode.
    test: (doc) => !!doc.doctype && doc.doctype.name?.toLowerCase() === 'html' && doc.compatMode === 'CSS1Compat',
  },
  {
    id: 'h1',
    label: 'Unclosed <h1> tag',
    hint: 'Heading elements wrap content between two tags — one to open and one to close. Look at the heading text and think about what needs to come after it.',
    // REGEX FALLBACK: the browser auto-closes an unclosed <h1> before the following
    // <p>, so the parsed DOM looks the same fixed or not — text inspection can't
    // distinguish it reliably. Keep the source check.
    test: (doc, win, code) => /<\/h1>/i.test(code),
  },
  {
    id: 'nesting',
    label: 'Tag nesting violation (strong / p)',
    hint: 'Tags must close in reverse order of how they opened — the last tag opened is the first to close. Which of these two tags was opened most recently?',
    // REGEX FALLBACK: the adoption-agency algorithm repairs mis-nested <strong>/<p>
    // into a near-identical DOM whether or not the student fixed it, so DOM
    // inspection isn't a reliable discriminator. Keep the source check.
    test: (doc, win, code) => !/<\/p>\s*<\/strong>/i.test(code) && /<\/strong>/i.test(code),
  },
  {
    id: 'anchor',
    label: 'Anchor tag not properly closed',
    hint: 'An element must end with its own dedicated closing tag. Check the very end of the link — does the tag there open something or close something?',
    // EXECUTION: a stray second <a> (instead of </a>) makes the parser close the
    // first anchor and open a second empty one — so the body holds two <a> elements.
    // Properly closed markup leaves exactly one anchor carrying the link text.
    test: (doc) => {
      const anchors = doc.body ? doc.body.querySelectorAll('a') : doc.querySelectorAll('a')
      if (anchors.length !== 1) return false
      return (anchors[0].textContent || '').trim().length > 0
    },
  },
]

export default function Quest() {
  const { goto } = useNav()
  const { completeQuest } = useAuth()
  const { onPaste, trackChange, getAnalytics, pasteBlocked } = useQuestAnalytics()

  const [startCode] = useState(() => VARIANTS[Math.floor(Math.random() * VARIANTS.length)])
  const [htmlCode, setHtmlCode] = useState(() => startCode)
  const [checks, setChecks] = useState(() => ERROR_CHECKS.map(c => ({ ...c, passed: false })))
  const [xpPopKey, setXpPopKey] = useState(0)
  const [xpPopText, setXpPopText] = useState('')
  const [transmitting, setTransmitting] = useState(false)
  const [dungeonEntry, setDungeonEntry] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [quizOpen, setQuizOpen] = useState(false)
  const [aiReview, setAiReview] = useState(null)

  const iframeRef = useRef(null)        // visible broadcast-terminal preview
  const checkIframeRef = useRef(null)   // offscreen iframe used to run the checks
  const prevPassRef = useRef(0)

  const passCount = checks.filter(c => c.passed).length
  const errorsLeft = ERROR_CHECKS.length - passCount

  const updatePreview = useCallback((html) => {
    if (!iframeRef.current) return
    const style = `<style>
      html { font-size: 9px; overflow: hidden; }
      body { margin: 0; padding: 5px 7px; background: #080c10; color: #a8bcc8; font-family: 'Courier New', monospace; font-size: 1.15rem; line-height: 1.45; }
      h1 { font-size: 1.25rem; color: #ff4444; text-transform: uppercase; letter-spacing: 0.04em; margin: 0 0 5px; padding-bottom: 4px; border-bottom: 1px solid #ff444430; }
      p { margin: 3px 0; font-size: 1.05rem; }
      strong { color: #ffaa44; }
      a { color: #40c8c0; text-decoration: none; display: block; margin-top: 5px; font-size: 1rem; }
    </style>`
    iframeRef.current.srcdoc = style + html
  }, [])

  useEffect(() => { updatePreview(htmlCode) }, [htmlCode, updatePreview])

  // Run the execution-based checks against the offscreen iframe whenever the code settles.
  // The check iframe renders the RAW student HTML (no style prepend) so the DOCTYPE keeps
  // its authentic leading position and the parsed DOM reflects exactly what was typed.
  const runChecks = useCallback(() => {
    const iframe = checkIframeRef.current
    const doc = iframe?.contentDocument
    const win = iframe?.contentWindow
    if (!doc || !win) return
    const results = ERROR_CHECKS.map(c => {
      let passed = false
      try { passed = !!c.test(doc, win, htmlCode) } catch { passed = false }
      return { ...c, passed }
    })
    setChecks(results)
    const newPass = results.filter(r => r.passed).length
    if (newPass > prevPassRef.current) {
      setXpPopText('+25 XP')
      setXpPopKey(k => k + 1)
    }
    prevPassRef.current = newPass
  }, [htmlCode])

  useEffect(() => {
    const iframe = checkIframeRef.current
    if (!iframe) return
    const t = setTimeout(() => {
      iframe.onload = () => requestAnimationFrame(runChecks)
      iframe.srcdoc = htmlCode
    }, 350)
    return () => clearTimeout(t)
  }, [htmlCode, runChecks])

  useEffect(() => {
    if (errorsLeft !== 0) { setAiReview(null); return }
    setAiReview('loading')
    supabase.functions.invoke('grade-code', {
      body: { code: htmlCode, quest_title: 'Gate 01 — The Document Tomb', requirements: 'Fix all HTML structural errors: valid DOCTYPE declaration, correct html/head/body nesting, all tags properly closed, no broken or unclosed tags.', language: 'html' },
    }).then(({ data }) => setAiReview(data ?? null)).catch(() => setAiReview(null))
  }, [errorsLeft]) // eslint-disable-line react-hooks/exhaustive-deps
  const xpEarned = (4 - errorsLeft) * 25
  const xpPct = (xpEarned / 100) * 100
  const xpLabel = `${xpEarned} / 100 XP`

  const statusText = pasteBlocked
    ? '⊘ Paste disabled — type the code'
    : errorsLeft === 0
    ? 'Gate unlocked — extract the signal'
    : errorsLeft === 1
    ? '1 error remains — almost there'
    : `${errorsLeft} errors detected — scan and repair`

  const previewHint = errorsLeft === 0
    ? 'Gate unlocked. Click the terminal to extract.'
    : 'The scanner detects errors. The browser does not.'

  function handleHtmlChange(value) {
    const val = value ?? ''
    setHtmlCode(val)
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

  function handleTransmit() {
    if (errorsLeft > 0 || transmitting) return
    setQuizOpen(true)
  }

  function handleQuizPass() {
    setQuizOpen(false)
    setTransmitting(true)
    setTimeout(() => setDungeonEntry(true), 750)
    setTimeout(() => { setDungeonEntry(false); setModalOpen(true) }, 3350)
  }

  const signalClass = [
    'dq-signal-slot',
    errorsLeft > 0 ? 'corrupted' : 'live',
    transmitting && 'transmitting',
  ].filter(Boolean).join(' ')

  return (
    <div className="dq-wrap">

      {/* Offscreen iframe that actually parses the student's HTML for the checks */}
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
          <span className="dq-chapter">RANK E GATE · GATE 01</span>
          <span className="dq-title-label">The Document Tomb</span>
        </div>
        <div className="dq-xp-row">
          <div className="dq-xp-bar-wrap">
            <div className="dq-xp-fill" style={{ width: `${xpPct}%` }} />
          </div>
          <span className="dq-xp-text">{xpLabel}</span>
        </div>
      </div>

      <div className="dq-main">
        <aside className="dq-brief">
          <div className="dq-scene-art">
            <div className="dq-scene-torch left" />
            <div className="dq-scene-torch right" />
            <div className={`dq-scene-tower${errorsLeft === 0 ? ' live' : ''}`} />
          </div>

          <div className="dq-narrator-box">
            <div className="dq-narrator-label">▶ NARRATOR</div>
            <p className="dq-narrator-text">
              You descend into Gate 01 expecting nothing. Inside: a broadcast tower running on ancient
              HTML — corrupted, unformatted, still transmitting into the dark. The Abyss doesn't care
              if it looks right. <strong>The Gate doesn't open until the validator reads zero.</strong>
            </p>
          </div>

          <div>
            <div className="dq-section-label">
              SCANNER REPORT —{' '}
              <span style={{ color: errorsLeft > 0 ? 'var(--magenta)' : 'var(--lime)' }}>
                {errorsLeft} ERROR{errorsLeft !== 1 ? 'S' : ''}
              </span>
            </div>
            <ul className="dq-objectives">
              {ERROR_CHECKS.map((chk, i) => {
                const fixed = checks[i]?.passed
                return (
                  <li key={chk.id} className={fixed ? 'done' : 'error'}>
                    <div className="dq-obj-box">{fixed ? '✓' : '!'}</div>
                    <div>
                      <span>{chk.label}</span>
                      {!fixed && <div className="dq-error-hint">{chk.hint}</div>}
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
            <div className="dq-reward eva"><div className="l">REWARD</div><div className="v">+250 DRIFT</div></div>
            <div className="dq-reward xp"><div className="l">XP</div><div className="v">+100</div></div>
          </div>
        </aside>

        <div className="dq-editor-wrap">
          <div className="dq-tabs">
            <div className="dq-tab active">
              index.html
              <span className="dq-dot" />
            </div>
            <div className="dq-status">{statusText}</div>
          </div>

          <div className="dq-editor-pane active">
            <div className="dq-editor-inner" style={{ height: '100%', minHeight: 460 }}>
              <Editor
                height="100%"
                language="html"
                value={htmlCode}
                onChange={handleHtmlChange}
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
          </div>

          <div className="dq-editor-footer">
            <div className="dq-editor-status">
              <div className={`dq-dot-green${errorsLeft > 0 ? ' error' : ''}`} />
              <span>{statusText}</span>
            </div>
            <span key={xpPopKey} className={`dq-xp-pop${xpPopText ? ' pop' : ''}`}>{xpPopText}</span>
          </div>
        </div>

        <aside className="dq-preview-wrap">
          <div className="dq-preview-label">BROADCAST TERMINAL</div>
          <div className="dq-dungeon-scene">
            <div className="dq-torch left" />
            <div className="dq-torch-bracket left" />
            <div className="dq-torch right" />
            <div className="dq-torch-bracket right" />
            <div className={signalClass} onClick={handleTransmit}>
              <iframe ref={iframeRef} className="dq-signal-iframe" sandbox="allow-scripts" title="preview" />
              <div className="dq-signal-frame" />
              <div className="dq-enter-prompt">▶ Transmit Signal</div>
              {errorsLeft === 0 && <div className="dq-door-overlay" />}
              {errorsLeft === 0 && <div className="dq-signal-live-chip">SIGNAL LIVE</div>}
            </div>
          </div>
          <p className="dq-preview-hint">{previewHint}</p>
        </aside>
      </div>

      {quizOpen && <QuestQuiz quiz={QUIZ} onPass={handleQuizPass} />}

      {dungeonEntry && (
        <div className="dq-dungeon-entry">
          <div className="dq-de-corridor">
            <div className="dq-de-in1"><div className="dq-de-in2" /></div>
          </div>
          <div className="dq-de-torch left" />
          <div className="dq-de-torch right" />
          <div className="dq-de-xp">+100 XP</div>
          <div className="dq-de-label">Gate 01 — Cleared</div>
        </div>
      )}

      <div className={`dq-complete-modal${modalOpen ? ' open' : ''}`}>
        <div className="dq-complete-inner">
          <span className="dq-badge-icon">📡</span>
          <div className="dq-complete-chip">GATE CLEARED</div>
          <h2>The Gate opens.</h2>
          <p>Most hunters left thinking it was dead. You stayed. The browser forgives everything. <strong>The Gate does not.</strong> You extracted what others dismissed as worthless.</p>
          <div className="dq-complete-rewards">
            <div className="r"><div className="l">$DRIFT EARNED</div><div className="v">+250</div></div>
            <div className="r"><div className="l">XP GAINED</div><div className="v">+100</div></div>
            <div className="r"><div className="l">FRAGMENT</div><div className="v">Signal Fragment</div></div>
            <div className="r"><div className="l">RANK</div><div className="v">E License</div></div>
          </div>
          <div className="dq-next-quest">
            <div className="dq-nq-label">NEXT GATE UNLOCKED</div>
            <div className="dq-nq-card" onClick={async () => { await completeQuest('act1-ch01', 100, getAnalytics()); goto('quest2') }}>
              <span className="dq-nq-emoji">⚱️</span>
              <div>
                <div className="dq-nq-title">The Semantic Crypt</div>
                <div className="dq-nq-sub">Semantic HTML</div>
              </div>
              <span className="dq-nq-arrow">→</span>
            </div>
          </div>
          <button className="btn btn-primary" onClick={async () => { await completeQuest('act1-ch01', 100, getAnalytics()); goto('dashboard') }}>Continue →</button>
        </div>
      </div>
    </div>
  )
}

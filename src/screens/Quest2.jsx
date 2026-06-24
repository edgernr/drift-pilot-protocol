import { useState, useRef, useCallback, useEffect } from 'react'
import './Quest.css'
import './Quest2.css'
import Editor from '@monaco-editor/react'
import { useNav } from '../context/NavigationContext'
import { useAuth } from '../context/AuthContext'
import { useQuestAnalytics } from '../hooks/useQuestAnalytics'
import QuestQuiz from './QuestQuiz'
import { supabase } from '../lib/supabase'

const VARIANTS = [
  `<!DOCTYPE html>
<html>
<head>
  <title>EVA City — Sector Zero District</title>
</head>
<body>

  <div class="site-header">
    <div class="site-nav">
      <a href="#sectors">Sectors</a>
      <a href="#archives">Archives</a>
      <a href="#command">Command</a>
    </div>
  </div>

  <div class="page-main">

    <div class="lead-story">
      <h2>Sector Zero: The Origin Point</h2>
      <p>The first district built beneath EVA City. Everything routes through here.</p>
    </div>

    <div class="history-block">
      <h3>Historical Record</h3>
      <p>Constructed in Year 0 by the original architects of EVA Command.</p>
    </div>

    <div class="page-sidebar">
      <h3>Quick Stats</h3>
      <p>Population: 4,200 · Founded: Year 0</p>
    </div>

    <div class="blueprint-block">
      <img src="blueprint.png" alt="Sector Zero original blueprint" />
      <div class="blueprint-caption">Blueprint — Year 0, Sector Zero Archives</div>
    </div>

  </div>

  <div class="page-footer">
    <p>© EVA City Archives — All transmissions logged</p>
  </div>

</body>
</html>`,

  `<!DOCTYPE html>
<html>
<head>
  <title>EVA City — Command Centre Archives</title>
</head>
<body>

  <div class="cmd-header">
    <div class="cmd-nav">
      <a href="#operations">Operations</a>
      <a href="#records">Records</a>
      <a href="#personnel">Personnel</a>
    </div>
  </div>

  <div class="cmd-main">

    <div class="briefing-block">
      <h2>Operation Nightfall: Declassified</h2>
      <p>The mission files were sealed for a decade. Now available to all ranked seekers.</p>
    </div>

    <div class="archive-block">
      <h3>Archive Status</h3>
      <p>Last updated by EVA Command Intelligence Division in Year 12.</p>
    </div>

    <div class="intel-sidebar">
      <h3>Classification</h3>
      <p>Level: DELTA · Clearance: Active</p>
    </div>

    <div class="schematic-block">
      <img src="schematic.png" alt="Operation Nightfall tactical schematic" />
      <div class="schematic-caption">Schematic — Operation Nightfall, Year 4</div>
    </div>

  </div>

  <div class="cmd-footer">
    <p>© EVA City Command — For authorised personnel only</p>
  </div>

</body>
</html>`,

  `<!DOCTYPE html>
<html>
<head>
  <title>EVA City — Reactor Grid Station</title>
</head>
<body>

  <div class="reactor-header">
    <div class="reactor-nav">
      <a href="#status">Status</a>
      <a href="#logs">Logs</a>
      <a href="#safety">Safety</a>
    </div>
  </div>

  <div class="reactor-main">

    <div class="status-block">
      <h2>Core Status: Stable</h2>
      <p>All reactor cells within normal parameters. Monitoring active around the clock.</p>
    </div>

    <div class="log-block">
      <h3>Incident Log</h3>
      <p>No critical events recorded in the past 72 hours by the automated systems.</p>
    </div>

    <div class="specs-sidebar">
      <h3>Core Specs</h3>
      <p>Output: 4.2 GW · Uptime: 99.97%</p>
    </div>

    <div class="diagram-block">
      <img src="core-diagram.png" alt="Reactor core cross-section diagram" />
      <div class="diagram-caption">Diagram — Reactor Core, Year 0 Design Specification</div>
    </div>

  </div>

  <div class="reactor-footer">
    <p>© EVA City Energy Division — All readings are logged</p>
  </div>

</body>
</html>`,
]

const QUIZ = {
  question: 'What is the main benefit of using <article> instead of <div> for the lead story?',
  options: [
    'Screen readers and search engines understand what the content represents',
    '<article> renders text in bold by default for emphasis',
    '<article> prevents the content from being cached by the browser',
    '<div> elements cannot contain heading elements like <h2>',
  ],
  correct: 0,
}

// ─── Semantic checks (EXECUTION-BASED) ──────────────────────────────────────────
// Each test runs against the RENDERED iframe (doc + its window) — it inspects the
// actual parsed DOM produced by the student's HTML, so the markup has to genuinely
// contain the real semantic elements (with content), not just the right text.

const SEMANTIC_CHECKS = [
  {
    id: 'header',
    label: 'Site banner → <header>',
    hint: 'The banner at the top of a page — home to the logo and navigation — belongs in a landmark element whose name describes its position on the page.',
    test: (doc) => {
      const el = doc.querySelector('header')
      // The banner must wrap the navigation links.
      return !!el && !!el.querySelector('a')
    },
  },
  {
    id: 'nav',
    label: 'Link group → <nav>',
    hint: 'A group of links used to move around a site belongs in an element whose name literally describes its purpose.',
    test: (doc) => {
      const el = doc.querySelector('nav')
      // A real link group lives inside the nav.
      return !!el && el.querySelectorAll('a').length >= 2
    },
  },
  {
    id: 'main',
    label: 'Primary content → <main>',
    hint: 'The primary content of a page — the reason someone visited — lives in a single landmark element. There should only ever be one of it per page.',
    test: (doc) => {
      const els = doc.querySelectorAll('main')
      // Exactly one <main> per page, and it must hold the page content.
      return els.length === 1 && els[0].children.length > 0
    },
  },
  {
    id: 'article',
    label: 'Lead story → <article>',
    hint: 'Content that could be lifted out and still make sense on its own — like a news story — belongs in an element that means a self-contained composition.',
    test: (doc) => {
      const el = doc.querySelector('article')
      // The lead story carries its own heading.
      return !!el && !!el.querySelector('h1, h2, h3')
    },
  },
  {
    id: 'section',
    label: 'History block → <section>',
    hint: 'A thematic block of content with its own heading, but not fully independent from the page, belongs in an element that represents a themed grouping.',
    test: (doc) => {
      const el = doc.querySelector('section')
      // A themed block keeps its heading.
      return !!el && !!el.querySelector('h1, h2, h3')
    },
  },
  {
    id: 'aside',
    label: 'Sidebar → <aside>',
    hint: 'Supplementary content that enriches but isn\'t essential to the main story — like a sidebar fact box — has its own dedicated landmark element.',
    test: (doc) => {
      const el = doc.querySelector('aside')
      return !!el && el.children.length > 0
    },
  },
  {
    id: 'figure',
    label: 'Blueprint block → <figure> + <figcaption>',
    hint: 'When an image and its description belong together as a visual unit, they share a semantic container. The description text goes in a dedicated child element inside that container.',
    test: (doc) => {
      const fig = doc.querySelector('figure')
      // The caption must actually live inside the figure.
      return !!fig && !!fig.querySelector('figcaption')
    },
  },
  {
    id: 'footer',
    label: 'Page footer → <footer>',
    hint: 'The closing band of a page — copyright, credits, secondary links — belongs in a landmark element whose name describes where it sits on the page.',
    test: (doc) => {
      const el = doc.querySelector('footer')
      return !!el && (el.textContent || '').trim().length > 0
    },
  },
]

export default function Quest2() {
  const { goto } = useNav()
  const { completeQuest } = useAuth()
  const { onPaste, trackChange, getAnalytics, pasteBlocked } = useQuestAnalytics()

  const [startCode] = useState(() => VARIANTS[Math.floor(Math.random() * VARIANTS.length)])
  const [htmlCode, setHtmlCode] = useState(() => startCode)
  // All checks start failing; runChecks() (driven by the offscreen render) clears them.
  const [errors, setErrors] = useState(() => new Set(SEMANTIC_CHECKS.map(c => c.id)))
  const [xpPopKey, setXpPopKey] = useState(0)
  const [xpPopText, setXpPopText] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [dungeonEntry, setDungeonEntry] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [quizOpen, setQuizOpen] = useState(false)
  const [aiReview, setAiReview] = useState(null)

  const iframeRef = useRef(null)        // visible preview (Identity Scanner)
  const checkIframeRef = useRef(null)   // offscreen iframe used to run the checks
  const prevFixedRef = useRef(0)

  const buildPreview = useCallback((html) => {
    const style = `<style>
      html { font-size: 9px; overflow: hidden; }
      body { margin: 0; padding: 0; background: #080c14; color: #a0b0c0; font-family: 'Courier New', monospace; font-size: 1.1rem; line-height: 1.4; }
      header, .site-header, .cmd-header, .reactor-header { display: block; background: #0c1018; padding: 3px 6px; border-bottom: 1px solid #1e2a38; }
      nav, .site-nav, .cmd-nav, .reactor-nav { display: flex; gap: 8px; }
      nav a, .site-nav a, .cmd-nav a, .reactor-nav a { color: #5878b0; font-size: 0.9rem; text-decoration: none; }
      main, .page-main, .cmd-main, .reactor-main { display: block; padding: 5px 6px; }
      article, .lead-story, .briefing-block, .status-block { border-left: 2px solid #3858a0; padding: 3px 5px; margin-bottom: 4px; }
      section, .history-block, .archive-block, .log-block { padding: 3px 5px; margin-bottom: 3px; border-bottom: 1px solid #1a2030; }
      aside, .page-sidebar, .intel-sidebar, .specs-sidebar { background: #0a0e14; border: 1px solid #1e2a38; padding: 3px 5px; margin-bottom: 3px; font-size: 0.9rem; }
      figure, .blueprint-block, .schematic-block, .diagram-block { margin: 2px 0; padding: 3px 5px; background: #090c12; }
      figcaption, .blueprint-caption, .schematic-caption, .diagram-caption { font-size: 0.85rem; color: #4860a0; font-style: italic; }
      footer, .page-footer, .cmd-footer, .reactor-footer { background: #0c1018; border-top: 1px solid #1e2a38; padding: 3px 6px; font-size: 0.85rem; color: #405060; }
      h2 { font-size: 1.15rem; margin: 0 0 2px; color: #c0d0e0; }
      h3 { font-size: 1rem; margin: 0 0 2px; color: #90a8c0; }
      p { margin: 1px 0; }
      img { display: none; }
    </style>`
    return style + html
  }, [])

  const updatePreview = useCallback((html) => {
    if (!iframeRef.current) return
    iframeRef.current.srcdoc = buildPreview(html)
  }, [buildPreview])

  useEffect(() => { updatePreview(htmlCode) }, [htmlCode, updatePreview])

  // Run the execution-based checks against the offscreen iframe whenever the HTML settles.
  const runChecks = useCallback(() => {
    const iframe = checkIframeRef.current
    const doc = iframe?.contentDocument
    const win = iframe?.contentWindow
    if (!doc || !win || !doc.body) return
    const errs = new Set()
    for (const chk of SEMANTIC_CHECKS) {
      let passed = false
      try { passed = !!chk.test(doc, win) } catch { passed = false }
      if (!passed) errs.add(chk.id)
    }
    const fixed = SEMANTIC_CHECKS.length - errs.size
    if (fixed > prevFixedRef.current) {
      setXpPopText('+25 XP')
      setXpPopKey(k => k + 1)
    }
    prevFixedRef.current = fixed
    setErrors(errs)
  }, [])

  useEffect(() => {
    const iframe = checkIframeRef.current
    if (!iframe) return
    const t = setTimeout(() => {
      iframe.onload = () => requestAnimationFrame(runChecks)
      iframe.srcdoc = buildPreview(htmlCode)
    }, 350)
    return () => clearTimeout(t)
  }, [htmlCode, buildPreview, runChecks])

  const errorsLeft = errors.size

  useEffect(() => {
    if (errorsLeft !== 0) { setAiReview(null); return }
    setAiReview('loading')
    supabase.functions.invoke('grade-code', {
      body: { code: htmlCode, quest_title: 'Gate 02 — The Semantic Crypt', requirements: 'Replace all generic divs with correct semantic HTML5 elements: header, nav, main, section, article, aside, footer, figure, figcaption. Semantic structure must be meaningful and complete.', language: 'html' },
    }).then(({ data }) => setAiReview(data ?? null)).catch(() => setAiReview(null))
  }, [errorsLeft]) // eslint-disable-line react-hooks/exhaustive-deps
  const xpEarned = (8 - errorsLeft) * 25
  const xpPct = (xpEarned / 200) * 100
  const xpLabel = `${xpEarned} / 200 XP`

  const statusText = pasteBlocked
    ? '⊘ Paste disabled — type the code'
    : errorsLeft === 0
    ? 'Crypt cleared — submit for extraction'
    : errorsLeft === 1
    ? '1 element unidentified — almost there'
    : `${errorsLeft} elements unidentified — decode the structure`

  const previewHint = errorsLeft === 0
    ? 'All elements identified. Submit to extract.'
    : 'The page looks identical. Only the meaning changes.'

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

  function handleVerify() {
    if (errorsLeft > 0 || verifying) return
    setQuizOpen(true)
  }

  function handleQuizPass() {
    setQuizOpen(false)
    setVerifying(true)
    setTimeout(() => setDungeonEntry(true), 750)
    setTimeout(() => { setDungeonEntry(false); setModalOpen(true) }, 3350)
  }

  const codexClass = [
    'dq-codex-slot',
    errorsLeft > 0 ? 'incomplete' : 'verified',
    verifying && 'verifying',
  ].filter(Boolean).join(' ')

  return (
    <div className="dq-wrap">

      {/* Offscreen iframe that actually renders the student's HTML for the checks.
          No sandbox attribute → stays same-origin so the checks can read its DOM. */}
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
          <span className="dq-chapter">RANK E GATE · GATE 02</span>
          <span className="dq-title-label">The Semantic Crypt</span>
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
            <div className={`dq2-scene-codex${errorsLeft === 0 ? ' verified' : ''}`} />
          </div>

          <div className="dq-narrator-box">
            <div className="dq-narrator-label">▶ NARRATOR</div>
            <p className="dq-narrator-text">
              Deep in the Crypt, the original architects built with meaning — every chamber named for
              its function. A later generation rebuilt the same structures out of nameless <strong>divs</strong>.
              The Crypt still stands, but something inside it is dying. Replace every div with its true
              identity. The scanner sees what the eye cannot.
            </p>
          </div>

          <div>
            <div className="dq-section-label">
              IDENTITY SCANNER —{' '}
              <span style={{ color: errorsLeft > 0 ? 'var(--violet)' : 'var(--lime)' }}>
                {errorsLeft} UNIDENTIFIED
              </span>
            </div>
            <ul className="dq-objectives">
              {SEMANTIC_CHECKS.map(chk => {
                const fixed = !errors.has(chk.id)
                return (
                  <li key={chk.id} className={fixed ? 'done' : 'error'}>
                    <div className="dq-obj-box dq2-obj-box">{fixed ? '✓' : '?'}</div>
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
            <div className="dq-reward eva"><div className="l">REWARD</div><div className="v">+350 SHARD</div></div>
            <div className="dq-reward xp"><div className="l">XP</div><div className="v">+200</div></div>
          </div>
        </aside>

        <div className="dq-editor-wrap">
          <div className="dq-tabs">
            <div className="dq-tab active">
              index.html
              <span className="dq-dot" />
            </div>
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
          <div className="dq-preview-label">IDENTITY SCANNER</div>
          <div className="dq-dungeon-scene">
            <div className="dq-torch left" />
            <div className="dq-torch-bracket left" />
            <div className="dq-torch right" />
            <div className="dq-torch-bracket right" />
            <div className={codexClass} onClick={handleVerify}>
              <iframe ref={iframeRef} className="dq-codex-iframe" sandbox="allow-scripts" title="preview" />
              <div className="dq-codex-frame" />
              <div className="dq-enter-prompt">▶ Submit to Scanner</div>
              {errorsLeft === 0 && <div className="dq-door-overlay" />}
              {errorsLeft === 0 && <div className="dq-codex-verified-chip">CODEX VERIFIED</div>}
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
          <div className="dq-de-xp">+200 XP</div>
          <div className="dq-de-label">Gate 02 — Cleared</div>
        </div>
      )}

      <div className={`dq-complete-modal${modalOpen ? ' open' : ''}`}>
        <div className="dq-complete-inner">
          <span className="dq-badge-icon">📜</span>
          <div className="dq-complete-chip">GATE CLEARED</div>
          <h2>The Crypt yields.</h2>
          <p>The divs fell. The elements rose. The dungeon cannot consume what has identity. <strong>What you cannot see is more real than what you can.</strong></p>
          <div className="dq-complete-rewards">
            <div className="r"><div className="l">$SHARD EARNED</div><div className="v">+350</div></div>
            <div className="r"><div className="l">XP GAINED</div><div className="v">+200</div></div>
            <div className="r"><div className="l">CORE</div><div className="v">Semantic Core</div></div>
            <div className="r"><div className="l">FRAGMENT</div><div className="v">Identity Fragment</div></div>
          </div>
          <div className="dq-next-quest">
            <div className="dq-nq-label">NEXT GATE UNLOCKED</div>
            <div className="dq-nq-card" onClick={async () => { await completeQuest('act1-ch02', 200, getAnalytics()); goto('quest3') }}>
              <span className="dq-nq-emoji">📋</span>
              <div>
                <div className="dq-nq-title">The Form Gate</div>
                <div className="dq-nq-sub">HTML Forms · Boss Gate</div>
              </div>
              <span className="dq-nq-arrow">→</span>
            </div>
          </div>
          <button className="btn btn-primary" onClick={async () => { await completeQuest('act1-ch02', 200, getAnalytics()); goto('dashboard') }}>Continue →</button>
        </div>
      </div>
    </div>
  )
}

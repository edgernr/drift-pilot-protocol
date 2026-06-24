import { useState, useRef, useCallback, useEffect } from 'react'
import './Quest.css'
import './Quest10.css'
import Editor from '@monaco-editor/react'
import { useNav } from '../context/NavigationContext'
import { useAuth } from '../context/AuthContext'
import { useQuestAnalytics } from '../hooks/useQuestAnalytics'
import QuestQuiz from './QuestQuiz'
import GateAIHint from '../components/GateAIHint'
import { supabase } from '../lib/supabase'
import { stripComments } from '../lib/codeUtils'

// ─── Intelligence dashboard HTML (single template — the mechanic is the JS) ───

const TEMPLATE_HTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>EVA City — Intelligence Dashboard</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#0a0d18;color:#e8ecff;font-family:system-ui,sans-serif;padding:12px;font-size:13px}
#loading{text-align:center;padding:30px;color:#7a8199;font-size:13px}
.spinner{display:inline-block;width:18px;height:18px;border:2px solid rgba(180,200,255,.12);border-top-color:#e040fb;border-radius:50%;animation:spin .8s linear infinite;margin-right:8px;vertical-align:middle}
@keyframes spin{to{transform:rotate(360deg)}}
#content-wrap{display:none}
#error-state{display:none;text-align:center;padding:24px}
.err-icon{font-size:24px;margin-bottom:8px}
.err-text{color:#f43f5e;font-size:12px;font-family:monospace;margin-bottom:10px}
.err-retry{padding:5px 14px;background:rgba(240,64,251,.08);border:1px solid rgba(240,64,251,.25);border-radius:3px;color:#e040fb;cursor:pointer;font-size:11px}
.panel{background:#111524;border:1px solid rgba(180,200,255,.08);border-radius:5px;padding:12px;margin-bottom:10px}
.panel h3{font-size:10px;letter-spacing:.1em;color:#e040fb;margin-bottom:10px;font-weight:600}
.field{display:flex;justify-content:space-between;align-items:baseline;padding:5px 0;border-bottom:1px solid rgba(180,200,255,.05);font-size:12px}
.field:last-child{border-bottom:none}
.f-label{color:#7a8199;font-size:9px;letter-spacing:.06em}
.f-value{color:#e8ecff;font-weight:500}
.refresh-bar{background:#111524;border:1px solid rgba(180,200,255,.08);border-radius:5px;padding:9px 12px;display:flex;justify-content:space-between;align-items:center;font-size:10px;color:#7a8199}
#refresh-status{color:#e040fb;font-family:monospace;font-size:10px}
#last-updated{font-size:9px;color:#3a4060}
</style>
</head>
<body>

<div id="loading">
  <span class="spinner"></span>Awaiting signal from outside…
</div>

<div id="error-state">
  <div class="err-icon">⊗</div>
  <div class="err-text" id="error-message">Signal lost. Cannot reach the outside.</div>
  <button class="err-retry" id="retry-btn">Retry Signal</button>
</div>

<div id="content-wrap">
  <div class="panel">
    <h3>◈ INTELLIGENCE RECEIVED</h3>
    <div class="field"><span class="f-label">SIGNAL ID</span><span class="f-value" id="data-id">—</span></div>
    <div class="field"><span class="f-label">CALLSIGN</span><span class="f-value" id="data-name">—</span></div>
    <div class="field"><span class="f-label">SECTOR</span><span class="f-value" id="data-city">—</span></div>
    <div class="field"><span class="f-label">CONTACT</span><span class="f-value" id="data-email">—</span></div>
    <div class="field"><span class="f-label">COMPANY</span><span class="f-value" id="data-company">—</span></div>
  </div>
  <div class="refresh-bar">
    <span id="refresh-status">Auto-refresh not running</span>
    <span id="last-updated">Never updated</span>
  </div>
</div>

</body>
</html>`

// ─── Starting JS scaffold ─────────────────────────────────────────────────────

const START_JS = `// Gate 10 — The Signal from Outside
// Fetch live intelligence from this URL:
//   https://jsonplaceholder.typicode.com/users/1
//
// The dashboard HTML is pre-built. Wire it up:
//   #loading      — show while fetching, hide when done
//   #content-wrap — hide while fetching, show when data arrives
//   #error-state  — show if the fetch fails
//   #data-id, #data-name, #data-city, #data-email, #data-company — fill these
//   #refresh-status — update with next refresh info
//   #last-updated   — update with a timestamp on each fetch
//
// Three failure modes the boss tests:
//   1. Slow connection — your loading state must appear before data arrives
//   2. Failed request  — your error state must appear, not a blank screen
//   3. Partial data    — some fields may be undefined; handle with ?.
//
// Checks to pass:
//  1. fetch() called with the API URL
//  2. async and await both present
//  3. try / catch handles fetch failure
//  4. Loading element manipulated (show/hide)
//  5. Optional chaining (?.) used for nested field access
//  6. setInterval auto-refreshes every 30 seconds

`

// ─── Quiz ─────────────────────────────────────────────────────────────────────

const QUIZ = {
  question: "Your fetch succeeds but the API returns a user with no 'phone' field. Instead of crashing, you show 'Unknown'. What syntax safely accesses a field that might not exist without throwing a TypeError?",
  options: [
    "Wrap every property access in a try/catch — TypeErrors inside catch are silently ignored and the fallback value is returned",
    "Declare all expected fields at the top with let phone = null — this reserves memory for the key and prevents undefined property errors",
    "Optional chaining: data?.phone ?? 'Unknown' — ?. short-circuits to undefined if the parent is null or undefined, and ?? falls back to the default",
    "Convert the JSON object to a string and parse individual fields with .split() to avoid property access entirely",
  ],
  correct: 2,
}

// ─── JS checks ────────────────────────────────────────────────────────────────

const JS_CHECKS = [
  {
    id: 'fetch_api',
    label: 'fetch() called to request data',
    hint: "Call fetch('https://jsonplaceholder.typicode.com/users/1') — it returns a Promise that resolves to a Response object. Use .json() to parse it.",
    test: code => /\bfetch\s*\(/.test(code),
  },
  {
    id: 'async_await',
    label: 'async function + await used together',
    hint: "Define your fetch function with the async keyword, then await the fetch() call. This pauses the function until the response arrives without blocking the rest of the page.",
    test: code => /\basync\b/.test(code) && /\bawait\b/.test(code),
  },
  {
    id: 'error_handling',
    label: 'try / catch handles fetch errors',
    hint: "Wrap your fetch logic in a try block. The catch(e) block runs if the network is down, the URL is wrong, or the server returns an error — show the error state there.",
    test: code => /\btry\s*\{/.test(code) && /\bcatch\s*\(/.test(code),
  },
  {
    id: 'loading_state',
    label: 'Loading element shown/hidden around the fetch',
    hint: "Show the #loading element at the top of your function (before the await). Hide it once data arrives or an error is caught. Use style.display or classList.",
    test: code => /loading/.test(code) && (/style|display|classList/.test(code)),
  },
  {
    id: 'optional_chain',
    label: 'Optional chaining (?.) handles missing fields',
    hint: "Some API fields are nested: data.address.city. If address is missing, that crashes. Use data?.address?.city to safely get undefined instead of throwing.",
    test: code => /\?\.\w/.test(code),
  },
  {
    id: 'auto_refresh',
    label: 'setInterval auto-refreshes the data',
    hint: "Call setInterval(yourFetchFunction, 30000) after the first fetch to re-run it every 30 seconds automatically.",
    test: code => /\bsetInterval\s*\(/.test(code),
  },
]

// ─── Preview builder ──────────────────────────────────────────────────────────

function buildPreview(js) {
  const safe = `try{\n${js}\n}catch(e){ console.error('JS error:',e.message) }`
  return TEMPLATE_HTML.replace('</body>', `<script>\n${safe}\n</script>\n</body>`)
}

// ─── City building heights for scene art ─────────────────────────────────────

const BUILDING_HEIGHTS = [22, 38, 28, 48, 34, 26]

// ─── Component ────────────────────────────────────────────────────────────────

export default function Quest10() {
  const { goto } = useNav()
  const { completeQuest } = useAuth()
  const { onPaste, trackChange, getAnalytics, pasteBlocked } = useQuestAnalytics()

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
  const checkIframeRef = useRef(null)   // offscreen iframe used to run the checks
  const prevPassRef = useRef(0)

  const passCount = checks.filter(c => c.passed).length
  const allPassed = passCount === JS_CHECKS.length
  const failCount = JS_CHECKS.length - passCount
  const xpEarned = passCount * 100
  const xpPct = (xpEarned / 600) * 100
  const bossHpPct = (failCount / JS_CHECKS.length) * 100

  const updatePreview = useCallback((js) => {
    if (!iframeRef.current) return
    iframeRef.current.srcdoc = buildPreview(js)
  }, [])

  // Run the checks whenever the JS settles. Gate 10 is the FINAL BOSS — its
  // mechanics are async + real network (fetch to JSONPlaceholder), which can't be
  // reliably verified blind. So these checks stay SOURCE-based (regex on the
  // student's code, comments stripped). We still run them through the same
  // state + runChecks() + debounced-render pipeline as the execution gates, and
  // the offscreen iframe genuinely executes the student's code (sandboxed) so the
  // live behavior matches what they wrote.
  const runChecks = useCallback(() => {
    const src = stripComments(jsCode)
    const results = JS_CHECKS.map(c => {
      let passed = false
      try { passed = !!c.test(src) } catch { passed = false }
      return { ...c, passed }
    })
    setChecks(results)
    const newPass = results.filter(r => r.passed).length
    if (newPass > prevPassRef.current) {
      setXpPopText(`+${(newPass - prevPassRef.current) * 100} XP`)
      setXpPopKey(k => k + 1)
    }
    prevPassRef.current = newPass
  }, [jsCode])

  // Render the student's JS into the offscreen check iframe (it allows scripts AND
  // same-origin so the executed dashboard is real & readable), debounced so we're
  // not re-running on every keystroke, then evaluate the checks.
  useEffect(() => {
    const iframe = checkIframeRef.current
    if (!iframe) return
    const t = setTimeout(() => {
      iframe.onload = () => requestAnimationFrame(runChecks)
      iframe.srcdoc = buildPreview(jsCode)
    }, 350)
    return () => clearTimeout(t)
  }, [jsCode, runChecks])

  useEffect(() => {
    if (!allPassed) { setAiReview(null); return }
    setAiReview('loading')
    supabase.functions.invoke('grade-code', {
      body: {
        code: jsCode,
        quest_title: 'Gate 10 — The Static City',
        requirements: 'Fetch API with async/await: call fetch() with a URL, use async/await, try/catch error handling, show loading state before data arrives and hide after, use optional chaining (?.) for nested/missing fields, setInterval for 30-second auto-refresh.',
        language: 'javascript',
      },
    }).then(({ data }) => setAiReview(data ?? null)).catch(() => setAiReview(null))
  }, [allPassed]) // eslint-disable-line react-hooks/exhaustive-deps

  const statusText = pasteBlocked
    ? '⊘ Paste disabled — type the code'
    : allPassed
    ? 'Signal received — THE STATIC CITY defeated'
    : `${failCount} check${failCount !== 1 ? 's' : ''} failing — city frozen`

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

  const slotClass = ['dq10-breach-slot', allPassed ? 'ready' : 'locked', activating ? 'activating' : ''].filter(Boolean).join(' ')

  return (
    <div className="dq-wrap dq-wrap-g10">

      {/* Offscreen iframe that actually runs the student's JS for the checks.
          Final boss executes student code, so it needs allow-scripts; it also needs
          allow-same-origin so the rendered dashboard stays readable for inspection. */}
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
          <span className="dq-chapter">RANK B GATE · GATE 10 · BOSS · FINAL</span>
          <span className="dq-title-label">The Static City</span>
        </div>
        <div className="dq-xp-row">
          <div className="dq-xp-bar-wrap">
            <div className="dq-xp-fill" style={{ width: `${xpPct}%` }} />
          </div>
          <span className="dq-xp-text">{xpEarned} / 600 XP</span>
        </div>
      </div>

      <div className="dq-main">

        {/* ── Left panel ──────────────────────────────────────────────────── */}
        <aside className="dq-brief">

          <div className="dq-scene-art">
            <div className="dq-scene-torch left" />
            <div className="dq-scene-torch right" />
            <div className={`dq10-scene-city${allPassed ? ' alive' : ''}`}>
              {BUILDING_HEIGHTS.map((h, i) => (
                <div
                  key={i}
                  className={`dq10-building${checks[i]?.passed ? ' alive' : ''}`}
                  style={{ height: `${h}px` }}
                />
              ))}
              <div className={`dq10-tower${allPassed ? ' broadcasting' : ''}`} />
            </div>
          </div>

          {/* Boss HP — The Static City */}
          <div className="dq10-boss-hp">
            <div className="dq10-boss-name">
              <span className="dq10-boss-title">BOSS — THE STATIC CITY</span>
              <span className="dq10-boss-status" style={{ color: failCount > 0 ? 'var(--magenta)' : 'var(--lime)' }}>
                {failCount > 0 ? `${failCount} FROZEN` : 'BREACHED'}
              </span>
            </div>
            <div className="dq10-boss-bar">
              <div className="dq10-boss-bar-fill" style={{ width: `${bossHpPct}%` }} />
            </div>
          </div>

          <div className="dq-narrator-box">
            <div className="dq-narrator-label">▶ NARRATOR</div>
            <p className="dq-narrator-text">
              THE STATIC CITY only knows what it was built with. Connect it to the outside.{' '}
              <code>fetch()</code> punches through the wall.{' '}
              <code>async/await</code> waits without blocking.{' '}
              <strong>Handle every failure mode — the city that survives is one that works when the signal breaks.</strong>
            </p>
          </div>

          <div>
            <div className="dq-section-label">
              SIGNAL AUDIT —{' '}
              <span style={{ color: allPassed ? 'var(--lime)' : 'oklch(0.62 0.22 25)' }}>
                {allPassed ? 'ALL CLEAR' : `${failCount} FROZEN`}
              </span>
            </div>
            <ul className="dq-objectives">
              {JS_CHECKS.map((chk, i) => {
                const ok = checks[i]?.passed
                return (
                  <li key={chk.id} className={ok ? 'done' : 'error'}>
                    <div className="dq-obj-box dq10-obj-box">{ok ? '✓' : '!'}</div>
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
            <GateAIHint code={jsCode} checks={checks} gateId="g10" lang="javascript" done={modalOpen} />
          </div>

          <div className="dq-rewards">
            <div className="dq-reward eva"><div className="l">REWARD</div><div className="v">+1500 SHARD</div></div>
            <div className="dq-reward xp"><div className="l">XP</div><div className="v">+600</div></div>
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
            <iframe
              ref={iframeRef}
              className="dq10-preview-frame"
              title="Intelligence Dashboard Preview"
              sandbox="allow-scripts"
            />
          )}

          {/* Signal Breach slot */}
          <div className={`dq10-slot-wrap${allPassed ? ' ready' : ''}`}>
            <div className="dq10-slot-label">
              {allPassed
                ? '📡 STATIC CITY BREACHED — engage the signal slot'
                : `⊗ ${failCount} check${failCount !== 1 ? 's' : ''} frozen — city unreachable`}
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
          <div className="dq-de-xp">+600 XP</div>
          <div className="dq-de-label">THE STATIC CITY — Breached</div>
        </div>
      )}

      {/* ── Completion modal ──────────────────────────────────────────────── */}
      <div className={`dq-complete-modal${modalOpen ? ' open' : ''}`}>
        <div className="dq-complete-inner">
          <span className="dq-badge-icon">📡</span>
          <div className="dq-complete-chip dq10-chip">ACT I: THE NEON FRONTIER — COMPLETE</div>
          <h2>The Static City Has Been Breached.</h2>
          <p>
            The city that only knew what it was built with now reaches outside itself.
            fetch(), async/await, error handling, optional chaining, setInterval —
            every piece was a layer of armor against a broken world.{' '}
            <strong>The city that survives is one that works when the signal breaks.</strong>
          </p>
          <div className="dq-complete-rewards">
            <div className="r"><div className="l">$SHARD EARNED</div><div className="v">+1500</div></div>
            <div className="r"><div className="l">XP GAINED</div><div className="v">+600</div></div>
            <div className="r"><div className="l">RANK</div><div className="v">Interface Architect</div></div>
            <div className="r"><div className="l">STATUS</div><div className="v">Act I Complete</div></div>
          </div>
          <button
            className="btn btn-primary"
            onClick={async () => { await completeQuest('act1-ch10', 600, getAnalytics()); goto('dashboard') }}
          >
            Return to Seeker HQ →
          </button>
        </div>
      </div>

    </div>
  )
}

import { useState } from 'react'
import './AcademyGate.css'
import { useNav } from '../context/NavigationContext'
import { useAcademy } from '../context/AcademyContext'

const GATE_ID = 'J-08'
const GATE_XP = 300

const STARTER = `// The Performance Layer — Keeping the Construct Fast

// 1. Debounce — delay execution until typing stops
// let debounceTimer
// document.getElementById("search").addEventListener("input", (e) => {
//     clearTimeout(debounceTimer)
//     debounceTimer = setTimeout(() => {
//         fetchResults(e.target.value)
//     }, 300)
// })

// 2. requestAnimationFrame — smooth DOM updates
// function animateProgress(el, target) {
//     let current = 0
//     function step() {
//         current += 2
//         el.style.width = current + "%"
//         if (current < target) requestAnimationFrame(step)
//     }
//     requestAnimationFrame(step)
// }

// 3. Virtual scroll — only render what's visible
// function renderVisible() {
//     const container = document.getElementById("list")
//     const scrollTop = container.scrollTop
//     const viewHeight = container.clientHeight
//     const visible = allItems.slice(
//         Math.floor(scrollTop / itemHeight),
//         Math.ceil((scrollTop + viewHeight) / itemHeight)
//     )
//     container.innerHTML = visible.map(item => \`<div>\${item.name}</div>\`).join("")
// }
`

const CHECKS = [
  { id: 'c1', label: 'Debounce with clearTimeout + setTimeout', hint: 'clearTimeout(timer) cancels the previous call; setTimeout(() => fn(), 300) schedules a new one.',  test: c => /clearTimeout\s*\(/.test(c) && /setTimeout\s*\(/.test(c) },
  { id: 'c2', label: 'requestAnimationFrame used',              hint: 'Call requestAnimationFrame(step) inside the step function to loop on each frame — smooth 60fps updates.', test: c => /requestAnimationFrame\s*\(/.test(c) },
  { id: 'c3', label: 'Virtual scroll with .slice()',            hint: 'Use .slice(startIndex, endIndex) to render only the items in the visible window — essential for large lists.', test: c => /\.slice\s*\(/.test(c) && /(scrollTop|clientHeight|innerHeight)/.test(c) },
]

const QUIZ = {
  q: 'A search input fires a fetch on every keystroke — 300ms debounce would help. What does debouncing actually do?',
  opts: [
    'It batches multiple events into one and fires the handler once per second regardless of typing speed.',
    'It delays the handler until the user pauses — clearTimeout cancels the previous timer, setTimeout schedules a new one, so only the last keystroke triggers the fetch.',
    'It throttles the event to fire at most once every 300ms, even if the user is still typing.',
    'It buffers all keystrokes and sends them together in a single fetch after 300ms.',
  ],
  correct: 1,
}

function Scene({ passCount }) {
  return (
    <div className="ag-scene" style={{ '--ac': 'var(--lime)' }}>
      <span className="ag-scene-label">PERFORMANCE LAYER — GATE J-08</span>
      <div className="ag-py-terminal">
        <div className="ag-py-terminal-bar">
          <span className="ag-py-dot" style={{ background: 'var(--magenta)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--amber)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--lime)' }} />
          <span style={{ flex: 1, textAlign: 'center', fontSize: 9, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)' }}>perf.js</span>
        </div>
        <div className="ag-py-output">
          {passCount === 0 && <div className="ag-py-line" style={{ opacity: 0.35 }}>&gt; running perf.js…</div>}
          {passCount >= 1 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>debounce active</span></div>}
          {passCount >= 2 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>rAF frame loop ready</span></div>}
          {passCount >= 3 && <div className="ag-py-line">&gt; <span style={{ color: 'var(--lime)' }}>PERFORMANCE LAYER ENGAGED!</span></div>}
        </div>
      </div>
    </div>
  )
}

export default function GateJ08() {
  const { goto } = useNav()
  const { activeChild, completeAcademyGate } = useAcademy()
  const [code, setCode]           = useState(STARTER)
  const [running, setRunning]     = useState(false)
  const [quizOpen, setQuizOpen]   = useState(false)
  const [quizOrder, setQuizOrder] = useState(null)
  const [quizWrong, setQuizWrong] = useState(false)
  const [done, setDone]           = useState(false)

  const checks    = CHECKS.map(c => ({ ...c, passed: c.test(code) }))
  const allPassed = checks.every(c => c.passed)
  const passCount = checks.filter(c => c.passed).length

  async function handleRun() {
    if (!allPassed || running) return
    setRunning(true)
    await new Promise(r => setTimeout(r, 1200))
    setRunning(false)
    const _ord = [0,1,2,3]; for (let _i=3;_i>0;_i--){const _j=Math.floor(Math.random()*(_i+1));[_ord[_i],_ord[_j]]=[_ord[_j],_ord[_i]]}; setQuizOrder(_ord)
    setQuizOpen(true)
  }

  async function answer(i) {
    if (quizOrder[i] !== QUIZ.correct) {
      setQuizWrong(true)
      setTimeout(() => setQuizWrong(false), 700)
      return
    }
    setQuizOpen(false)
    setDone(true)
    if (activeChild) await completeAcademyGate(activeChild.id, GATE_ID, GATE_XP)
  }

  return (
    <div className="ag-root">
      <button className="ag-back" onClick={() => goto('academy/dashboard')}>← Builder HQ</button>

      <div className="ag-topbar">
        <span className="ag-rank-badge" style={{ '--ac': 'var(--lime)' }}>RANK C</span>
        <h1 className="ag-gate-name">The Performance Layer</h1>
        <span className="ag-concept-tag">Performance</span>
        <span className="ag-xp-tag" style={{ color: 'var(--lime)' }}>+300 XP</span>
      </div>

      <div className="ag-body">
        <div className="ag-left">
          <Scene passCount={passCount} />
          <div className="ag-checks">
            {checks.map(c => (
              <div key={c.id} className={`ag-check${c.passed ? ' pass' : ''}`}>
                <span className="ag-check-ic">{c.passed ? '✓' : '○'}</span>
                <div>
                  <div className="ag-check-lbl">{c.label}</div>
                  {!c.passed && <div className="ag-check-hint">{c.hint}</div>}
                </div>
              </div>
            ))}
          </div>
          <button
            className="ag-run-btn" style={{ '--ac': 'var(--lime)' }}
            onClick={handleRun} disabled={!allPassed || running}
          >
            {running ? '⟳ Running checks…' : allPassed ? '▶ ENGAGE PERFORMANCE' : `○ ${3 - passCount} check${3 - passCount !== 1 ? 's' : ''} remaining`}
          </button>
        </div>

        <div className="ag-right">
          <div className="ag-instruction">
            Optimize the Construct's performance. Use <strong>debounce</strong> (clearTimeout + setTimeout) to prevent firing on every keystroke. Use <strong>requestAnimationFrame</strong> for smooth animations. Use <strong>virtual scroll</strong> with .slice() to render only visible items — so large lists never slow the UI.
          </div>
          <div className="ag-py-editor">
            <div className="ag-py-editor-head">⚡ perf.js</div>
            <textarea
              className="ag-py-code"
              value={code}
              onChange={e => setCode(e.target.value)}
              rows={14}
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="none"
              autoComplete="off"
            />
          </div>
        </div>
      </div>

      {quizOpen && (
        <div className="ag-quiz-bd">
          <div className={`ag-quiz-card${quizWrong ? ' wrong' : ''}`}>
            <div className="ag-quiz-eyebrow">Knowledge Check — Gate J-08</div>
            <p className="ag-quiz-q">{QUIZ.q}</p>
            <div className="ag-quiz-opts">
              {(quizOrder || [0,1,2,3]).map((origIdx, i) => (
                <button key={i} className="ag-quiz-opt" onClick={() => answer(i)}>
                  <span className="ag-quiz-letter">{String.fromCharCode(65 + i)}</span>
                  {QUIZ.opts[origIdx]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {done && (
        <div className="ag-done-bd">
          <div className="ag-done-card" style={{ '--ac': 'var(--lime)' }}>
            <span className="ag-done-emoji">🚀</span>
            <span className="ag-done-xp">+300 XP</span>
            <h2 className="ag-done-title">The Performance Layer</h2>
            <p className="ag-done-flavor">The Performance Layer engaged. Debounced. Animated at 60fps. Only the visible rendered. The Construct runs without friction.</p>
            <div className="ag-done-rewards">
              <span className="ag-done-reward">Performance Fragment</span>
              <span className="ag-done-reward">Speed Badge I</span>
            </div>
            <button className="ag-done-btn" onClick={() => goto('academy/dashboard')}>Builder HQ →</button>
          </div>
        </div>
      )}
    </div>
  )
}

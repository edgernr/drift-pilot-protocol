import { useState } from 'react'
import './AcademyGate.css'
import { useNav } from '../context/NavigationContext'
import { useAcademy } from '../context/AcademyContext'
import { stripComments } from '../lib/codeUtils'
import GateAIHint from '../components/GateAIHint'

const GATE_ID = 'J-13'
const GATE_XP = 330

const STARTER = `// The Event Loop Depths — Microtasks and Macrotasks

// 1. setTimeout vs Promise — execution order
// console.log("1 — sync")
// setTimeout(() => console.log("3 — macrotask"), 0)
// Promise.resolve().then(() => console.log("2 — microtask"))
// // Output: 1, 2, 3 — microtask queue drains before macrotask

// 2. Microtask queue — Promise.resolve fires before setTimeout
// Promise.resolve("microtask").then(val => console.log(val))

// 3. Chaining .then() and async/await
// fetch("/api/citizens")
//   .then(res => res.json())
//   .then(data => console.log(data))
//   .catch(err => console.error(err))

// async function loadData() {
//   const res = await fetch("/api/citizens")
//   const data = await res.json()
//   return data
// }

// 4. Blocking the event loop — never do this
// while (true) {}  // blocks everything — no callbacks, no rendering

// 5. Execution order comment
// Synchronous code runs first.
// Microtasks (Promise.then) run next.
// Macrotasks (setTimeout, setInterval) run last.

// 6. Macrotask queue example
// setTimeout(() => console.log("macrotask"), 0)
// setInterval(() => console.log("interval"), 1000)
`

const CHECKS = [
  { id: 'c1', label: 'setTimeout + Promise order shown', hint: 'Show that Promise.resolve().then runs before setTimeout(fn, 0) by logging both.',       test: c => /\bsetTimeout\b/.test(c) && /Promise\.resolve\b/.test(c) },
  { id: 'c2', label: 'Microtask queue explained',        hint: 'Use Promise.resolve().then() to create a microtask and log or comment its order.',       test: c => /\bmicrotask\b/i.test(c) },
  { id: 'c3', label: '.then() chaining used',            hint: 'Chain .then() calls on a Promise or async operation.',                                    test: c => /\.then\s*\(/.test(c) },
  { id: 'c4', label: 'async/await used',                 hint: 'Write an async function using the async keyword and await inside it.',                    test: c => /\basync\b/.test(c) && /\bawait\b/.test(c) },
  { id: 'c5', label: 'Blocking loop shown or commented', hint: 'Show while(true) {} or comment about why blocking the event loop is dangerous.',          test: c => /while\s*\(\s*true\s*\)/.test(c) || /\bblocking\b|\bblock.*event loop\b/i.test(c) },
  { id: 'c6', label: 'Macrotask queue mentioned',        hint: 'Show or comment setTimeout/setInterval as macrotask examples.',                           test: c => /\bmacrotask\b/i.test(c) || /\bsetInterval\b/.test(c) },
]

const QUIZ = {
  q: 'setTimeout(fn, 0) schedules fn to run "immediately" — yet Promise.then() callbacks always run first. Why?',
  opts: [
    'setTimeout has extra overhead from the timer system, making it slightly slower.',
    'Promise.then callbacks go into the microtask queue, which is fully drained after each task before the macrotask queue (where setTimeout lives) is checked.',
    'Promises are processed by a separate thread, so they finish faster.',
    'JavaScript prioritizes I/O operations over timers automatically.',
  ],
  correct: 1,
}

function Scene({ passCount }) {
  return (
    <div className="ag-scene" style={{ '--ac': 'var(--violet)' }}>
      <span className="ag-scene-label">EVENT LOOP DEPTHS — GATE J-13</span>
      <div className="ag-py-terminal">
        <div className="ag-py-terminal-bar">
          <span className="ag-py-dot" style={{ background: 'var(--magenta)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--amber)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--lime)' }} />
          <span style={{ flex: 1, textAlign: 'center', fontSize: 9, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)' }}>eventloop.js</span>
        </div>
        <div className="ag-py-output">
          {passCount === 0 && <div className="ag-py-line" style={{ opacity: 0.35 }}>&gt; running eventloop.js…</div>}
          {passCount >= 1 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>task order mapped</span></div>}
          {passCount >= 2 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>microtask queue active</span></div>}
          {passCount >= 3 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>.then() chain ready</span></div>}
          {passCount >= 4 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>async/await wired</span></div>}
          {passCount >= 5 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>blocking trap identified</span></div>}
          {passCount >= 6 && <div className="ag-py-line">&gt; <span style={{ color: 'var(--violet)' }}>LOOP CHARTED — DEPTHS UNDERSTOOD!</span></div>}
        </div>
      </div>
    </div>
  )
}

export default function GateJ13() {
  const { goto } = useNav()
  const { activeChild, completeAcademyGate } = useAcademy()
  const [code, setCode]           = useState(STARTER)
  const [running, setRunning]     = useState(false)
  const [quizOpen, setQuizOpen]   = useState(false)
  const [quizOrder, setQuizOrder] = useState(null)
  const [quizWrong, setQuizWrong] = useState(false)
  const [done, setDone]           = useState(false)

  const checks    = CHECKS.map(c => ({ ...c, passed: c.test(c.raw ? code : stripComments(code)) }))
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
        <span className="ag-rank-badge" style={{ '--ac': 'var(--violet)' }}>RANK C</span>
        <h1 className="ag-gate-name">The Event Loop Depths</h1>
        <span className="ag-concept-tag">Event Loop</span>
        <span className="ag-xp-tag" style={{ color: 'var(--violet)' }}>+330 XP</span>
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
            className="ag-run-btn" style={{ '--ac': 'var(--violet)' }}
            onClick={handleRun} disabled={!allPassed || running}
          >
            {running ? '⟳ Running checks…' : allPassed ? '▶ CHART THE LOOP' : `○ ${6 - passCount} check${6 - passCount !== 1 ? 's' : ''} remaining`}
          </button>
          <GateAIHint code={code} checks={checks} gateId={GATE_ID} lang="javascript" done={done} />
        </div>

        <div className="ag-right">
          <div className="ag-instruction">
            Descend into JavaScript's execution model. Show <strong>setTimeout vs Promise</strong> ordering. Explain the <strong>microtask queue</strong>. Chain <strong>.then()</strong> calls. Write <strong>async/await</strong>. Identify the <strong>blocking loop</strong> trap. Show <strong>macrotask</strong> examples.
          </div>
          <div className="ag-py-editor">
            <div className="ag-py-editor-head">⚡ eventloop.js</div>
            <textarea
              onPaste={e => e.preventDefault()}
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
            <div className="ag-quiz-eyebrow">Knowledge Check — Gate J-13</div>
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
          <div className="ag-done-card" style={{ '--ac': 'var(--violet)' }}>
            <span className="ag-done-emoji">🔄</span>
            <span className="ag-done-xp">+330 XP</span>
            <h2 className="ag-done-title">The Event Loop Depths</h2>
            <p className="ag-done-flavor">Sync. Microtask. Macrotask. The order is fixed. The loop never stops. Now you know when your code actually runs.</p>
            <div className="ag-done-rewards">
              <span className="ag-done-reward">Loop Fragment</span>
              <span className="ag-done-reward">Async Badge II</span>
            </div>
            <button className="ag-done-btn" onClick={() => goto('academy/dashboard')}>Builder HQ →</button>
          </div>
        </div>
      )}
    </div>
  )
}

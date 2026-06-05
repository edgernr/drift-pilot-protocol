import { useState } from 'react'
import './AcademyGate.css'
import { useNav } from '../context/NavigationContext'
import { useAcademy } from '../context/AcademyContext'
import { stripComments } from '../lib/codeUtils'
import GateAIHint from '../components/GateAIHint'

const GATE_ID = 'J-15'
const GATE_XP = 330

const STARTER = `// The Error Architecture — Handling Failures Gracefully

// 1. Built-in error types
// TypeError   — wrong type: null.property
// RangeError  — out of range: new Array(-1)
// ReferenceError — undefined variable
// SyntaxError — invalid JS: eval("}")

// 2. Custom error class
// class ConstructError extends Error {
//   constructor(message, code) {
//     super(message)
//     this.name = "ConstructError"
//     this.code = code
//   }
// }

// 3. Extending custom errors
// class AuthError extends ConstructError {
//   constructor(message) {
//     super(message, "AUTH_FAILED")
//   }
// }

// 4. Async error handling with try/catch
// async function fetchCitizen(id) {
//   try {
//     const res = await fetch("/api/" + id)
//     if (!res.ok) throw new ConstructError("Not found", 404)
//     return await res.json()
//   } catch (err) {
//     console.error(err.message)
//   }
// }

// 5. Unhandled rejection listener
// window.addEventListener("unhandledrejection", event => {
//   console.error("Unhandled:", event.reason)
// })

// 6. Propagating errors with async throw
// async function validate(data) {
//   if (!data) throw new ConstructError("No data", "EMPTY")
// }
`

const CHECKS = [
  { id: 'c1', label: 'Built-in error types listed',   hint: 'Name at least TypeError, RangeError, ReferenceError, or SyntaxError with a comment.',     test: c => /\bTypeError\b/.test(c) || /\bRangeError\b/.test(c) || /\bReferenceError\b/.test(c) },
  { id: 'c2', label: 'Custom error class defined',    hint: 'class MyError extends Error { constructor(msg) { super(msg); this.name = "MyError" } }',   test: c => /class\s+\w+Error\b/.test(c) && /\bextends\s+Error\b/.test(c) },
  { id: 'c3', label: 'Error subclass extends custom', hint: 'Extend your custom error: class AuthError extends ConstructError {}.',                      test: c => /class\s+\w+\s+extends\s+\w+Error\b/.test(c) },
  { id: 'c4', label: 'try/await/catch in async fn',  hint: 'Write an async function with try { await ... } catch (err) { ... } inside.',               test: c => /\btry\b/.test(c) && /\bawait\b/.test(c) && /\bcatch\b/.test(c) },
  { id: 'c5', label: 'unhandledrejection listener',  hint: 'Add a window.addEventListener("unhandledrejection", ...) handler.',                        test: c => /\bunhandledrejection\b/.test(c) },
  { id: 'c6', label: 'async throw propagation shown', hint: 'Throw an error inside an async function to show it becomes a rejected Promise.',            test: c => /\basync\b/.test(c) && /\bthrow\b/.test(c) },
]

const QUIZ = {
  q: 'What does "unhandled promise rejection" mean, and why is it harder to detect than a regular error?',
  opts: [
    'It means the Promise library crashed — you need to reinstall node_modules.',
    'A Promise was rejected but no .catch() or try/catch block handled it — the error silently disappears unless you listen for the unhandledrejection event.',
    'It means the network request failed and needs to be retried.',
    'Unhandled rejections are automatically logged to the console in all browsers.',
  ],
  correct: 1,
}

function Scene({ passCount }) {
  return (
    <div className="ag-scene" style={{ '--ac': 'var(--lime)' }}>
      <span className="ag-scene-label">ERROR ARCHITECTURE — GATE J-15</span>
      <div className="ag-py-terminal">
        <div className="ag-py-terminal-bar">
          <span className="ag-py-dot" style={{ background: 'var(--magenta)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--amber)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--lime)' }} />
          <span style={{ flex: 1, textAlign: 'center', fontSize: 9, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)' }}>errors.js</span>
        </div>
        <div className="ag-py-output">
          {passCount === 0 && <div className="ag-py-line" style={{ opacity: 0.35 }}>&gt; running errors.js…</div>}
          {passCount >= 1 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>error types mapped</span></div>}
          {passCount >= 2 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>custom error defined</span></div>}
          {passCount >= 3 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>error hierarchy built</span></div>}
          {passCount >= 4 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>async catch wired</span></div>}
          {passCount >= 5 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>rejection guard active</span></div>}
          {passCount >= 6 && <div className="ag-py-line">&gt; <span style={{ color: 'var(--lime)' }}>ARCHITECTURE SEALED — NO ERRORS ESCAPE!</span></div>}
        </div>
      </div>
    </div>
  )
}

export default function GateJ15() {
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
        <span className="ag-rank-badge" style={{ '--ac': 'var(--lime)' }}>RANK C</span>
        <h1 className="ag-gate-name">The Error Architecture</h1>
        <span className="ag-concept-tag">Error Handling</span>
        <span className="ag-xp-tag" style={{ color: 'var(--lime)' }}>+330 XP</span>
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
            {running ? '⟳ Running checks…' : allPassed ? '▶ SEAL ARCHITECTURE' : `○ ${6 - passCount} check${6 - passCount !== 1 ? 's' : ''} remaining`}
          </button>
          <GateAIHint code={code} checks={checks} gateId={GATE_ID} lang="javascript" done={done} />
        </div>

        <div className="ag-right">
          <div className="ag-instruction">
            Build the Construct's error defense. Know the <strong>built-in error types</strong>. Create a <strong>custom error class</strong> extending Error. Build an <strong>error hierarchy</strong>. Handle async errors with <strong>try/await/catch</strong>. Catch <strong>unhandled rejections</strong>. Propagate errors from <strong>async functions</strong>.
          </div>
          <div className="ag-py-editor">
            <div className="ag-py-editor-head">⚡ errors.js</div>
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
            <div className="ag-quiz-eyebrow">Knowledge Check — Gate J-15</div>
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
            <span className="ag-done-emoji">🛡️</span>
            <span className="ag-done-xp">+330 XP</span>
            <h2 className="ag-done-title">The Error Architecture</h2>
            <p className="ag-done-flavor">Every failure mode named. Every catch block placed. No silent rejection left unguarded. The architecture holds.</p>
            <div className="ag-done-rewards">
              <span className="ag-done-reward">Error Fragment</span>
              <span className="ag-done-reward">Resilience Badge II</span>
            </div>
            <button className="ag-done-btn" onClick={() => goto('academy/dashboard')}>Builder HQ →</button>
          </div>
        </div>
      )}
    </div>
  )
}

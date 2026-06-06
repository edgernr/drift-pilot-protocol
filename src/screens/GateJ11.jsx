import { useState } from 'react'
import './AcademyGate.css'
import { useNav } from '../context/NavigationContext'
import { useAcademy } from '../context/AcademyContext'
import { stripComments } from '../lib/codeUtils'
import GateAIHint from '../components/GateAIHint'

const GATE_ID = 'J-11'
const GATE_XP = 330

const STARTER = `// The Scope Chamber — Closures and the Variable Trap

// 1. var hoisting — the classic bug
// var x = 1
// console.log(x)  // works but var has function scope

// 2. Closure — let creates a new binding per call
// function makeCounter() {
//   let count = 0
//   return {
//     increment() { count++ },
//     getCount() { return count }
//   }
// }

// 3. Closure captures the enclosing scope
// const counter = makeCounter()
// counter.increment()
// counter.getCount()  // 1

// 4. Loop with setTimeout — var vs let
// for (let i = 0; i < 3; i++) {
//   setTimeout(() => console.log(i), 0)
// }
// // let: prints 0, 1, 2 (per-iteration binding)
// // var: would print 3, 3, 3 (one shared binding)

// 5. 'this' in a regular function
// const obj = {
//   name: "EVA",
//   getName: function() { return this.name }
// }

// 6. Arrow function preserves outer 'this'
// class Construct {
//   constructor() { this.name = "Construct" }
//   start() {
//     setTimeout(() => console.log(this.name), 100)
//   }
// }
`

const CHECKS = [
  { id: 'c1', label: 'var scope shown',               hint: 'Use var and demonstrate its function-scoped or hoisted behavior with console.log.',        test: c => /\bvar\b/.test(c) && /\bconsole\.log\b/.test(c) },
  { id: 'c2', label: 'Closure with let count',        hint: 'Create a function that returns an object with increment/getCount methods sharing a let variable.', test: c => /\blet\s+count\b/.test(c) },
  { id: 'c3', label: 'increment and getCount methods', hint: 'The returned object needs both increment() and getCount() to demonstrate the closure.',   test: c => /\bincrement\b/.test(c) && /\bgetCount\b/.test(c) },
  { id: 'c4', label: 'setTimeout + let in loop',      hint: 'Show the let loop with setTimeout(() => console.log(i), 0) to demonstrate per-iteration binding.', test: c => /\bsetTimeout\b/.test(c) && /\bfor\b/.test(c) },
  { id: 'c5', label: 'this.name in method',           hint: 'Create an object with a method that uses this.name to access the object\'s own property.', test: c => /\bthis\.name\b/.test(c) },
  { id: 'c6', label: 'Arrow function preserves this', hint: 'Use an arrow function inside a method or class to show that => inherits the outer this.',  test: c => /=>\s/.test(c) && /\bthis\b/.test(c) },
]

const QUIZ = {
  q: 'In a loop with setTimeout, using var prints the same number three times while let prints 0, 1, 2. Why?',
  opts: [
    'var is async by default, so it waits to resolve its value.',
    'var creates one shared binding for the entire loop — by the time the callbacks fire, all share the final value. let creates a new binding per iteration, capturing each value independently.',
    'let copies the value into each callback, while var passes a reference.',
    'setTimeout behaves differently depending on whether var or let is used.',
  ],
  correct: 1,
}

function Scene({ passCount }) {
  return (
    <div className="ag-scene" style={{ '--ac': 'var(--teal)' }}>
      <span className="ag-scene-label">SCOPE CHAMBER — GATE J-11</span>
      <div className="ag-py-terminal">
        <div className="ag-py-terminal-bar">
          <span className="ag-py-dot" style={{ background: 'var(--magenta)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--amber)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--lime)' }} />
          <span style={{ flex: 1, textAlign: 'center', fontSize: 9, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)' }}>scope.js</span>
        </div>
        <div className="ag-py-output">
          {passCount === 0 && <div className="ag-py-line" style={{ opacity: 0.35 }}>&gt; running scope.js…</div>}
          {passCount >= 1 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>var scope mapped</span></div>}
          {passCount >= 2 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>closure sealed</span></div>}
          {passCount >= 3 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>counter methods wired</span></div>}
          {passCount >= 4 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>loop binding fixed</span></div>}
          {passCount >= 5 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>this resolved</span></div>}
          {passCount >= 6 && <div className="ag-py-line">&gt; <span style={{ color: 'var(--teal)' }}>CHAMBER SEALED — SCOPE UNDERSTOOD!</span></div>}
        </div>
      </div>
    </div>
  )
}

export default function GateJ11() {
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
        <span className="ag-rank-badge" style={{ '--ac': 'var(--teal)' }}>RANK D</span>
        <h1 className="ag-gate-name">The Scope Chamber</h1>
        <span className="ag-concept-tag">Closures &amp; Scope</span>
        <span className="ag-xp-tag" style={{ color: 'var(--teal)' }}>+330 XP</span>
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
            className="ag-run-btn" style={{ '--ac': 'var(--teal)' }}
            onClick={handleRun} disabled={!allPassed || running}
          >
            {running ? '⟳ Running checks…' : allPassed ? '▶ SEAL CHAMBER' : `○ ${6 - passCount} check${6 - passCount !== 1 ? 's' : ''} remaining`}
          </button>
          <GateAIHint code={code} checks={checks} gateId={GATE_ID} lang="javascript" done={done} />
        </div>

        <div className="ag-right">
          <div className="ag-instruction">
            Master JavaScript's scope rules. Demonstrate <strong>var hoisting</strong>. Build a <strong>closure</strong> with a private counter using let. Show the <strong>var vs let</strong> loop trap with setTimeout. Use <strong>this</strong> in a method. Preserve <strong>this</strong> with an arrow function.
          </div>
          <div className="ag-py-editor">
            <div className="ag-py-editor-head">⚡ scope.js</div>
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
            <div className="ag-quiz-eyebrow">Knowledge Check — Gate J-11</div>
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
          <div className="ag-done-card" style={{ '--ac': 'var(--teal)' }}>
            <span className="ag-done-emoji">🔐</span>
            <span className="ag-done-xp">+330 XP</span>
            <h2 className="ag-done-title">The Scope Chamber</h2>
            <p className="ag-done-flavor">Closures sealed. Scope understood. var's traps avoided. The Chamber remembers only what it should.</p>
            <div className="ag-done-rewards">
              <span className="ag-done-reward">Closure Fragment</span>
              <span className="ag-done-reward">Scope Badge I</span>
            </div>
            <button className="ag-done-btn" onClick={() => goto('academy/dashboard')}>Builder HQ →</button>
          </div>
        </div>
      )}
    </div>
  )
}

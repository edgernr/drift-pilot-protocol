import { useState } from 'react'
import './AcademyGate.css'
import { useNav } from '../context/NavigationContext'
import { useAcademy } from '../context/AcademyContext'
import { stripComments } from '../lib/codeUtils'
import GateAIHint from '../components/GateAIHint'

const GATE_ID = 'J-12'
const GATE_XP = 330

const STARTER = `// The Prototype Chain — Objects and Inheritance

// 1. Constructor function with prototype
// function Citizen(name) {
//   this.name = name
// }
// Citizen.prototype.greet = function() {
//   return "Hello, " + this.name
// }

// 2. ES6 class — syntactic sugar over prototypes
// class Citizen {
//   constructor(name, level) {
//     this.name = name
//     this.level = level
//   }
//   greet() {
//     return "Hello, " + this.name
//   }
// }

// 3. Private field with #
// class Citizen {
//   #secret = "classified"
//   getSecret() { return this.#secret }
// }

// 4. Static method
// class Citizen {
//   static validate(level) {
//     return level >= 1 && level <= 5
//   }
// }

// 5. Inheritance with extends and super
// class SpecialCitizen extends Citizen {
//   constructor(name, level, ability) {
//     super(name, level)
//     this.ability = ability
//   }
// }

// 6. instanceof check
// const c = new Citizen("LUCY", 5)
// c instanceof Citizen  // true
`

const CHECKS = [
  { id: 'c1', label: 'prototype used',                hint: 'Attach a method to a constructor function via Constructor.prototype.method = function() {}', test: c => /\.prototype\b/.test(c) },
  { id: 'c2', label: 'class with constructor',        hint: 'Define a class with a constructor() that sets properties using this.',                       test: c => /\bclass\b/.test(c) && /\bconstructor\s*\(/.test(c) },
  { id: 'c3', label: 'Private field (#field)',         hint: 'Declare a private field with # prefix: #secret = "value" inside the class body.',           test: c => /#\w+/.test(c) },
  { id: 'c4', label: 'static method defined',         hint: 'Add a static method with the static keyword — called on the class, not an instance.',       test: c => /\bstatic\b/.test(c) },
  { id: 'c5', label: 'extends + super() used',        hint: 'Create a subclass with extends. Call super() inside the constructor with parent arguments.', test: c => /\bextends\b/.test(c) && /\bsuper\s*\(/.test(c) },
  { id: 'c6', label: 'instanceof used',               hint: 'Use instanceof to check if an object was created by a specific class or constructor.',       test: c => /\binstanceof\b/.test(c) },
]

const QUIZ = {
  q: 'JavaScript classes are described as "syntactic sugar" over prototype chains. What does that mean?',
  opts: [
    'Classes are only available in modern browsers — older code must use prototypes.',
    'The class syntax is cleaner to write but compiles down to the same prototype-based inheritance — the underlying mechanism is identical.',
    'Classes are slower than prototypes because they add an extra abstraction layer.',
    'Syntactic sugar means classes are optional and never needed in production code.',
  ],
  correct: 1,
}

function Scene({ passCount }) {
  return (
    <div className="ag-scene" style={{ '--ac': 'var(--amber)' }}>
      <span className="ag-scene-label">PROTOTYPE CHAIN — GATE J-12</span>
      <div className="ag-py-terminal">
        <div className="ag-py-terminal-bar">
          <span className="ag-py-dot" style={{ background: 'var(--magenta)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--amber)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--lime)' }} />
          <span style={{ flex: 1, textAlign: 'center', fontSize: 9, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)' }}>proto.js</span>
        </div>
        <div className="ag-py-output">
          {passCount === 0 && <div className="ag-py-line" style={{ opacity: 0.35 }}>&gt; running proto.js…</div>}
          {passCount >= 1 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>prototype linked</span></div>}
          {passCount >= 2 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>class constructed</span></div>}
          {passCount >= 3 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>private field sealed</span></div>}
          {passCount >= 4 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>static method ready</span></div>}
          {passCount >= 5 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>chain extended</span></div>}
          {passCount >= 6 && <div className="ag-py-line">&gt; <span style={{ color: 'var(--amber)' }}>CHAIN COMPLETE — HIERARCHY LINKED!</span></div>}
        </div>
      </div>
    </div>
  )
}

export default function GateJ12() {
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
        <span className="ag-rank-badge" style={{ '--ac': 'var(--amber)' }}>RANK D</span>
        <h1 className="ag-gate-name">The Prototype Chain</h1>
        <span className="ag-concept-tag">Prototypes &amp; Classes</span>
        <span className="ag-xp-tag" style={{ color: 'var(--amber)' }}>+330 XP</span>
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
            className="ag-run-btn" style={{ '--ac': 'var(--amber)' }}
            onClick={handleRun} disabled={!allPassed || running}
          >
            {running ? '⟳ Running checks…' : allPassed ? '▶ LINK CHAIN' : `○ ${6 - passCount} check${6 - passCount !== 1 ? 's' : ''} remaining`}
          </button>
          <GateAIHint code={code} checks={checks} gateId={GATE_ID} lang="javascript" done={done} />
        </div>

        <div className="ag-right">
          <div className="ag-instruction">
            Build JavaScript's object hierarchy. Attach methods via <strong>.prototype</strong>. Use <strong>class with constructor</strong>. Declare a <strong>private field</strong> with #. Add a <strong>static method</strong>. Create a subclass with <strong>extends and super()</strong>. Verify the chain with <strong>instanceof</strong>.
          </div>
          <div className="ag-py-editor">
            <div className="ag-py-editor-head">⚡ proto.js</div>
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
            <div className="ag-quiz-eyebrow">Knowledge Check — Gate J-12</div>
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
          <div className="ag-done-card" style={{ '--ac': 'var(--amber)' }}>
            <span className="ag-done-emoji">⛓️</span>
            <span className="ag-done-xp">+330 XP</span>
            <h2 className="ag-done-title">The Prototype Chain</h2>
            <p className="ag-done-flavor">The chain is linked. Prototypes understood. Classes unmasked. Every object in JavaScript is part of a chain reaching up to Object.prototype.</p>
            <div className="ag-done-rewards">
              <span className="ag-done-reward">Prototype Fragment</span>
              <span className="ag-done-reward">OOP Badge II</span>
            </div>
            <button className="ag-done-btn" onClick={() => goto('academy/dashboard')}>Builder HQ →</button>
          </div>
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import './AcademyGate.css'
import { useNav } from '../context/NavigationContext'
import { useAcademy } from '../context/AcademyContext'

const GATE_ID = 'J-05'
const GATE_XP = 300

const STARTER = `// The Module System — Organizing Code Across Files

// 1. Default export — one main export per file
// class Citizen {
//     constructor(name, level) {
//         this.name = name
//         this.level = level
//     }
// }
// export default Citizen

// 2. Named export — export specific functions
// export function createCitizen(name) {
//     return new Citizen(name, 1)
// }

// 3. Default import — no braces, any name you choose
// import Citizen from './citizen.js'

// 4. Named import — braces, exact function name
// import { createCitizen } from './citizen.js'

// 5. Instantiate an imported class
// const eva = new Citizen("EVA", 1)
`

const CHECKS = [
  { id: 'c1', label: 'Default export written',        hint: 'Use export default ClassName or export default function — one per file.',                             test: c => /\bexport\s+default\b/.test(c) },
  { id: 'c2', label: 'Named export written',           hint: 'Use export function name() or export const name — curly braces needed on import side.',              test: c => /\bexport\s+function\b/.test(c) },
  { id: 'c3', label: 'Default import used',            hint: 'import Citizen from "./citizen.js" — no curly braces for default imports.',                          test: c => /\bimport\s+\w+\s+from\b/.test(c) && !/\bimport\s*\{/.test(c.split('\n').find(l => /\bimport\s+\w+\s+from\b/.test(l)) || '') },
  { id: 'c4', label: 'Named import used',              hint: 'import { createCitizen } from "./citizen.js" — curly braces for named imports.',                    test: c => /\bimport\s*\{[^}]+\}\s*from\b/.test(c) },
  { id: 'c5', label: 'Class instantiated with new',    hint: 'const eva = new Citizen("EVA", 1) — use the new keyword to create an instance.',                    test: c => /\bnew\s+\w+\s*\(/.test(c) },
]

const QUIZ = {
  q: 'A file has both export default Citizen and export function createCitizen(). How do you import both in one line?',
  opts: [
    'import { Citizen, createCitizen } from "./citizen.js" — both in curly braces.',
    'import Citizen, { createCitizen } from "./citizen.js" — default first, then named in braces.',
    'import * from "./citizen.js" — the star grabs everything automatically.',
    'import default Citizen and named createCitizen from "./citizen.js" — use the keywords.',
  ],
  correct: 1,
}

function Scene({ passCount }) {
  return (
    <div className="ag-scene" style={{ '--ac': 'var(--magenta)' }}>
      <span className="ag-scene-label">MODULE SYSTEM — GATE J-05</span>
      <div className="ag-py-terminal">
        <div className="ag-py-terminal-bar">
          <span className="ag-py-dot" style={{ background: 'var(--magenta)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--amber)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--lime)' }} />
          <span style={{ flex: 1, textAlign: 'center', fontSize: 9, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)' }}>modules.js</span>
        </div>
        <div className="ag-py-output">
          {passCount === 0 && <div className="ag-py-line" style={{ opacity: 0.35 }}>&gt; running modules.js…</div>}
          {passCount >= 1 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>default export ready</span></div>}
          {passCount >= 2 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>named export ready</span></div>}
          {passCount >= 3 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>default import wired</span></div>}
          {passCount >= 4 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>named import wired</span></div>}
          {passCount >= 5 && <div className="ag-py-line">&gt; <span style={{ color: 'var(--magenta)' }}>MODULE NETWORK ONLINE!</span></div>}
        </div>
      </div>
    </div>
  )
}

export default function GateJ05() {
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
        <span className="ag-rank-badge" style={{ '--ac': 'var(--magenta)' }}>RANK D</span>
        <h1 className="ag-gate-name">The Module System</h1>
        <span className="ag-concept-tag">ES Modules</span>
        <span className="ag-xp-tag" style={{ color: 'var(--magenta)' }}>+300 XP</span>
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
            className="ag-run-btn" style={{ '--ac': 'var(--magenta)' }}
            onClick={handleRun} disabled={!allPassed || running}
          >
            {running ? '⟳ Running checks…' : allPassed ? '▶ LINK MODULES' : `○ ${5 - passCount} check${5 - passCount !== 1 ? 's' : ''} remaining`}
          </button>
        </div>

        <div className="ag-right">
          <div className="ag-instruction">
            Structure the Construct's code across <strong>modules</strong>. Write a <strong>default export</strong> and a <strong>named export</strong>. Import the default <strong>without braces</strong>, the named export <strong>with braces</strong>. Instantiate a class with <strong>new</strong>. One responsibility per file — the module network holds.
          </div>
          <div className="ag-py-editor">
            <div className="ag-py-editor-head">⚡ modules.js</div>
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
            <div className="ag-quiz-eyebrow">Knowledge Check — Gate J-05</div>
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
          <div className="ag-done-card" style={{ '--ac': 'var(--magenta)' }}>
            <span className="ag-done-emoji">📦</span>
            <span className="ag-done-xp">+300 XP</span>
            <h2 className="ag-done-title">The Module System</h2>
            <p className="ag-done-flavor">The Module System links. Each file a focused unit. Exports flow between them. The Construct grows without collapsing into chaos.</p>
            <div className="ag-done-rewards">
              <span className="ag-done-reward">Module Fragment</span>
              <span className="ag-done-reward">Module Badge I</span>
            </div>
            <button className="ag-done-btn" onClick={() => goto('academy/dashboard')}>Builder HQ →</button>
          </div>
        </div>
      )}
    </div>
  )
}

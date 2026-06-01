import { useState } from 'react'
import './AcademyGate.css'
import { useNav } from '../context/NavigationContext'
import { useAcademy } from '../context/AcademyContext'

const GATE_ID = 'P-02'
const GATE_XP = 200

const STARTER = `# Calculator program
# Tip: Use int(input("Enter a number: ")) to get a number from the user

`

const CHECKS = [
  { id: 'c1', label: 'Gets input with int(input())', hint: 'Use int(input("...")) to read a number from the user.',               test: c => /int\s*\(\s*input\s*\(/.test(c) },
  { id: 'c2', label: 'Uses arithmetic (+, -, *, /)', hint: 'Use +, -, *, or / to perform a calculation.',                         test: c => /[\+\-\*\/]/.test(c) },
  { id: 'c3', label: 'Uses integer division (//)',   hint: 'Use // to divide and get a whole number — like: 7 // 2 gives 3.',     test: c => /\/\//.test(c) },
  { id: 'c4', label: 'Uses modulo (%)',              hint: 'Use % to find the remainder — like: 7 % 2 gives 1.',                  test: c => /%/.test(c) },
  { id: 'c5', label: 'Shows result with f-string',   hint: 'Print the result using an f-string: print(f"The answer is {result}")', test: c => /f["'][^"']*\{[^}]+\}/.test(c) },
]

const QUIZ = {
  q: 'What does the // operator do in Python?',
  opts: [
    '// divides two numbers and keeps the decimal — like regular division.',
    '// divides two numbers and rounds down to a whole number — this is called integer division.',
    '// makes Python skip a line of code when it runs.',
    '// is how you write a comment in Python.',
  ],
  correct: 1,
}

function Scene({ passCount }) {
  const ops = ['+', '-', '*', '/', '//', '%']
  return (
    <div className="ag-scene" style={{ '--ac': 'var(--teal)' }}>
      <span className="ag-scene-label">PYTHON TERMINAL — GATE P-02</span>
      <div className="ag-py-terminal">
        <div className="ag-py-terminal-bar">
          <span className="ag-py-dot" style={{ background: 'var(--magenta)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--amber)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--lime)' }} />
          <span style={{ flex: 1, textAlign: 'center', fontSize: 9, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)' }}>calculator.py</span>
        </div>
        <div className="ag-py-output">
          {passCount === 0 && <div className="ag-py-line" style={{ opacity: 0.35 }}>$ python3 calculator.py</div>}
          {passCount >= 1 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>input() reading numbers</span></div>}
          {passCount >= 2 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>arithmetic operator found</span></div>}
          {passCount >= 3 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>integer division (//) found</span></div>}
          {passCount >= 4 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>modulo (%) found</span></div>}
          {passCount >= 5 && <div className="ag-py-line">&gt;&gt;&gt; <span style={{ color: 'var(--amber)' }}>ALL CHECKS PASSED!</span></div>}
        </div>
      </div>
    </div>
  )
}

export default function GateP02() {
  const { goto } = useNav()
  const { activeChild, completeAcademyGate } = useAcademy()
  const [code, setCode]         = useState(STARTER)
  const [running, setRunning]   = useState(false)
  const [quizOpen, setQuizOpen] = useState(false)
  const [quizOrder, setQuizOrder] = useState(null)
  const [quizWrong, setQuizWrong] = useState(false)
  const [done, setDone]         = useState(false)

  const checks   = CHECKS.map(c => ({ ...c, passed: c.test(code) }))
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
        <span className="ag-rank-badge" style={{ '--ac': 'var(--teal)' }}>RANK E</span>
        <h1 className="ag-gate-name">The Number Engine</h1>
        <span className="ag-concept-tag">Math &amp; Input</span>
        <span className="ag-xp-tag" style={{ color: 'var(--teal)' }}>+200 XP</span>
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
            {running ? '⟳ Running checks…' : allPassed ? '▶ RUN CALCULATOR' : `○ ${5 - passCount} check${5 - passCount !== 1 ? 's' : ''} remaining`}
          </button>
        </div>

        <div className="ag-right">
          <div className="ag-instruction">
            Build a <strong>Python calculator</strong>. Read a number from the user, perform calculations using <strong>+, -, *, /</strong>, use <strong>//</strong> for integer division, use <strong>%</strong> for the remainder, then print the result with an f-string.
          </div>
          <div className="ag-py-editor">
            <div className="ag-py-editor-head">🐍 calculator.py</div>
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
            <div className="ag-quiz-eyebrow">Knowledge Check — Gate P-02</div>
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
            <span className="ag-done-emoji">🔢</span>
            <span className="ag-done-xp">+200 XP</span>
            <h2 className="ag-done-title">The Number Engine</h2>
            <p className="ag-done-flavor">Your program takes numbers, transforms them, and reports back. That is the core of every calculator, every game score, every bank account. Python is now your calculator.</p>
            <div className="ag-done-rewards">
              <span className="ag-done-reward">Math Badge</span>
              <span className="ag-done-reward">Number Cruncher</span>
            </div>
            <button className="ag-done-btn" onClick={() => goto('academy/dashboard')}>Builder HQ →</button>
          </div>
        </div>
      )}
    </div>
  )
}

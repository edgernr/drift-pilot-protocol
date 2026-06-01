import { useState } from 'react'
import './AcademyGate.css'
import { useNav } from '../context/NavigationContext'
import { useAcademy } from '../context/AcademyContext'

const GATE_ID = 'P-03'
const GATE_XP = 300

const STARTER = `# Grade checker program
# Tip: Use if, elif, and else to handle different score ranges

`

const CHECKS = [
  { id: 'c1', label: 'Uses elif',    hint: 'Add elif score >= 70: to check another range after your first if.',  test: c => /\belif\b/.test(c) },
  { id: 'c2', label: 'Uses else',    hint: 'Add else: at the end to handle anything that didn\'t match.',        test: c => /\belse\b/.test(c) },
  { id: 'c3', label: 'Uses and',     hint: 'Use and to check two things at once: if x > 5 and x < 10:',         test: c => /\band\b/.test(c) },
  { id: 'c4', label: 'Uses or',      hint: 'Use or to allow either condition: if score == 0 or score < 0:',     test: c => /\bor\b/.test(c) },
  { id: 'c5', label: 'Uses not',     hint: 'Use not to reverse a condition: if not valid:',                     test: c => /\bnot\b/.test(c) },
]

const QUIZ = {
  q: 'What is the difference between if and elif in Python?',
  opts: [
    'elif is the same as if — they are completely interchangeable.',
    'elif is checked only when the previous if (or elif) was False — it chains conditions so only one branch runs.',
    'elif always runs, even if the if above it was True.',
    'elif is only allowed inside loops — it cannot appear outside a for loop.',
  ],
  correct: 1,
}

function Scene({ passCount }) {
  const keywords = ['if', 'elif', 'else', 'and', 'or', 'not']
  return (
    <div className="ag-scene" style={{ '--ac': 'var(--lime)' }}>
      <span className="ag-scene-label">PYTHON TERMINAL — GATE P-03</span>
      <div className="ag-py-terminal">
        <div className="ag-py-terminal-bar">
          <span className="ag-py-dot" style={{ background: 'var(--magenta)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--amber)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--lime)' }} />
          <span style={{ flex: 1, textAlign: 'center', fontSize: 9, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)' }}>grades.py</span>
        </div>
        <div className="ag-py-output">
          {passCount === 0 && <div className="ag-py-line" style={{ opacity: 0.35 }}>$ python3 grades.py</div>}
          {passCount >= 1 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>elif detected</span></div>}
          {passCount >= 2 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>else detected</span></div>}
          {passCount >= 3 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>and operator found</span></div>}
          {passCount >= 4 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>or operator found</span></div>}
          {passCount >= 5 && <div className="ag-py-line">&gt;&gt;&gt; <span style={{ color: 'var(--amber)' }}>ALL CHECKS PASSED!</span></div>}
        </div>
      </div>
    </div>
  )
}

export default function GateP03() {
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
        <span className="ag-rank-badge" style={{ '--ac': 'var(--lime)' }}>RANK E</span>
        <h1 className="ag-gate-name">The Condition Writer</h1>
        <span className="ag-concept-tag">Conditionals</span>
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
            {running ? '⟳ Running checks…' : allPassed ? '▶ RUN PROGRAM' : `○ ${5 - passCount} check${5 - passCount !== 1 ? 's' : ''} remaining`}
          </button>
        </div>

        <div className="ag-right">
          <div className="ag-instruction">
            Write a <strong>grade checker</strong> in Python. Use <strong>if</strong>, <strong>elif</strong>, and <strong>else</strong> to handle score ranges. Use <strong>and</strong> to combine conditions, <strong>or</strong> for alternatives, and <strong>not</strong> to reverse a check.
          </div>
          <div className="ag-py-editor">
            <div className="ag-py-editor-head">🐍 grades.py</div>
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
            <div className="ag-quiz-eyebrow">Knowledge Check — Gate P-03</div>
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
            <span className="ag-done-emoji">🔀</span>
            <span className="ag-done-xp">+300 XP</span>
            <h2 className="ag-done-title">The Condition Writer</h2>
            <p className="ag-done-flavor">Programs make decisions. With if, elif, else, and, or, not — you can write any decision logic in Python. Every app, every game, every system uses this.</p>
            <div className="ag-done-rewards">
              <span className="ag-done-reward">Logic Badge</span>
              <span className="ag-done-reward">Decision Maker</span>
            </div>
            <button className="ag-done-btn" onClick={() => goto('academy/dashboard')}>Builder HQ →</button>
          </div>
        </div>
      )}
    </div>
  )
}

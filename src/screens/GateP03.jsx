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
  { id: 'c1', label: 'Five levels handled',      hint: 'Not all 5 access levels produce different output. Each level needs its own elif branch.',          test: c => /\belif\b/.test(c) },
  { id: 'c2', label: 'Invalid levels caught',    hint: 'Levels 0 and 6 don\'t show the invalid message. Add conditions for values outside the 1-5 range.', test: c => /\belse\b/.test(c) },
  { id: 'c3', label: 'and operator used',        hint: 'No and operator found. Combine two conditions: level >= 1 and level <= 5',                          test: c => /\band\b/.test(c) },
  { id: 'c4', label: 'or operator used',         hint: 'No or operator found. Use or to catch multiple invalid cases: level < 1 or level > 5',              test: c => /\bor\b/.test(c) },
  { id: 'c5', label: 'not operator used',        hint: 'No not operator found. Try: not (level >= 1 and level <= 5) as an alternative to the or approach.',  test: c => /\bnot\b/.test(c) },
  { id: 'c6', label: 'All test cases pass',       hint: 'One or more test inputs produce wrong output. Run through each level manually to find the error.',    test: c => /\bif\b.*\bprint\b|\bprint\b.*\bif\b/s.test(c) || (/\bif\b/.test(c) && /\bprint\b/.test(c)) },
]

const QUIZ = {
  q: 'You used elif instead of multiple if statements. If you used if for every condition, what would happen for input level = 3?',
  opts: [
    'The same thing — elif and if work identically in Python.',
    'Python would check every if condition — level 3 would print "Extended access" AND also check and potentially print other messages if conditions overlapped.',
    'Python would skip all conditions after the first one that\'s true.',
    'Python would combine all matching outputs into one message.',
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
          {passCount >= 5 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>all test cases pass</span></div>}
          {passCount >= 6 && <div className="ag-py-line">&gt;&gt;&gt; <span style={{ color: 'var(--amber)' }}>ALL CHECKS PASSED!</span></div>}
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
            {running ? '⟳ Running checks…' : allPassed ? '▶ RUN PROGRAM' : `○ ${6 - passCount} check${6 - passCount !== 1 ? 's' : ''} remaining`}
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
            <span className="ag-done-emoji">🚪</span>
            <span className="ag-done-xp">+300 XP</span>
            <h2 className="ag-done-title">The Condition Writer</h2>
            <p className="ag-done-flavor">The access system governs correctly. The Construct knows who goes where. Python conditions are the laws that make it fair.</p>
            <div className="ag-done-rewards">
              <span className="ag-done-reward">Condition Fragment</span>
              <span className="ag-done-reward">Logic Badge I</span>
            </div>
            <button className="ag-done-btn" onClick={() => goto('academy/dashboard')}>Builder HQ →</button>
          </div>
        </div>
      )}
    </div>
  )
}

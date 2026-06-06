import { useState } from 'react'
import './AcademyGate.css'
import { useNav } from '../context/NavigationContext'
import { useAcademy } from '../context/AcademyContext'
import { stripComments } from '../lib/codeUtils'
import GateAIHint from '../components/GateAIHint'

const GATE_ID = 'P-05'
const GATE_XP = 250

const STARTER = `# Functions program
# Define greet and calculate_power functions below

`

const CHECKS = [
  { id: 'c1', label: 'greet function returns greeting',    hint: 'The function prints instead of returning. Use return to send the value back to whoever called it.',                  test: c => /def\s+greet\s*\(/.test(c) },
  { id: 'c2', label: 'calculate_power returns correctly',  hint: 'The function returns wrong value or uses wrong operator. Use ** for exponentiation in Python.',                      test: c => /def\s+calculate_power\s*\(/.test(c) },
  { id: 'c3', label: 'Default parameter works',            hint: 'create_citizen("Alex") raises an error — level has no default. Add =1 after the level parameter.',                  test: c => /def\s+\w+\s*\([^)]*\w\s*=\s*[^,)]+/.test(c) },
  { id: 'c4', label: 'Keyword argument works',             hint: 'Call a function with a keyword: greet(name="Builder") or describe_sector(name="Alpha", status="active")',           test: c => /(greet|calculate_power)\s*\([^)]*\w+\s*=/.test(c) },
  { id: 'c5', label: 'Docstrings present',                  hint: 'No docstrings found. Add """ description """ on the line after each def statement.',                                 test: c => /"""/.test(c) },
]

const QUIZ = {
  q: 'create_citizen has level=1 as a default parameter. Why is this useful compared to always requiring level to be provided?',
  opts: [
    'Default parameters make functions faster because Python skips the parameter check.',
    'Default parameters let you call the function without providing that argument when the default is appropriate — less typing, cleaner code for the common case.',
    'Default parameters are required for functions with more than 2 parameters.',
    'Default parameters prevent errors by automatically correcting wrong values.',
  ],
  correct: 1,
}

function Scene({ passCount }) {
  return (
    <div className="ag-scene" style={{ '--ac': 'var(--amber)' }}>
      <span className="ag-scene-label">PYTHON TERMINAL — GATE P-05</span>
      <div className="ag-py-terminal">
        <div className="ag-py-terminal-bar">
          <span className="ag-py-dot" style={{ background: 'var(--magenta)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--amber)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--lime)' }} />
          <span style={{ flex: 1, textAlign: 'center', fontSize: 9, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)' }}>functions.py</span>
        </div>
        <div className="ag-py-output">
          {passCount === 0 && <div className="ag-py-line" style={{ opacity: 0.35 }}>$ python3 functions.py</div>}
          {passCount >= 1 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>def greet() found</span></div>}
          {passCount >= 2 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>def calculate_power() found</span></div>}
          {passCount >= 3 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>default parameter set</span></div>}
          {passCount >= 4 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>keyword argument used</span></div>}
          {passCount >= 5 && <div className="ag-py-line">&gt;&gt;&gt; <span style={{ color: 'var(--amber)' }}>ALL CHECKS PASSED!</span></div>}
        </div>
      </div>
    </div>
  )
}

export default function GateP05() {
  const { goto } = useNav()
  const { activeChild, completeAcademyGate } = useAcademy()
  const [code, setCode]         = useState(STARTER)
  const [running, setRunning]   = useState(false)
  const [quizOpen, setQuizOpen] = useState(false)
  const [quizOrder, setQuizOrder] = useState(null)
  const [quizWrong, setQuizWrong] = useState(false)
  const [done, setDone]         = useState(false)

  const checks   = CHECKS.map(c => ({ ...c, passed: c.test(c.raw ? code : stripComments(code)) }))
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
        <h1 className="ag-gate-name">The Function Forge</h1>
        <span className="ag-concept-tag">Functions</span>
        <span className="ag-xp-tag" style={{ color: 'var(--amber)' }}>+250 XP</span>
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
            {running ? '⟳ Running checks…' : allPassed ? '▶ RUN PROGRAM' : `○ ${5 - passCount} check${5 - passCount !== 1 ? 's' : ''} remaining`}
          </button>
          <GateAIHint code={code} checks={checks} gateId={GATE_ID} lang="python" done={done} />
        </div>

        <div className="ag-right">
          <div className="ag-instruction">
            Build two Python functions. <strong>greet(name)</strong> prints a personalised greeting. <strong>calculate_power(base, exp)</strong> returns base to the power of exp. Add a <strong>default parameter</strong>, call one with a <strong>keyword argument</strong>, and add a <strong>docstring</strong> to document it.
          </div>
          <div className="ag-py-editor">
            <div className="ag-py-editor-head">🐍 functions.py</div>
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
            <div className="ag-quiz-eyebrow">Knowledge Check — Gate P-05</div>
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
            <span className="ag-done-emoji">🔨</span>
            <span className="ag-done-xp">+250 XP</span>
            <h2 className="ag-done-title">The Function Forge</h2>
            <p className="ag-done-flavor">Five functions forged. Five tools for the Construct. Python functions are the Builder's most powerful instruments.</p>
            <div className="ag-done-rewards">
              <span className="ag-done-reward">Function Fragment</span>
              <span className="ag-done-reward">Function Badge II</span>
            </div>
            <button className="ag-done-btn" onClick={() => goto('academy/dashboard')}>Builder HQ →</button>
          </div>
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import './AcademyGate.css'
import { useNav } from '../context/NavigationContext'
import { useAcademy } from '../context/AcademyContext'

const GATE_ID = 'P-09'
const GATE_XP = 275

const STARTER = `# Error Handler — Making the Construct Resilient

# 1. Handle ValueError — bad input
try:
    value = int("not_a_number")
except ValueError:
    print("Invalid input — please enter a number")

# 2. Handle FileNotFoundError — missing file
# try:
#     with open("missing_file.txt") as f:
#         data = f.read()
# except FileNotFoundError:
#     data = "default_data"

# 3. Handle ZeroDivisionError
# try:
#     result = 10 / 0
# except ZeroDivisionError:
#     result = 0

# 4. Custom exception
# class ConstructError(Exception):
#     pass
# raise ConstructError("Invalid sector level") if level < 1 else None

# 5. finally block — always runs
# try:
#     risky_operation()
# except Exception:
#     handle_error()
# finally:
#     print("Cleanup complete")
`

const CHECKS = [
  { id: 'c1', label: 'ValueError handled',          hint: 'Wrap int() in try/except ValueError: — catch and handle bad input.',        test: c => /\bexcept\s+ValueError/.test(c) },
  { id: 'c2', label: 'FileNotFoundError handled',   hint: 'Catch except FileNotFoundError: when opening a file that might not exist.', test: c => /\bexcept\s+FileNotFoundError/.test(c) },
  { id: 'c3', label: 'ZeroDivisionError handled',   hint: 'Catch except ZeroDivisionError: specifically — not a bare except.',         test: c => /\bexcept\s+ZeroDivisionError/.test(c) },
  { id: 'c4', label: 'Custom exception defined',    hint: 'Define class ConstructError(Exception): pass — then raise it with a message.', test: c => /class\s+\w+\s*\(\s*Exception\s*\)/.test(c) },
  { id: 'c5', label: 'finally block present',       hint: 'Add finally: after the except blocks — it runs whether an exception occurred or not.', test: c => /\bfinally\s*:/.test(c) },
]

const QUIZ = {
  q: 'You used except ValueError instead of bare except (which catches everything). Why is catching specific exceptions better?',
  opts: [
    'Specific exceptions run faster because Python checks fewer error types.',
    'Bare except hides bugs — if your code has an unexpected error, bare except silently catches it and you will never know something went wrong.',
    'Python requires specific exceptions — bare except is not valid Python syntax.',
    'Specific exceptions use less memory because they store smaller error objects.',
  ],
  correct: 1,
}

function Scene({ passCount }) {
  const labels = ['ValueError', 'FileNotFound', 'ZeroDivision', 'Custom', 'finally']
  return (
    <div className="ag-scene" style={{ '--ac': 'var(--lime)' }}>
      <span className="ag-scene-label">ERROR HANDLER — GATE P-09</span>
      <div className="ag-py-terminal">
        <div className="ag-py-terminal-bar">
          <span className="ag-py-dot" style={{ background: 'var(--magenta)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--amber)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--lime)' }} />
          <span style={{ flex: 1, textAlign: 'center', fontSize: 9, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)' }}>errors.py</span>
        </div>
        <div className="ag-py-output">
          {passCount === 0 && <div className="ag-py-line" style={{ opacity: 0.35 }}>$ python3 errors.py</div>}
          {passCount >= 1 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>ValueError caught</span></div>}
          {passCount >= 2 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>FileNotFoundError caught</span></div>}
          {passCount >= 3 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>ZeroDivisionError caught</span></div>}
          {passCount >= 4 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>custom exception defined</span></div>}
          {passCount >= 5 && <div className="ag-py-line">&gt;&gt;&gt; <span style={{ color: 'var(--lime)' }}>ALL CHECKS PASSED!</span></div>}
        </div>
      </div>
    </div>
  )
}

export default function GateP09() {
  const { goto } = useNav()
  const { activeChild, completeAcademyGate } = useAcademy()
  const [code, setCode]           = useState(STARTER)
  const [running, setRunning]     = useState(false)
  const [quizOpen, setQuizOpen]   = useState(false)
  const [quizOrder, setQuizOrder] = useState(null)
  const [quizWrong, setQuizWrong] = useState(false)
  const [done, setDone]           = useState(false)

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
        <span className="ag-rank-badge" style={{ '--ac': 'var(--lime)' }}>RANK C</span>
        <h1 className="ag-gate-name">The Error Handler</h1>
        <span className="ag-concept-tag">Error Handling</span>
        <span className="ag-xp-tag" style={{ color: 'var(--lime)' }}>+275 XP</span>
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
            Make the Construct <strong>resilient</strong>. Handle <strong>ValueError</strong>, <strong>FileNotFoundError</strong>, and <strong>ZeroDivisionError</strong> with specific except clauses. Define a <strong>custom exception</strong> class. Add a <strong>finally</strong> block that always runs. Programs that don't crash are trustworthy.
          </div>
          <div className="ag-py-editor">
            <div className="ag-py-editor-head">🐍 errors.py</div>
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
            <div className="ag-quiz-eyebrow">Knowledge Check — Gate P-09</div>
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
            <span className="ag-done-xp">+275 XP</span>
            <h2 className="ag-done-title">The Error Handler</h2>
            <p className="ag-done-flavor">The Construct handles its own failures. It doesn't crash. It recovers. Error handling is what makes programs trustworthy.</p>
            <div className="ag-done-rewards">
              <span className="ag-done-reward">Error Fragment</span>
              <span className="ag-done-reward">Error Handler</span>
            </div>
            <button className="ag-done-btn" onClick={() => goto('academy/dashboard')}>Builder HQ →</button>
          </div>
        </div>
      )}
    </div>
  )
}

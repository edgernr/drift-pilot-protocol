import { useState } from 'react'
import './AcademyGate.css'
import { useNav } from '../context/NavigationContext'
import { useAcademy } from '../context/AcademyContext'
import { stripComments } from '../lib/codeUtils'
import GateAIHint from '../components/GateAIHint'

const GATE_ID = 'P-22'
const GATE_XP = 330

const STARTER = `# The Context Manager — Resource Safety

# 1. Context manager class with __enter__ and __exit__
# class ManagedResource:
#     def __enter__(self):
#         print("acquiring resource")
#         return self
#     def __exit__(self, exc_type, exc_val, exc_tb):
#         print("releasing resource")
#         return False

# 2. Using @contextmanager decorator
# from contextlib import contextmanager
# @contextmanager
# def open_connection(url):
#     conn = connect(url)
#     try:
#         yield conn
#     finally:
#         conn.close()

# 3. Suppress exceptions by returning True
# def __exit__(self, exc_type, exc_val, exc_tb):
#     if exc_type is ValueError:
#         return True  # suppress ValueError
#     return False     # propagate everything else

# 4. Database connection pattern
# class DatabaseConnection:
#     def __enter__(self):
#         self.conn = create_connection()
#         return self.conn
#     def __exit__(self, exc_type, exc_val, exc_tb):
#         self.conn.close()
#         return False

# 5. Timer context manager
# import time
# @contextmanager
# def timer():
#     start = time.time()
#     yield
#     print(f"elapsed: {time.time() - start:.4f}s")
`

const CHECKS = [
  { id: 'c1', label: '__enter__ method defined',        hint: 'Define __enter__(self) — it sets up the resource and returns it (or self).',            test: c => /def\s+__enter__\s*\(/.test(c) },
  { id: 'c2', label: '__exit__ method defined',         hint: 'Define __exit__(self, exc_type, exc_val, exc_tb) — it cleans up the resource.',         test: c => /def\s+__exit__\s*\(/.test(c) },
  { id: 'c3', label: '@contextmanager used',            hint: 'Import contextmanager from contextlib. Use yield inside the decorated function.',        test: c => /\bcontextmanager\b/.test(c) },
  { id: 'c4', label: 'Exception handling in __exit__', hint: '__exit__ receives exc_type. Return True to suppress, False (or None) to propagate.',     test: c => /\bexc_type\b/.test(c) && (/return\s+True/.test(c) || /return\s+False/.test(c)) },
  { id: 'c5', label: 'DB connection pattern shown',    hint: 'Create a context manager that opens a connection in __enter__ and closes it in __exit__.',test: c => /\bconn\b/.test(c) || /\bconnection\b/i.test(c) },
  { id: 'c6', label: 'Timer uses time.time + yield',   hint: 'Record start time before yield, print elapsed after yield.',                            test: c => /\btime\.time\s*\(/.test(c) && /\byield\b/.test(c) },
]

const QUIZ = {
  q: 'When a with block completes normally (no exception), what values does __exit__ receive for exc_type, exc_val, and exc_tb?',
  opts: [
    'The values from the last statement in the with block.',
    'All three are None — __exit__ only receives exception info if an exception actually occurred.',
    'True, True, True — Python signals successful completion with True values.',
    'The return value of __enter__ is passed as exc_type.',
  ],
  correct: 1,
}

function Scene({ passCount }) {
  return (
    <div className="ag-scene" style={{ '--ac': 'var(--magenta)' }}>
      <span className="ag-scene-label">CONTEXT MANAGER — GATE P-22</span>
      <div className="ag-py-terminal">
        <div className="ag-py-terminal-bar">
          <span className="ag-py-dot" style={{ background: 'var(--magenta)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--amber)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--lime)' }} />
          <span style={{ flex: 1, textAlign: 'center', fontSize: 9, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)' }}>context.py</span>
        </div>
        <div className="ag-py-output">
          {passCount === 0 && <div className="ag-py-line" style={{ opacity: 0.35 }}>&gt; running context.py…</div>}
          {passCount >= 1 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>__enter__ active</span></div>}
          {passCount >= 2 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>__exit__ active</span></div>}
          {passCount >= 3 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>contextmanager wired</span></div>}
          {passCount >= 4 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>exception flow controlled</span></div>}
          {passCount >= 5 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>connection guarded</span></div>}
          {passCount >= 6 && <div className="ag-py-line">&gt; <span style={{ color: 'var(--magenta)' }}>RESOURCES LOCKED — LEAKS SEALED!</span></div>}
        </div>
      </div>
    </div>
  )
}

export default function GateP22() {
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
        <span className="ag-rank-badge" style={{ '--ac': 'var(--magenta)' }}>RANK B</span>
        <h1 className="ag-gate-name">The Context Manager</h1>
        <span className="ag-concept-tag">Context Managers</span>
        <span className="ag-xp-tag" style={{ color: 'var(--magenta)' }}>+330 XP</span>
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
            {running ? '⟳ Running checks…' : allPassed ? '▶ SEAL RESOURCES' : `○ ${6 - passCount} check${6 - passCount !== 1 ? 's' : ''} remaining`}
          </button>
          <GateAIHint code={code} checks={checks} gateId={GATE_ID} lang="python" done={done} />
        </div>

        <div className="ag-right">
          <div className="ag-instruction">
            Guard the Construct's resources from leaks. Implement <strong>__enter__</strong> and <strong>__exit__</strong> for the class protocol. Use <strong>@contextmanager</strong> with yield for the function protocol. Control <strong>exception propagation</strong> in __exit__. Build a <strong>database connection</strong> guard. Create a <strong>timer</strong> using time.time + yield.
          </div>
          <div className="ag-py-editor">
            <div className="ag-py-editor-head">⚡ context.py</div>
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
            <div className="ag-quiz-eyebrow">Knowledge Check — Gate P-22</div>
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
            <span className="ag-done-emoji">🔒</span>
            <span className="ag-done-xp">+330 XP</span>
            <h2 className="ag-done-title">The Context Manager</h2>
            <p className="ag-done-flavor">Resources acquired. Resources released. No leaks. No dangling connections. The with statement: Python's most disciplined block.</p>
            <div className="ag-done-rewards">
              <span className="ag-done-reward">Context Fragment</span>
              <span className="ag-done-reward">Resource Badge I</span>
            </div>
            <button className="ag-done-btn" onClick={() => goto('academy/dashboard')}>Builder HQ →</button>
          </div>
        </div>
      )}
    </div>
  )
}

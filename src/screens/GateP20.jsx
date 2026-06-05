import { useState } from 'react'
import './AcademyGate.css'
import { useNav } from '../context/NavigationContext'
import { useAcademy } from '../context/AcademyContext'
import { stripComments } from '../lib/codeUtils'
import GateAIHint from '../components/GateAIHint'

const GATE_ID = 'P-20'
const GATE_XP = 330

const STARTER = `# The Decorator Chamber — Functions That Wrap Functions

# 1. Basic decorator — wrapper calls original
# def my_decorator(func):
#     def wrapper(*args, **kwargs):
#         print("before")
#         result = func(*args, **kwargs)
#         print("after")
#         return result
#     return wrapper

# 2. Decorator returns the original function
# @my_decorator
# def greet(name):
#     return f"Hello, {name}"

# 3. Timing decorator
# import time
# def timer(func):
#     def wrapper(*args, **kwargs):
#         start = time.time()
#         result = func(*args, **kwargs)
#         end = time.time()
#         print(f"{func.__name__} took {end - start:.4f}s")
#         return result
#     return wrapper

# 4. Retry decorator with max_attempts
# def retry(max_attempts):
#     def decorator(func):
#         def wrapper(*args, **kwargs):
#             for attempt in range(max_attempts):
#                 try:
#                     return func(*args, **kwargs)
#                 except Exception:
#                     if attempt == max_attempts - 1:
#                         raise
#         return wrapper
#     return decorator

# 5. Preserve metadata with functools.wraps
# import functools
# @functools.wraps(func)

# 6. Cache with lru_cache
# from functools import lru_cache
# @lru_cache(maxsize=128)
# def expensive(n):
#     return n * n
`

const CHECKS = [
  { id: 'c1', label: 'Wrapper calls the original',    hint: 'The wrapper function must call func(*args, **kwargs) and return its result.',             test: c => /def\s+wrapper\s*\(/.test(c) && /func\s*\(/.test(c) },
  { id: 'c2', label: 'Decorator returns callable',    hint: 'The decorator function must return wrapper — not wrapper() (calling it would break it).', test: c => /return\s+wrapper\b/.test(c) },
  { id: 'c3', label: 'Timing decorator uses time',    hint: 'Import time. Use time.time() before and after the call to measure elapsed time.',        test: c => /\btime\.time\s*\(/.test(c) },
  { id: 'c4', label: 'Retry uses max_attempts',       hint: 'Loop up to max_attempts times. Catch exceptions and re-raise on the last attempt.',      test: c => /\bmax_attempts\b/.test(c) },
  { id: 'c5', label: '@functools.wraps used',          hint: 'Apply @functools.wraps(func) to the wrapper to preserve __name__ and __doc__.',         test: c => /functools\.wraps\b/.test(c) || /@wraps\b/.test(c) },
  { id: 'c6', label: '@lru_cache applied',             hint: 'Import lru_cache from functools and apply @lru_cache(maxsize=...) to a function.',      test: c => /\blru_cache\b/.test(c) },
]

const QUIZ = {
  q: 'A decorator must return something that will replace the original function. What must that returned value be?',
  opts: [
    'A string — the decorator returns documentation for the function.',
    'A callable — something that can be called with the same arguments the original function accepts.',
    'A class instance — decorators must wrap functions in objects to work.',
    'A dict — decorators store function metadata in a dictionary.',
  ],
  correct: 1,
}

function Scene({ passCount }) {
  return (
    <div className="ag-scene" style={{ '--ac': 'var(--violet)' }}>
      <span className="ag-scene-label">DECORATOR CHAMBER — GATE P-20</span>
      <div className="ag-py-terminal">
        <div className="ag-py-terminal-bar">
          <span className="ag-py-dot" style={{ background: 'var(--magenta)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--amber)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--lime)' }} />
          <span style={{ flex: 1, textAlign: 'center', fontSize: 9, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)' }}>decorators.py</span>
        </div>
        <div className="ag-py-output">
          {passCount === 0 && <div className="ag-py-line" style={{ opacity: 0.35 }}>&gt; running decorators.py…</div>}
          {passCount >= 1 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>wrapper active</span></div>}
          {passCount >= 2 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>callable returned</span></div>}
          {passCount >= 3 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>timer wired</span></div>}
          {passCount >= 4 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>retry armed</span></div>}
          {passCount >= 5 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>metadata preserved</span></div>}
          {passCount >= 6 && <div className="ag-py-line">&gt; <span style={{ color: 'var(--violet)' }}>CHAMBER SEALED — ALL DECORATORS APPLIED!</span></div>}
        </div>
      </div>
    </div>
  )
}

export default function GateP20() {
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
        <span className="ag-rank-badge" style={{ '--ac': 'var(--violet)' }}>RANK B</span>
        <h1 className="ag-gate-name">The Decorator Chamber</h1>
        <span className="ag-concept-tag">Decorators</span>
        <span className="ag-xp-tag" style={{ color: 'var(--violet)' }}>+330 XP</span>
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
            className="ag-run-btn" style={{ '--ac': 'var(--violet)' }}
            onClick={handleRun} disabled={!allPassed || running}
          >
            {running ? '⟳ Running checks…' : allPassed ? '▶ SEAL CHAMBER' : `○ ${6 - passCount} check${6 - passCount !== 1 ? 's' : ''} remaining`}
          </button>
          <GateAIHint code={code} checks={checks} gateId={GATE_ID} lang="python" done={done} />
        </div>

        <div className="ag-right">
          <div className="ag-instruction">
            Master Python's meta-programming tool. Write a <strong>wrapper</strong> that calls the original function. Build a <strong>timer</strong> decorator with time.time(). Create a <strong>retry</strong> decorator with max_attempts. Use <strong>@functools.wraps</strong> to preserve metadata. Apply <strong>@lru_cache</strong> for memoization.
          </div>
          <div className="ag-py-editor">
            <div className="ag-py-editor-head">⚡ decorators.py</div>
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
            <div className="ag-quiz-eyebrow">Knowledge Check — Gate P-20</div>
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
          <div className="ag-done-card" style={{ '--ac': 'var(--violet)' }}>
            <span className="ag-done-emoji">✨</span>
            <span className="ag-done-xp">+330 XP</span>
            <h2 className="ag-done-title">The Decorator Chamber</h2>
            <p className="ag-done-flavor">Functions wrapped in functions. Behavior injected without touching the source. The Chamber seals. Meta-programming mastered.</p>
            <div className="ag-done-rewards">
              <span className="ag-done-reward">Decorator Fragment</span>
              <span className="ag-done-reward">Meta Badge I</span>
            </div>
            <button className="ag-done-btn" onClick={() => goto('academy/dashboard')}>Builder HQ →</button>
          </div>
        </div>
      )}
    </div>
  )
}

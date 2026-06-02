import { useState } from 'react'
import './AcademyGate.css'
import { useNav } from '../context/NavigationContext'
import { useAcademy } from '../context/AcademyContext'

const GATE_ID = 'P-19'
const GATE_XP = 330

const STARTER = `# The Generator Network — Lazy Sequences

# 1. Basic generator with yield
# def count_up(limit):
#     n = 0
#     while n < limit:
#         yield n
#         n += 1

# 2. Generator is lazy — values produced on demand
# gen = count_up(3)
# next(gen)  → 0
# next(gen)  → 1

# 3. Custom iterator with __iter__ and __next__
# class Counter:
#     def __init__(self, limit):
#         self.limit = limit
#         self.n = 0
#     def __iter__(self):
#         return self
#     def __next__(self):
#         if self.n >= self.limit:
#             raise StopIteration
#         value = self.n
#         self.n += 1
#         return value

# 4. itertools.islice — take first N from infinite generator
# from itertools import islice
# first_five = list(islice(count_up(100), 5))

# 5. itertools.chain — combine generators
# from itertools import chain
# combined = list(chain(count_up(3), count_up(3)))

# 6. Memory comparison
# import sys
# gen_size = sys.getsizeof(count_up(1000))
# list_size = sys.getsizeof(list(range(1000)))
`

const CHECKS = [
  { id: 'c1', label: 'yield keyword used',             hint: 'Define a generator function using the yield keyword to produce values one at a time.',    test: c => /\byield\b/.test(c) },
  { id: 'c2', label: 'Generator laziness shown',       hint: 'Call next() on a generator or show it produces values on demand.',                        test: c => /\bnext\s*\(/.test(c) },
  { id: 'c3', label: '__iter__ and __next__ defined',  hint: 'Create a class with both __iter__ and __next__ methods to implement the iterator protocol.',test: c => /def\s+__iter__\s*\(/.test(c) && /def\s+__next__\s*\(/.test(c) },
  { id: 'c4', label: 'islice used correctly',          hint: 'Import islice from itertools. Use islice(generator, n) to take the first n items.',       test: c => /\bislice\b/.test(c) },
  { id: 'c5', label: 'chain combines generators',      hint: 'Import chain from itertools. Use chain(gen1, gen2) to concatenate them.',                 test: c => /\bchain\b/.test(c) },
  { id: 'c6', label: 'sys.getsizeof comparison',       hint: 'Import sys. Use sys.getsizeof() to compare generator vs list memory usage.',             test: c => /\bsys\.getsizeof\b/.test(c) },
]

const QUIZ = {
  q: 'When a generator function is paused at a yield statement, what happens to its local variables?',
  opts: [
    'They are garbage collected to save memory — that\'s why generators are efficient.',
    'They are preserved in the generator\'s frame state — the function resumes exactly where it left off with all variables intact.',
    'They are reset to their initial values each time next() is called.',
    'They are stored in a global dictionary shared across all generators.',
  ],
  correct: 1,
}

function Scene({ passCount }) {
  return (
    <div className="ag-scene" style={{ '--ac': 'var(--teal)' }}>
      <span className="ag-scene-label">GENERATOR NETWORK — GATE P-19</span>
      <div className="ag-py-terminal">
        <div className="ag-py-terminal-bar">
          <span className="ag-py-dot" style={{ background: 'var(--magenta)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--amber)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--lime)' }} />
          <span style={{ flex: 1, textAlign: 'center', fontSize: 9, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)' }}>generators.py</span>
        </div>
        <div className="ag-py-output">
          {passCount === 0 && <div className="ag-py-line" style={{ opacity: 0.35 }}>&gt; running generators.py…</div>}
          {passCount >= 1 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>yield active</span></div>}
          {passCount >= 2 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>lazy evaluation active</span></div>}
          {passCount >= 3 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>iterator protocol wired</span></div>}
          {passCount >= 4 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>islice connected</span></div>}
          {passCount >= 5 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>chain connected</span></div>}
          {passCount >= 6 && <div className="ag-py-line">&gt; <span style={{ color: 'var(--teal)' }}>NETWORK ONLINE — INFINITE STREAMS FLOWING!</span></div>}
        </div>
      </div>
    </div>
  )
}

export default function GateP19() {
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
        <span className="ag-rank-badge" style={{ '--ac': 'var(--teal)' }}>RANK B</span>
        <h1 className="ag-gate-name">The Generator Network</h1>
        <span className="ag-concept-tag">Generators</span>
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
            {running ? '⟳ Running checks…' : allPassed ? '▶ ACTIVATE NETWORK' : `○ ${6 - passCount} check${6 - passCount !== 1 ? 's' : ''} remaining`}
          </button>
        </div>

        <div className="ag-right">
          <div className="ag-instruction">
            Build the Construct's lazy data streams. Use <strong>yield</strong> to create a generator function. Show <strong>lazy evaluation</strong> with next(). Implement the <strong>iterator protocol</strong> (__iter__ + __next__). Use <strong>itertools.islice</strong> to limit and <strong>itertools.chain</strong> to combine. Compare memory with <strong>sys.getsizeof</strong>.
          </div>
          <div className="ag-py-editor">
            <div className="ag-py-editor-head">⚡ generators.py</div>
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
            <div className="ag-quiz-eyebrow">Knowledge Check — Gate P-19</div>
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
            <span className="ag-done-emoji">♾️</span>
            <span className="ag-done-xp">+330 XP</span>
            <h2 className="ag-done-title">The Generator Network</h2>
            <p className="ag-done-flavor">Infinite streams, finite memory. The Generator Network hums. Values flow only when called. The Construct breathes lazy.</p>
            <div className="ag-done-rewards">
              <span className="ag-done-reward">Generator Fragment</span>
              <span className="ag-done-reward">Stream Badge I</span>
            </div>
            <button className="ag-done-btn" onClick={() => goto('academy/dashboard')}>Builder HQ →</button>
          </div>
        </div>
      )}
    </div>
  )
}

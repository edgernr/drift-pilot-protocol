import { useState } from 'react'
import './AcademyGate.css'
import { useNav } from '../context/NavigationContext'
import { useAcademy } from '../context/AcademyContext'

const GATE_ID = 'P-06'
const GATE_XP = 280

const STARTER = `# List Library — Citizen Registry
citizens = ["Zara", "Alex", "Lucy", "Sam", "Viktor"]

# 1. Add "Morgan" with append()

# 2. Remove "Sam" with remove()

# 3. Sort the list alphabetically with sort()

# 4. Slice to get items at index 1 and 2

# 5. List comprehension: names with more than 3 characters
# filtered = [c for c in citizens if ...]

# 6. Create a 2D grid and access grid[1][1]
# grid = [[0,0,0],[0,0,0],[0,0,0]]

# 7. Use pop() to remove and return the last item
`

const CHECKS = [
  { id: 'c1', label: 'List created correctly',              hint: 'The citizens list doesn\'t contain the required names or uses wrong syntax.',                         test: c => /\w+\s*=\s*\[/.test(c) && /["']/.test(c) },
  { id: 'c2', label: 'append and remove work',              hint: 'Adding or removing citizens isn\'t working. Check that append() adds to the end and remove() finds by value.', test: c => /\.append\s*\(/.test(c) && /\.remove\s*\(/.test(c) },
  { id: 'c3', label: 'sort works correctly',                hint: 'The list isn\'t alphabetically ordered. Call .sort() on the list directly.',                          test: c => /\.sort\s*\(/.test(c) },
  { id: 'c4', label: 'Slicing returns subset',              hint: 'The slice returns wrong items. Remember: list[start:end] includes start, excludes end.',              test: c => /\w+\[\s*\d+\s*:\s*\d+\s*\]/.test(c) },
  { id: 'c5', label: 'List comprehension filters correctly',hint: 'The comprehension returns wrong items or has syntax errors. Check the if condition.',                  test: c => /\[\s*\w+\s+for\s+\w+\s+in\s+\w+/.test(c) && /\bif\b/.test(c) },
  { id: 'c6', label: '2D list indexed correctly',           hint: 'The grid cell isn\'t being accessed correctly. 2D lists use grid[row][column].',                      test: c => /\[\s*\[/.test(c) && /\w+\[\s*\d+\s*\]\s*\[\s*\d+\s*\]/.test(c) },
  { id: 'c7', label: 'pop returns and removes',             hint: 'pop() isn\'t being used or its return value is being ignored. It both removes and returns the item.', test: c => /\.pop\s*\(/.test(c) },
]

const QUIZ = {
  q: 'citizens[1:3] returns items at index 1 and 2 — but NOT index 3. Why does Python exclude the end index in slices?',
  opts: [
    "It's a bug in Python — the designers intended it to include the end index.",
    'Excluding the end makes the length predictable: list[1:4] always gives 3 items (4−1=3). It also matches range(1, 4) which gives 1, 2, 3.',
    'Including the end would cause errors when the end index is the last item in the list.',
    'The end index is reserved for Python internal calculations and cannot be included.',
  ],
  correct: 1,
}

function Scene({ passCount }) {
  return (
    <div className="ag-scene" style={{ '--ac': 'var(--amber)' }}>
      <span className="ag-scene-label">LIST LIBRARY — GATE P-06</span>
      <div className="ag-py-terminal">
        <div className="ag-py-terminal-bar">
          <span className="ag-py-dot" style={{ background: 'var(--magenta)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--amber)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--lime)' }} />
          <span style={{ flex: 1, textAlign: 'center', fontSize: 9, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)' }}>registry.py</span>
        </div>
        <div className="ag-py-output">
          {passCount === 0 && <div className="ag-py-line" style={{ opacity: 0.35 }}>$ python3 registry.py</div>}
          {passCount >= 1 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>citizens list created</span></div>}
          {passCount >= 2 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>append() and remove() working</span></div>}
          {passCount >= 3 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>list sorted alphabetically</span></div>}
          {passCount >= 4 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>slice returned subset</span></div>}
          {passCount >= 5 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>list comprehension filtering</span></div>}
          {passCount >= 6 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>2D grid indexed correctly</span></div>}
          {passCount >= 7 && <div className="ag-py-line">&gt;&gt;&gt; <span style={{ color: 'var(--amber)' }}>ALL CHECKS PASSED!</span></div>}
        </div>
      </div>
    </div>
  )
}

export default function GateP06() {
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
        <span className="ag-rank-badge" style={{ '--ac': 'var(--amber)' }}>RANK D</span>
        <h1 className="ag-gate-name">The List Library</h1>
        <span className="ag-concept-tag">Lists</span>
        <span className="ag-xp-tag" style={{ color: 'var(--amber)' }}>+280 XP</span>
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
            {running ? '⟳ Running checks…' : allPassed ? '▶ RUN REGISTRY' : `○ ${7 - passCount} check${7 - passCount !== 1 ? 's' : ''} remaining`}
          </button>
        </div>

        <div className="ag-right">
          <div className="ag-instruction">
            Build the Construct's <strong>citizen registry</strong> using Python lists. Append and remove citizens, sort alphabetically, slice to get subsets, filter with a <strong>list comprehension</strong>, manage a <strong>2D grid</strong>, and use pop(). Seven operations — seven list skills mastered.
          </div>
          <div className="ag-py-editor">
            <div className="ag-py-editor-head">🐍 registry.py</div>
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
            <div className="ag-quiz-eyebrow">Knowledge Check — Gate P-06</div>
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
            <span className="ag-done-emoji">📚</span>
            <span className="ag-done-xp">+280 XP</span>
            <h2 className="ag-done-title">The List Library</h2>
            <p className="ag-done-flavor">The List Library organized. The Construct's registry runs clean. Python lists hold the world's memory.</p>
            <div className="ag-done-rewards">
              <span className="ag-done-reward">List Fragment</span>
              <span className="ag-done-reward">Collection Badge I</span>
            </div>
            <button className="ag-done-btn" onClick={() => goto('academy/dashboard')}>Builder HQ →</button>
          </div>
        </div>
      )}
    </div>
  )
}

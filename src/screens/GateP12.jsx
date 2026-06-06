import { useState } from 'react'
import './AcademyGate.css'
import { useNav } from '../context/NavigationContext'
import { useAcademy } from '../context/AcademyContext'
import { stripComments } from '../lib/codeUtils'
import GateAIHint from '../components/GateAIHint'

const GATE_ID = 'P-12'
const GATE_XP = 300

const STARTER = `# Algorithm Mind — Search and Sort

# 1. Linear search: find citizen by name (returns index or -1)
def find_citizen(citizens, target):
    for i, name in enumerate(citizens):
        if name == target:
            return i
    return -1

# 2. Binary search: find sector ID (list must meet a key requirement)
# def binary_search(sorted_ids, target):
#     left, right = 0, len(sorted_ids) - 1
#     while left <= right:
#         mid = (left + right) // 2
#         if sorted_ids[mid] == target:
#             return mid
#         elif sorted_ids[mid] < target:
#             left = mid + 1
#         else:
#             right = mid - 1
#     return -1

# 3. Add a comment explaining why binary search has one key requirement:
# # (your explanation: what property must the list have, and why?)

# 4. Bubble sort: swap adjacent items — no .sort() allowed
# def bubble_sort(lst):
#     for i in range(len(lst)):
#         for j in range(len(lst) - 1):
#             if lst[j] > lst[j+1]:
#                 lst[j], lst[j+1] = lst[j+1], lst[j]
#     return lst
`

const CHECKS = [
  { id: 'c1', label: 'Linear search correct',           hint: 'The search returns wrong index or doesn\'t handle not-found case. Return -1 when the item isn\'t found.',        test: c => /return\s+-1/.test(c) },
  { id: 'c2', label: 'Binary search correct',           hint: 'Binary search returns wrong index or doesn\'t halve the search range. Calculate mid = (left + right) // 2',      test: c => /\/\/\s*2/.test(c) },
  { id: 'c3', label: 'Binary search explanation present',hint: 'No comment explaining why sorted is required. Add a comment: # Binary search only works because the list is sorted.', raw: true, test: c => /#[^\n]*\bbinary\b[^\n]*\b(sort|order)\b/i.test(c) },
  { id: 'c4', label: 'Bubble sort uses nested loops',   hint: 'The sort uses .sort() instead of nested loops. Implement the comparison and swap manually.',                      test: c => (c.match(/for\s+\w+\s+in\s+range\s*\(/g) || []).length >= 2 },
]

const QUIZ = {
  q: 'Binary search is much faster than linear search on large lists, but it requires the list to be sorted first. When would linear search still be the better choice?',
  opts: [
    'Linear search is never better — always sort first and use binary search.',
    'When the list is small or unsorted and sorting it would cost more than just searching linearly — for one search on an unsorted list, sorting first adds extra work.',
    'When the items are strings — binary search only works on numbers.',
    'When you need to find multiple items — binary search can only find one at a time.',
  ],
  correct: 1,
}

function Scene({ passCount }) {
  return (
    <div className="ag-scene" style={{ '--ac': 'var(--violet)' }}>
      <span className="ag-scene-label">ALGORITHM MIND — GATE P-12</span>
      <div className="ag-py-terminal">
        <div className="ag-py-terminal-bar">
          <span className="ag-py-dot" style={{ background: 'var(--magenta)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--amber)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--lime)' }} />
          <span style={{ flex: 1, textAlign: 'center', fontSize: 9, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)' }}>algorithms.py</span>
        </div>
        <div className="ag-py-output">
          {passCount === 0 && <div className="ag-py-line" style={{ opacity: 0.35 }}>$ python3 algorithms.py</div>}
          {passCount >= 1 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>linear search: not-found → -1</span></div>}
          {passCount >= 2 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>binary search midpoint: //2</span></div>}
          {passCount >= 3 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>sorted list requirement explained</span></div>}
          {passCount >= 4 && <div className="ag-py-line">&gt;&gt;&gt; <span style={{ color: 'var(--violet)' }}>ALL CHECKS PASSED!</span></div>}
        </div>
      </div>
    </div>
  )
}

export default function GateP12() {
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
        <h1 className="ag-gate-name">The Algorithm Mind</h1>
        <span className="ag-concept-tag">Algorithms</span>
        <span className="ag-xp-tag" style={{ color: 'var(--violet)' }}>+300 XP</span>
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
            {running ? '⟳ Running checks…' : allPassed ? '▶ RUN ALGORITHMS' : `○ ${4 - passCount} check${4 - passCount !== 1 ? 's' : ''} remaining`}
          </button>
          <GateAIHint code={code} checks={checks} gateId={GATE_ID} lang="python" done={done} />
        </div>

        <div className="ag-right">
          <div className="ag-instruction">
            Build the Construct's <strong>search system</strong>. Implement <strong>linear search</strong> (scan every item, return -1 if not found), <strong>binary search</strong> (halve the range each step using <code>//2</code>), explain WHY sorted is required, then implement <strong>bubble sort</strong> with nested loops — no cheating with .sort().
          </div>
          <div className="ag-py-editor">
            <div className="ag-py-editor-head">🐍 algorithms.py</div>
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
            <div className="ag-quiz-eyebrow">Knowledge Check — Gate P-12</div>
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
            <span className="ag-done-emoji">🧠</span>
            <span className="ag-done-xp">+300 XP</span>
            <h2 className="ag-done-title">The Algorithm Mind</h2>
            <p className="ag-done-flavor">Algorithms understood. The Construct searches efficiently. Thinking about HOW to solve problems is as important as solving them.</p>
            <div className="ag-done-rewards">
              <span className="ag-done-reward">Algorithm Fragment</span>
              <span className="ag-done-reward">Algorithm Badge I</span>
            </div>
            <button className="ag-done-btn" onClick={() => goto('academy/dashboard')}>Builder HQ →</button>
          </div>
        </div>
      )}
    </div>
  )
}

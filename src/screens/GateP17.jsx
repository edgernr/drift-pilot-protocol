import { useState } from 'react'
import './AcademyGate.css'
import { useNav } from '../context/NavigationContext'
import { useAcademy } from '../context/AcademyContext'
import { stripComments } from '../lib/codeUtils'
import GateAIHint from '../components/GateAIHint'

const GATE_ID = 'P-17'
const GATE_XP = 300

const STARTER = `# The Comprehension Engine — One-Line Data Transformations

# 1. List comprehension with filter
# names = [c["name"] for c in citizens if c["level"] >= 4]

# 2. Nested list comprehension
# grid = [[row * col for col in range(3)] for row in range(3)]

# 3. Dict comprehension
# level_map = {c["name"]: c["level"] for c in citizens}

# 4. Set comprehension — removes duplicates
# sectors = {c["sector"] for c in citizens}

# 5. Generator expression — memory efficient
# total = sum(c["level"] for c in citizens)

# 6. When to use a loop instead
# Complex nested comprehension rewritten as a regular for loop
# for item in data:
#     result.append(transform(item))
`

const CHECKS = [
  { id: 'c1', label: 'List comprehension with filter',   hint: 'Add an if condition after the for clause: [x for x in list if condition].',         test: c => /\[.+\bfor\b.+\bif\b.+\]/.test(c) },
  { id: 'c2', label: 'Nested comprehension correct',     hint: 'Two for clauses: [[expr for col in range(3)] for row in range(3)].',               test: c => /\[.+for.+for.+\]/.test(c) },
  { id: 'c3', label: 'Dict comprehension correct',       hint: 'Use {key: value for item in iterable} format.',                                    test: c => /\{[^{}]+:[^{}]+\bfor\b[^{}]+\}/.test(c) },
  { id: 'c4', label: 'Set comprehension correct',        hint: 'Set comprehension uses {} without key:value — {expression for item in iterable}.',  test: c => /\{[^{}:]+\bfor\b[^{}]+\}/.test(c) },
  { id: 'c5', label: 'Generator expression used',        hint: 'Remove square brackets inside sum(): sum(expr for item in iterable).',             test: c => /\bsum\s*\([^[\]]*\bfor\b/.test(c) || /\bgen\b.*for\b|\(.*\bfor\b.*\bin\b/.test(c) },
  { id: 'c6', label: 'Complex comprehension rewritten',  hint: 'Some comprehensions are too complex. Rewrite as a regular for loop with .append().',test: c => /\bfor\b.+:/.test(c) && /\.append\s*\(/.test(c) },
]

const QUIZ = {
  q: 'A generator expression uses less memory than a list comprehension for the same operation. When would a list comprehension be better despite using more memory?',
  opts: [
    'List comprehensions are always better — memory is cheap and generators are slower.',
    'When you need to access the results multiple times — generators are exhausted after one iteration, lists can be reused.',
    'When the expression is complex — generators only work with simple operations.',
    'When working with numbers — generators can\'t handle numeric operations correctly.',
  ],
  correct: 1,
}

function Scene({ passCount }) {
  return (
    <div className="ag-scene" style={{ '--ac': 'var(--lime)' }}>
      <span className="ag-scene-label">COMPREHENSION ENGINE — GATE P-17</span>
      <div className="ag-py-terminal">
        <div className="ag-py-terminal-bar">
          <span className="ag-py-dot" style={{ background: 'var(--magenta)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--amber)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--lime)' }} />
          <span style={{ flex: 1, textAlign: 'center', fontSize: 9, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)' }}>comprehensions.py</span>
        </div>
        <div className="ag-py-output">
          {passCount === 0 && <div className="ag-py-line" style={{ opacity: 0.35 }}>&gt; running comprehensions.py…</div>}
          {passCount >= 1 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>list comprehension active</span></div>}
          {passCount >= 2 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>nested comprehension active</span></div>}
          {passCount >= 3 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>dict comprehension active</span></div>}
          {passCount >= 4 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>set comprehension active</span></div>}
          {passCount >= 5 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>generator active</span></div>}
          {passCount >= 6 && <div className="ag-py-line">&gt; <span style={{ color: 'var(--lime)' }}>ENGINE COMPRESSED — BALANCE CONFIRMED!</span></div>}
        </div>
      </div>
    </div>
  )
}

export default function GateP17() {
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
        <span className="ag-rank-badge" style={{ '--ac': 'var(--lime)' }}>RANK C</span>
        <h1 className="ag-gate-name">The Comprehension Engine</h1>
        <span className="ag-concept-tag">Comprehensions</span>
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
            {running ? '⟳ Running checks…' : allPassed ? '▶ COMPRESS ENGINE' : `○ ${6 - passCount} check${6 - passCount !== 1 ? 's' : ''} remaining`}
          </button>
          <GateAIHint code={code} checks={checks} gateId={GATE_ID} lang="python" done={done} />
        </div>

        <div className="ag-right">
          <div className="ag-instruction">
            Master Python's most powerful one-liner tool. Write a <strong>list comprehension with filter</strong>, a <strong>nested comprehension</strong> for a 2D grid, a <strong>dict comprehension</strong>, a <strong>set comprehension</strong>, and a <strong>generator expression</strong> inside sum(). Then demonstrate when a <strong>regular loop is more readable</strong> than a comprehension.
          </div>
          <div className="ag-py-editor">
            <div className="ag-py-editor-head">⚡ comprehensions.py</div>
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
            <div className="ag-quiz-eyebrow">Knowledge Check — Gate P-17</div>
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
            <span className="ag-done-emoji">🗜️</span>
            <span className="ag-done-xp">+300 XP</span>
            <h2 className="ag-done-title">The Comprehension Engine</h2>
            <p className="ag-done-flavor">Comprehensions mastered. Loops compressed to single lines. But the hardest lesson learned: brevity isn't always better.</p>
            <div className="ag-done-rewards">
              <span className="ag-done-reward">Comprehension Fragment</span>
              <span className="ag-done-reward">Compression Badge I</span>
            </div>
            <button className="ag-done-btn" onClick={() => goto('academy/dashboard')}>Builder HQ →</button>
          </div>
        </div>
      )}
    </div>
  )
}

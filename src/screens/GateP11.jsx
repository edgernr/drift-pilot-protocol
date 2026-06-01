import { useState } from 'react'
import './AcademyGate.css'
import { useNav } from '../context/NavigationContext'
import { useAcademy } from '../context/AcademyContext'

const GATE_ID = 'P-11'
const GATE_XP = 275

const STARTER = `# Data Structures Forge — Right Tool for Each Job

# 1. Tuple: immutable coordinates (use () not [])
coords = (127.5, -43.2)
# x = coords[0]

# 2. Set: remove duplicates from sector list
# sectors_with_dupes = ["Alpha","Beta","Alpha","Gamma","Beta"]
# unique = set(sectors_with_dupes)

# 3. Set membership — add a new sector with .add()
# unique.add("Delta")
# "Delta" in unique  → True

# 4. String strip and split: process raw citizen names
# raw = "  Lucy, Alex, Sam  "
# names = raw.strip().split(", ")

# 5. str.join: reassemble with a separator
# output = " | ".join(names)
`

const CHECKS = [
  { id: 'c1', label: 'Tuple stores coordinates',      hint: 'Use () not [] for immutable data: coords = (127.5, -43.2)',                   test: c => /\w+\s*=\s*\(\s*-?[\d.]+\s*,\s*-?[\d.]+/.test(c) },
  { id: 'c2', label: 'set() removes duplicates',      hint: 'Convert to set: unique = set(sectors_with_dupes)',                             test: c => /\bset\s*\(/.test(c) },
  { id: 'c3', label: 'set.add() used',                hint: 'Call .add("Delta") on the set to insert a new value.',                         test: c => /\.add\s*\(/.test(c) },
  { id: 'c4', label: '.strip() and .split() used',    hint: 'Call .strip() to trim whitespace and .split(", ") to break into a list.',      test: c => /\.strip\s*\(/.test(c) && /\.split\s*\(/.test(c) },
  { id: 'c5', label: 'str.join() assembles output',   hint: 'Reassemble with " | ".join(names) — join is called on the separator string.',  test: c => /\.join\s*\(/.test(c) },
]

const QUIZ = {
  q: 'You chose a set to track which sectors have been visited. What would happen if you used a list instead, and why does it matter for large data?',
  opts: [
    'A list would work the same way — sets and lists both support "in" checks.',
    'A list works but "in" checks scan every item (O(n)) — for 1 million visited sectors, each check reads up to 1 million items. A set checks in O(1) regardless of size.',
    'A list would allow duplicate visited sectors, but the program would still work correctly.',
    'Lists don\'t support "in" checks — you\'d need to use index() instead.',
  ],
  correct: 1,
}

function Scene({ passCount }) {
  return (
    <div className="ag-scene" style={{ '--ac': 'var(--amber)' }}>
      <span className="ag-scene-label">DATA STRUCTURES FORGE — GATE P-11</span>
      <div className="ag-py-terminal">
        <div className="ag-py-terminal-bar">
          <span className="ag-py-dot" style={{ background: 'var(--magenta)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--amber)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--lime)' }} />
          <span style={{ flex: 1, textAlign: 'center', fontSize: 9, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)' }}>structures.py</span>
        </div>
        <div className="ag-py-output">
          {passCount === 0 && <div className="ag-py-line" style={{ opacity: 0.35 }}>$ python3 structures.py</div>}
          {passCount >= 1 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>tuple coordinates stored</span></div>}
          {passCount >= 2 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>set removes duplicates</span></div>}
          {passCount >= 3 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>set.add() membership</span></div>}
          {passCount >= 4 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>string strip and split</span></div>}
          {passCount >= 5 && <div className="ag-py-line">&gt;&gt;&gt; <span style={{ color: 'var(--amber)' }}>ALL CHECKS PASSED!</span></div>}
        </div>
      </div>
    </div>
  )
}

export default function GateP11() {
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
        <span className="ag-rank-badge" style={{ '--ac': 'var(--amber)' }}>RANK C</span>
        <h1 className="ag-gate-name">The Data Structures Forge</h1>
        <span className="ag-concept-tag">Tuples, Sets &amp; Strings</span>
        <span className="ag-xp-tag" style={{ color: 'var(--amber)' }}>+275 XP</span>
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
            {running ? '⟳ Running checks…' : allPassed ? '▶ FORGE STRUCTURES' : `○ ${5 - passCount} check${5 - passCount !== 1 ? 's' : ''} remaining`}
          </button>
        </div>

        <div className="ag-right">
          <div className="ag-instruction">
            Use the <strong>right tool</strong> for each job. <strong>Tuples</strong> for immutable data, <strong>sets</strong> for uniqueness and O(1) lookup, <strong>string methods</strong> (strip, split, join) for text processing. Four data structures — four different strengths.
          </div>
          <div className="ag-py-editor">
            <div className="ag-py-editor-head">🐍 structures.py</div>
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
            <div className="ag-quiz-eyebrow">Knowledge Check — Gate P-11</div>
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
            <span className="ag-done-emoji">🗂️</span>
            <span className="ag-done-xp">+275 XP</span>
            <h2 className="ag-done-title">The Data Structures Forge</h2>
            <p className="ag-done-flavor">Four structures. Four purposes. The Construct stores data correctly now. Right tool for each job.</p>
            <div className="ag-done-rewards">
              <span className="ag-done-reward">Structure Fragment</span>
              <span className="ag-done-reward">Data Badge II</span>
            </div>
            <button className="ag-done-btn" onClick={() => goto('academy/dashboard')}>Builder HQ →</button>
          </div>
        </div>
      )}
    </div>
  )
}

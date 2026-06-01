import { useState } from 'react'
import './AcademyGate.css'
import { useNav } from '../context/NavigationContext'
import { useAcademy } from '../context/AcademyContext'

const GATE_ID = 'J-06'
const GATE_XP = 280

const STARTER = `// The Array Toolkit — Transforming Data Without Loops

// 1. filter() — keep only matching items
// const active = citizens.filter(c => c.active)

// 2. map() — transform every item
// const names = citizens.map(c => c.name)

// 3. reduce() — collapse array to a single value
// const totalXP = citizens.reduce((sum, c) => sum + c.xp, 0)

// 4. Chain filter + map together
// const activeNames = citizens
//     .filter(c => c.active)
//     .map(c => c.name)

// 5. Destructuring — extract values by name
// const { name, level } = citizens[0]

// 6. Spread — copy or merge arrays/objects
// const updated = [...citizens, newCitizen]

// 7. some() and every() — boolean checks
// const anyOnline = citizens.some(c => c.online)
// const allVerified = citizens.every(c => c.verified)
`

const CHECKS = [
  { id: 'c1', label: '.filter() used',                hint: 'Use array.filter(item => condition) to keep only items that match.',                             test: c => /\.filter\s*\(/.test(c) },
  { id: 'c2', label: '.map() used',                   hint: 'Use array.map(item => transformation) to create a new array of transformed values.',            test: c => /\.map\s*\(/.test(c) },
  { id: 'c3', label: '.reduce() used',                hint: 'Use array.reduce((acc, item) => acc + item.value, 0) to total up values.',                      test: c => /\.reduce\s*\(/.test(c) },
  { id: 'c4', label: 'filter + map chained',          hint: 'Chain them: array.filter(…).map(…) — filter narrows the list, map transforms what remains.',    test: c => /\.filter\s*\([^)]*\)\s*\n?\s*\.map\s*\(|\.filter\s*\([^)]*\)\.map\s*\(/.test(c) },
  { id: 'c5', label: 'Object destructuring used',     hint: 'const { name, level } = obj — extract named properties without repeating obj.name, obj.level.',test: c => /const\s*\{[^}]+\}\s*=/.test(c) },
  { id: 'c6', label: 'Spread operator used',          hint: 'Use [...array, newItem] to copy an array and add an item, or {...obj, key: val} for objects.', test: c => /\.\.\.\w+/.test(c) },
  { id: 'c7', label: '.some() and .every() used',     hint: 'some() returns true if any item passes; every() returns true only if all pass.',                test: c => /\.some\s*\(/.test(c) && /\.every\s*\(/.test(c) },
]

const QUIZ = {
  q: 'You need a list of names from citizens where level > 3. Which approach is most readable?',
  opts: [
    'Loop with forEach and push each matching name into a new array manually.',
    'citizens.filter(c => c.level > 3).map(c => c.name) — filter first, then transform.',
    'citizens.map(c => c.name).filter(c => c.level > 3) — transform first, then filter.',
    'citizens.reduce((acc, c) => c.level > 3 ? [...acc, c.name] : acc, [])',
  ],
  correct: 1,
}

function Scene({ passCount }) {
  return (
    <div className="ag-scene" style={{ '--ac': 'var(--amber)' }}>
      <span className="ag-scene-label">ARRAY TOOLKIT — GATE J-06</span>
      <div className="ag-py-terminal">
        <div className="ag-py-terminal-bar">
          <span className="ag-py-dot" style={{ background: 'var(--magenta)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--amber)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--lime)' }} />
          <span style={{ flex: 1, textAlign: 'center', fontSize: 9, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)' }}>arrays.js</span>
        </div>
        <div className="ag-py-output">
          {passCount === 0 && <div className="ag-py-line" style={{ opacity: 0.35 }}>&gt; running arrays.js…</div>}
          {passCount >= 1 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>filter active</span></div>}
          {passCount >= 2 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>map active</span></div>}
          {passCount >= 3 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>reduce active</span></div>}
          {passCount >= 4 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>chain active</span></div>}
          {passCount >= 5 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>destructuring active</span></div>}
          {passCount >= 6 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>spread active</span></div>}
          {passCount >= 7 && <div className="ag-py-line">&gt; <span style={{ color: 'var(--amber)' }}>FULL TOOLKIT LOADED!</span></div>}
        </div>
      </div>
    </div>
  )
}

export default function GateJ06() {
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
        <h1 className="ag-gate-name">The Array Toolkit</h1>
        <span className="ag-concept-tag">Array Methods</span>
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
            {running ? '⟳ Running checks…' : allPassed ? '▶ RUN TOOLKIT' : `○ ${7 - passCount} check${7 - passCount !== 1 ? 's' : ''} remaining`}
          </button>
        </div>

        <div className="ag-right">
          <div className="ag-instruction">
            Master the Construct's <strong>array methods</strong>. Use <strong>.filter()</strong> to narrow, <strong>.map()</strong> to transform, <strong>.reduce()</strong> to total. <strong>Chain</strong> filter and map together. Extract values with <strong>destructuring</strong>, copy arrays with <strong>spread</strong>, and test with <strong>.some()</strong> and <strong>.every()</strong>.
          </div>
          <div className="ag-py-editor">
            <div className="ag-py-editor-head">⚡ arrays.js</div>
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
            <div className="ag-quiz-eyebrow">Knowledge Check — Gate J-06</div>
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
            <span className="ag-done-emoji">🔧</span>
            <span className="ag-done-xp">+280 XP</span>
            <h2 className="ag-done-title">The Array Toolkit</h2>
            <p className="ag-done-flavor">The Toolkit armed. Data flows through filter, map, reduce. No loop noise. The Construct speaks in transformations now.</p>
            <div className="ag-done-rewards">
              <span className="ag-done-reward">Array Fragment</span>
              <span className="ag-done-reward">Data Badge I</span>
            </div>
            <button className="ag-done-btn" onClick={() => goto('academy/dashboard')}>Builder HQ →</button>
          </div>
        </div>
      )}
    </div>
  )
}

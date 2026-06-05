import { useState } from 'react'
import './AcademyGate.css'
import { useNav } from '../context/NavigationContext'
import { useAcademy } from '../context/AcademyContext'
import { stripComments } from '../lib/codeUtils'
import GateAIHint from '../components/GateAIHint'

const GATE_ID = 'J-21'
const GATE_XP = 385

const STARTER = `// The React Introduction — Components and State

// 1. Function component that returns JSX
// function CitizenCard({ name, level }) {
//   return (
//     <div className="card">
//       <h2>{name}</h2>
//       <p>Level {level}</p>
//     </div>
//   )
// }

// 2. Destructured props
// function Badge({ label, color = "teal" }) {
//   return <span style={{ color }}>{label}</span>
// }

// 3. useState — reactive state
// const [count, setCount] = useState(0)
// <button onClick={() => setCount(count + 1)}>
//   Clicked {count} times
// </button>

// 4. Rendering a list with .map() and key=
// const citizens = ["LUCY", "ALEX", "SAM"]
// citizens.map(name => <li key={name}>{name}</li>)

// 5. useEffect — side effects
// useEffect(() => {
//   document.title = "Citizens: " + count
// }, [count])

// 6. Conditional rendering
// {isLoggedIn && <Dashboard />}
// {error ? <Error msg={error} /> : <Content />}

// 7. Fragment — group without extra DOM node
// return (
//   <>
//     <Header />
//     <Main />
//   </>
// )
`

const CHECKS = [
  { id: 'c1', label: 'Function component with return', hint: 'Define function ComponentName() { return (<jsx />) } — capital letter name required.',    test: c => /function\s+[A-Z]\w*\s*\(/.test(c) && /\breturn\s*\(/.test(c) },
  { id: 'c2', label: 'Destructured props',             hint: 'Destructure props in the parameter: function Card({ name, level }) {...}',                test: c => /function\s+[A-Z]\w*\s*\(\s*\{/.test(c) },
  { id: 'c3', label: 'useState() called',              hint: 'Call useState(initialValue) — it returns [value, setter].',                               test: c => /\buseState\s*\(/.test(c) },
  { id: 'c4', label: '.map() with key= prop',          hint: 'Render a list with .map(item => <Element key={item.id}>{item}</Element>)',               test: c => /\.map\s*\(/.test(c) && /\bkey\s*=/.test(c) },
  { id: 'c5', label: 'useEffect() used',               hint: 'Call useEffect(() => { /* side effect */ }, [dependencies])',                            test: c => /\buseEffect\s*\(/.test(c) },
  { id: 'c6', label: 'Conditional rendering',          hint: 'Use && for short-circuit or ternary for if/else: {condition && <Component />}',          test: c => /&&\s*</.test(c) || /\?\s*</.test(c) },
  { id: 'c7', label: 'Fragment <> used',               hint: 'Wrap multiple elements in <> ... </> instead of an extra div.',                          test: c => /<>/.test(c) && /<\/?>/.test(c) },
]

const QUIZ = {
  q: 'React uses a virtual DOM instead of letting you update the real DOM directly. What is the core benefit of this approach?',
  opts: [
    'The virtual DOM is stored in the GPU, making rendering faster than regular JavaScript.',
    'You describe what the UI should look like and React figures out the minimal DOM updates needed — you don\'t have to track which elements changed.',
    'Virtual DOM elements use less memory than real DOM nodes.',
    'React can reuse virtual DOM nodes across different pages, reducing load times.',
  ],
  correct: 1,
}

function Scene({ passCount }) {
  return (
    <div className="ag-scene" style={{ '--ac': 'var(--teal)' }}>
      <span className="ag-scene-label">REACT INTRODUCTION — GATE J-21</span>
      <div className="ag-py-terminal">
        <div className="ag-py-terminal-bar">
          <span className="ag-py-dot" style={{ background: 'var(--magenta)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--amber)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--lime)' }} />
          <span style={{ flex: 1, textAlign: 'center', fontSize: 9, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)' }}>App.jsx</span>
        </div>
        <div className="ag-py-output">
          {passCount === 0 && <div className="ag-py-line" style={{ opacity: 0.35 }}>&gt; running App.jsx…</div>}
          {passCount >= 1 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>component defined</span></div>}
          {passCount >= 2 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>props destructured</span></div>}
          {passCount >= 3 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>state wired</span></div>}
          {passCount >= 4 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>list rendered</span></div>}
          {passCount >= 5 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>effect registered</span></div>}
          {passCount >= 6 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>conditionals active</span></div>}
          {passCount >= 7 && <div className="ag-py-line">&gt; <span style={{ color: 'var(--teal)' }}>REACT INITIALIZED — THE CONSTRUCT RENDERS!</span></div>}
        </div>
      </div>
    </div>
  )
}

export default function GateJ21() {
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
        <span className="ag-rank-badge" style={{ '--ac': 'var(--teal)' }}>RANK B</span>
        <h1 className="ag-gate-name">The React Introduction</h1>
        <span className="ag-concept-tag">React Fundamentals</span>
        <span className="ag-xp-tag" style={{ color: 'var(--teal)' }}>+385 XP</span>
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
            {running ? '⟳ Running checks…' : allPassed ? '▶ INITIALIZE REACT' : `○ ${7 - passCount} check${7 - passCount !== 1 ? 's' : ''} remaining`}
          </button>
          <GateAIHint code={code} checks={checks} gateId={GATE_ID} lang="javascript" done={done} />
        </div>

        <div className="ag-right">
          <div className="ag-instruction">
            Build the Construct's first React interface. Write a <strong>function component</strong>. <strong>Destructure props</strong> in the parameter. Add <strong>useState</strong> for reactive data. Render a <strong>list with .map() and key=</strong>. Register a <strong>useEffect</strong>. Add <strong>conditional rendering</strong>. Wrap siblings in a <strong>Fragment</strong>.
          </div>
          <div className="ag-py-editor">
            <div className="ag-py-editor-head">⚡ App.jsx</div>
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
            <div className="ag-quiz-eyebrow">Knowledge Check — Gate J-21</div>
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
            <span className="ag-done-emoji">⚛️</span>
            <span className="ag-done-xp">+385 XP</span>
            <h2 className="ag-done-title">The React Introduction</h2>
            <p className="ag-done-flavor">Components defined. State wired. Lists rendered. Effects registered. The Construct renders. React is not a library — it's a way of thinking about UI.</p>
            <div className="ag-done-rewards">
              <span className="ag-done-reward">React Fragment</span>
              <span className="ag-done-reward">Component Badge I</span>
            </div>
            <button className="ag-done-btn" onClick={() => goto('academy/dashboard')}>Builder HQ →</button>
          </div>
        </div>
      )}
    </div>
  )
}

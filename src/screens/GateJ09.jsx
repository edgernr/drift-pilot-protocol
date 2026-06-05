import { useState } from 'react'
import './AcademyGate.css'
import { useNav } from '../context/NavigationContext'
import { useAcademy } from '../context/AcademyContext'
import { stripComments } from '../lib/codeUtils'
import GateAIHint from '../components/GateAIHint'

const GATE_ID = 'J-09'
const GATE_XP = 350

const STARTER = `// The React Awakening — Building with Components

// 1. Function component — name must start with a capital letter
// function CitizenCard({ name, level }) {
//     return (
//         <div className="card">
//             <h2>{name}</h2>
//             <span>Level {level}</span>
//         </div>
//     )
// }

// 2. Use className instead of class (class is a reserved word in JS)
// function StatusBadge({ status }) {
//     return <span className="badge">{status}</span>
// }

// 3. Render a list — every item needs a unique key prop
// function CitizenList({ citizens }) {
//     return (
//         <ul>
//             {citizens.map(c => (
//                 <li key={c.id}>{c.name}</li>
//             ))}
//         </ul>
//     )
// }

// 4. Compose — use your components inside other components
// function App() {
//     return (
//         <div>
//             <CitizenCard name="EVA" level={5} />
//             <StatusBadge status="online" />
//         </div>
//     )
// }

// 5. Conditional rendering — ternary inside JSX
// function Indicator({ online }) {
//     return <span>{online ? "Online" : "Offline"}</span>
// }
`

const CHECKS = [
  { id: 'c1', label: 'Function component defined',       hint: 'Create a function with a capital letter name: function CitizenCard({ name }) { return <div>{name}</div> }',             test: c => /function\s+[A-Z]\w*\s*\(/.test(c) },
  { id: 'c2', label: 'className used in JSX',            hint: 'Use className="card" not class="card" — class is a reserved word in JavaScript.',                                      test: c => /className\s*=/.test(c) },
  { id: 'c3', label: 'Props destructured in signature',  hint: 'function Card({ name, level }) — destructure props directly in the parameter list, no need to write props.name.',      test: c => /function\s+\w+\s*\(\s*\{[^}]+\}/.test(c) },
  { id: 'c4', label: 'List rendered with key prop',      hint: 'Add key={c.id} to each item inside .map() — React needs it to track which items changed.',                             test: c => /\.map\s*\(/.test(c) && /\bkey\s*=/.test(c) },
  { id: 'c5', label: 'Custom component used in JSX',     hint: '<CitizenCard name="EVA" level={5} /> — capital letter tells React it\'s your component, not an HTML tag.',            test: c => /<[A-Z]\w+[\s/>]/.test(c) },
]

const QUIZ = {
  q: 'React requires every item in a rendered list to have a unique key prop. What does React actually use the key for?',
  opts: [
    'Keys style the element — they\'re shorthand for a CSS id selector and affect how the item looks.',
    'React uses keys to identify which items changed, were added, or removed — it enables efficient updates without re-rendering the whole list.',
    'Keys encrypt the list data before storing it in the virtual DOM for security reasons.',
    'Keys set the tab order for keyboard navigation — screen readers announce items by their key value.',
  ],
  correct: 1,
}

function Scene({ passCount }) {
  return (
    <div className="ag-scene" style={{ '--ac': 'var(--teal)' }}>
      <span className="ag-scene-label">REACT AWAKENING — GATE J-09</span>
      <div className="ag-py-terminal">
        <div className="ag-py-terminal-bar">
          <span className="ag-py-dot" style={{ background: 'var(--magenta)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--amber)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--lime)' }} />
          <span style={{ flex: 1, textAlign: 'center', fontSize: 9, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)' }}>components.jsx</span>
        </div>
        <div className="ag-py-output">
          {passCount === 0 && <div className="ag-py-line" style={{ opacity: 0.35 }}>&gt; running components.jsx…</div>}
          {passCount >= 1 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>component defined</span></div>}
          {passCount >= 2 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>className valid</span></div>}
          {passCount >= 3 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>props destructured</span></div>}
          {passCount >= 4 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>list keys present</span></div>}
          {passCount >= 5 && <div className="ag-py-line">&gt; <span style={{ color: 'var(--teal)' }}>REACT AWAKENED — COMPONENTS LIVE!</span></div>}
        </div>
      </div>
    </div>
  )
}

export default function GateJ09() {
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
        <h1 className="ag-gate-name">The React Awakening</h1>
        <span className="ag-concept-tag">React Components</span>
        <span className="ag-xp-tag" style={{ color: 'var(--teal)' }}>+350 XP</span>
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
            {running ? '⟳ Running checks…' : allPassed ? '▶ AWAKEN REACT' : `○ ${5 - passCount} check${5 - passCount !== 1 ? 's' : ''} remaining`}
          </button>
          <GateAIHint code={code} checks={checks} gateId={GATE_ID} lang="javascript" done={done} />
        </div>

        <div className="ag-right">
          <div className="ag-instruction">
            Enter the <strong>React layer</strong>. Write a <strong>function component</strong> with a capital name. Use <strong>className</strong> not class. <strong>Destructure props</strong> in the signature. Render a list using <strong>.map() with a key prop</strong>. Compose by using your <strong>component inside JSX</strong>.
          </div>
          <div className="ag-py-editor">
            <div className="ag-py-editor-head">⚡ components.jsx</div>
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
            <div className="ag-quiz-eyebrow">Knowledge Check — Gate J-09</div>
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
            <span className="ag-done-xp">+350 XP</span>
            <h2 className="ag-done-title">The React Awakening</h2>
            <p className="ag-done-flavor">React awakens. Components compose. Props flow. The Construct now speaks the language of modern interfaces.</p>
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

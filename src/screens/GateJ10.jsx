import { useState } from 'react'
import './AcademyGate.css'
import { useNav } from '../context/NavigationContext'
import { useAcademy } from '../context/AcademyContext'
import { stripComments } from '../lib/codeUtils'
import GateAIHint from '../components/GateAIHint'

const GATE_ID = 'J-10'
const GATE_XP = 500

const STARTER = `// The Hook Circuit — React State and Side Effects

// 1. useState — track a value that can change
// const [count, setCount] = useState(0)

// 2. Update state on interaction
// function Counter() {
//     const [count, setCount] = useState(0)
//     return (
//         <button onClick={() => setCount(count + 1)}>
//             Clicked {count} times
//         </button>
//     )
// }

// 3. useEffect — run code when something changes
// useEffect(() => {
//     document.title = "Count: " + count
// }, [count])

// 4. Fetch data once on mount — empty dependency array
// useEffect(() => {
//     fetch("/api/citizens")
//         .then(r => r.json())
//         .then(data => setCitizens(data))
// }, [])

// 5. Lift state — shared state lives in the parent
// function App() {
//     const [selected, setSelected] = useState(null)
//     return (
//         <>
//             <SectorList onSelect={setSelected} />
//             <DetailPanel selected={selected} />
//         </>
//     )
// }
`

const CHECKS = [
  { id: 'c1', label: 'useState used',                    hint: 'Call useState() to create a state variable: const [count, setCount] = useState(0)',                                test: c => /\buseState\b/.test(c) },
  { id: 'c2', label: 'State array destructuring',        hint: 'const [value, setValue] = useState(initial) — the first item is state, the second is the setter function.',        test: c => /const\s*\[\w+,\s*set\w+\]\s*=\s*useState/.test(c) },
  { id: 'c3', label: 'Setter called to update state',    hint: 'Call setCount(count + 1) to update state — never do count++ directly. React re-renders on setter calls.',          test: c => /set[A-Z]\w*\s*\(/.test(c) },
  { id: 'c4', label: 'useEffect with dependency array',  hint: 'useEffect(() => { ... }, [dep]) — the array controls when the effect re-runs. [] means run once on mount.',        test: c => /\buseEffect\b/.test(c) && /,\s*\[/.test(c) },
  { id: 'c5', label: 'State lifted to parent',           hint: 'Pass the setter as a prop: <Child onSelect={setSelected} /> — then the child calls onSelect() to update parent state.', test: c => /\w+\s*=\s*\{\s*set[A-Z]\w*\s*\}/.test(c) },
]

const QUIZ = {
  q: 'Two sibling components both need to know which sector is selected. Where should that state live?',
  opts: [
    'In the first sibling — pass it as a global variable the second sibling reads directly.',
    'In the closest common parent — lift state up and pass it down as props to both siblings, so there is one source of truth.',
    'In each sibling separately with their own useState — keep them independent and in sync via localStorage.',
    'In the browser URL — both siblings can read window.location and it persists on refresh.',
  ],
  correct: 1,
}

function Scene({ passCount }) {
  const bossHp = Math.max(0, 1 - passCount / 5)
  const hpColor = bossHp > 0.6 ? 'var(--magenta)' : bossHp > 0.3 ? 'var(--amber)' : 'var(--lime)'

  return (
    <div className="ag-scene" style={{ '--ac': 'var(--magenta)' }}>
      <span className="ag-scene-label">HOOK CIRCUIT — GATE J-10</span>
      <div style={{ padding: '8px 0 2px', fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: 1 }}>
        BOSS — THE CIRCUIT BREAKER
      </div>
      <div style={{ background: 'var(--surface-1)', borderRadius: 3, overflow: 'hidden', height: 10, margin: '2px 0 10px' }}>
        <div style={{ height: '100%', width: `${bossHp * 100}%`, background: hpColor, transition: 'width 0.4s ease, background 0.4s ease' }} />
      </div>
      <div className="ag-py-terminal">
        <div className="ag-py-terminal-bar">
          <span className="ag-py-dot" style={{ background: 'var(--magenta)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--amber)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--lime)' }} />
          <span style={{ flex: 1, textAlign: 'center', fontSize: 9, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)' }}>hooks.jsx</span>
        </div>
        <div className="ag-py-output">
          {passCount === 0 && <div className="ag-py-line" style={{ opacity: 0.35 }}>&gt; running hooks.jsx…</div>}
          {passCount >= 1 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>useState detected</span></div>}
          {passCount >= 2 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>state pattern valid</span></div>}
          {passCount >= 3 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>setter wired</span></div>}
          {passCount >= 4 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>useEffect hooked</span></div>}
          {passCount >= 5 && <div className="ag-py-line">&gt; <span style={{ color: 'var(--magenta)' }}>CIRCUIT BREAKER DEFEATED!</span></div>}
        </div>
      </div>
    </div>
  )
}

export default function GateJ10() {
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
        <h1 className="ag-gate-name">The Hook Circuit</h1>
        <span className="ag-concept-tag">React Hooks</span>
        <span className="ag-xp-tag" style={{ color: 'var(--magenta)' }}>+500 XP</span>
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
            {running ? '⟳ Running checks…' : allPassed ? '⚔ BREAK THE CIRCUIT' : `○ ${5 - passCount} check${5 - passCount !== 1 ? 's' : ''} remaining`}
          </button>
          <GateAIHint code={code} checks={checks} gateId={GATE_ID} lang="javascript" done={done} />
        </div>

        <div className="ag-right">
          <div className="ag-instruction">
            Defeat the <strong>Circuit Breaker</strong>. Master React's hook system: <strong>useState</strong> for reactive values, the <strong>[value, setter]</strong> destructuring pattern, <strong>setX()</strong> to trigger re-renders, <strong>useEffect</strong> with a dependency array, and <strong>lifted state</strong> passed as a prop from parent to child.
          </div>
          <div className="ag-py-editor">
            <div className="ag-py-editor-head">⚡ hooks.jsx</div>
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
            <div className="ag-quiz-eyebrow">Knowledge Check — Gate J-10</div>
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
            <span className="ag-done-emoji">🪝</span>
            <span className="ag-done-xp">+500 XP</span>
            <h2 className="ag-done-title">The Hook Circuit</h2>
            <p className="ag-done-flavor">The Circuit Breaker falls. State flows. Effects fire. The Construct is reactive now — it responds, remembers, and syncs.</p>
            <div className="ag-done-rewards">
              <span className="ag-done-reward">Hook Core</span>
              <span className="ag-done-reward">React Badge II</span>
            </div>
            <button className="ag-done-btn" onClick={() => goto('academy/dashboard')}>Builder HQ →</button>
          </div>
        </div>
      )}
    </div>
  )
}

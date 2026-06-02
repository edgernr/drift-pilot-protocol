import { useState } from 'react'
import './AcademyGate.css'
import { useNav } from '../context/NavigationContext'
import { useAcademy } from '../context/AcademyContext'

const GATE_ID = 'J-04'
const GATE_XP = 300

const STARTER = `// The State Machine — State as Single Source of Truth

// 1. State object — all data lives here, not in the DOM
const state = {
    citizens: [],
    filter: "",
    history: []
}

// 2. render() reads from state and updates the DOM
// function render() {
//     const list = document.getElementById("citizen-list")
//     const visible = state.citizens.filter(c =>
//         c.name.toLowerCase().includes(state.filter)
//     )
//     list.innerHTML = visible.map(c => \`<li>\${c.name}</li>\`).join("")
// }

// 3. Always update state THEN call render()
// function addCitizen(name) {
//     state.citizens.push({ name, level: 1 })
//     render()
// }

// 4. Persist state to localStorage
// function saveState() {
//     localStorage.setItem("citizens", JSON.stringify(state.citizens))
// }
// function loadState() {
//     const saved = localStorage.getItem("citizens")
//     if (saved) state.citizens = JSON.parse(saved)
// }

// 5. Undo: save state history, pop to go back
// function updateCitizens(newList) {
//     state.history.push([...state.citizens])
//     state.citizens = newList
//     render()
// }
// function undo() {
//     if (state.history.length > 0) {
//         state.citizens = state.history.pop()
//         render()
//     }
// }
`

const CHECKS = [
  { id: 'c1', label: 'State object is source of truth', hint: 'Data is being read from the DOM instead of from the state object. All reads should come from state, not from element.textContent.', test: c => /\bconst\s+state\s*=\s*\{|\blet\s+state\s*=\s*\{/.test(c) },
  { id: 'c2', label: 'render() function present',       hint: 'DOM updates are scattered throughout the code. Create one render() function that reads state and updates all DOM elements.',         test: c => /\bfunction\s+render\s*\(/.test(c) },
  { id: 'c3', label: 'State updated before render',     hint: 'The DOM is updated directly without changing state first. Always: update state → call render().',                                    test: c => /state\.\w+/.test(c) && /render\s*\(\s*\)/.test(c) },
  { id: 'c4', label: 'localStorage persists state',     hint: 'State resets on page refresh. Save to localStorage on every state change, load on page start.',                                     test: c => /localStorage\.setItem\s*\(/.test(c) && /localStorage\.getItem\s*\(/.test(c) },
  { id: 'c5', label: 'Undo reverses last change',       hint: 'Undo doesn\'t work or goes back too far. Keep a history array and pop the last state to undo.',                                     test: c => /\.push\s*\(/.test(c) && /\.pop\s*\(/.test(c) },
]

const QUIZ = {
  q: 'You read the current count from your state object instead of from the DOM. Why is reading from the DOM unreliable as a data source?',
  opts: [
    'DOM reads are slower than object reads — performance degrades with complex UIs.',
    'The DOM is a display layer — it can be changed by CSS, user interaction, or other scripts. State that lives in the DOM can become inconsistent with what the program thinks is true.',
    'DOM elements can only store string values — numbers stored in the DOM lose their type.',
    'Reading from the DOM requires async operations which complicate the code unnecessarily.',
  ],
  correct: 1,
}

function Scene({ passCount }) {
  return (
    <div className="ag-scene" style={{ '--ac': 'var(--violet)' }}>
      <span className="ag-scene-label">STATE MACHINE — GATE J-04</span>
      <div className="ag-py-terminal">
        <div className="ag-py-terminal-bar">
          <span className="ag-py-dot" style={{ background: 'var(--magenta)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--amber)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--lime)' }} />
          <span style={{ flex: 1, textAlign: 'center', fontSize: 9, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)' }}>state.js</span>
        </div>
        <div className="ag-py-output">
          {passCount === 0 && <div className="ag-py-line" style={{ opacity: 0.35 }}>&gt; running state.js…</div>}
          {passCount >= 1 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>state object defined</span></div>}
          {passCount >= 2 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>render() function ready</span></div>}
          {passCount >= 3 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>state → render() wired</span></div>}
          {passCount >= 4 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>localStorage persistence</span></div>}
          {passCount >= 5 && <div className="ag-py-line">&gt; <span style={{ color: 'var(--violet)' }}>STATE MACHINE ONLINE!</span></div>}
        </div>
      </div>
    </div>
  )
}

export default function GateJ04() {
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
        <span className="ag-rank-badge" style={{ '--ac': 'var(--violet)' }}>RANK D</span>
        <h1 className="ag-gate-name">The State Machine</h1>
        <span className="ag-concept-tag">State Management</span>
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
            {running ? '⟳ Running checks…' : allPassed ? '▶ RUN STATE MACHINE' : `○ ${5 - passCount} check${5 - passCount !== 1 ? 's' : ''} remaining`}
          </button>
        </div>

        <div className="ag-right">
          <div className="ag-instruction">
            Build the Construct's <strong>state management</strong> system. All data lives in a <strong>state object</strong> — never in the DOM. A single <strong>render()</strong> function syncs DOM from state. Every change goes through state first. <strong>localStorage</strong> for persistence. <strong>History array</strong> for undo.
          </div>
          <div className="ag-py-editor">
            <div className="ag-py-editor-head">⚡ state.js</div>
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
            <div className="ag-quiz-eyebrow">Knowledge Check — Gate J-04</div>
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
            <span className="ag-done-emoji">🎮</span>
            <span className="ag-done-xp">+300 XP</span>
            <h2 className="ag-done-title">The State Machine</h2>
            <p className="ag-done-flavor">The State Machine governs. One truth. All displays reflect it. State management is how real applications think.</p>
            <div className="ag-done-rewards">
              <span className="ag-done-reward">State Fragment</span>
              <span className="ag-done-reward">State Badge I</span>
            </div>
            <button className="ag-done-btn" onClick={() => goto('academy/dashboard')}>Builder HQ →</button>
          </div>
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import './AcademyGate.css'
import { useNav } from '../context/NavigationContext'
import { useAcademy } from '../context/AcademyContext'

const GATE_ID = 'J-02'
const GATE_XP = 250

const STARTER = `// The Event System — Making the Construct Interactive

// 1. Click handler: button increments a counter
// document.getElementById("add-btn").addEventListener("click", () => {
//     const counter = document.getElementById("counter")
//     counter.textContent = Number(counter.textContent) + 1
// })

// 2. Input event: updates display in real time as you type
// document.getElementById("search").addEventListener("input", (e) => {
//     document.getElementById("search-display").textContent = e.target.value
// })

// 3. Form submit: prevent default page reload
// document.getElementById("citizen-form").addEventListener("submit", (e) => {
//     e.preventDefault()
//     console.log("Form submitted — page did not reload")
// })

// 4. Keyboard shortcut: Escape key closes the modal
// document.addEventListener("keydown", (e) => {
//     if (e.key === "Escape") {
//         document.getElementById("modal").style.display = "none"
//     }
// })

// 5. Event delegation: listen on parent for dynamically added cards
// document.getElementById("sector-list").addEventListener("click", (e) => {
//     if (e.target.matches(".sector-card")) {
//         console.log("Sector:", e.target.dataset.name)
//     }
// })
`

const CHECKS = [
  { id: 'c1', label: 'Click handler attached',        hint: 'Use .addEventListener("click", handler) on the button element.',                                                         test: c => /addEventListener\s*\(\s*["']click["']/.test(c) },
  { id: 'c2', label: 'Input event updates display',   hint: 'Use "input" event (not "change") for real-time updates. Read e.target.value inside the handler.',                        test: c => /addEventListener\s*\(\s*["']input["']/.test(c) && /\.target\.value/.test(c) },
  { id: 'c3', label: 'Form submission prevented',     hint: 'Call e.preventDefault() at the start of the submit handler to stop the page reload.',                                   test: c => /\.preventDefault\s*\(\s*\)/.test(c) },
  { id: 'c4', label: 'Keyboard shortcut works',       hint: 'Listen on document for "keydown" and check e.key inside the handler.',                                                  test: c => /addEventListener\s*\(\s*["']keydown["']/.test(c) },
  { id: 'c5', label: 'Event delegation on parent',    hint: 'Add the listener to the parent and check e.target.matches(".class") to identify which child was clicked.', test: c => /e\.target\.(matches|closest)\s*\(/.test(c) },
]

const QUIZ = {
  q: 'Event delegation means listening on a parent element for events on its children. Why is this better than adding a listener to each child?',
  opts: [
    'Parent listeners are faster because they\'re closer to the top of the DOM tree.',
    'Children added after the listener is set up are automatically covered — you don\'t need to add new listeners for new elements.',
    'Parent listeners use less battery on mobile devices because fewer event handlers run.',
    'It\'s required for click events — individual children can\'t have their own click listeners.',
  ],
  correct: 1,
}

function Scene({ passCount }) {
  return (
    <div className="ag-scene" style={{ '--ac': 'var(--amber)' }}>
      <span className="ag-scene-label">EVENT SYSTEM — GATE J-02</span>
      <div className="ag-py-terminal">
        <div className="ag-py-terminal-bar">
          <span className="ag-py-dot" style={{ background: 'var(--magenta)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--amber)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--lime)' }} />
          <span style={{ flex: 1, textAlign: 'center', fontSize: 9, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)' }}>events.js</span>
        </div>
        <div className="ag-py-output">
          {passCount === 0 && <div className="ag-py-line" style={{ opacity: 0.35 }}>&gt; running events.js…</div>}
          {passCount >= 1 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>click event wired</span></div>}
          {passCount >= 2 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>input event listening</span></div>}
          {passCount >= 3 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>form default prevented</span></div>}
          {passCount >= 4 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>keydown shortcut active</span></div>}
          {passCount >= 5 && <div className="ag-py-line">&gt; <span style={{ color: 'var(--amber)' }}>ALL EVENTS WIRED!</span></div>}
        </div>
      </div>
    </div>
  )
}

export default function GateJ02() {
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
        <span className="ag-rank-badge" style={{ '--ac': 'var(--amber)' }}>RANK E</span>
        <h1 className="ag-gate-name">The Event System</h1>
        <span className="ag-concept-tag">Events</span>
        <span className="ag-xp-tag" style={{ color: 'var(--amber)' }}>+250 XP</span>
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
            {running ? '⟳ Running checks…' : allPassed ? '▶ FIRE ALL EVENTS' : `○ ${5 - passCount} check${5 - passCount !== 1 ? 's' : ''} remaining`}
          </button>
        </div>

        <div className="ag-right">
          <div className="ag-instruction">
            Wire the Construct's <strong>event system</strong>. Attach a <strong>click</strong> handler, listen to <strong>input</strong> events for real-time updates, use <strong>preventDefault</strong> on form submit, catch <strong>keydown</strong> shortcuts, and use <strong>event delegation</strong> on a parent element. Every interaction heard.
          </div>
          <div className="ag-py-editor">
            <div className="ag-py-editor-head">⚡ events.js</div>
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
            <div className="ag-quiz-eyebrow">Knowledge Check — Gate J-02</div>
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
            <span className="ag-done-emoji">📡</span>
            <span className="ag-done-xp">+250 XP</span>
            <h2 className="ag-done-title">The Event System</h2>
            <p className="ag-done-flavor">The Event System active. Every click heard. Every key caught. The Construct responds to everything now.</p>
            <div className="ag-done-rewards">
              <span className="ag-done-reward">Event Fragment</span>
              <span className="ag-done-reward">Event Badge II</span>
            </div>
            <button className="ag-done-btn" onClick={() => goto('academy/dashboard')}>Builder HQ →</button>
          </div>
        </div>
      )}
    </div>
  )
}

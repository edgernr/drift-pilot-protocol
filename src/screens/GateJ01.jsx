import { useState } from 'react'
import './AcademyGate.css'
import { useNav } from '../context/NavigationContext'
import { useAcademy } from '../context/AcademyContext'

const GATE_ID = 'J-01'
const GATE_XP = 250

const STARTER = `// The DOM Awakens — Making the Construct Live
// HTML context this code runs against:
// <h1 id="city-title">EVA Construct</h1>
// <span class="status-light">offline</span>
// <div id="sectors"></div>
// <ul id="citizen-list"></ul>

// 1. Select an element by ID or query selector
// const title = document.getElementById("city-title")
// const status = document.querySelector(".status-light")

// 2. Update text content
// title.textContent = "EVA Construct — Online"

// 3. Change style through JavaScript
// status.style.color = "lime"
// status.style.fontWeight = "bold"

// 4. Create a new element and add it to the page
// const newSector = document.createElement("div")
// newSector.textContent = "Sector Delta — Active"
// document.getElementById("sectors").appendChild(newSector)

// 5. Render an array as list items
// const citizens = ["Lucy", "Alex", "Sam", "Viktor"]
// const list = document.getElementById("citizen-list")
// citizens.forEach(name => {
//     const li = document.createElement("li")
//     li.textContent = name
//     list.appendChild(li)
// })
`

const CHECKS = [
  { id: 'c1', label: 'Element selected from DOM',       hint: 'Use document.getElementById("id") or document.querySelector(".class") to select.',         test: c => /getElementById|querySelector/.test(c) },
  { id: 'c2', label: 'textContent updated',             hint: 'Set element.textContent = "new text" — not innerHTML for plain text.',                      test: c => /\.textContent\s*=/.test(c) },
  { id: 'c3', label: 'Style changed through JS',        hint: 'Use element.style.propertyName = "value" — camelCase: backgroundColor not background-color.',test: c => /\.style\.\w+\s*=/.test(c) },
  { id: 'c4', label: 'New element created and appended',hint: 'createElement() creates it, appendChild() adds it to the page.',                            test: c => /createElement\s*\(/.test(c) && /appendChild\s*\(/.test(c) },
  { id: 'c5', label: 'Array rendered as list items',    hint: 'Use forEach to loop through the array, createElement for each item, appendChild to add it.', test: c => /\.forEach\s*\(/.test(c) && /createElement\s*\(/.test(c) },
]

const QUIZ = {
  q: 'You changed the DOM with JavaScript but the HTML file didn\'t change. Where do the JavaScript changes exist?',
  opts: [
    'They\'re saved to the HTML file automatically — the browser updates the file when JS runs.',
    'They exist only in the browser\'s memory as the current DOM state — refreshing the page resets everything back to the HTML.',
    'They\'re cached by the browser and persist until the cache is cleared.',
    'They\'re sent to the server and stored there until the page is next loaded.',
  ],
  correct: 1,
}

function Scene({ passCount }) {
  return (
    <div className="ag-scene" style={{ '--ac': 'var(--lime)' }}>
      <span className="ag-scene-label">DOM AWAKENS — GATE J-01</span>
      <div className="ag-py-terminal">
        <div className="ag-py-terminal-bar">
          <span className="ag-py-dot" style={{ background: 'var(--magenta)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--amber)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--lime)' }} />
          <span style={{ flex: 1, textAlign: 'center', fontSize: 9, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)' }}>dom.js</span>
        </div>
        <div className="ag-py-output">
          {passCount === 0 && <div className="ag-py-line" style={{ opacity: 0.35 }}>&gt; running dom.js…</div>}
          {passCount >= 1 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>element selected</span></div>}
          {passCount >= 2 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>textContent updated</span></div>}
          {passCount >= 3 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>style changed</span></div>}
          {passCount >= 4 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>element created and added</span></div>}
          {passCount >= 5 && <div className="ag-py-line">&gt; <span style={{ color: 'var(--lime)' }}>DOM ALIVE — ALL CHECKS PASSED!</span></div>}
        </div>
      </div>
    </div>
  )
}

export default function GateJ01() {
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
        <span className="ag-rank-badge" style={{ '--ac': 'var(--lime)' }}>RANK E</span>
        <h1 className="ag-gate-name">The DOM Awakens</h1>
        <span className="ag-concept-tag">DOM Basics</span>
        <span className="ag-xp-tag" style={{ color: 'var(--lime)' }}>+250 XP</span>
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
            {running ? '⟳ Running checks…' : allPassed ? '▶ AWAKEN THE DOM' : `○ ${5 - passCount} check${5 - passCount !== 1 ? 's' : ''} remaining`}
          </button>
        </div>

        <div className="ag-right">
          <div className="ag-instruction">
            Bring the Construct's interface to life with <strong>JavaScript DOM manipulation</strong>. Select elements, update <strong>textContent</strong>, change <strong>styles</strong>, create new elements with <strong>createElement + appendChild</strong>, and render an array as a list. Static HTML becomes dynamic.
          </div>
          <div className="ag-py-editor">
            <div className="ag-py-editor-head">⚡ dom.js</div>
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
            <div className="ag-quiz-eyebrow">Knowledge Check — Gate J-01</div>
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
            <span className="ag-done-emoji">🌐</span>
            <span className="ag-done-xp">+250 XP</span>
            <h2 className="ag-done-title">The DOM Awakens</h2>
            <p className="ag-done-flavor">The DOM awakens. The Construct's browser layer responds to code. Static becomes dynamic. Everything changes from here.</p>
            <div className="ag-done-rewards">
              <span className="ag-done-reward">DOM Fragment</span>
              <span className="ag-done-reward">Browser Badge I</span>
            </div>
            <button className="ag-done-btn" onClick={() => goto('academy/dashboard')}>Builder HQ →</button>
          </div>
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import './AcademyGate.css'
import { useNav } from '../context/NavigationContext'
import { useAcademy } from '../context/AcademyContext'

const GATE_ID = 'J-07'
const GATE_XP = 380

const STARTER = `// The Complete Interface — Full App in Vanilla JS

// 1. Fetch data and render it
// async function loadCitizens() {
//     const res = await fetch("/api/citizens")
//     const data = await res.json()
//     renderList(data)
// }

// 2. Form submit — add new citizen
// document.getElementById("add-form").addEventListener("submit", (e) => {
//     e.preventDefault()
//     const name = document.getElementById("name-input").value
//     citizens.push({ name, active: true })
//     render()
// })

// 3. Input event — live filter
// document.getElementById("search").addEventListener("input", (e) => {
//     state.filter = e.target.value
//     render()
// })

// 4. Delete — filter out the item
// function deleteCitizen(name) {
//     state.citizens = state.citizens.filter(c => c.name !== name)
//     render()
// }

// 5. Persist to localStorage
// function saveData() {
//     localStorage.setItem("citizens", JSON.stringify(state.citizens))
// }

// 6. Error handling with DOM feedback
// async function safeFetch(url) {
//     try {
//         const res = await fetch(url)
//         if (!res.ok) throw new Error(\`HTTP \${res.status}\`)
//         return res.json()
//     } catch (err) {
//         document.getElementById("error-msg").textContent = err.message
//     }
// }
`

const CHECKS = [
  { id: 'c1', label: 'async fetch used',              hint: 'async function load() { const res = await fetch(url); const data = await res.json() }',              test: c => /\basync\b/.test(c) && /await\s+fetch\s*\(/.test(c) },
  { id: 'c2', label: 'Form submit with preventDefault',hint: 'addEventListener("submit", (e) => { e.preventDefault(); ... }) — stops the page reload.',           test: c => /addEventListener\s*\(\s*["']submit["']/.test(c) && /\.preventDefault\s*\(\s*\)/.test(c) },
  { id: 'c3', label: 'Input drives live filter',       hint: 'addEventListener("input", (e) => { state.filter = e.target.value; render() })',                     test: c => /addEventListener\s*\(\s*["']input["']/.test(c) && /\.target\.value/.test(c) },
  { id: 'c4', label: 'Delete uses .filter()',          hint: 'state.citizens = state.citizens.filter(c => c.name !== name) — filter creates a new array without the deleted item.', test: c => /\.filter\s*\(/.test(c) && /!==/.test(c) },
  { id: 'c5', label: 'localStorage saves state',       hint: 'localStorage.setItem("key", JSON.stringify(data)) — call this after every change.',                test: c => /localStorage\.setItem\s*\(/.test(c) },
  { id: 'c6', label: 'Errors shown in DOM',            hint: 'catch (err) { document.getElementById("error-msg").textContent = err.message }',                   test: c => /\bcatch\s*\(/.test(c) && /\.textContent\s*=/.test(c) },
]

const QUIZ = {
  q: 'Your delete function mutates state.citizens directly with splice(). A colleague says use .filter() instead. Why?',
  opts: [
    '.filter() is faster than splice() for large arrays — it uses a native C++ optimization path.',
    '.filter() returns a new array without changing the original, keeping state predictable and supporting undo — splice() mutates in place and can cause subtle bugs when other code holds a reference to the old array.',
    'splice() requires you to know the exact index, while .filter() finds items by value automatically.',
    'Direct mutation with splice() triggers a browser warning in strict mode.',
  ],
  correct: 1,
}

function Scene({ passCount }) {
  return (
    <div className="ag-scene" style={{ '--ac': 'var(--teal)' }}>
      <span className="ag-scene-label">COMPLETE INTERFACE — GATE J-07</span>
      <div className="ag-py-terminal">
        <div className="ag-py-terminal-bar">
          <span className="ag-py-dot" style={{ background: 'var(--magenta)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--amber)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--lime)' }} />
          <span style={{ flex: 1, textAlign: 'center', fontSize: 9, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)' }}>app.js</span>
        </div>
        <div className="ag-py-output">
          {passCount === 0 && <div className="ag-py-line" style={{ opacity: 0.35 }}>&gt; running app.js…</div>}
          {passCount >= 1 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>fetch connected</span></div>}
          {passCount >= 2 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>form wired</span></div>}
          {passCount >= 3 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>live filter active</span></div>}
          {passCount >= 4 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>delete working</span></div>}
          {passCount >= 5 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>persistence ready</span></div>}
          {passCount >= 6 && <div className="ag-py-line">&gt; <span style={{ color: 'var(--teal)' }}>INTERFACE COMPLETE — ALL SYSTEMS GO!</span></div>}
        </div>
      </div>
    </div>
  )
}

export default function GateJ07() {
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
        <span className="ag-rank-badge" style={{ '--ac': 'var(--teal)' }}>RANK C</span>
        <h1 className="ag-gate-name">The Complete Interface</h1>
        <span className="ag-concept-tag">Integration</span>
        <span className="ag-xp-tag" style={{ color: 'var(--teal)' }}>+380 XP</span>
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
            {running ? '⟳ Running checks…' : allPassed ? '▶ LAUNCH INTERFACE' : `○ ${6 - passCount} check${6 - passCount !== 1 ? 's' : ''} remaining`}
          </button>
        </div>

        <div className="ag-right">
          <div className="ag-instruction">
            Build the Construct's <strong>complete interface</strong>. <strong>Fetch</strong> data from an API, handle <strong>form submission</strong>, drive a <strong>live filter</strong> from input, <strong>delete</strong> items via filter, <strong>persist</strong> to localStorage, and surface <strong>errors in the DOM</strong>. Every system integrated.
          </div>
          <div className="ag-py-editor">
            <div className="ag-py-editor-head">⚡ app.js</div>
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
            <div className="ag-quiz-eyebrow">Knowledge Check — Gate J-07</div>
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
            <span className="ag-done-emoji">🌍</span>
            <span className="ag-done-xp">+380 XP</span>
            <h2 className="ag-done-title">The Complete Interface</h2>
            <p className="ag-done-flavor">The Interface complete. Data fetched. Forms handled. Errors caught. The Construct is a real application now.</p>
            <div className="ag-done-rewards">
              <span className="ag-done-reward">Interface Fragment</span>
              <span className="ag-done-reward">Builder Badge II</span>
            </div>
            <button className="ag-done-btn" onClick={() => goto('academy/dashboard')}>Builder HQ →</button>
          </div>
        </div>
      )}
    </div>
  )
}

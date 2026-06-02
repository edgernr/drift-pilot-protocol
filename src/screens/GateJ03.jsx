import { useState } from 'react'
import './AcademyGate.css'
import { useNav } from '../context/NavigationContext'
import { useAcademy } from '../context/AcademyContext'

const GATE_ID = 'J-03'
const GATE_XP = 300

const STARTER = `// The Async Signal — Connecting to External Data
// Mock endpoints: /api/citizens  /api/sectors  /api/sectors/:id

// 1. async/await with fetch
// async function loadCitizens() {
//     const response = await fetch("/api/citizens")
//     const data = await response.json()
//     return data
// }

// 2. Show loading state before fetch completes
// async function loadWithStatus() {
//     document.getElementById("status").textContent = "Loading..."
//     const data = await loadCitizens()
//     document.getElementById("status").textContent = "Ready"
//     return data
// }

// 3. Check response.ok before using data
// async function safeFetch(url) {
//     const response = await fetch(url)
//     if (!response.ok) throw new Error(\`HTTP \${response.status}\`)
//     return response.json()
// }

// 4. try/catch for network errors
// async function fetchWithHandling(url) {
//     try {
//         return await safeFetch(url)
//     } catch (error) {
//         document.getElementById("error").textContent = error.message
//     }
// }

// 5. Chained fetches: get sectors, then fetch details for the first one
// async function loadSectorDetails() {
//     const sectors = await safeFetch("/api/sectors")
//     const details = await safeFetch(\`/api/sectors/\${sectors[0].id}\`)
//     return details
// }
`

const CHECKS = [
  { id: 'c1', label: 'async/await used correctly',        hint: 'The fetch result isn\'t being awaited. The function must be async and use await before fetch().',                          test: c => /\basync\b/.test(c) && /await\s+fetch\s*\(/.test(c) },
  { id: 'c2', label: 'Loading state shows during fetch',  hint: 'No loading indicator appears while waiting. Show a loading message before fetch, hide it after.',                          test: c => /["']Loading/.test(c) },
  { id: 'c3', label: 'response.ok checked',               hint: 'HTTP errors aren\'t being caught. Check if (!response.ok) after fetch before calling response.json().',                    test: c => /response\.ok/.test(c) },
  { id: 'c4', label: 'Network errors caught',             hint: 'Network failures crash the script. Wrap the fetch in try/catch to handle connection errors.',                               test: c => /\bcatch\s*\(/.test(c) },
  { id: 'c5', label: 'Chained fetches work',              hint: 'The second fetch doesn\'t use data from the first. await the first fetch, extract the ID, then use it in the second.',    test: c => (c.match(/\bfetch\s*\(/g) || []).length >= 2 },
]

const QUIZ = {
  q: 'JavaScript is single-threaded but handles async operations without freezing. What actually happens while await is waiting?',
  opts: [
    'JavaScript pauses completely until the response arrives — nothing else can run.',
    'JavaScript continues executing other code while the browser handles the network request in the background — await resumes when done.',
    'JavaScript creates a new thread specifically for the await operation.',
    'The browser pauses JavaScript but keeps the UI responsive through a separate process.',
  ],
  correct: 1,
}

function Scene({ passCount }) {
  return (
    <div className="ag-scene" style={{ '--ac': 'var(--teal)' }}>
      <span className="ag-scene-label">ASYNC SIGNAL — GATE J-03</span>
      <div className="ag-py-terminal">
        <div className="ag-py-terminal-bar">
          <span className="ag-py-dot" style={{ background: 'var(--magenta)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--amber)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--lime)' }} />
          <span style={{ flex: 1, textAlign: 'center', fontSize: 9, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)' }}>async.js</span>
        </div>
        <div className="ag-py-output">
          {passCount === 0 && <div className="ag-py-line" style={{ opacity: 0.35 }}>&gt; running async.js…</div>}
          {passCount >= 1 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>async/await ready</span></div>}
          {passCount >= 2 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>loading state shown</span></div>}
          {passCount >= 3 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>response.ok verified</span></div>}
          {passCount >= 4 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>errors caught</span></div>}
          {passCount >= 5 && <div className="ag-py-line">&gt; <span style={{ color: 'var(--teal)' }}>SIGNAL FLOWING — ALL CHECKS PASSED!</span></div>}
        </div>
      </div>
    </div>
  )
}

export default function GateJ03() {
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
        <span className="ag-rank-badge" style={{ '--ac': 'var(--teal)' }}>RANK D</span>
        <h1 className="ag-gate-name">The Async Signal</h1>
        <span className="ag-concept-tag">Async / Await</span>
        <span className="ag-xp-tag" style={{ color: 'var(--teal)' }}>+300 XP</span>
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
            {running ? '⟳ Running checks…' : allPassed ? '▶ SEND SIGNAL' : `○ ${5 - passCount} check${5 - passCount !== 1 ? 's' : ''} remaining`}
          </button>
        </div>

        <div className="ag-right">
          <div className="ag-instruction">
            Connect the Construct to <strong>external data</strong>. Use <strong>async/await</strong> with fetch, show a <strong>loading state</strong> while waiting, verify <strong>response.ok</strong> before reading data, catch <strong>network errors</strong> with try/catch, and <strong>chain two fetches</strong> where the second uses data from the first.
          </div>
          <div className="ag-py-editor">
            <div className="ag-py-editor-head">⚡ async.js</div>
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
            <div className="ag-quiz-eyebrow">Knowledge Check — Gate J-03</div>
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
            <span className="ag-done-emoji">⚡</span>
            <span className="ag-done-xp">+300 XP</span>
            <h2 className="ag-done-title">The Async Signal</h2>
            <p className="ag-done-flavor">The Async Signal flows. The Construct reaches outside itself. Data arrives from beyond. The world connects.</p>
            <div className="ag-done-rewards">
              <span className="ag-done-reward">Async Fragment</span>
              <span className="ag-done-reward">Async Badge I</span>
            </div>
            <button className="ag-done-btn" onClick={() => goto('academy/dashboard')}>Builder HQ →</button>
          </div>
        </div>
      )}
    </div>
  )
}

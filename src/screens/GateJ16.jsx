import { useState } from 'react'
import './AcademyGate.css'
import { useNav } from '../context/NavigationContext'
import { useAcademy } from '../context/AcademyContext'
import { stripComments } from '../lib/codeUtils'
import GateAIHint from '../components/GateAIHint'

const GATE_ID = 'J-16'
const GATE_XP = 300

const STARTER = `// The Browser API Vault — Native Web Power

// 1. URLSearchParams — parse query strings
// const params = new URLSearchParams("?name=LUCY&level=5")
// params.get("name")   // "LUCY"
// params.get("level")  // "5"

// 2. history.pushState — change URL without reload
// history.pushState({ page: "citizens" }, "", "/citizens")

// 3. Storage APIs
// sessionStorage.setItem("token", "abc123")
// localStorage.setItem("theme", "dark")
// localStorage.getItem("theme")  // "dark"

// 4. Clipboard API
// navigator.clipboard.writeText("LUCY_ALPHA_5")
//   .then(() => console.log("copied!"))

// 5. IntersectionObserver — detect when element enters viewport
// const observer = new IntersectionObserver(entries => {
//   entries.forEach(entry => {
//     if (entry.isIntersecting) console.log("visible!")
//   })
// })
// observer.observe(document.querySelector(".card"))

// 6. ResizeObserver — detect element size changes
// const ro = new ResizeObserver(entries => {
//   entries.forEach(e => console.log(e.contentRect.width))
// })
// ro.observe(document.querySelector(".panel"))
`

const CHECKS = [
  { id: 'c1', label: 'URLSearchParams used',          hint: 'Create new URLSearchParams("?key=value") and call .get() to extract a value.',             test: c => /\bURLSearchParams\b/.test(c) },
  { id: 'c2', label: 'history.pushState used',        hint: 'Call history.pushState(state, title, url) to update the URL without a page reload.',       test: c => /\bhistory\.pushState\b/.test(c) },
  { id: 'c3', label: 'sessionStorage + localStorage', hint: 'Use both sessionStorage.setItem() and localStorage.setItem() or getItem().',               test: c => /\bsessionStorage\b/.test(c) && /\blocalStorage\b/.test(c) },
  { id: 'c4', label: 'navigator.clipboard used',      hint: 'Use navigator.clipboard.writeText("text") — it returns a Promise.',                        test: c => /\bnavigator\.clipboard\b/.test(c) },
  { id: 'c5', label: 'IntersectionObserver used',     hint: 'Create new IntersectionObserver(callback) and call .observe() on an element.',             test: c => /\bIntersectionObserver\b/.test(c) },
  { id: 'c6', label: 'ResizeObserver used',           hint: 'Create new ResizeObserver(callback) and call .observe() to watch element size changes.',   test: c => /\bResizeObserver\b/.test(c) },
]

const QUIZ = {
  q: 'IntersectionObserver detects when elements enter or leave the viewport. What is the performance advantage over using a scroll event listener?',
  opts: [
    'IntersectionObserver uses WebGL acceleration, making it 100x faster.',
    'A scroll event fires on every pixel scrolled — potentially hundreds of times per second. IntersectionObserver only fires when an element actually crosses a threshold, saving significant CPU.',
    'Scroll events don\'t work on mobile — IntersectionObserver does.',
    'IntersectionObserver is built into the GPU, so it doesn\'t use JavaScript at all.',
  ],
  correct: 1,
}

function Scene({ passCount }) {
  return (
    <div className="ag-scene" style={{ '--ac': 'var(--teal)' }}>
      <span className="ag-scene-label">BROWSER API VAULT — GATE J-16</span>
      <div className="ag-py-terminal">
        <div className="ag-py-terminal-bar">
          <span className="ag-py-dot" style={{ background: 'var(--magenta)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--amber)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--lime)' }} />
          <span style={{ flex: 1, textAlign: 'center', fontSize: 9, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)' }}>browser.js</span>
        </div>
        <div className="ag-py-output">
          {passCount === 0 && <div className="ag-py-line" style={{ opacity: 0.35 }}>&gt; running browser.js…</div>}
          {passCount >= 1 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>URL params parsed</span></div>}
          {passCount >= 2 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>history wired</span></div>}
          {passCount >= 3 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>storage accessed</span></div>}
          {passCount >= 4 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>clipboard ready</span></div>}
          {passCount >= 5 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>intersection observed</span></div>}
          {passCount >= 6 && <div className="ag-py-line">&gt; <span style={{ color: 'var(--teal)' }}>VAULT OPEN — ALL APIS UNLOCKED!</span></div>}
        </div>
      </div>
    </div>
  )
}

export default function GateJ16() {
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
        <span className="ag-rank-badge" style={{ '--ac': 'var(--teal)' }}>RANK C</span>
        <h1 className="ag-gate-name">The Browser API Vault</h1>
        <span className="ag-concept-tag">Browser APIs</span>
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
            {running ? '⟳ Running checks…' : allPassed ? '▶ OPEN VAULT' : `○ ${6 - passCount} check${6 - passCount !== 1 ? 's' : ''} remaining`}
          </button>
          <GateAIHint code={code} checks={checks} gateId={GATE_ID} lang="javascript" done={done} />
        </div>

        <div className="ag-right">
          <div className="ag-instruction">
            Unlock the browser's native power. Parse URLs with <strong>URLSearchParams</strong>. Navigate without reload using <strong>history.pushState</strong>. Store data in <strong>sessionStorage and localStorage</strong>. Copy text with <strong>navigator.clipboard</strong>. Track visibility with <strong>IntersectionObserver</strong>. Watch size with <strong>ResizeObserver</strong>.
          </div>
          <div className="ag-py-editor">
            <div className="ag-py-editor-head">⚡ browser.js</div>
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
            <div className="ag-quiz-eyebrow">Knowledge Check — Gate J-16</div>
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
            <span className="ag-done-emoji">🔧</span>
            <span className="ag-done-xp">+300 XP</span>
            <h2 className="ag-done-title">The Browser API Vault</h2>
            <p className="ag-done-flavor">Vault open. Six native APIs mastered. The browser holds more power than most developers ever use. You found it.</p>
            <div className="ag-done-rewards">
              <span className="ag-done-reward">Native Fragment</span>
              <span className="ag-done-reward">Browser Badge II</span>
            </div>
            <button className="ag-done-btn" onClick={() => goto('academy/dashboard')}>Builder HQ →</button>
          </div>
        </div>
      )}
    </div>
  )
}

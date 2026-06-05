import { useState } from 'react'
import './AcademyGate.css'
import { useNav } from '../context/NavigationContext'
import { useAcademy } from '../context/AcademyContext'
import { stripComments } from '../lib/codeUtils'
import GateAIHint from '../components/GateAIHint'

const GATE_ID = 'J-17'
const GATE_XP = 330

const STARTER = `// The Form Depths — Advanced Form Handling

// 1. FormData — collect all named fields at once
// const form = document.querySelector("form")
// const data = new FormData(form)
// data.get("username")  // value of input[name="username"]

// 2. Custom validity message
// const input = document.querySelector("input")
// input.setCustomValidity("ID must start with C")
// input.reportValidity()

// 3. FileReader — read uploaded file contents
// const reader = new FileReader()
// reader.onload = e => console.log(e.target.result)
// reader.readAsText(file)

// 4. Multi-step form with state tracking
// let step = 1
// function nextStep() {
//   step++
//   showStep(step)
// }

// 5. checkValidity — programmatic validation
// const isValid = form.checkValidity()
// if (!isValid) form.reportValidity()

// 6. autocomplete attribute for UX
// <input name="email" type="email" autocomplete="email" />
// <input name="username" autocomplete="username" />
`

const CHECKS = [
  { id: 'c1', label: 'new FormData() used',           hint: 'Create new FormData(form) and use .get("fieldName") to access field values.',             test: c => /\bnew\s+FormData\s*\(/.test(c) },
  { id: 'c2', label: 'setCustomValidity used',        hint: 'Call input.setCustomValidity("message") to set a custom error on an input element.',      test: c => /\.setCustomValidity\s*\(/.test(c) },
  { id: 'c3', label: 'FileReader used',               hint: 'Create new FileReader() and use .readAsText(file) or .readAsDataURL(file).',              test: c => /\bFileReader\b/.test(c) },
  { id: 'c4', label: 'Multi-step state tracked',      hint: 'Track a step variable (let step = 1) and increment it to navigate between form steps.',  test: c => /\bstep\b/.test(c) && /nextStep|step\+\+|step\s*=\s*step\s*\+/.test(c) },
  { id: 'c5', label: 'checkValidity() called',        hint: 'Call form.checkValidity() or input.checkValidity() to programmatically validate.',       test: c => /\.checkValidity\s*\(/.test(c) },
  { id: 'c6', label: 'autocomplete attribute shown',  hint: 'Add autocomplete="email" or autocomplete="username" to an input for better UX.',         test: c => /\bautocomplete\b/.test(c) },
]

const QUIZ = {
  q: 'FormData automatically collects all form fields. What attribute must every input have for FormData to include it in the collection?',
  opts: [
    'The id attribute — FormData uses element IDs to identify fields.',
    'The name attribute — FormData uses the name to key each field value, and inputs without a name are silently ignored.',
    'The value attribute — FormData only collects inputs with a pre-filled value.',
    'The type attribute — FormData requires explicit type declarations to process fields.',
  ],
  correct: 1,
}

function Scene({ passCount }) {
  return (
    <div className="ag-scene" style={{ '--ac': 'var(--amber)' }}>
      <span className="ag-scene-label">FORM DEPTHS — GATE J-17</span>
      <div className="ag-py-terminal">
        <div className="ag-py-terminal-bar">
          <span className="ag-py-dot" style={{ background: 'var(--magenta)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--amber)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--lime)' }} />
          <span style={{ flex: 1, textAlign: 'center', fontSize: 9, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)' }}>forms.js</span>
        </div>
        <div className="ag-py-output">
          {passCount === 0 && <div className="ag-py-line" style={{ opacity: 0.35 }}>&gt; running forms.js…</div>}
          {passCount >= 1 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>FormData collected</span></div>}
          {passCount >= 2 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>custom validity set</span></div>}
          {passCount >= 3 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>FileReader ready</span></div>}
          {passCount >= 4 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>multi-step tracked</span></div>}
          {passCount >= 5 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>validity checked</span></div>}
          {passCount >= 6 && <div className="ag-py-line">&gt; <span style={{ color: 'var(--amber)' }}>DEPTHS REACHED — FORMS MASTERED!</span></div>}
        </div>
      </div>
    </div>
  )
}

export default function GateJ17() {
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
        <span className="ag-rank-badge" style={{ '--ac': 'var(--amber)' }}>RANK C</span>
        <h1 className="ag-gate-name">The Form Depths</h1>
        <span className="ag-concept-tag">Advanced Forms</span>
        <span className="ag-xp-tag" style={{ color: 'var(--amber)' }}>+330 XP</span>
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
            {running ? '⟳ Running checks…' : allPassed ? '▶ DIVE DEEPER' : `○ ${6 - passCount} check${6 - passCount !== 1 ? 's' : ''} remaining`}
          </button>
          <GateAIHint code={code} checks={checks} gateId={GATE_ID} lang="javascript" done={done} />
        </div>

        <div className="ag-right">
          <div className="ag-instruction">
            Go beyond basic forms. Collect data with <strong>new FormData()</strong>. Set custom errors with <strong>setCustomValidity</strong>. Read files with <strong>FileReader</strong>. Track <strong>multi-step state</strong>. Programmatically check with <strong>checkValidity()</strong>. Improve UX with the <strong>autocomplete</strong> attribute.
          </div>
          <div className="ag-py-editor">
            <div className="ag-py-editor-head">⚡ forms.js</div>
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
            <div className="ag-quiz-eyebrow">Knowledge Check — Gate J-17</div>
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
            <span className="ag-done-emoji">📋</span>
            <span className="ag-done-xp">+330 XP</span>
            <h2 className="ag-done-title">The Form Depths</h2>
            <p className="ag-done-flavor">Data collected. Files read. Steps tracked. Validation confirmed. Forms aren't just inputs — they're the interface between users and data.</p>
            <div className="ag-done-rewards">
              <span className="ag-done-reward">Form Fragment</span>
              <span className="ag-done-reward">Form Badge II</span>
            </div>
            <button className="ag-done-btn" onClick={() => goto('academy/dashboard')}>Builder HQ →</button>
          </div>
        </div>
      )}
    </div>
  )
}

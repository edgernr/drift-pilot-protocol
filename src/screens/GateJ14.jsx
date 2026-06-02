import { useState } from 'react'
import './AcademyGate.css'
import { useNav } from '../context/NavigationContext'
import { useAcademy } from '../context/AcademyContext'

const GATE_ID = 'J-14'
const GATE_XP = 300

const STARTER = `// The Regex Forge — Pattern Matching

// 1. Match citizen ID format: C followed by 4 digits
// const idPattern = /^C\d{4}$/
// idPattern.test("C1234")  // true
// idPattern.test("X999")   // false

// 2. Find all matches with /g flag
// const text = "Citizens C1001 and C2002 and C3003"
// const matches = text.match(/C\d{4}/g)
// // ["C1001", "C2002", "C3003"]

// 3. Replace with pattern
// const cleaned = "CORRUPTED_C1001".replace(/CORRUPTED_/, "")
// // "C1001"

// 4. Split on multiple separators using character class
// const parts = "LUCY,ALEX;SAM|ZED".split(/[,;|]/)
// // ["LUCY", "ALEX", "SAM", "ZED"]

// 5. Email validation regex
// const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// emailPattern.test("citizen@construct.net")  // true

// 6. Capture groups — extract name and level
// const str = "LUCY:5"
// const [, name, level] = str.match(/^(\w+):(\d)$/)
// // name = "LUCY", level = "5"
`

const CHECKS = [
  { id: 'c1', label: 'Digit pattern /\\d{4}/ used',   hint: 'Use \\d{4} to match exactly 4 digits. Anchor with ^ and $ to match the whole string.',    test: c => /\\d\{4\}/.test(c) || /\d\{4\}/.test(c) },
  { id: 'c2', label: '/g flag for all matches',        hint: 'Add the g flag to your regex: /pattern/g — then use .match() to get all results.',        test: c => /\/[^/]+\/g/.test(c) },
  { id: 'c3', label: '.replace() with regex',          hint: 'Pass a regex as the first argument to .replace() instead of a plain string.',              test: c => /\.replace\s*\(\s*\//.test(c) },
  { id: 'c4', label: 'Character class split [,;|]',   hint: 'Use a character class like /[,;|]/ as the separator for .split().',                        test: c => /\[.*[,;|].*\]/.test(c) },
  { id: 'c5', label: 'Email regex pattern',            hint: 'Build a regex that validates the user@domain.ext format — check for @ and a dot.',        test: c => /@/.test(c) && /emailPattern|email|Email/i.test(c) },
  { id: 'c6', label: 'Capture groups () used',         hint: 'Use parentheses to create capture groups: /^(\\w+):(\\d)$/ — then extract with .match().', test: c => /\([^)]+\)/.test(c) && /\.match\s*\(/.test(c) },
]

const QUIZ = {
  q: 'Email validation with regex is notoriously tricky. Why is writing a "perfect" email validator with regex essentially impossible?',
  opts: [
    'JavaScript regex doesn\'t support the special characters used in email addresses.',
    'The email specification (RFC 5321) allows many edge cases that are technically valid but look bizarre — like "user+tag"@domain or quoted strings with spaces.',
    'Regex is synchronous and email validation requires async checks against a mail server.',
    'Email addresses can only be validated server-side, never in the browser.',
  ],
  correct: 1,
}

function Scene({ passCount }) {
  return (
    <div className="ag-scene" style={{ '--ac': 'var(--magenta)' }}>
      <span className="ag-scene-label">REGEX FORGE — GATE J-14</span>
      <div className="ag-py-terminal">
        <div className="ag-py-terminal-bar">
          <span className="ag-py-dot" style={{ background: 'var(--magenta)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--amber)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--lime)' }} />
          <span style={{ flex: 1, textAlign: 'center', fontSize: 9, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)' }}>regex.js</span>
        </div>
        <div className="ag-py-output">
          {passCount === 0 && <div className="ag-py-line" style={{ opacity: 0.35 }}>&gt; running regex.js…</div>}
          {passCount >= 1 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>ID pattern forged</span></div>}
          {passCount >= 2 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>global match active</span></div>}
          {passCount >= 3 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>replace forged</span></div>}
          {passCount >= 4 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>multi-split active</span></div>}
          {passCount >= 5 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>email pattern forged</span></div>}
          {passCount >= 6 && <div className="ag-py-line">&gt; <span style={{ color: 'var(--magenta)' }}>FORGE HOT — ALL PATTERNS READY!</span></div>}
        </div>
      </div>
    </div>
  )
}

export default function GateJ14() {
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
        <span className="ag-rank-badge" style={{ '--ac': 'var(--magenta)' }}>RANK C</span>
        <h1 className="ag-gate-name">The Regex Forge</h1>
        <span className="ag-concept-tag">Regular Expressions</span>
        <span className="ag-xp-tag" style={{ color: 'var(--magenta)' }}>+300 XP</span>
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
            {running ? '⟳ Running checks…' : allPassed ? '▶ HEAT THE FORGE' : `○ ${6 - passCount} check${6 - passCount !== 1 ? 's' : ''} remaining`}
          </button>
        </div>

        <div className="ag-right">
          <div className="ag-instruction">
            Forge patterns that match citizen data. Use <strong>\d{"{4}"}</strong> to validate IDs. Extract all matches with <strong>/g flag</strong>. Clean data with <strong>.replace(regex)</strong>. Split on multiple separators with a <strong>character class</strong>. Validate email format. Extract data with <strong>capture groups</strong>.
          </div>
          <div className="ag-py-editor">
            <div className="ag-py-editor-head">⚡ regex.js</div>
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
            <div className="ag-quiz-eyebrow">Knowledge Check — Gate J-14</div>
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
            <span className="ag-done-emoji">🎯</span>
            <span className="ag-done-xp">+300 XP</span>
            <h2 className="ag-done-title">The Regex Forge</h2>
            <p className="ag-done-flavor">Patterns forged. Data matched. Corruption replaced. The Forge runs hot. Text is just data waiting for the right pattern.</p>
            <div className="ag-done-rewards">
              <span className="ag-done-reward">Pattern Fragment</span>
              <span className="ag-done-reward">Regex Badge I</span>
            </div>
            <button className="ag-done-btn" onClick={() => goto('academy/dashboard')}>Builder HQ →</button>
          </div>
        </div>
      )}
    </div>
  )
}

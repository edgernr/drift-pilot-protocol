import { useState } from 'react'
import './AcademyGate.css'
import { useNav } from '../context/NavigationContext'
import { useAcademy } from '../context/AcademyContext'
import { stripComments } from '../lib/codeUtils'
import GateAIHint from '../components/GateAIHint'

const GATE_ID = 'P-01'
const GATE_XP = 200

const STARTER = `# Write your Python program below!
# Tip: Create a variable and print it using f"Hello, {name}!"

`

const CHECKS = [
  { id: 'c1', label: 'print() used correctly',              hint: 'Nothing appears in the output. print() shows text in the terminal — put your message inside the parentheses.',                 test: c => /print\s*\(/.test(c) },
  { id: 'c2', label: 'Name stored in variable',             hint: 'The Builder name is written directly in the print statement instead of stored first. Create a variable: name = "YourName"',    test: c => /\b\w+\s*=\s*["']/.test(c) },
  { id: 'c3', label: 'Comment present',                     hint: 'No comment found in the code. Start a line with # to write a note the Construct ignores.',                                      raw: true, test: c => /#[^\n]+/.test(c) },
  { id: 'c4', label: 'f-string combines text and variable', hint: 'The name and greeting are in separate print statements. Use f"Hello {name}" to combine them.',                                  test: c => /f["']/.test(c) },
  { id: 'c5', label: 'Variable in f-string braces',         hint: 'Put your variable name inside curly braces in the f-string: f"Hello {name}"',                                                   test: c => /\{[a-z_]\w*\}/.test(c) },
]

const QUIZ = {
  q: 'You wrote name = "Builder" and then print(name). Why did Python print Builder without the quotation marks?',
  opts: [
    'Python automatically removes quotation marks from all output.',
    'The variable name stores the value Builder — the quotation marks tell Python it\'s text, but the text itself doesn\'t include them.',
    'print() removes quotation marks as a formatting feature.',
    'You need to add the quotation marks back inside print() if you want them to show.',
  ],
  correct: 1,
}

function Scene({ passCount }) {
  return (
    <div className="ag-scene" style={{ '--ac': 'var(--lime)' }}>
      <span className="ag-scene-label">PYTHON TERMINAL — GATE P-01</span>
      <div className="ag-py-terminal">
        <div className="ag-py-terminal-bar">
          <span className="ag-py-dot" style={{ background: 'var(--magenta)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--amber)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--lime)' }} />
          <span style={{ flex: 1, textAlign: 'center', fontSize: 9, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)' }}>main.py</span>
        </div>
        <div className="ag-py-output">
          {passCount === 0 && <div className="ag-py-line" style={{ opacity: 0.35 }}>$ python3 main.py</div>}
          {passCount >= 1 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>print() found</span></div>}
          {passCount >= 2 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>string variable set</span></div>}
          {passCount >= 3 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>comment detected</span></div>}
          {passCount >= 4 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>f-string found</span></div>}
          {passCount >= 5 && <div className="ag-py-line">&gt;&gt;&gt; <span style={{ color: 'var(--amber)' }}>ALL CHECKS PASSED!</span></div>}
        </div>
      </div>
    </div>
  )
}

export default function GateP01() {
  const { goto } = useNav()
  const { activeChild, completeAcademyGate } = useAcademy()
  const [code, setCode]         = useState(STARTER)
  const [running, setRunning]   = useState(false)
  const [quizOpen, setQuizOpen] = useState(false)
  const [quizOrder, setQuizOrder] = useState(null)
  const [quizWrong, setQuizWrong] = useState(false)
  const [done, setDone]         = useState(false)

  const checks   = CHECKS.map(c => ({ ...c, passed: c.test(c.raw ? code : stripComments(code)) }))
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
        <h1 className="ag-gate-name">First Words</h1>
        <span className="ag-concept-tag">Print &amp; Strings</span>
        <span className="ag-xp-tag" style={{ color: 'var(--lime)' }}>+200 XP</span>
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
            {running ? '⟳ Running checks…' : allPassed ? '▶ RUN PROGRAM' : `○ ${5 - passCount} check${5 - passCount !== 1 ? 's' : ''} remaining`}
          </button>
          <GateAIHint code={code} checks={checks} gateId={GATE_ID} lang="python" done={done} />
        </div>

        <div className="ag-right">
          <div className="ag-instruction">
            Write your <strong>first Python program</strong>. Create a variable to hold your name, then use an f-string to print a personalised greeting. Add a comment to explain what your code does. Five checks — five concepts learned.
          </div>
          <div className="ag-py-editor">
            <div className="ag-py-editor-head">🐍 main.py</div>
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
            <div className="ag-quiz-eyebrow">Knowledge Check — Gate P-01</div>
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
            <span className="ag-done-emoji">🐍</span>
            <span className="ag-done-xp">+200 XP</span>
            <h2 className="ag-done-title">First Words</h2>
            <p className="ag-done-flavor">First words written. The Construct has a name. Python understands you. The real building begins.</p>
            <div className="ag-done-rewards">
              <span className="ag-done-reward">First Law Fragment</span>
              <span className="ag-done-reward">Python Badge I</span>
            </div>
            <button className="ag-done-btn" onClick={() => goto('academy/dashboard')}>Builder HQ →</button>
          </div>
        </div>
      )}
    </div>
  )
}

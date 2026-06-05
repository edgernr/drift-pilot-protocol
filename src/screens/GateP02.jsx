import { useState } from 'react'
import './AcademyGate.css'
import { useNav } from '../context/NavigationContext'
import { useAcademy } from '../context/AcademyContext'
import { stripComments } from '../lib/codeUtils'
import GateAIHint from '../components/GateAIHint'

const GATE_ID = 'P-02'
const GATE_XP = 200

const STARTER = `# The Number Engine — Build a calculator in Python
#
# Your goal: ask the user for two numbers, calculate with them, print the results.
#
# STEP 1 — Get numbers from the user
# input() asks a question and waits for the user to type an answer.
# But input() gives you TEXT, not a number. You cannot do maths on text.
# Use int() to convert the text into a real integer.
# Use both functions together on one line to capture each number.
#
# STEP 2 — Do all four basic operations
# Once you have two number variables, you can calculate with them.
# You need to show: addition, subtraction, multiplication, and division.
# Use an f string to label each result so it is clear what each line shows.
#
# STEP 3 — Integer division
# Regular division gives a decimal answer (like 3.5).
# Integer division gives only the whole number part (like 3).
# The operator is the division symbol written twice in a row.
#
# STEP 4 — Modulo (the remainder)
# Modulo tells you what is left over after dividing two numbers.
# For example: 17 divided by 5 goes 3 times with 2 remaining. The modulo is 2.
# The operator is the percent symbol.
#
# STEP 5 — Brackets change the order
# Python does multiplication before addition, just like in normal maths.
# Brackets let you change that order.
# Write the same calculation twice: once without brackets, once with brackets.
# The two answers should be different.
`

const CHECKS = [
  { id: 'c1', label: 'Input converted to number',       hint: 'You\'re using input() directly in arithmetic. input() returns text — wrap it with int() first: int(input("Enter number: "))',  test: c => /int\s*\(\s*input\s*\(/.test(c) },
  { id: 'c2', label: 'Basic operations complete',        hint: 'One or more of +, -, *, / are missing from the output.',                                                                         test: c => /[\+\-\*\/]/.test(c) },
  { id: 'c3', label: 'Integer division shown',           hint: '// is missing. Integer division gives the whole number part of a division result.',                                              test: c => /\/\//.test(c) },
  { id: 'c4', label: 'Modulo shown',                     hint: '% is missing. Modulo gives the remainder after division.',                                                                       test: c => /%/.test(c) },
  { id: 'c5', label: 'Results displayed clearly',        hint: 'Numbers appear but without labels. Use f-strings to show what each number means.',                                               test: c => /f["'][^"']*\{[^}]+\}/.test(c) },
  { id: 'c6', label: 'Precedence example correct',       hint: 'Remember: multiplication before addition unless brackets say otherwise. Try: 2 + 3 * 4 vs (2 + 3) * 4',                        test: c => /\(.*\+.*\)|\(.*-.*\)/.test(c) },
]

const QUIZ = {
  q: 'What does 17 % 5 equal, and when would you actually use modulo in a real program?',
  opts: [
    '3.4 — modulo is the same as division but shows the decimal part.',
    '2 — because 5 goes into 17 three times with 2 left over. Useful for checking if a number is even (number % 2 == 0).',
    '3 — because 5 goes into 17 three times. Useful for rounding numbers down.',
    '85 — modulo multiplies the two numbers.',
  ],
  correct: 1,
}

function Scene({ passCount }) {
  const ops = ['+', '-', '*', '/', '//', '%']
  return (
    <div className="ag-scene" style={{ '--ac': 'var(--teal)' }}>
      <span className="ag-scene-label">PYTHON TERMINAL — GATE P-02</span>
      <div className="ag-py-terminal">
        <div className="ag-py-terminal-bar">
          <span className="ag-py-dot" style={{ background: 'var(--magenta)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--amber)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--lime)' }} />
          <span style={{ flex: 1, textAlign: 'center', fontSize: 9, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)' }}>calculator.py</span>
        </div>
        <div className="ag-py-output">
          {passCount === 0 && <div className="ag-py-line" style={{ opacity: 0.35 }}>$ python3 calculator.py</div>}
          {passCount >= 1 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>input() reading numbers</span></div>}
          {passCount >= 2 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>arithmetic operator found</span></div>}
          {passCount >= 3 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>integer division (//) found</span></div>}
          {passCount >= 4 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>modulo (%) found</span></div>}
          {passCount >= 5 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>precedence example correct</span></div>}
          {passCount >= 6 && <div className="ag-py-line">&gt;&gt;&gt; <span style={{ color: 'var(--amber)' }}>ALL CHECKS PASSED!</span></div>}
        </div>
      </div>
    </div>
  )
}

export default function GateP02() {
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
        <span className="ag-rank-badge" style={{ '--ac': 'var(--teal)' }}>RANK E</span>
        <h1 className="ag-gate-name">The Number Engine</h1>
        <span className="ag-concept-tag">Math &amp; Input</span>
        <span className="ag-xp-tag" style={{ color: 'var(--teal)' }}>+200 XP</span>
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
            {running ? '⟳ Running checks…' : allPassed ? '▶ RUN CALCULATOR' : `○ ${6 - passCount} check${6 - passCount !== 1 ? 's' : ''} remaining`}
          </button>
          <GateAIHint code={code} checks={checks} gateId={GATE_ID} lang="python" done={done} />
        </div>

        <div className="ag-right">
          <div className="ag-instruction">
            Build a calculator in Python. The comments in the code panel explain each step — read them, then write the code yourself.<br /><br />
            <strong>Step 1 — Input.</strong> <code>input()</code> returns text. <code>int()</code> converts text to a number. You need both — look up how to use them together on one line.<br /><br />
            <strong>Step 2 — Four operations.</strong> Use your two number variables to add, subtract, multiply, and divide. Print each result with a label using an f string.<br /><br />
            <strong>Step 3 — Integer division.</strong> The operator is two of the same symbol as regular division. It drops the decimal and keeps only the whole number.<br /><br />
            <strong>Step 4 — Modulo.</strong> The operator is the percent symbol. It gives you the remainder — what is left over after dividing.<br /><br />
            <strong>Step 5 — Precedence.</strong> Multiply runs before add. Write a calculation that proves brackets change the result.
          </div>
          <div className="ag-py-editor">
            <div className="ag-py-editor-head">🐍 calculator.py</div>
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
            <div className="ag-quiz-eyebrow">Knowledge Check — Gate P-02</div>
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
            <span className="ag-done-emoji">🔢</span>
            <span className="ag-done-xp">+200 XP</span>
            <h2 className="ag-done-title">The Number Engine</h2>
            <p className="ag-done-flavor">The Number Engine runs correctly. The Construct can calculate now. Math is just another law written in Python.</p>
            <div className="ag-done-rewards">
              <span className="ag-done-reward">Calculation Fragment</span>
              <span className="ag-done-reward">Math Badge I</span>
            </div>
            <button className="ag-done-btn" onClick={() => goto('academy/dashboard')}>Builder HQ →</button>
          </div>
        </div>
      )}
    </div>
  )
}

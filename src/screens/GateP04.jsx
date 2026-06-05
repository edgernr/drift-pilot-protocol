import { useState } from 'react'
import './AcademyGate.css'
import { useNav } from '../context/NavigationContext'
import { useAcademy } from '../context/AcademyContext'
import { stripComments } from '../lib/codeUtils'
import GateAIHint from '../components/GateAIHint'

const GATE_ID = 'P-04'
const GATE_XP = 250

const STARTER = `# Loops program
# Tip: Use "for i in range(5):" to loop 5 times

`

const CHECKS = [
  { id: 'c1', label: 'for range loop correct',       hint: 'The citizen IDs aren\'t formatted correctly or the range is wrong. range(1, 11) gives 1 through 10.',                   test: c => /for\s+\w+\s+in\s+range\s*\(/.test(c) },
  { id: 'c2', label: 'enumerate used',               hint: 'The index isn\'t showing with each sector. Use enumerate() to get both index and value: for i, val in enumerate(mylist):', test: c => /enumerate\s*\(/.test(c) },
  { id: 'c3', label: 'break exits loop correctly',   hint: 'The loop continues after finding the corrupted sector. break must be inside the if that detects corruption.',             test: c => /\bbreak\b/.test(c) },
  { id: 'c4', label: 'continue skips correctly',     hint: 'Offline sectors are still being processed. continue must come before the processing code.',                               test: c => /\bcontinue\b/.test(c) },
  { id: 'c5', label: 'Nested loops generate grid',   hint: 'The grid coordinates aren\'t all appearing. Check that the inner loop runs for each iteration of the outer loop.',       test: c => /for\s+\w+[\s\S]{1,200}for\s+\w+/.test(c) },
]

const QUIZ = {
  q: 'In Challenge 3, break exited the loop when the corrupted sector was found. What would have happened without break?',
  opts: [
    'Python would have raised an error — loops must have break to stop searching.',
    'The loop would have continued checking all remaining sectors even after finding the corrupted one.',
    'The loop would have automatically stopped after finding the first match.',
    'The variable would have reset to the first sector and started over.',
  ],
  correct: 1,
}

function Scene({ passCount }) {
  return (
    <div className="ag-scene" style={{ '--ac': 'var(--violet)' }}>
      <span className="ag-scene-label">PYTHON TERMINAL — GATE P-04</span>
      <div className="ag-py-terminal">
        <div className="ag-py-terminal-bar">
          <span className="ag-py-dot" style={{ background: 'var(--magenta)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--amber)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--lime)' }} />
          <span style={{ flex: 1, textAlign: 'center', fontSize: 9, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)' }}>loops.py</span>
        </div>
        <div className="ag-py-output">
          {passCount === 0 && <div className="ag-py-line" style={{ opacity: 0.35 }}>$ python3 loops.py</div>}
          {passCount >= 1 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>for range() found</span></div>}
          {passCount >= 2 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>enumerate() found</span></div>}
          {passCount >= 3 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>break found</span></div>}
          {passCount >= 4 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>continue found</span></div>}
          {passCount >= 5 && <div className="ag-py-line">&gt;&gt;&gt; <span style={{ color: 'var(--amber)' }}>ALL CHECKS PASSED!</span></div>}
        </div>
      </div>
    </div>
  )
}

export default function GateP04() {
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
        <span className="ag-rank-badge" style={{ '--ac': 'var(--violet)' }}>RANK D</span>
        <h1 className="ag-gate-name">The Loop Writer</h1>
        <span className="ag-concept-tag">Loops</span>
        <span className="ag-xp-tag" style={{ color: 'var(--violet)' }}>+250 XP</span>
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
            {running ? '⟳ Running checks…' : allPassed ? '▶ RUN PROGRAM' : `○ ${5 - passCount} check${5 - passCount !== 1 ? 's' : ''} remaining`}
          </button>
          <GateAIHint code={code} checks={checks} gateId={GATE_ID} lang="python" done={done} />
        </div>

        <div className="ag-right">
          <div className="ag-instruction">
            Write a Python program using <strong>five loop techniques</strong>: a <strong>for range()</strong> loop, <strong>enumerate()</strong>, <strong>break</strong> to exit early, <strong>continue</strong> to skip an item, and a <strong>nested loop</strong> (a loop inside a loop).
          </div>
          <div className="ag-py-editor">
            <div className="ag-py-editor-head">🐍 loops.py</div>
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
            <div className="ag-quiz-eyebrow">Knowledge Check — Gate P-04</div>
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
            <span className="ag-done-emoji">🔄</span>
            <span className="ag-done-xp">+250 XP</span>
            <h2 className="ag-done-title">The Loop Writer</h2>
            <p className="ag-done-flavor">Five loops written. Five patterns generated. The Construct's population system runs. Python loops are the heartbeat of the world.</p>
            <div className="ag-done-rewards">
              <span className="ag-done-reward">Loop Fragment</span>
              <span className="ag-done-reward">Loop Badge I</span>
            </div>
            <button className="ag-done-btn" onClick={() => goto('academy/dashboard')}>Builder HQ →</button>
          </div>
        </div>
      )}
    </div>
  )
}

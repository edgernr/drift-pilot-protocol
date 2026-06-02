import { useState } from 'react'
import './AcademyGate.css'
import { useNav } from '../context/NavigationContext'
import { useAcademy } from '../context/AcademyContext'

const GATE_ID = 'S-03'
const GATE_XP = 90

// 3 puzzles: [leftSafe, rightSafe, leftSafe(random)]
const PUZZLES = [
  { id: 'P1', label: 'Puzzle 1', safe: 'left',  desc: 'The left path glows green. The right path has a gap.' },
  { id: 'P2', label: 'Puzzle 2', safe: 'right', desc: 'The right path is safe. The left has a gap.' },
  { id: 'P3', label: 'Puzzle 3 (random)', safe: 'right', desc: 'Safe path is hidden. Your condition must figure it out.' },
]

// Correct answers: IF IS_X_SAFE THEN GO_X ELSE GO_other
const CORRECT = [
  { cond: 'IS_LEFT_SAFE',  then: 'GO_LEFT',  els: 'GO_RIGHT' },
  { cond: 'IS_RIGHT_SAFE', then: 'GO_RIGHT', els: 'GO_LEFT'  },
  { cond: 'IS_RIGHT_SAFE', then: 'GO_RIGHT', els: 'GO_LEFT'  },
]

const COND_OPTS = [
  { value: '',             label: '— choose condition —' },
  { value: 'IS_LEFT_SAFE',  label: 'IS_LEFT_SAFE'  },
  { value: 'IS_RIGHT_SAFE', label: 'IS_RIGHT_SAFE' },
]
const ACTION_OPTS = [
  { value: '',          label: '— choose action —' },
  { value: 'GO_LEFT',   label: 'GO_LEFT'  },
  { value: 'GO_RIGHT',  label: 'GO_RIGHT' },
]

const CHECKS = [
  { id: 'c1', label: 'Puzzle 1 solved correctly', hint: 'Check what the condition checks and which branch follows from a true result.' },
  { id: 'c2', label: 'Puzzle 2 solved correctly', hint: 'The then/else branches might be swapped. True = condition is met.' },
  { id: 'c3', label: 'Puzzle 3 solved correctly', hint: 'The random puzzle tests whether the condition is correct or memorized. Trust the condition block.' },
]

const QUIZ = {
  q: 'In puzzle 3, the safe path was random. But your program still worked without you changing anything. Why?',
  opts: [
    'The computer guessed which path was safe and chose correctly.',
    'The condition block checked which path was actually safe each time and the branches followed correctly.',
    'The program memorized which path was safe from puzzles 1 and 2.',
    'Both paths became safe after puzzles 1 and 2 were solved.',
  ],
  correct: 1,
}

function Scene({ answers, running }) {
  const p3 = answers[2]
  const charPos = running && p3?.cond && p3?.then && p3?.els
    ? (p3.then === 'GO_RIGHT' ? 'moved-right' : 'moved-left')
    : ''
  return (
    <div className={`ag-scene${running ? ' running' : ''}`} style={{ '--ac': 'var(--lime)' }}>
      <span className="ag-scene-label">THE FORK — GATE S-03</span>
      {running && <span className="ag-scene-run-label">RUNNING ▶</span>}
      <div className="ag-s03-base">
        <div className="ag-s03-stem" />
        <div className={`ag-s03-path left${running ? ' safe' : ''}`} />
        <div className={`ag-s03-path right${running ? ' safe' : ''}`} />
        <div className={`ag-s03-char${charPos ? ` ${charPos}` : ''}`} />
        <span className="ag-s03-label lbl-l">LEFT</span>
        <span className="ag-s03-label lbl-r">RIGHT</span>
      </div>
    </div>
  )
}

function PuzzleRow({ puzzle, idx, ans, onChange, solved }) {
  return (
    <div className={`ag-puzzle${solved ? ' solved' : ''}`}>
      <div className="ag-puzzle-head">
        <span className="ag-puzzle-id">{puzzle.label}</span>
        <span className="ag-puzzle-status">{solved ? '✓ SOLVED' : ''}</span>
      </div>
      <p style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-2)', marginBottom: 12, lineHeight: 1.5 }}>{puzzle.desc}</p>
      <div className="ag-puzzle-row" style={{ marginBottom: 8 }}>
        <span className="ag-puzzle-kw">IF</span>
        <select className="ag-puzzle-select" value={ans.cond} onChange={e => onChange({ ...ans, cond: e.target.value })}>
          {COND_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      <div className="ag-puzzle-row" style={{ marginBottom: 8 }}>
        <span className="ag-puzzle-kw">THEN</span>
        <select className="ag-puzzle-select" value={ans.then} onChange={e => onChange({ ...ans, then: e.target.value })}>
          {ACTION_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      <div className="ag-puzzle-row">
        <span className="ag-puzzle-kw">ELSE</span>
        <select className="ag-puzzle-select" value={ans.els} onChange={e => onChange({ ...ans, els: e.target.value })}>
          {ACTION_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    </div>
  )
}

export default function GateS03() {
  const { goto } = useNav()
  const { activeChild, completeAcademyGate } = useAcademy()
  const [answers, setAnswers] = useState([
    { cond: '', then: '', els: '' },
    { cond: '', then: '', els: '' },
    { cond: '', then: '', els: '' },
  ])
  const [running, setRunning] = useState(false)
  const [quizOpen, setQuizOpen] = useState(false)
  const [quizOrder, setQuizOrder] = useState(null)
  const [quizWrong, setQuizWrong] = useState(false)
  const [done, setDone] = useState(false)

  function isSolved(idx) {
    const a = answers[idx]; const c = CORRECT[idx]
    return a.cond === c.cond && a.then === c.then && a.els === c.els
  }

  const checks = CHECKS.map((c, i) => ({ ...c, passed: isSolved(i) }))
  const allPassed = checks.every(c => c.passed)

  function updateAnswer(idx, val) {
    setAnswers(prev => prev.map((a, i) => i === idx ? val : a))
  }

  async function handleRun() {
    if (!allPassed || running) return
    setRunning(true)
    await new Promise(r => setTimeout(r, 1300))
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
        <h1 className="ag-gate-name">The Decision Point</h1>
        <span className="ag-concept-tag">Conditionals</span>
        <span className="ag-xp-tag">+90 XP</span>
      </div>

      <div className="ag-body">
        <div className="ag-left">
          <Scene answers={answers} running={running} />
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
            {running ? '⟳ Running…' : allPassed ? '▶ RUN ALL PUZZLES' : '○ Solve all 3 puzzles first'}
          </button>
        </div>

        <div className="ag-right">
          <div className="ag-instruction">
            There is a fork in the Construct. One path is safe (<strong>green</strong>), one has a gap. Build an <strong>IF/THEN/ELSE</strong> block for each puzzle. The condition checks which path is safe — then the character follows the correct branch. Solve all 3.
          </div>
          <div className="ag-puzzles">
            {PUZZLES.map((p, i) => (
              <PuzzleRow
                key={p.id} puzzle={p} idx={i}
                ans={answers[i]} onChange={v => updateAnswer(i, v)}
                solved={isSolved(i)}
              />
            ))}
          </div>
        </div>
      </div>

      {quizOpen && (
        <div className="ag-quiz-bd">
          <div className={`ag-quiz-card${quizWrong ? ' wrong' : ''}`}>
            <div className="ag-quiz-eyebrow">Knowledge Check — Gate S-03</div>
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
            <span className="ag-done-emoji">🔀</span>
            <span className="ag-done-xp">+90 XP</span>
            <h2 className="ag-done-title">The Decision Point</h2>
            <p className="ag-done-flavor">The Decision Point clears. The Construct can now choose its own path based on what's true.</p>
            <div className="ag-done-rewards">
              <span className="ag-done-reward">Decision Fragment</span>
              <span className="ag-done-reward">Branch Badge I</span>
            </div>
            <button className="ag-done-btn" onClick={() => goto('academy/dashboard')}>Builder HQ →</button>
          </div>
        </div>
      )}
    </div>
  )
}

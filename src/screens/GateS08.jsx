import { useState } from 'react'
import './AcademyGate.css'
import { useNav } from '../context/NavigationContext'
import { useAcademy } from '../context/AcademyContext'
import BlockCanvas from '../components/BlockCanvas'

const GATE_ID = 'S-08'
const GATE_XP = 150

const PALETTE = [
  { id: 'SET_COUNTER_10', label: 'SET COUNTER TO 10', icon: '🔟', color: 'var(--teal)',   count: 1 },
  { id: 'CHANGE_BY_NEG1', label: 'CHANGE BY -1',      icon: '▼',  color: 'var(--amber)',  count: 1 },
  { id: 'UNTIL_ZERO',     label: 'UNTIL COUNTER = 0', icon: '🛑', color: 'var(--lime)',   count: 1 },
]
const SLOTS = [
  { label: 'Initialize:',       placeholder: 'Set the starting value' },
  { label: 'Change each loop:', placeholder: 'What changes every iteration?' },
  { label: 'Exit when:',        placeholder: 'When should the loop stop?' },
]
const CORRECT = ['SET_COUNTER_10', 'CHANGE_BY_NEG1', 'UNTIL_ZERO']

const CHECKS = [
  { id: 'c1', label: 'Counter initialized at 10',   hint: 'Place SET COUNTER TO 10 in the Initialize slot — it starts the countdown.' },
  { id: 'c2', label: 'Counter decreases each loop', hint: 'Place CHANGE BY -1 in the "Change each loop" slot — it ticks down each cycle.' },
  { id: 'c3', label: 'Loop exits at zero',           hint: 'Place UNTIL COUNTER = 0 in the "Exit when" slot — the loop stops when counter hits zero.' },
]

const QUIZ = {
  q: 'REPEAT 10 TIMES and REPEAT UNTIL COUNTER = 0 both run 10 times in this program. When would REPEAT UNTIL be more useful than REPEAT N TIMES?',
  opts: [
    'When you want the loop to run exactly 10 times — REPEAT UNTIL is more precise.',
    "When you don't know in advance how many times the loop should run — it stops based on a condition, not a fixed count.",
    'REPEAT UNTIL is always better — REPEAT N TIMES is an older, slower approach.',
    'When the loop needs to run very fast — UNTIL loops skip unnecessary iterations.',
  ],
  correct: 1,
}

function Scene({ passCount, running }) {
  const labels = ['∞', '10', '↓', '0']
  const display = running ? '0' : labels[passCount]
  const active = passCount > 0 || running
  return (
    <div className={`ag-scene${running ? ' running' : ''}`} style={{ '--ac': 'var(--teal)' }}>
      <span className="ag-scene-label">COUNTER LOOP — GATE S-08</span>
      {running && <span className="ag-scene-run-label">RUNNING ▶</span>}
      <div className="ag-s08-outer">
        <div className={`ag-s08-ring${active ? ' active' : ''}${running ? ' running' : ''}`}>
          <span className="ag-s08-num">{display}</span>
        </div>
      </div>
      <span className="ag-s08-lbl">COUNTER LOOP</span>
    </div>
  )
}

export default function GateS08() {
  const { goto } = useNav()
  const { activeChild, completeAcademyGate } = useAcademy()
  const [ws, setWs]           = useState(null)
  const [running, setRunning] = useState(false)
  const [quizOpen, setQuizOpen] = useState(false)
  const [quizOrder, setQuizOrder] = useState(null)
  const [quizWrong, setQuizWrong] = useState(false)
  const [done, setDone]       = useState(false)

  const checks = CHECKS.map((c, i) => ({ ...c, passed: ws ? ws[i]?.blockId === CORRECT[i] : false }))
  const allPassed = checks.every(c => c.passed)
  const passCount = checks.filter(c => c.passed).length

  async function handleRun() {
    if (!allPassed || running) return
    setRunning(true)
    await new Promise(r => setTimeout(r, 1400))
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
        <h1 className="ag-gate-name">The Counter Loop</h1>
        <span className="ag-concept-tag">Loop + Counter</span>
        <span className="ag-xp-tag">+150 XP</span>
      </div>

      <div className="ag-body">
        <div className="ag-left">
          <Scene passCount={passCount} running={running} />
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
            {running ? '⟳ Counting down…' : allPassed ? '▶ RUN COUNTER' : `○ Wire ${3 - passCount} more slot${3 - passCount !== 1 ? 's' : ''}`}
          </button>
        </div>

        <div className="ag-right">
          <div className="ag-instruction">
            Build a countdown timer for the Construct. Wire three blocks: <strong>initialize</strong> the counter at 10, <strong>decrease</strong> it each loop cycle, and set an <strong>exit condition</strong> so the loop stops exactly at zero.
          </div>
          <BlockCanvas palette={PALETTE} workspace={SLOTS} onChange={setWs} />
        </div>
      </div>

      {quizOpen && (
        <div className="ag-quiz-bd">
          <div className={`ag-quiz-card${quizWrong ? ' wrong' : ''}`}>
            <div className="ag-quiz-eyebrow">Knowledge Check — Gate S-08</div>
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
            <span className="ag-done-emoji">⏱️</span>
            <span className="ag-done-xp">+150 XP</span>
            <h2 className="ag-done-title">The Counter Loop</h2>
            <p className="ag-done-flavor">The counter counts down clean. The Construct learns to stop when conditions are met, not just when told to stop.</p>
            <div className="ag-done-rewards">
              <span className="ag-done-reward">Counter Fragment</span>
              <span className="ag-done-reward">Loop Badge II</span>
            </div>
            <button className="ag-done-btn" onClick={() => goto('academy/dashboard')}>Builder HQ →</button>
          </div>
        </div>
      )}
    </div>
  )
}

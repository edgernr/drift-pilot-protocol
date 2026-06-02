import { useState } from 'react'
import './AcademyGate.css'
import { useNav } from '../context/NavigationContext'
import { useAcademy } from '../context/AcademyContext'
import BlockCanvas from '../components/BlockCanvas'

const GATE_ID = 'S-04'
const GATE_XP = 100

const PALETTE = [
  { id: 'set_score_0',   label: 'SET SCORE TO 0',   icon: '🔲', color: 'var(--amber)', count: 1 },
  { id: 'change_score',  label: 'CHANGE SCORE BY 1', icon: '➕', color: 'var(--teal)',  count: 1 },
  { id: 'show_score',    label: 'SHOW SCORE',         icon: '👁', color: 'var(--violet)', count: 1 },
  { id: 'if_score_5',    label: 'IF SCORE = 5',       icon: '🏆', color: 'var(--lime)',  count: 1 },
]
const SLOTS = [
  { label: 'Start:',    placeholder: 'Runs when game begins' },
  { label: 'Collect:',  placeholder: 'Runs when block touched' },
  { label: 'Display:',  placeholder: 'Makes score visible' },
  { label: 'Win:',      placeholder: 'Checks for victory' },
]
const CORRECT = ['set_score_0', 'change_score', 'show_score', 'if_score_5']

const CHECKS = [
  { id: 'c1', label: 'Score starts at zero',        hint: 'SET SCORE TO 0 must happen before anything else — put it in the Start slot.' },
  { id: 'c2', label: 'Score increases on collection', hint: 'CHANGE SCORE BY 1 connects to the collection event. Put it in the Collect slot.' },
  { id: 'c3', label: 'Score displayed on screen',   hint: 'The score is changing but nobody can see it. Put SHOW SCORE in the Display slot.' },
  { id: 'c4', label: 'Celebration at score 5',      hint: 'The IF block must check if SCORE equals 5. Put it in the Win slot.' },
]

const QUIZ = {
  q: 'Why did we need to SET SCORE TO 0 at the beginning instead of just starting with the CHANGE block?',
  opts: [
    'The computer needs permission to use a variable before it can change it.',
    'Without setting it first, the computer doesn\'t know what number to add 1 to — it might start from any number.',
    'SET TO 0 makes the variable visible on screen — without it, SCORE is invisible.',
    'The computer automatically sets all variables to 0, so it doesn\'t actually matter.',
  ],
  correct: 1,
}

function Scene({ ws, running }) {
  const passCount = ws ? CORRECT.filter((id, i) => ws[i]?.blockId === id).length : 0
  const score = passCount >= 2 ? Math.min(passCount - 1, 5) : 0
  const celebrating = passCount === 4
  return (
    <div className={`ag-scene${running ? ' running' : ''}`} style={{ '--ac': 'var(--amber)' }}>
      <span className="ag-scene-label">MEMORY BOX — GATE S-04</span>
      {running && <span className="ag-scene-run-label">RUNNING ▶</span>}
      <div className={`ag-s04-box${passCount > 0 ? ' lit' : ''}`}>
        <div className="ag-s04-lbl">SCORE</div>
        <div className={`ag-s04-score${celebrating ? ' celebrating' : ''}`}>{running ? 5 : score}</div>
      </div>
      <div className="ag-s04-dots">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className={`ag-s04-dot${running || i < score ? ' collected' : ''}`} />
        ))}
      </div>
    </div>
  )
}

export default function GateS04() {
  const { goto } = useNav()
  const { activeChild, completeAcademyGate } = useAcademy()
  const [ws, setWs]       = useState(null)
  const [running, setRunning] = useState(false)
  const [quizOpen, setQuizOpen] = useState(false)
  const [quizOrder, setQuizOrder] = useState(null)
  const [quizWrong, setQuizWrong] = useState(false)
  const [done, setDone]   = useState(false)

  const checks = CHECKS.map((c, i) => ({ ...c, passed: ws ? ws[i]?.blockId === CORRECT[i] : false }))
  const allPassed = checks.every(c => c.passed)

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
        <span className="ag-rank-badge" style={{ '--ac': 'var(--amber)' }}>RANK E</span>
        <h1 className="ag-gate-name">The Memory Box</h1>
        <span className="ag-concept-tag">Variables</span>
        <span className="ag-xp-tag">+100 XP</span>
      </div>

      <div className="ag-body">
        <div className="ag-left">
          <Scene ws={ws} running={running} />
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
            {running ? '⟳ Running…' : allPassed ? '▶ RUN GAME' : '○ Wire all 4 blocks first'}
          </button>
        </div>

        <div className="ag-right">
          <div className="ag-instruction">
            Wire up a score counter for a collecting game. <strong>Four blocks</strong> — each goes in the right slot.
            The order matters: initialize before use, display after changing, check after displaying.
          </div>
          <BlockCanvas palette={PALETTE} workspace={SLOTS} onChange={setWs} />
        </div>
      </div>

      {quizOpen && (
        <div className="ag-quiz-bd">
          <div className={`ag-quiz-card${quizWrong ? ' wrong' : ''}`}>
            <div className="ag-quiz-eyebrow">Knowledge Check — Gate S-04</div>
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
            <span className="ag-done-emoji">📦</span>
            <span className="ag-done-xp">+100 XP</span>
            <h2 className="ag-done-title">The Memory Box</h2>
            <p className="ag-done-flavor">The Memory Box activates. The Construct can remember things now. Numbers. States. Everything changes.</p>
            <div className="ag-done-rewards">
              <span className="ag-done-reward">Memory Fragment</span>
              <span className="ag-done-reward">Variable Badge I</span>
            </div>
            <button className="ag-done-btn" onClick={() => goto('academy/dashboard')}>Builder HQ →</button>
          </div>
        </div>
      )}
    </div>
  )
}

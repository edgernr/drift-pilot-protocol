import { useState } from 'react'
import './AcademyGate.css'
import { useNav } from '../context/NavigationContext'
import { useAcademy } from '../context/AcademyContext'
import BlockCanvas from '../components/BlockCanvas'

const GATE_ID = 'S-01'
const GATE_XP = 80

const PALETTE = [
  { id: 'face_right', label: 'face right', icon: '→', color: 'var(--amber)',  count: 1 },
  { id: 'walk',       label: 'walk',        icon: '👣', color: 'var(--teal)',  count: 2 },
  { id: 'pick_up',    label: 'pick up',     icon: '✊', color: 'var(--lime)',  count: 1 },
]
const SLOTS = [
  { placeholder: 'Step 1 — what does the character do first?' },
  { placeholder: 'Step 2 — keep moving…' },
  { placeholder: 'Step 3 — almost there…' },
  { placeholder: 'Step 4 — last action' },
]
const CORRECT = ['face_right', 'walk', 'walk', 'pick_up']

const CHECKS = [
  { id: 'c1', label: 'Character faces right direction',  hint: 'The first block should point the character toward the golden block.' },
  { id: 'c2', label: 'Character walks to the block',      hint: 'Two walk blocks are needed. Check steps 2 and 3.' },
  { id: 'c3', label: 'Character reaches the block',       hint: 'The second walk block goes in step 3.' },
  { id: 'c4', label: 'Character picks up the block',      hint: 'The pick up block comes after the character arrives — not before.' },
]

const QUIZ = {
  q: 'You put the pick-up block at the END of the sequence. What would have happened if you put it first?',
  opts: [
    'Nothing — the computer would have skipped it and done the walking first.',
    'The character would have tried to pick up a block that wasn\'t there yet, then walked to an empty spot.',
    'The computer would have known what you meant and fixed the order itself.',
    'The character would have walked backwards to find the block.',
  ],
  correct: 1,
}

function Scene({ ws, running }) {
  const passed = ws ? CORRECT.every((id, i) => ws[i]?.blockId === id) : false
  return (
    <div className={`ag-scene${running ? ' running' : ''}`} style={{ '--ac': 'var(--amber)' }}>
      <span className="ag-scene-label">THE CONSTRUCT · GATE S-01</span>
      {running && <span className="ag-scene-run-label">RUNNING ▶</span>}
      <div className="ag-s01-floor" />
      <div className={`ag-s01-char${running ? ' running' : ''}`}>
        <div className="ag-s01-head" />
        <div className="ag-s01-body" />
      </div>
      <div className={`ag-s01-goldenblock${running && passed ? ' lifted' : ''}`} />
    </div>
  )
}

export default function GateS01() {
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
        <h1 className="ag-gate-name">The First Block</h1>
        <span className="ag-concept-tag">Sequences</span>
        <span className="ag-xp-tag">+80 XP</span>
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
            {running ? '⟳ Running…' : allPassed ? '▶ RUN SEQUENCE' : '○ Arrange the blocks first'}
          </button>
        </div>

        <div className="ag-right">
          <div className="ag-instruction">
            A character stands on the left. A <strong>golden block</strong> waits on the right.
            Arrange the 4 blocks in the correct order to make the character walk to the block and pick it up.
            <br /><br />
            Click a block in the panel on the right, then click a slot to place it. Wrong order = wrong result.
          </div>
          <BlockCanvas palette={PALETTE} workspace={SLOTS} onChange={setWs} />
        </div>
      </div>

      {quizOpen && (
        <div className="ag-quiz-bd">
          <div className={`ag-quiz-card${quizWrong ? ' wrong' : ''}`}>
            <div className="ag-quiz-eyebrow">Knowledge Check — Gate S-01</div>
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
            <span className="ag-done-emoji">🟡</span>
            <span className="ag-done-xp">+80 XP</span>
            <h2 className="ag-done-title">The First Block</h2>
            <p className="ag-done-flavor">The first block is placed. The Construct remembers it forever.</p>
            <div className="ag-done-rewards">
              <span className="ag-done-reward">First Block</span>
              <span className="ag-done-reward">Builder Badge I</span>
            </div>
            <button className="ag-done-btn" onClick={() => goto('academy/dashboard')}>Builder HQ →</button>
          </div>
        </div>
      )}
    </div>
  )
}

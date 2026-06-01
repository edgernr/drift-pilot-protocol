import { useState } from 'react'
import './AcademyGate.css'
import { useNav } from '../context/NavigationContext'
import { useAcademy } from '../context/AcademyContext'
import BlockCanvas from '../components/BlockCanvas'

const GATE_ID = 'S-14'
const GATE_XP = 250

const PALETTE = [
  { id: 'WHEN_FLAG',        label: 'WHEN FLAG CLICKED',   icon: '🚩', color: 'var(--lime)',   count: 1 },
  { id: 'CREATE_CLONE',     label: 'CREATE CLONE',         icon: '⊕',  color: 'var(--teal)',   count: 1 },
  { id: 'WHEN_CLONE_STARTS',label: 'WHEN CLONE STARTS',   icon: '◈',  color: 'var(--amber)',  count: 1 },
  { id: 'SET_RANDOM_POS',   label: 'GO TO RANDOM POSITION',icon: '🎲', color: 'var(--violet)', count: 1 },
]
const SLOTS = [
  { label: 'Create trigger:',     placeholder: 'When does cloning begin?' },
  { label: 'Clone command:',      placeholder: 'How do you make a clone?' },
  { label: 'Clone start event:',  placeholder: 'What runs when a clone appears?' },
  { label: 'Clone behaviour:',    placeholder: 'Where does each clone go?' },
]
const CORRECT = ['WHEN_FLAG', 'CREATE_CLONE', 'WHEN_CLONE_STARTS', 'SET_RANDOM_POS']

const CHECKS = [
  { id: 'c1', label: 'Clone trigger set',       hint: 'Put WHEN FLAG CLICKED in slot 1 — cloning starts when the game begins.' },
  { id: 'c2', label: 'Create clone wired',       hint: 'Put CREATE CLONE in slot 2 — this spawns a new copy of the sprite.' },
  { id: 'c3', label: 'Clone start event set',    hint: 'Put WHEN CLONE STARTS in slot 3 — each clone runs this code independently.' },
  { id: 'c4', label: 'Random position set',      hint: 'Put GO TO RANDOM POSITION in slot 4 — each clone appears in a different spot.' },
]

const QUIZ = {
  q: 'What makes clones different from just drawing the same sprite four times on the screen?',
  opts: [
    'Clones look different from the original sprite — they change colour automatically.',
    'Each clone is an independent copy that runs its own code — they behave on their own, not all at once.',
    'Clones are faster than regular sprites because they share memory.',
    'Clones are only for decoration — they cannot do anything.',
  ],
  correct: 1,
}

function Scene({ passCount, running }) {
  return (
    <div className={`ag-scene${running ? ' running' : ''}`} style={{ '--ac': 'var(--lime)' }}>
      <span className="ag-scene-label">CLONE FACTORY — GATE S-14</span>
      {running && <span className="ag-scene-run-label">CLONING ▶</span>}
      <div className="ag-s14-stage">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className={`ag-s14-clone${(running || passCount > i) ? ' spawned' : ''}`}
            style={{ transitionDelay: `${i * 0.12}s` }}
          >
            <div className="ag-s14-clone-head" />
            <div className="ag-s14-clone-body" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function GateS14() {
  const { goto } = useNav()
  const { activeChild, completeAcademyGate } = useAcademy()
  const [ws, setWs]             = useState(null)
  const [running, setRunning]   = useState(false)
  const [quizOpen, setQuizOpen] = useState(false)
  const [quizOrder, setQuizOrder] = useState(null)
  const [quizWrong, setQuizWrong] = useState(false)
  const [done, setDone]         = useState(false)

  const checks   = CHECKS.map((c, i) => ({ ...c, passed: ws ? ws[i]?.blockId === CORRECT[i] : false }))
  const allPassed = checks.every(c => c.passed)
  const passCount = checks.filter(c => c.passed).length

  async function handleRun() {
    if (!allPassed || running) return
    setRunning(true)
    await new Promise(r => setTimeout(r, 1600))
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
        <span className="ag-rank-badge" style={{ '--ac': 'var(--lime)' }}>RANK B</span>
        <h1 className="ag-gate-name">The Clone Factory</h1>
        <span className="ag-concept-tag">Clones</span>
        <span className="ag-xp-tag" style={{ color: 'var(--lime)' }}>+250 XP</span>
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
            className="ag-run-btn" style={{ '--ac': 'var(--lime)' }}
            onClick={handleRun} disabled={!allPassed || running}
          >
            {running ? '⟳ Cloning sprites…' : allPassed ? '▶ BUILD THE FACTORY' : `○ Add ${4 - passCount} more block${4 - passCount !== 1 ? 's' : ''}`}
          </button>
        </div>

        <div className="ag-right">
          <div className="ag-instruction">
            Build a <strong>clone factory</strong> — use two scripts. The first script runs when the flag is clicked and calls CREATE CLONE. The second script uses WHEN CLONE STARTS to give each clone its own random position. One original sprite, infinite copies.
          </div>
          <BlockCanvas palette={PALETTE} workspace={SLOTS} onChange={setWs} />
        </div>
      </div>

      {quizOpen && (
        <div className="ag-quiz-bd">
          <div className={`ag-quiz-card${quizWrong ? ' wrong' : ''}`}>
            <div className="ag-quiz-eyebrow">Knowledge Check — Gate S-14</div>
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
            <span className="ag-done-emoji">🏭</span>
            <span className="ag-done-xp">+250 XP</span>
            <h2 className="ag-done-title">The Clone Factory</h2>
            <p className="ag-done-flavor">One sprite became many. Each clone acts on its own. The factory is running. This is how games fill their worlds.</p>
            <div className="ag-done-rewards">
              <span className="ag-done-reward">Clone Master</span>
              <span className="ag-done-reward">Factory Badge</span>
            </div>
            <button className="ag-done-btn" onClick={() => goto('academy/dashboard')}>Builder HQ →</button>
          </div>
        </div>
      )}
    </div>
  )
}

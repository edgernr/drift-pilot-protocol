import { useState } from 'react'
import './AcademyGate.css'
import { useNav } from '../context/NavigationContext'
import { useAcademy } from '../context/AcademyContext'
import BlockCanvas from '../components/BlockCanvas'

const GATE_ID = 'S-05'
const GATE_XP = 100

// 6 slots: 3 event blocks + 3 action blocks paired
const PALETTE = [
  { id: 'when_flag',   label: 'WHEN FLAG CLICKED',  icon: '🚩', color: 'var(--amber)',  count: 1 },
  { id: 'when_space',  label: 'WHEN SPACE PRESSED',  icon: '⌨️', color: 'var(--teal)',  count: 1 },
  { id: 'when_touch',  label: 'WHEN BLOCK TOUCHED',  icon: '👆', color: 'var(--violet)',count: 1 },
  { id: 'setup_game',  label: 'setup game',           icon: '▶', color: 'var(--amber)', count: 1 },
  { id: 'jump',        label: 'jump',                 icon: '⬆', color: 'var(--teal)',  count: 1 },
  { id: 'change_score',label: 'change score',         icon: '➕', color: 'var(--violet)',count: 1 },
]
const SLOTS = [
  { label: 'Event 1:', placeholder: 'What triggers the game start?' },
  { label: 'Action 1:', placeholder: 'What happens when triggered?' },
  { label: 'Event 2:', placeholder: 'What triggers the jump?' },
  { label: 'Action 2:', placeholder: 'What happens on that event?' },
  { label: 'Event 3:', placeholder: 'What triggers score change?' },
  { label: 'Action 3:', placeholder: 'What happens when collecting?' },
]
const CORRECT = ['when_flag', 'setup_game', 'when_space', 'jump', 'when_touch', 'change_score']

const CHECKS = [
  { id: 'c1', label: 'Start event wired',       hint: 'WHEN FLAG CLICKED connects to setup_game. Put them in Event 1 and Action 1.' },
  { id: 'c2', label: 'Jump event wired',         hint: 'WHEN SPACE PRESSED connects to jump. Slots Event 2 and Action 2.' },
  { id: 'c3', label: 'Collection event wired',   hint: 'WHEN BLOCK TOUCHED connects to change score. Slots Event 3 and Action 3.' },
]

const QUIZ = {
  q: 'The jump event and the collection event both work at the same time. If they were in a sequence instead, what would happen?',
  opts: [
    'They would both still work — sequences and events do the same thing.',
    'The character could only jump OR collect, not both — the sequence would wait for one to finish before starting the other.',
    'The sequence would be faster because it doesn\'t have to wait for events.',
    'The character would jump and collect simultaneously because sequences run all at once.',
  ],
  correct: 1,
}

function Scene({ ws, running }) {
  const c1 = ws ? ws[0]?.blockId === 'when_flag'  && ws[1]?.blockId === 'setup_game'   : false
  const c2 = ws ? ws[2]?.blockId === 'when_space' && ws[3]?.blockId === 'jump'          : false
  const c3 = ws ? ws[4]?.blockId === 'when_touch' && ws[5]?.blockId === 'change_score'  : false
  return (
    <div className={`ag-scene${running ? ' running' : ''}`} style={{ '--ac': 'var(--amber)' }}>
      <span className="ag-scene-label">EVENT TOWER — GATE S-05</span>
      {running && <span className="ag-scene-run-label">RUNNING ▶</span>}
      <div className="ag-s05-tower-base">
        <div className="ag-s05-mast" />
        <div className={`ag-s05-arm${c1 || running ? ' active' : ''}`}><div className="ag-s05-node" /></div>
        <div className={`ag-s05-arm${c2 || running ? ' active' : ''}`}><div className="ag-s05-node" /></div>
        <div className={`ag-s05-arm${c3 || running ? ' active' : ''}`}><div className="ag-s05-node" /></div>
      </div>
    </div>
  )
}

export default function GateS05() {
  const { goto } = useNav()
  const { activeChild, completeAcademyGate } = useAcademy()
  const [ws, setWs]       = useState(null)
  const [running, setRunning] = useState(false)
  const [quizOpen, setQuizOpen] = useState(false)
  const [quizOrder, setQuizOrder] = useState(null)
  const [quizWrong, setQuizWrong] = useState(false)
  const [done, setDone]   = useState(false)

  // Each check: event + action pair correct
  const checkPassed = [
    ws ? ws[0]?.blockId === 'when_flag'  && ws[1]?.blockId === 'setup_game'  : false,
    ws ? ws[2]?.blockId === 'when_space' && ws[3]?.blockId === 'jump'         : false,
    ws ? ws[4]?.blockId === 'when_touch' && ws[5]?.blockId === 'change_score' : false,
  ]
  const checks = CHECKS.map((c, i) => ({ ...c, passed: checkPassed[i] }))
  const allPassed = checks.every(c => c.passed)

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
        <span className="ag-rank-badge" style={{ '--ac': 'var(--amber)' }}>RANK D</span>
        <h1 className="ag-gate-name">The Event Tower</h1>
        <span className="ag-concept-tag">Events</span>
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
            {running ? '⟳ Running…' : allPassed ? '▶ FIRE ALL EVENTS' : '○ Wire all 3 events first'}
          </button>
        </div>

        <div className="ag-right">
          <div className="ag-instruction">
            Wire the Construct's event system. Each event needs a <strong>trigger</strong> (WHEN something) paired with an <strong>action</strong> (what happens). Events run independently — they don't wait for each other.
          </div>
          <BlockCanvas palette={PALETTE} workspace={SLOTS} onChange={setWs} />
        </div>
      </div>

      {quizOpen && (
        <div className="ag-quiz-bd">
          <div className={`ag-quiz-card${quizWrong ? ' wrong' : ''}`}>
            <div className="ag-quiz-eyebrow">Knowledge Check — Gate S-05</div>
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
            <span className="ag-done-emoji">📡</span>
            <span className="ag-done-xp">+100 XP</span>
            <h2 className="ag-done-title">The Event Tower</h2>
            <p className="ag-done-flavor">The Event Tower activates. The Construct listens now. It responds to what happens, not just what's planned.</p>
            <div className="ag-done-rewards">
              <span className="ag-done-reward">Event Fragment</span>
              <span className="ag-done-reward">Event Badge I</span>
            </div>
            <button className="ag-done-btn" onClick={() => goto('academy/dashboard')}>Builder HQ →</button>
          </div>
        </div>
      )}
    </div>
  )
}

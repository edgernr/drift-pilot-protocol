import { useState } from 'react'
import './AcademyGate.css'
import { useNav } from '../context/NavigationContext'
import { useAcademy } from '../context/AcademyContext'
import BlockCanvas from '../components/BlockCanvas'

const GATE_ID = 'S-09'
const GATE_XP = 165

const PALETTE = [
  { id: 'WHEN_FLAG',       label: 'WHEN FLAG CLICKED',    icon: '🚩', color: 'var(--amber)',   count: 1 },
  { id: 'BROADCAST_READY', label: 'BROADCAST READY',      icon: '📡', color: 'var(--teal)',    count: 1 },
  { id: 'RECEIVE_READY',   label: 'WHEN I RECEIVE READY', icon: '📻', color: 'var(--teal)',    count: 1 },
  { id: 'BROADCAST_DONE',  label: 'BROADCAST DONE',       icon: '✅', color: 'var(--lime)',    count: 1 },
  { id: 'RECEIVE_DONE',    label: 'WHEN I RECEIVE DONE',  icon: '🎯', color: 'var(--lime)',    count: 1 },
  { id: 'CELEBRATE',       label: 'CELEBRATE',             icon: '🎉', color: 'var(--magenta)', count: 1 },
]
const SLOTS = [
  { label: 'Guide (event):',   placeholder: 'What triggers Guide?' },
  { label: 'Guide (action):',  placeholder: 'What does Guide broadcast?' },
  { label: 'Builder (event):',  placeholder: 'What does Builder listen for?' },
  { label: 'Builder (action):', placeholder: 'What does Builder broadcast?' },
  { label: 'Celebr. (event):',  placeholder: 'What does Celebration listen for?' },
  { label: 'Celebr. (action):', placeholder: 'What does Celebration do?' },
]
const CORRECT = ['WHEN_FLAG', 'BROADCAST_READY', 'RECEIVE_READY', 'BROADCAST_DONE', 'RECEIVE_DONE', 'CELEBRATE']

const CHECKS = [
  { id: 'c1', label: 'Guide broadcasts READY',      hint: "Guide's event: WHEN FLAG CLICKED. Guide's action: BROADCAST READY." },
  { id: 'c2', label: 'Builder receives and passes', hint: "Builder listens with WHEN I RECEIVE READY, then sends BROADCAST DONE." },
  { id: 'c3', label: 'Celebration receives DONE',   hint: 'Celebration listens with WHEN I RECEIVE DONE, then responds with CELEBRATE.' },
]

const QUIZ = {
  q: "Why does each sprite have its own separate script instead of one big script controlling all of them?",
  opts: [
    'The computer can only read one script at a time, so separate scripts run faster.',
    "Each sprite is independent — it has its own behavior and responds to messages in its own way. One script controlling everything would make them dependent.",
    "Separate scripts are required by the rules — you're not allowed to control two sprites from one script.",
    "Separate scripts use less memory because they don't share variables.",
  ],
  correct: 1,
}

function Scene({ ws, running }) {
  const c1 = ws ? ws[0]?.blockId === 'WHEN_FLAG'      && ws[1]?.blockId === 'BROADCAST_READY' : false
  const c2 = ws ? ws[2]?.blockId === 'RECEIVE_READY'  && ws[3]?.blockId === 'BROADCAST_DONE'  : false
  const c3 = ws ? ws[4]?.blockId === 'RECEIVE_DONE'   && ws[5]?.blockId === 'CELEBRATE'       : false
  return (
    <div className={`ag-scene${running ? ' running' : ''}`} style={{ '--ac': 'var(--teal)' }}>
      <span className="ag-scene-label">MULTI-SPRITE — GATE S-09</span>
      {running && <span className="ag-scene-run-label">RUNNING ▶</span>}
      <div className="ag-s09-stage">
        <div className="ag-s09-sprite">
          <div className={`ag-s09-shead${c1 || running ? ' active' : ''}`} />
          <div className={`ag-s09-sbody${c1 || running ? ' active' : ''}`} />
          <span className="ag-s09-sname">GUIDE</span>
        </div>
        <div className="ag-s09-sprite">
          <div className={`ag-s09-shead${c2 || running ? ' active' : ''}`} />
          <div className={`ag-s09-sbody${c2 || running ? ' active' : ''}`} />
          <span className="ag-s09-sname">BUILDER</span>
        </div>
        <div className="ag-s09-sprite">
          <div className={`ag-s09-shead${c3 || running ? ' active' : ''}`} />
          <div className={`ag-s09-sbody${c3 || running ? ' active' : ''}`} />
          <span className="ag-s09-sname">CELEBR.</span>
        </div>
      </div>
      <div className={`ag-s09-wave w1${(c1 && c2) || running ? ' active' : ''}`} />
      <div className={`ag-s09-wave w2${(c2 && c3) || running ? ' active' : ''}`} />
    </div>
  )
}

export default function GateS09() {
  const { goto } = useNav()
  const { activeChild, completeAcademyGate } = useAcademy()
  const [ws, setWs]           = useState(null)
  const [running, setRunning] = useState(false)
  const [quizOpen, setQuizOpen] = useState(false)
  const [quizOrder, setQuizOrder] = useState(null)
  const [quizWrong, setQuizWrong] = useState(false)
  const [done, setDone]       = useState(false)

  const checkPassed = [
    ws ? ws[0]?.blockId === 'WHEN_FLAG'     && ws[1]?.blockId === 'BROADCAST_READY' : false,
    ws ? ws[2]?.blockId === 'RECEIVE_READY' && ws[3]?.blockId === 'BROADCAST_DONE'  : false,
    ws ? ws[4]?.blockId === 'RECEIVE_DONE'  && ws[5]?.blockId === 'CELEBRATE'       : false,
  ]
  const checks = CHECKS.map((c, i) => ({ ...c, passed: checkPassed[i] }))
  const allPassed = checks.every(c => c.passed)
  const passCount = checkPassed.filter(Boolean).length

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
        <span className="ag-rank-badge" style={{ '--ac': 'var(--teal)' }}>RANK C</span>
        <h1 className="ag-gate-name">The Multi-Sprite World</h1>
        <span className="ag-concept-tag">Multiple Sprites</span>
        <span className="ag-xp-tag">+165 XP</span>
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
            className="ag-run-btn" style={{ '--ac': 'var(--teal)' }}
            onClick={handleRun} disabled={!allPassed || running}
          >
            {running ? '⟳ Broadcasting…' : allPassed ? '▶ COORDINATE SPRITES' : `○ Wire ${3 - passCount} more sprite${3 - passCount !== 1 ? 's' : ''}`}
          </button>
        </div>

        <div className="ag-right">
          <div className="ag-instruction">
            Wire three sprites to work together through <strong>broadcasts</strong>. Each sprite has two slots: a trigger (event) and an action. The Guide starts, passes a message to the Builder, who passes it to the Celebration. Assign the correct blocks to each sprite.
          </div>
          <BlockCanvas palette={PALETTE} workspace={SLOTS} onChange={setWs} />
        </div>
      </div>

      {quizOpen && (
        <div className="ag-quiz-bd">
          <div className={`ag-quiz-card${quizWrong ? ' wrong' : ''}`}>
            <div className="ag-quiz-eyebrow">Knowledge Check — Gate S-09</div>
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
            <span className="ag-done-emoji">🤝</span>
            <span className="ag-done-xp">+165 XP</span>
            <h2 className="ag-done-title">The Multi-Sprite World</h2>
            <p className="ag-done-flavor">Three sprites. Three scripts. One coordinated world. The Construct learns that independent things can work together.</p>
            <div className="ag-done-rewards">
              <span className="ag-done-reward">Message Fragment</span>
              <span className="ag-done-reward">Coordination Badge I</span>
            </div>
            <button className="ag-done-btn" onClick={() => goto('academy/dashboard')}>Builder HQ →</button>
          </div>
        </div>
      )}
    </div>
  )
}

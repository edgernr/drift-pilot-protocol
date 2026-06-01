import { useState } from 'react'
import './AcademyGate.css'
import { useNav } from '../context/NavigationContext'
import { useAcademy } from '../context/AcademyContext'
import BlockCanvas from '../components/BlockCanvas'

const GATE_ID = 'S-12'
const GATE_XP = 200

const PALETTE = [
  { id: 'WHEN_FLAG',      label: 'WHEN FLAG CLICKED', icon: '🚩', color: 'var(--violet)', count: 1 },
  { id: 'REPEAT_FOREVER', label: 'REPEAT FOREVER',    icon: '∞',  color: 'var(--teal)',   count: 1 },
  { id: 'SWITCH_COSTUME', label: 'SWITCH COSTUME',    icon: '🎭', color: 'var(--lime)',   count: 1 },
  { id: 'WAIT_SECS',      label: 'WAIT 0.2 SECS',     icon: '⏱', color: 'var(--amber)',  count: 1 },
]
const SLOTS = [
  { label: 'Start trigger:',  placeholder: 'When does animation start?' },
  { label: 'Outer loop:',     placeholder: 'How does it keep going?' },
  { label: 'Frame change:',   placeholder: 'How does it switch frames?' },
  { label: 'Frame delay:',    placeholder: 'How long between frames?' },
]
const CORRECT = ['WHEN_FLAG', 'REPEAT_FOREVER', 'SWITCH_COSTUME', 'WAIT_SECS']

const CHECKS = [
  { id: 'c1', label: 'Animation starts on flag',  hint: 'Put WHEN FLAG CLICKED in slot 1 — that\'s when the animation begins.' },
  { id: 'c2', label: 'Forever loop running',      hint: 'Put REPEAT FOREVER in slot 2 — animation keeps cycling non-stop.' },
  { id: 'c3', label: 'Costume switching',         hint: 'Put SWITCH COSTUME in slot 3 — this changes the animation frame.' },
  { id: 'c4', label: 'Frame delay set',           hint: 'Put WAIT 0.2 SECS in slot 4 — controls how fast the animation plays.' },
]

const QUIZ = {
  q: 'A sprite animates by switching costumes. What happens if you remove the WAIT block from inside the loop?',
  opts: [
    'The animation stops completely — WAIT is required to start it.',
    'The costumes switch so fast you cannot see them — the animation becomes invisible.',
    'The sprite plays the animation once and then stops.',
    'Nothing changes — WAIT has no effect on animation speed.',
  ],
  correct: 1,
}

function Scene({ passCount, running }) {
  return (
    <div className={`ag-scene${running ? ' running' : ''}`} style={{ '--ac': 'var(--violet)' }}>
      <span className="ag-scene-label">ANIMATION STUDIO — GATE S-12</span>
      {running && <span className="ag-scene-run-label">RUNNING ▶</span>}
      <div className="ag-s12-stage">
        <div className={`ag-s12-sprite${running ? ' ag-s12-animate' : ''}`} />
        <div className="ag-s12-frames">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={`ag-s12-frame${i < passCount ? ' lit' : ''}`} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function GateS12() {
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
        <span className="ag-rank-badge" style={{ '--ac': 'var(--violet)' }}>RANK C</span>
        <h1 className="ag-gate-name">The Animation Studio</h1>
        <span className="ag-concept-tag">Animation</span>
        <span className="ag-xp-tag" style={{ color: 'var(--violet)' }}>+200 XP</span>
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
            className="ag-run-btn" style={{ '--ac': 'var(--violet)' }}
            onClick={handleRun} disabled={!allPassed || running}
          >
            {running ? '⟳ Animating…' : allPassed ? '▶ RUN ANIMATION' : `○ Add ${4 - passCount} more block${4 - passCount !== 1 ? 's' : ''}`}
          </button>
        </div>

        <div className="ag-right">
          <div className="ag-instruction">
            Build an <strong>animation loop</strong> — trigger it with the flag, loop forever, switch costumes on each cycle, and add a short wait between frames. Four blocks in the right order make any sprite come alive.
          </div>
          <BlockCanvas palette={PALETTE} workspace={SLOTS} onChange={setWs} />
        </div>
      </div>

      {quizOpen && (
        <div className="ag-quiz-bd">
          <div className={`ag-quiz-card${quizWrong ? ' wrong' : ''}`}>
            <div className="ag-quiz-eyebrow">Knowledge Check — Gate S-12</div>
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
            <span className="ag-done-emoji">🎬</span>
            <span className="ag-done-xp">+200 XP</span>
            <h2 className="ag-done-title">The Animation Studio</h2>
            <p className="ag-done-flavor">Frame by frame, your sprite comes alive. Cartoons, games, films — all animation works this way. One image at a time. Very fast.</p>
            <div className="ag-done-rewards">
              <span className="ag-done-reward">Animation Badge</span>
              <span className="ag-done-reward">Frame Artist</span>
            </div>
            <button className="ag-done-btn" onClick={() => goto('academy/dashboard')}>Builder HQ →</button>
          </div>
        </div>
      )}
    </div>
  )
}

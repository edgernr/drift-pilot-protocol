import { useState } from 'react'
import './AcademyGate.css'
import { useNav } from '../context/NavigationContext'
import { useAcademy } from '../context/AcademyContext'
import BlockCanvas from '../components/BlockCanvas'

const GATE_ID = 'S-07'
const GATE_XP = 180

const PAL_P1 = [
  { id: 'build_wall',  label: 'build wall',  icon: '🧱', color: 'var(--violet)', count: 1 },
  { id: 'add_floor',   label: 'add floor',   icon: '⬛', color: 'var(--teal)',   count: 1 },
  { id: 'place_door',  label: 'place door',  icon: '🚪', color: 'var(--amber)',  count: 1 },
  { id: 'add_window',  label: 'add window',  icon: '🔳', color: 'var(--lime)',   count: 1 },
  { id: 'paint_room',  label: 'paint room',  icon: '🎨', color: 'var(--magenta)',count: 1 },
]
const SLOTS_P1 = [
  { label: 'Step 1:', placeholder: 'Start with the structure' },
  { label: 'Step 2:', placeholder: 'Add the foundation' },
  { label: 'Step 3:', placeholder: 'Add an entry point' },
  { label: 'Step 4:', placeholder: 'Let in some light' },
  { label: 'Step 5:', placeholder: 'Finish the room' },
]
const CORRECT_P1 = ['build_wall', 'add_floor', 'place_door', 'add_window', 'paint_room']

const PAL_P2 = [
  { id: 'call_build_room', label: 'BUILD_ROOM', icon: '⚙️', color: 'var(--violet)', count: 3 },
]
const SLOTS_P2 = [
  { label: 'Room 1:', placeholder: 'Call the function' },
  { label: 'Room 2:', placeholder: 'Call it again' },
  { label: 'Room 3:', placeholder: 'One more call' },
]
const CORRECT_P2 = ['call_build_room', 'call_build_room', 'call_build_room']

const CHECKS = [
  { id: 'c1', label: 'BUILD_ROOM function defined (5 actions)', hint: 'Fill all 5 steps — build_wall → add_floor → place_door → add_window → paint_room.' },
  { id: 'c2', label: 'BUILD_ROOM called three times',           hint: 'In Phase 2, place a BUILD_ROOM call in all 3 room slots.' },
]

const QUIZ = {
  q: 'If you needed to change how rooms are built — adding a roof to each one — how many places would you need to change in the function version vs the repeated version?',
  opts: [
    'The same number — you always have to change every copy.',
    'Function version: 1 place (inside the function). Repeated version: 3 places (each copy).',
    'Function version: 3 places (each call). Repeated version: 1 place (the first copy).',
    'Neither — the computer updates all copies automatically.',
  ],
  correct: 1,
}

function Scene({ p1Done, p2Done, running }) {
  return (
    <div className={`ag-scene${running ? ' running' : ''}`} style={{ '--ac': 'var(--violet)' }}>
      <span className="ag-scene-label">FUNCTION MACHINE — GATE S-07</span>
      {running && <span className="ag-scene-run-label">RUNNING ▶</span>}
      <div className="ag-s07-groups" style={{ opacity: p2Done || running ? 0 : 1, transition: 'opacity 0.4s', pointerEvents: 'none' }}>
        {[0, 1, 2].map(g => (
          <div key={g} className="ag-s07-group">
            {[0, 1, 2, 3, 4].map(b => (
              <div key={b} className={`ag-s07-fblock${p1Done ? ' on' : ''}`} />
            ))}
          </div>
        ))}
      </div>
      <div className={`ag-s07-callrow${p2Done || running ? ' visible' : ''}`}>
        {[0, 1, 2].map(i => (
          <div key={i} className="ag-s07-call">
            <span className="ag-s07-call-label">BUILD_ROOM</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function GateS07() {
  const { goto } = useNav()
  const { activeChild, completeAcademyGate } = useAcademy()
  const [phase, setPhase]     = useState(1)
  const [ws1, setWs1]         = useState(null)
  const [ws2, setWs2]         = useState(null)
  const [running, setRunning] = useState(false)
  const [quizOpen, setQuizOpen] = useState(false)
  const [quizOrder, setQuizOrder] = useState(null)
  const [quizWrong, setQuizWrong] = useState(false)
  const [done, setDone]       = useState(false)

  const p1Done = ws1 ? CORRECT_P1.every((id, i) => ws1[i]?.blockId === id) : false
  const p2Done = ws2 ? CORRECT_P2.every((id, i) => ws2[i]?.blockId === id) : false

  const checks = [
    { ...CHECKS[0], passed: p1Done },
    { ...CHECKS[1], passed: p2Done },
  ]
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
        <span className="ag-rank-badge" style={{ '--ac': 'var(--violet)' }}>RANK D</span>
        <h1 className="ag-gate-name">The Function Machine</h1>
        <span className="ag-concept-tag">Functions</span>
        <span className="ag-xp-tag" style={{ color: 'var(--violet)' }}>+180 XP</span>
      </div>

      <div className="ag-body">
        <div className="ag-left">
          <Scene p1Done={p1Done} p2Done={p2Done} running={running} />
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
            {running ? '⟳ Running…' : allPassed ? '▶ RUN FUNCTION' : '○ Complete both phases first'}
          </button>
        </div>

        <div className="ag-right">
          <div className="ag-phase-bar">
            <span className={phase === 1 ? 'ag-phase-active' : 'ag-phase-done'}>{phase === 1 ? '▶' : '✓'} Phase 1 — Define BUILD_ROOM</span>
            <span style={{ color: 'var(--line-2)', margin: '0 6px' }}>·</span>
            <span className={phase === 2 ? 'ag-phase-active' : p2Done ? 'ag-phase-done' : ''}>
              {p2Done ? '✓' : '○'} Phase 2 — Call it 3 times
            </span>
          </div>

          {phase === 1 && (
            <>
              <div className="ag-instruction">
                <strong>Phase 1:</strong> Define the <strong>BUILD_ROOM</strong> function. Place all 5 building actions in the correct order inside the function body. Walls before doors, foundation before paint.
              </div>
              <BlockCanvas key="p1" palette={PAL_P1} workspace={SLOTS_P1} onChange={setWs1} />
              {p1Done && (
                <button
                  style={{ marginTop: 10, background: 'var(--violet)', color: '#05070d', border: 'none', borderRadius: 8, padding: '10px 20px', fontFamily: 'var(--f-mono)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', cursor: 'pointer' }}
                  onClick={() => setPhase(2)}
                >
                  Function defined. Now call it 3 times →
                </button>
              )}
            </>
          )}

          {phase === 2 && (
            <>
              <div className="ag-instruction">
                <strong>Phase 2:</strong> Call <strong>BUILD_ROOM</strong> three times — once for each room. Same result as 15 individual blocks, but just 3 calls. That's the power of functions.
              </div>
              <BlockCanvas key="p2" palette={PAL_P2} workspace={SLOTS_P2} onChange={setWs2} />
            </>
          )}
        </div>
      </div>

      {quizOpen && (
        <div className="ag-quiz-bd">
          <div className={`ag-quiz-card${quizWrong ? ' wrong' : ''}`}>
            <div className="ag-quiz-eyebrow">Knowledge Check — Gate S-07</div>
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
            <span className="ag-done-emoji">⚙️</span>
            <span className="ag-done-xp">+180 XP</span>
            <h2 className="ag-done-title">The Function Machine</h2>
            <p className="ag-done-flavor">One definition. Infinite uses. The Construct learns to reuse what it already knows.</p>
            <div className="ag-done-rewards">
              <span className="ag-done-reward">Function Fragment</span>
              <span className="ag-done-reward">Function Builder</span>
            </div>
            <button className="ag-done-btn" onClick={() => goto('academy/dashboard')}>Builder HQ →</button>
          </div>
        </div>
      )}
    </div>
  )
}

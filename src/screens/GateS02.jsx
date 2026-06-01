import { useState } from 'react'
import './AcademyGate.css'
import { useNav } from '../context/NavigationContext'
import { useAcademy } from '../context/AcademyContext'
import BlockCanvas from '../components/BlockCanvas'

const GATE_ID = 'S-02'
const GATE_XP = 80

// Phase 1: 8 individual place_block slots
const PAL_P1  = [{ id: 'place_block', label: 'place block', icon: '🧱', color: 'var(--teal)', count: 8 }]
const SLOTS_P1 = Array.from({ length: 8 }, (_, i) => ({ placeholder: `Slot ${i + 1}` }))

// Phase 2: REPEAT wrapper with 2 slots
const PAL_P2  = [
  { id: 'REPEAT_8',    label: 'REPEAT 8 times', icon: '🔁', color: 'var(--teal)',  count: 1 },
  { id: 'place_block', label: 'place block',    icon: '🧱', color: 'var(--amber)', count: 1 },
]
const SLOTS_P2 = [
  { label: 'OUTER:',  placeholder: 'What repeats?' },
  { label: 'INNER:',  placeholder: 'What action repeats?' },
]

const CHECKS = [
  { id: 'c1', label: 'Wall built manually (8 individual blocks)',   hint: 'Place a place block in all 8 slots to complete Phase 1.' },
  { id: 'c2', label: 'Same wall built with Repeat block',           hint: 'In Phase 2, REPEAT 8 goes in the outer slot, place block in the inner slot.' },
]

const QUIZ = {
  q: 'If you needed to place 100 blocks instead of 8, how many instructions would the repeat version need?',
  opts: [
    '100 — one for each block.',
    '200 — one to go to each spot and one to place each block.',
    'Still just 2 — change the number in the repeat block from 8 to 100.',
    '50 — repeat blocks cut the work in half.',
  ],
  correct: 2,
}

function Scene({ p1Done, p2Done, running }) {
  const placedCount = p1Done ? 8 : 0
  return (
    <div className={`ag-scene${running ? ' running' : ''}`} style={{ '--ac': 'var(--teal)' }}>
      <span className="ag-scene-label">CONSTRUCT WALL — GATE S-02</span>
      {running && <span className="ag-scene-run-label">RUNNING ▶</span>}
      <div className="ag-s02-counter">
        {p2Done ? 'REPEAT × 8 — 2 instructions' : p1Done ? '8 blocks — 8 instructions' : `Blocks placed: ${placedCount}/8`}
      </div>
      <div className="ag-s02-wall">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className={`ag-s02-brick${p1Done || p2Done ? ' placed' : ''}`} />
        ))}
      </div>
    </div>
  )
}

export default function GateS02() {
  const { goto } = useNav()
  const { activeChild, completeAcademyGate } = useAcademy()
  const [phase, setPhase]   = useState(1)
  const [ws1, setWs1]       = useState(null)
  const [ws2, setWs2]       = useState(null)
  const [running, setRunning] = useState(false)
  const [quizOpen, setQuizOpen] = useState(false)
  const [quizOrder, setQuizOrder] = useState(null)
  const [quizWrong, setQuizWrong] = useState(false)
  const [done, setDone]     = useState(false)

  const p1Done = ws1 ? ws1.every(s => s.blockId === 'place_block') : false
  const p2Done = ws2 ? ws2[0]?.blockId === 'REPEAT_8' && ws2[1]?.blockId === 'place_block' : false

  const checks = [
    { ...CHECKS[0], passed: p1Done },
    { ...CHECKS[1], passed: p2Done },
  ]
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
        <span className="ag-rank-badge" style={{ '--ac': 'var(--teal)' }}>RANK E</span>
        <h1 className="ag-gate-name">The Repeat Machine</h1>
        <span className="ag-concept-tag">Loops</span>
        <span className="ag-xp-tag">+80 XP</span>
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
            className="ag-run-btn" style={{ '--ac': 'var(--teal)' }}
            onClick={handleRun} disabled={!allPassed || running}
          >
            {running ? '⟳ Running…' : allPassed ? '▶ RUN SEQUENCE' : '○ Complete both phases first'}
          </button>
        </div>

        <div className="ag-right">
          <div className="ag-phase-bar">
            <span className={phase === 1 ? 'ag-phase-active' : 'ag-phase-done'}>{phase === 1 ? '▶' : '✓'} Phase 1 — Manual (8 blocks)</span>
            <span style={{ color: 'var(--line-2)', margin: '0 6px' }}>·</span>
            <span className={phase === 2 ? 'ag-phase-active' : p2Done ? 'ag-phase-done' : ''}>
              {p2Done ? '✓' : '○'} Phase 2 — Loop (2 blocks)
            </span>
          </div>

          {phase === 1 && (
            <>
              <div className="ag-instruction">
                <strong>Phase 1:</strong> Build the wall the slow way. Place a <strong>place block</strong> in all 8 slots. Feel how repetitive it is. That's the point.
              </div>
              <BlockCanvas key="p1" palette={PAL_P1} workspace={SLOTS_P1} onChange={setWs1} />
              {p1Done && (
                <button
                  style={{ marginTop: 10, background: 'var(--teal)', color: '#05070d', border: 'none', borderRadius: 8, padding: '10px 20px', fontFamily: 'var(--f-mono)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', cursor: 'pointer' }}
                  onClick={() => setPhase(2)}
                >
                  That took a while. Try the smart way →
                </button>
              )}
            </>
          )}

          {phase === 2 && (
            <>
              <div className="ag-instruction">
                <strong>Phase 2:</strong> Now build the same wall using a <strong>REPEAT block</strong>. Place <strong>REPEAT 8 times</strong> in the outer slot, then <strong>place block</strong> in the inner slot. Same result — 2 instructions instead of 8.
              </div>
              <BlockCanvas key="p2" palette={PAL_P2} workspace={SLOTS_P2} onChange={setWs2} />
            </>
          )}
        </div>
      </div>

      {quizOpen && (
        <div className="ag-quiz-bd">
          <div className={`ag-quiz-card${quizWrong ? ' wrong' : ''}`}>
            <div className="ag-quiz-eyebrow">Knowledge Check — Gate S-02</div>
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
            <span className="ag-done-emoji">🔵</span>
            <span className="ag-done-xp">+80 XP</span>
            <h2 className="ag-done-title">The Repeat Machine</h2>
            <p className="ag-done-flavor">The Repeat Machine activates. The Construct learns to remember patterns instead of repeating steps.</p>
            <div className="ag-done-rewards">
              <span className="ag-done-reward">Loop Fragment</span>
              <span className="ag-done-reward">Loop Builder</span>
            </div>
            <button className="ag-done-btn" onClick={() => goto('academy/dashboard')}>Builder HQ →</button>
          </div>
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import './AcademyGate.css'
import { useNav } from '../context/NavigationContext'
import { useAcademy } from '../context/AcademyContext'
import BlockCanvas from '../components/BlockCanvas'

const GATE_ID = 'S-10'
const GATE_XP = 300

const PALETTE = [
  { id: 'SCORE_VAR',       label: 'SCORE VARIABLE',     icon: '📊', color: 'var(--amber)',   count: 1 },
  { id: 'COLLECTION_LOOP', label: 'COLLECTION LOOP',     icon: '🔄', color: 'var(--teal)',    count: 1 },
  { id: 'START_EVENT',     label: 'GAME START EVENT',    icon: '🚩', color: 'var(--violet)',  count: 1 },
  { id: 'SPAWN_FUNC',      label: 'SPAWN_ITEM FUNCTION', icon: '⚙️', color: 'var(--lime)',    count: 1 },
  { id: 'END_COND',        label: 'END CONDITION',       icon: '🏁', color: 'var(--magenta)', count: 1 },
]
const SLOTS = [
  { label: 'Score variable:',   placeholder: 'Track the player\'s score' },
  { label: 'Collection loop:',  placeholder: 'Repeat checking for items' },
  { label: 'Game start event:', placeholder: 'When does the game begin?' },
  { label: 'Spawn function:',   placeholder: 'Custom block for spawning items' },
  { label: 'End condition:',    placeholder: 'When does the game end?' },
]
const CORRECT = ['SCORE_VAR', 'COLLECTION_LOOP', 'START_EVENT', 'SPAWN_FUNC', 'END_COND']

const CHECKS = [
  { id: 'c1', label: 'Score variable present',     hint: 'Put SCORE VARIABLE in the first slot — it tracks the player\'s points from 0.' },
  { id: 'c2', label: 'Collection loop running',    hint: 'Put COLLECTION LOOP in the second slot — it continuously checks for item collection.' },
  { id: 'c3', label: 'Game start event wired',     hint: 'Put GAME START EVENT in the third slot — the game begins when the flag is clicked.' },
  { id: 'c4', label: 'Custom spawn block defined', hint: 'Put SPAWN_ITEM FUNCTION in the fourth slot — a reusable block for spawning collectibles.' },
  { id: 'c5', label: 'End condition present',      hint: 'Put END CONDITION in the fifth slot — defines when the game is finished.' },
]

const QUIZ = {
  q: "Before building, you filled in a plan describing what the game would have. Why is planning before building useful even for small projects?",
  opts: [
    "Planning is required — you can't start building without a complete plan.",
    "Planning helps you know what to build before you start, so you don't have to figure it out while building and get lost.",
    "Planning makes the program run faster because the computer knows what's coming.",
    "Planning isn't really useful for small projects — only for large ones.",
  ],
  correct: 1,
}

function Scene({ passCount, running }) {
  return (
    <div className={`ag-scene${running ? ' running' : ''}`} style={{ '--ac': 'var(--amber)' }}>
      <span className="ag-scene-label">COMPLETE WORLD — GATE S-10</span>
      {running && <span className="ag-scene-run-label">RUNNING ▶</span>}
      <div className="ag-s10-skyline">
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} className={`ag-s10-building${running || i < passCount ? ' built' : ''}`} />
        ))}
      </div>
    </div>
  )
}

export default function GateS10() {
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
        <span className="ag-rank-badge" style={{ '--ac': 'var(--amber)' }}>RANK C</span>
        <h1 className="ag-gate-name">The Complete World</h1>
        <span className="ag-concept-tag">Integration</span>
        <span className="ag-xp-tag" style={{ color: 'var(--amber)' }}>+300 XP</span>
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
            className="ag-run-btn" style={{ '--ac': 'var(--amber)' }}
            onClick={handleRun} disabled={!allPassed || running}
          >
            {running ? '⟳ Building world…' : allPassed ? '▶ COMPLETE THE WORLD' : `○ Add ${5 - passCount} more element${5 - passCount !== 1 ? 's' : ''}`}
          </button>
        </div>

        <div className="ag-right">
          <div className="ag-instruction">
            Assemble your <strong>complete game</strong> — every concept from the Scratch track combined into one. Wire a variable, a loop, an event, a custom function, and an end condition into their correct slots. All five parts. One complete world.
          </div>
          <BlockCanvas palette={PALETTE} workspace={SLOTS} onChange={setWs} />
        </div>
      </div>

      {quizOpen && (
        <div className="ag-quiz-bd">
          <div className={`ag-quiz-card${quizWrong ? ' wrong' : ''}`}>
            <div className="ag-quiz-eyebrow">Knowledge Check — Gate S-10</div>
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
            <span className="ag-done-emoji">🌍</span>
            <span className="ag-done-xp">+300 XP</span>
            <h2 className="ag-done-title">The Complete World</h2>
            <p className="ag-done-flavor">The Complete World exists. You built it. All of it. Every part working together. You are ready for what comes next.</p>
            <div className="ag-done-rewards">
              <span className="ag-done-reward">World Fragment</span>
              <span className="ag-done-reward">Scratch Graduate</span>
            </div>
            <button className="ag-done-btn" onClick={() => goto('academy/dashboard')}>Builder HQ →</button>
          </div>
        </div>
      )}
    </div>
  )
}

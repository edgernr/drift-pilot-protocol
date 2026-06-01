import { useState } from 'react'
import './AcademyGate.css'
import { useNav } from '../context/NavigationContext'
import { useAcademy } from '../context/AcademyContext'
import BlockCanvas from '../components/BlockCanvas'

const GATE_ID = 'S-15'
const GATE_XP = 400

const PALETTE = [
  { id: 'START_EVENT',   label: 'GAME START EVENT',   icon: '🚩', color: 'var(--violet)', count: 1 },
  { id: 'SCORE_VAR',     label: 'SCORE VARIABLE',     icon: '📊', color: 'var(--amber)',  count: 1 },
  { id: 'GAME_LOOP',     label: 'MAIN GAME LOOP',      icon: '🔄', color: 'var(--teal)',   count: 1 },
  { id: 'SPAWN_FUNC',    label: 'SPAWN FUNCTION',      icon: '⚙️', color: 'var(--lime)',   count: 1 },
  { id: 'CLONE_SYSTEM',  label: 'CLONE SYSTEM',        icon: '⊕',  color: 'var(--magenta)',count: 1 },
  { id: 'ANIMATION',     label: 'SPRITE ANIMATION',   icon: '🎭', color: 'var(--violet)', count: 1 },
]
const SLOTS = [
  { label: 'Start trigger:',   placeholder: 'How does the game begin?' },
  { label: 'Score tracking:',  placeholder: 'How is the score tracked?' },
  { label: 'Game loop:',       placeholder: 'The main cycle of the game' },
  { label: 'Item spawner:',    placeholder: 'Custom block to spawn items' },
  { label: 'Clone system:',    placeholder: 'Multiplies sprites' },
  { label: 'Animation:',       placeholder: 'Makes sprites animated' },
]
const CORRECT = ['START_EVENT', 'SCORE_VAR', 'GAME_LOOP', 'SPAWN_FUNC', 'CLONE_SYSTEM', 'ANIMATION']

const CHECKS = [
  { id: 'c1', label: 'Game start wired',     hint: 'Put GAME START EVENT in slot 1 — the entry point for your game.' },
  { id: 'c2', label: 'Score variable set',   hint: 'Put SCORE VARIABLE in slot 2 — track the player\'s progress.' },
  { id: 'c3', label: 'Game loop running',    hint: 'Put MAIN GAME LOOP in slot 3 — the cycle that drives everything.' },
  { id: 'c4', label: 'Spawn function ready', hint: 'Put SPAWN FUNCTION in slot 4 — reusable block for spawning collectibles.' },
  { id: 'c5', label: 'Clone system active',  hint: 'Put CLONE SYSTEM in slot 5 — fills the world with sprites.' },
  { id: 'c6', label: 'Animation running',    hint: 'Put SPRITE ANIMATION in slot 6 — brings every sprite to life.' },
]

const QUIZ = {
  q: 'You just combined every concept from the Scratch track into one game. What does this tell you about how real games are built?',
  opts: [
    'Real games only use one concept at a time — variables, loops, and clones are separate.',
    'Real games are built from many small concepts working together — events, variables, loops, functions, clones, and animations all at once.',
    'Real games do not use variables or events — those are only for beginners.',
    'Real games are too complex to understand until you are an adult.',
  ],
  correct: 1,
}

function Scene({ passCount, running }) {
  const labels = ['▶', '$', '∞', '⚙', '⊕', '🎭']
  return (
    <div className={`ag-scene${running ? ' running' : ''}`} style={{ '--ac': 'var(--amber)' }}>
      <span className="ag-scene-label">MINI GAME JAM — GATE S-15</span>
      {running && <span className="ag-scene-run-label">RUNNING ▶</span>}
      <div className="ag-s15-screen">
        {labels.map((l, i) => (
          <div
            key={i}
            className={`ag-s15-elem${(running || i < passCount) ? ' active' : ''}`}
            style={{ transitionDelay: `${i * 0.09}s` }}
          >
            {l}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function GateS15() {
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
        <span className="ag-rank-badge" style={{ '--ac': 'var(--amber)' }}>RANK B</span>
        <h1 className="ag-gate-name">The Mini Game Jam</h1>
        <span className="ag-concept-tag">All Concepts</span>
        <span className="ag-xp-tag" style={{ color: 'var(--amber)' }}>+400 XP</span>
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
            {running ? '⟳ Launching game…' : allPassed ? '▶ LAUNCH MINI GAME' : `○ Add ${6 - passCount} more system${6 - passCount !== 1 ? 's' : ''}`}
          </button>
        </div>

        <div className="ag-right">
          <div className="ag-instruction">
            Assemble the <strong>complete game system</strong> — every concept from the Scratch track in one build. Wire the start event, score tracking, game loop, spawn function, clone system, and animation into their slots. Six systems. One complete game.
          </div>
          <BlockCanvas palette={PALETTE} workspace={SLOTS} onChange={setWs} />
        </div>
      </div>

      {quizOpen && (
        <div className="ag-quiz-bd">
          <div className={`ag-quiz-card${quizWrong ? ' wrong' : ''}`}>
            <div className="ag-quiz-eyebrow">Knowledge Check — Gate S-15</div>
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
            <span className="ag-done-emoji">🎮</span>
            <span className="ag-done-xp">+400 XP</span>
            <h2 className="ag-done-title">The Mini Game Jam</h2>
            <p className="ag-done-flavor">Six systems. One game. You didn't just learn the pieces — you combined them. That is what builders do. The Block Layer is complete.</p>
            <div className="ag-done-rewards">
              <span className="ag-done-reward">Game Jam Badge</span>
              <span className="ag-done-reward">Block Layer Graduate</span>
            </div>
            <button className="ag-done-btn" onClick={() => goto('academy/dashboard')}>Builder HQ →</button>
          </div>
        </div>
      )}
    </div>
  )
}

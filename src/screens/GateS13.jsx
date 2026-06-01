import { useState } from 'react'
import './AcademyGate.css'
import { useNav } from '../context/NavigationContext'
import { useAcademy } from '../context/AcademyContext'
import BlockCanvas from '../components/BlockCanvas'

const GATE_ID = 'S-13'
const GATE_XP = 150

const PALETTE = [
  { id: 'WHEN_FLAG',    label: 'WHEN FLAG CLICKED',  icon: '🚩', color: 'var(--violet)', count: 1 },
  { id: 'PLAY_INTRO',   label: 'PLAY INTRO SOUND',   icon: '🎵', color: 'var(--teal)',   count: 1 },
  { id: 'WHEN_COLLECT', label: 'WHEN ITEM COLLECTED',icon: '⭐', color: 'var(--amber)',  count: 1 },
  { id: 'PLAY_COLLECT', label: 'PLAY COLLECT SOUND', icon: '🎶', color: 'var(--lime)',   count: 1 },
  { id: 'WHEN_WIN',     label: 'WHEN SCORE = 10',    icon: '🏆', color: 'var(--magenta)',count: 1 },
  { id: 'PLAY_WIN',     label: 'PLAY WIN SOUND',     icon: '🎺', color: 'var(--amber)',  count: 1 },
]
const SLOTS = [
  { label: 'Game start event:',   placeholder: 'When does the game begin?' },
  { label: 'Intro sound:',        placeholder: 'Which sound plays at start?' },
  { label: 'Collect event:',      placeholder: 'When does the player collect?' },
  { label: 'Collect sound:',      placeholder: 'Which sound plays on collect?' },
  { label: 'Win event:',          placeholder: 'When does the player win?' },
  { label: 'Win sound:',          placeholder: 'Which sound plays on winning?' },
]
const CORRECT = ['WHEN_FLAG', 'PLAY_INTRO', 'WHEN_COLLECT', 'PLAY_COLLECT', 'WHEN_WIN', 'PLAY_WIN']

const CHECKS = [
  { id: 'c1', label: 'Game start event wired',   hint: 'Put WHEN FLAG CLICKED in slot 1 — the game begins when the flag is clicked.' },
  { id: 'c2', label: 'Intro sound connected',    hint: 'Put PLAY INTRO SOUND in slot 2 — it plays right as the game starts.' },
  { id: 'c3', label: 'Collect event wired',       hint: 'Put WHEN ITEM COLLECTED in slot 3 — triggers when the player grabs an item.' },
  { id: 'c4', label: 'Collect sound connected',   hint: 'Put PLAY COLLECT SOUND in slot 4 — audio feedback on collection.' },
  { id: 'c5', label: 'Win event wired',           hint: 'Put WHEN SCORE = 10 in slot 5 — this detects when the player has won.' },
  { id: 'c6', label: 'Win sound connected',       hint: 'Put PLAY WIN SOUND in slot 6 — the victory fanfare.' },
]

const QUIZ = {
  q: 'Why do games use sound effects that react to player actions, like a collect sound when picking up an item?',
  opts: [
    'Sound effects are required by law for all computer programs.',
    'Sound gives the player instant feedback — it confirms the action worked and makes the experience feel more alive.',
    'Sound effects make the program run faster.',
    'Sound is only used for win and lose screens, not during gameplay.',
  ],
  correct: 1,
}

function Scene({ ws, running }) {
  const pairs = [
    { name: 'START', active: ws?.[0]?.blockId === 'WHEN_FLAG' && ws?.[1]?.blockId === 'PLAY_INTRO' },
    { name: 'COLLECT', active: ws?.[2]?.blockId === 'WHEN_COLLECT' && ws?.[3]?.blockId === 'PLAY_COLLECT' },
    { name: 'WIN', active: ws?.[4]?.blockId === 'WHEN_WIN' && ws?.[5]?.blockId === 'PLAY_WIN' },
  ]
  return (
    <div className={`ag-scene${running ? ' running' : ''}`} style={{ '--ac': 'var(--teal)' }}>
      <span className="ag-scene-label">SOUND SYSTEM — GATE S-13</span>
      {running && <span className="ag-scene-run-label">RUNNING ▶</span>}
      <div className="ag-s13-stage">
        {pairs.map(p => (
          <div key={p.name} className="ag-s13-spk-wrap">
            <div className={`ag-s13-spk${p.active || running ? ' active' : ''}`}>🔊</div>
            <div className={`ag-s13-waves${p.active || running ? ' active' : ''}`}>
              <div className="ag-s13-wave" />
              <div className="ag-s13-wave" />
              <div className="ag-s13-wave" />
            </div>
            <div className="ag-s13-spk-name">{p.name}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function GateS13() {
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
        <span className="ag-rank-badge" style={{ '--ac': 'var(--teal)' }}>RANK C</span>
        <h1 className="ag-gate-name">The Sound System</h1>
        <span className="ag-concept-tag">Sound</span>
        <span className="ag-xp-tag" style={{ color: 'var(--teal)' }}>+150 XP</span>
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
            {running ? '⟳ Playing sounds…' : allPassed ? '▶ PLAY ALL SOUNDS' : `○ Wire ${6 - passCount} more slot${6 - passCount !== 1 ? 's' : ''}`}
          </button>
        </div>

        <div className="ag-right">
          <div className="ag-instruction">
            Wire up your game's <strong>sound system</strong> — three event + sound pairs. Game start plays the intro, collecting an item plays the collect sound, and reaching score 10 plays the win fanfare. Events first, sounds second.
          </div>
          <BlockCanvas palette={PALETTE} workspace={SLOTS} onChange={setWs} />
        </div>
      </div>

      {quizOpen && (
        <div className="ag-quiz-bd">
          <div className={`ag-quiz-card${quizWrong ? ' wrong' : ''}`}>
            <div className="ag-quiz-eyebrow">Knowledge Check — Gate S-13</div>
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
            <span className="ag-done-emoji">🔊</span>
            <span className="ag-done-xp">+150 XP</span>
            <h2 className="ag-done-title">The Sound System</h2>
            <p className="ag-done-flavor">Sound follows events. Events drive sound. Your game now speaks — every action has a voice. The Construct has audio.</p>
            <div className="ag-done-rewards">
              <span className="ag-done-reward">Sound Badge</span>
              <span className="ag-done-reward">Audio Wirer</span>
            </div>
            <button className="ag-done-btn" onClick={() => goto('academy/dashboard')}>Builder HQ →</button>
          </div>
        </div>
      )}
    </div>
  )
}

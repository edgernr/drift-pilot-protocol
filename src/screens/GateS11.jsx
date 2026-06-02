import { useState } from 'react'
import './AcademyGate.css'
import { useNav } from '../context/NavigationContext'
import { useAcademy } from '../context/AcademyContext'

const GATE_ID = 'S-11'
const GATE_XP = 650

const BUGS = [
  {
    id: 'b1', label: 'Bug 1 — Score init',
    code: { before: 'SET SCORE TO', bug: '5', after: '' },
    opts: ['0', '1', '5'],
    correct: '0',
    hint: 'Score should always start at zero — not 5.',
  },
  {
    id: 'b2', label: 'Bug 2 — Loop type',
    code: { before: 'REPEAT', bug: '5 TIMES', after: '' },
    opts: ['UNTIL DONE', '5 TIMES', '10 TIMES'],
    correct: 'UNTIL DONE',
    hint: 'Use REPEAT UNTIL to loop until a condition is met — not a fixed count.',
  },
  {
    id: 'b3', label: 'Bug 3 — Start event',
    code: { before: 'START WHEN', bug: 'KEY PRESSED', after: '' },
    opts: ['FLAG CLICKED', 'KEY PRESSED', 'TIMER TICK'],
    correct: 'FLAG CLICKED',
    hint: 'Games start when the flag is clicked — not a random key press.',
  },
  {
    id: 'b4', label: 'Bug 4 — Spawn X',
    code: { before: 'SPAWN AT X:', bug: '200', after: 'Y: 0' },
    opts: ['0', '100', '200'],
    correct: '0',
    hint: 'X: 200 is off-screen. Items should spawn at X: 0.',
  },
  {
    id: 'b5', label: 'Bug 5 — Win score',
    code: { before: 'IF SCORE =', bug: '100', after: '' },
    opts: ['5', '10', '100'],
    correct: '10',
    hint: 'A win condition of 100 is unreachable. It should be 10.',
  },
]

const CHECKS = [
  { id: 'c1', label: 'Score starts at 0',       hint: 'Fix Bug 1 — select the correct starting value.' },
  { id: 'c2', label: 'Loop uses UNTIL',          hint: 'Fix Bug 2 — select the correct loop type.' },
  { id: 'c3', label: 'Game starts on flag',      hint: 'Fix Bug 3 — select the correct start trigger.' },
  { id: 'c4', label: 'Spawn X is 0',             hint: 'Fix Bug 4 — select the correct spawn X value.' },
  { id: 'c5', label: 'Win condition is 10',      hint: 'Fix Bug 5 — select the correct win score.' },
]

const QUIZ = {
  q: 'You fixed 5 bugs one by one. What is the smartest debugging strategy?',
  opts: [
    'Fix all bugs at once and test everything together at the end.',
    'Fix one bug at a time and test after each fix — so you know exactly what each change did.',
    'Delete the whole program and start fresh every time there is a bug.',
    'Only fix the bugs that cause crashes — leave the others alone.',
  ],
  correct: 1,
}

function Scene({ fixedCount, running }) {
  const hp = Math.max(0, 100 - fixedCount * 20)
  const defeated = fixedCount === 5
  return (
    <div className={`ag-scene${running ? ' running' : ''}`} style={{ '--ac': 'var(--magenta)' }}>
      <span className="ag-scene-label">GLITCH KING — BOSS GATE S-11</span>
      {running && <span className="ag-scene-run-label">DEFEATED ▶</span>}
      <div className={`ag-s11-boss${defeated ? ' defeated' : ''}`}>
        <span className="ag-s11-crown">{defeated ? '💀' : '👑'}</span>
      </div>
      <span className="ag-s06-hp-lbl">BOSS HP</span>
      <div className="ag-s06-hp-bar">
        <div className="ag-s06-hp-fill" style={{ width: `${hp}%` }} />
      </div>
    </div>
  )
}

export default function GateS11() {
  const { goto } = useNav()
  const { activeChild, completeAcademyGate } = useAcademy()
  const [fixed, setFixed]     = useState({ b1: null, b2: null, b3: null, b4: null, b5: null })
  const [wrong, setWrong]     = useState(null)
  const [running, setRunning] = useState(false)
  const [quizOpen, setQuizOpen] = useState(false)
  const [quizOrder, setQuizOrder] = useState(null)
  const [quizWrong, setQuizWrong] = useState(false)
  const [done, setDone]       = useState(false)

  function selectFix(bugId, val) {
    const bug = BUGS.find(b => b.id === bugId)
    if (val !== bug.correct) {
      setWrong(bugId)
      setTimeout(() => setWrong(null), 600)
      return
    }
    setFixed(prev => ({ ...prev, [bugId]: val }))
  }

  const fixedCount = Object.values(fixed).filter(Boolean).length
  const checks = CHECKS.map((c, i) => ({ ...c, passed: !!fixed[`b${i + 1}`] }))
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
        <span className="ag-boss-chip">BOSS</span>
        <span className="ag-rank-badge" style={{ '--ac': 'var(--magenta)' }}>RANK C</span>
        <h1 className="ag-gate-name">The Glitch King</h1>
        <span className="ag-concept-tag">Debugging Boss</span>
        <span className="ag-xp-tag" style={{ color: 'var(--magenta)' }}>+650 XP</span>
      </div>

      <div className="ag-body">
        <div className="ag-left">
          <Scene fixedCount={fixedCount} running={running} />
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
            className="ag-run-btn" style={{ '--ac': 'var(--magenta)' }}
            onClick={handleRun} disabled={!allPassed || running}
          >
            {running ? '⟳ Defeating Glitch King…' : allPassed ? '▶ DEFEAT THE GLITCH KING' : `○ Fix ${5 - fixedCount} more bug${5 - fixedCount !== 1 ? 's' : ''}`}
          </button>
        </div>

        <div className="ag-right">
          <div className="ag-instruction">
            The <strong>Glitch King</strong> has corrupted five blocks. Each wrong value costs <strong>-20 HP</strong>. Click a wrong value and pick the correct one. Fix all 5 to defeat the boss.
          </div>
          <div className="ag-debug-blocks">
            {BUGS.map(bug => {
              const isFixed = !!fixed[bug.id]
              const isWrong = wrong === bug.id
              return (
                <div key={bug.id} className={`ag-debug-block${isFixed ? ' fixed' : ' bugged'}`}>
                  <div className="ag-debug-id">{bug.label}</div>
                  <div className="ag-debug-code">
                    {bug.code.before}{' '}
                    {isFixed
                      ? <span className="fix-val">{fixed[bug.id]}</span>
                      : <span className="bug-val">{bug.code.bug}</span>
                    }
                    {bug.code.after ? ` ${bug.code.after}` : ''}
                  </div>
                  {!isFixed && (
                    <div className="ag-debug-opts">
                      {bug.opts.map(o => (
                        <button
                          key={o}
                          className={`ag-debug-opt${isWrong && o !== bug.correct ? ' wrong' : ''}`}
                          onClick={() => selectFix(bug.id, o)}
                        >
                          {o}
                        </button>
                      ))}
                    </div>
                  )}
                  {isFixed && (
                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--lime)', letterSpacing: '0.1em' }}>
                      ✓ FIXED — {bug.code.bug} → {fixed[bug.id]}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {quizOpen && (
        <div className="ag-quiz-bd">
          <div className={`ag-quiz-card${quizWrong ? ' wrong' : ''}`}>
            <div className="ag-quiz-eyebrow">Knowledge Check — Gate S-11 BOSS</div>
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
          <div className="ag-done-card" style={{ '--ac': 'var(--magenta)' }}>
            <span className="ag-done-emoji">👑</span>
            <span className="ag-done-xp">+650 XP</span>
            <h2 className="ag-done-title">The Glitch King Falls</h2>
            <p className="ag-done-flavor">Five bugs. Five fixes. The Glitch King is defeated. The Construct runs clean. Builders who can debug can fix anything.</p>
            <div className="ag-done-rewards">
              <span className="ag-done-reward">Glitch King Crown</span>
              <span className="ag-done-reward">Master Debugger Badge</span>
            </div>
            <button className="ag-done-btn" onClick={() => goto('academy/dashboard')}>Builder HQ →</button>
          </div>
        </div>
      )}
    </div>
  )
}

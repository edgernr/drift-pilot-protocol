import { useState } from 'react'
import './AcademyGate.css'
import { useNav } from '../context/NavigationContext'
import { useAcademy } from '../context/AcademyContext'

const GATE_ID = 'S-06'
const GATE_XP = 500

// 3 bugs to find and fix
const BUGS = [
  {
    id: 'b1', label: 'Bug 1 — Loop count',
    code: { before: 'REPEAT', bug: '7', after: 'times' },
    opts: ['5', '7', '8', '10'],
    correct: '8',
    hint: 'The wall is one block short. Find the number controlling the repeat count.',
  },
  {
    id: 'b2', label: 'Bug 2 — Score increment',
    code: { before: 'CHANGE SCORE BY', bug: '2', after: '' },
    opts: ['1', '2', '3', '5'],
    correct: '1',
    hint: 'The score jumps by 2 every time. Find the change amount.',
  },
  {
    id: 'b3', label: 'Bug 3 — Celebration trigger',
    code: { before: 'IF SCORE =', bug: '4', after: '' },
    opts: ['3', '4', '5', '6'],
    correct: '5',
    hint: 'The celebration fires too early. Find the comparison value.',
  },
]

const CHECKS = [
  { id: 'c1', label: 'Loop count corrected (7 → 8)',           hint: 'Click on Bug 1 and select the correct value.' },
  { id: 'c2', label: 'Score increment corrected (2 → 1)',       hint: 'Click on Bug 2 and select the correct value.' },
  { id: 'c3', label: 'Celebration trigger corrected (4 → 5)',   hint: 'Click on Bug 3 and select the correct value.' },
]

const QUIZ = {
  q: 'To find the bugs, you ran the program and watched what happened. What is this method of finding bugs called, and why is it useful?',
  opts: [
    'Guessing — sometimes you get lucky and find the bug quickly.',
    'Testing — running the program to see what it actually does versus what you expect it to do.',
    'Deleting — removing parts of the program until it works.',
    'Restarting — bugs go away when you start the program over.',
  ],
  correct: 1,
}

function Scene({ fixedCount, running }) {
  const hp = Math.max(0, 100 - fixedCount * 34)
  const defeated = fixedCount === 3
  return (
    <div className={`ag-scene${running ? ' running' : ''}`} style={{ '--ac': 'var(--magenta)' }}>
      <span className="ag-scene-label">THE GLITCH — BOSS GATE S-06</span>
      {running && <span className="ag-scene-run-label">DEFEATED ▶</span>}
      <div className={`ag-s06-glitch${defeated ? ' defeated' : ''}`}>
        <span className={`ag-s06-glyph${defeated ? ' settling' : ''}`}>{defeated ? '✓' : '☠'}</span>
      </div>
      <span className="ag-s06-hp-lbl">BOSS HP</span>
      <div className="ag-s06-hp-bar">
        <div className="ag-s06-hp-fill" style={{ width: `${hp}%` }} />
      </div>
    </div>
  )
}

export default function GateS06() {
  const { goto } = useNav()
  const { activeChild, completeAcademyGate } = useAcademy()
  const [fixed, setFixed]   = useState({ b1: null, b2: null, b3: null })
  const [wrong, setWrong]   = useState(null)
  const [running, setRunning] = useState(false)
  const [quizOpen, setQuizOpen] = useState(false)
  const [quizOrder, setQuizOrder] = useState(null)
  const [quizWrong, setQuizWrong] = useState(false)
  const [done, setDone]     = useState(false)

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
        <span className="ag-rank-badge" style={{ '--ac': 'var(--magenta)' }}>RANK D</span>
        <h1 className="ag-gate-name">The Glitch Block</h1>
        <span className="ag-concept-tag">Debugging</span>
        <span className="ag-xp-tag" style={{ color: 'var(--magenta)' }}>+500 XP</span>
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
            {running ? '⟳ Defeating…' : allPassed ? '▶ DEFEAT THE GLITCH' : `○ Find ${3 - fixedCount} more bug${3 - fixedCount !== 1 ? 's' : ''}`}
          </button>
        </div>

        <div className="ag-right">
          <div className="ag-instruction">
            <strong>THE GLITCH</strong> has corrupted three blocks in the Builder's program. Each one has a wrong value. Click the wrong value in each bug, then pick the correct one. Fix all 3 to defeat the boss.
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
                      ✓ BUG FIXED — {bug.code.bug} → {fixed[bug.id]}
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
            <div className="ag-quiz-eyebrow">Knowledge Check — Gate S-06 BOSS</div>
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
            <span className="ag-done-emoji">🐛</span>
            <span className="ag-done-xp">+500 XP</span>
            <h2 className="ag-done-title">THE GLITCH Defeated</h2>
            <p className="ag-done-flavor">Three bugs found. Three bugs fixed. The Construct runs clean. Builders who can debug can fix anything.</p>
            <div className="ag-done-rewards">
              <span className="ag-done-reward">Glitch Fragment</span>
              <span className="ag-done-reward">Debugger I</span>
              <span className="ag-done-reward">Boss Kill</span>
            </div>
            <button className="ag-done-btn" onClick={() => goto('academy/dashboard')}>Builder HQ →</button>
          </div>
        </div>
      )}
    </div>
  )
}

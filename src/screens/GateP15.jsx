import { useState } from 'react'
import './AcademyGate.css'
import { useNav } from '../context/NavigationContext'
import { useAcademy } from '../context/AcademyContext'

const GATE_ID = 'P-15'
const GATE_XP = 800

const BUGS = [
  {
    id: 'b1',
    label: 'Bug 1 — Class: promote()',
    hint: 'promote() is weakening citizens instead of levelling them up. Check the operator.',
    code: 'def promote(self):\n    self.level -= 1',
    opts: ['self.level += 1', 'self.level *= 2', 'self.level = 1'],
    correct: 0,
  },
  {
    id: 'b2',
    label: 'Bug 2 — File: save mode',
    hint: 'Saving raises an error — the file is opened in read mode instead of write mode.',
    code: 'with open("citizens.json", "r") as f:\n    json.dump(data, f)',
    opts: ['"a" — append', '"w" — write', '"x" — exclusive create'],
    correct: 1,
  },
  {
    id: 'b3',
    label: 'Bug 3 — Loop: break placement',
    hint: 'The menu exits immediately after showing once — break is in the wrong position.',
    code: 'while True:\n    break\n    choice = input("> ")',
    opts: ['Move break inside if choice == "exit":', 'Replace break with continue', 'Remove while True'],
    correct: 0,
  },
  {
    id: 'b4',
    label: 'Bug 4 — Error: wrong exception',
    hint: 'A missing file raises FileNotFoundError — not ValueError.',
    code: 'except ValueError:\n    data = []  # file not found',
    opts: ['except FileNotFoundError:', 'except TypeError:', 'except RuntimeError:'],
    correct: 0,
  },
  {
    id: 'b5',
    label: 'Bug 5 — Import: typo',
    hint: '"creat_citizen" is missing an "e" — Python raises ImportError.',
    code: 'from citizen_manager import creat_citizen',
    opts: ['create_citizen', 'citizen_create', 'new_citizen'],
    correct: 0,
  },
  {
    id: 'b6',
    label: 'Bug 6 — Algorithm: off-by-one',
    hint: 'The search found the item at index mid, but returns mid + 1 — always one too high.',
    code: 'if lst[mid] == target:\n    return mid + 1  # found',
    opts: ['return mid', 'return mid - 1', 'return left'],
    correct: 0,
  },
]

const QUIZ = {
  q: "You fixed 6 bugs in a complex program. What's the most important habit for finding bugs in a system you didn't write?",
  opts: [
    'Delete sections until it works, then add them back one by one.',
    'Read all the code from top to bottom until you spot the mistake.',
    'Run the program, identify what output is wrong, trace backward from there to find which code produces it.',
    'Rewrite the whole program from scratch — it\'s faster than debugging someone else\'s code.',
  ],
  correct: 2,
}

function Scene({ fixed }) {
  const fixCount = BUGS.filter(b => fixed[b.id]).length
  return (
    <div className="ag-scene" style={{ '--ac': 'var(--magenta)' }}>
      <span className="ag-scene-label">ROT SEED — GATE P-15 BOSS</span>
      <div className="ag-py-terminal">
        <div className="ag-py-terminal-bar">
          <span className="ag-py-dot" style={{ background: 'var(--magenta)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--amber)' }} />
          <span className="ag-py-dot" style={{ background: fixCount >= 6 ? 'var(--lime)' : 'var(--magenta)' }} />
          <span style={{ flex: 1, textAlign: 'center', fontSize: 9, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)' }}>system.py</span>
        </div>
        <div className="ag-py-output">
          <div className="ag-py-line" style={{ color: fixCount >= 6 ? 'var(--lime)' : 'var(--magenta)' }}>
            {fixCount >= 6
              ? '✓ System clean — ROT SEED defeated'
              : `⚠ ROT SEED: ${6 - fixCount} tendril${6 - fixCount !== 1 ? 's' : ''} remaining`}
          </div>
          {BUGS.filter(b => fixed[b.id]).map(b => (
            <div key={b.id} className="ag-py-line">
              ✓ <span style={{ color: 'var(--lime)' }}>{b.label.split('— ')[1]} fixed</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function GateP15() {
  const { goto } = useNav()
  const { activeChild, completeAcademyGate } = useAcademy()
  const [fixed, setFixed]         = useState({})
  const [wrongBug, setWrongBug]   = useState(null)
  const [running, setRunning]     = useState(false)
  const [quizOpen, setQuizOpen]   = useState(false)
  const [quizOrder, setQuizOrder] = useState(null)
  const [quizWrong, setQuizWrong] = useState(false)
  const [done, setDone]           = useState(false)

  const checks   = BUGS.map(b => ({ id: b.id, label: b.label.split('— ')[1] || b.label, passed: !!fixed[b.id], hint: b.hint }))
  const allFixed = BUGS.every(b => fixed[b.id])
  const fixCount = BUGS.filter(b => fixed[b.id]).length

  function chooseFix(bugId, bugCorrect, chosenIdx) {
    if (fixed[bugId]) return
    if (chosenIdx !== bugCorrect) {
      setWrongBug(bugId)
      setTimeout(() => setWrongBug(null), 700)
      return
    }
    setFixed(prev => ({ ...prev, [bugId]: true }))
  }

  async function handleRun() {
    if (!allFixed || running) return
    setRunning(true)
    await new Promise(r => setTimeout(r, 1200))
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
        <span className="ag-rank-badge" style={{ '--ac': 'var(--magenta)' }}>RANK B BOSS</span>
        <h1 className="ag-gate-name">The Rot Detector</h1>
        <span className="ag-concept-tag">Python Boss</span>
        <span className="ag-xp-tag" style={{ color: 'var(--magenta)' }}>+800 XP</span>
      </div>

      <div className="ag-body">
        <div className="ag-left">
          <Scene fixed={fixed} />
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
            onClick={handleRun} disabled={!allFixed || running}
          >
            {running ? '⟳ Eliminating Rot…' : allFixed ? '▶ DEFEAT ROT SEED' : `○ ${6 - fixCount} bug${6 - fixCount !== 1 ? 's' : ''} remaining`}
          </button>
        </div>

        <div className="ag-right">
          <div className="ag-instruction">
            The <strong>ROT SEED</strong> has infected the complete system. Find and fix <strong>six bugs</strong> — one in the class, one in file I/O, one in the loop, one in error handling, one in the import, one in the algorithm. Select the correct fix for each. Sever every tendril.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', maxHeight: 390 }}>
            {BUGS.map(b => {
              const isFixed = !!fixed[b.id]
              const isWrong = wrongBug === b.id
              return (
                <div key={b.id} style={{
                  border: `1px solid ${isFixed ? 'var(--lime)' : isWrong ? 'var(--amber)' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: 6,
                  padding: '10px 12px',
                  transition: 'border-color 0.15s',
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 4, color: isFixed ? 'var(--lime)' : 'var(--magenta)', fontFamily: 'var(--f-mono)' }}>
                    {isFixed ? `✓ ${b.label}` : b.label}
                  </div>
                  {!isFixed && (
                    <>
                      <div style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 6 }}>{b.hint}</div>
                      <pre style={{ margin: '0 0 8px 0', padding: '6px 8px', background: 'rgba(255,40,100,0.07)', borderRadius: 4, fontSize: 11, fontFamily: 'var(--f-mono)', color: 'var(--magenta)', whiteSpace: 'pre-wrap' }}>{b.code}</pre>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {b.opts.map((opt, i) => (
                          <button key={i} className="ag-quiz-opt" style={{ flex: '1 1 auto', padding: '5px 10px', fontSize: 11 }} onClick={() => chooseFix(b.id, b.correct, i)}>
                            {opt}
                          </button>
                        ))}
                      </div>
                    </>
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
            <div className="ag-quiz-eyebrow">Knowledge Check — Gate P-15</div>
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
            <span className="ag-done-emoji">🌱</span>
            <span className="ag-done-xp">+800 XP</span>
            <h2 className="ag-done-title">The Rot Detector</h2>
            <p className="ag-done-flavor">THE ROT SEED defeated. Six bugs. Six fixes. The system runs clean. You built it. You understand it. You fixed it. JavaScript is next.</p>
            <div className="ag-done-rewards">
              <span className="ag-done-reward">Rot Seed Core</span>
              <span className="ag-done-reward">Python Master Badge</span>
            </div>
            <button className="ag-done-btn" onClick={() => goto('academy/dashboard')}>Builder HQ →</button>
          </div>
        </div>
      )}
    </div>
  )
}

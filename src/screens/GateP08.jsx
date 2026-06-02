import { useState } from 'react'
import './AcademyGate.css'
import { useNav } from '../context/NavigationContext'
import { useAcademy } from '../context/AcademyContext'

const GATE_ID = 'P-08'
const GATE_XP = 330

const STARTER = `# Class Constructor — Citizen Blueprint

class Citizen:
    def __init__(self, name, level, sector):
        # Store parameters as instance variables
        pass

    def describe(self):
        # Return f-string: "Lucy (Level 3) — Sector Alpha"
        pass

    def promote(self):
        # Increase self.level by 1
        pass

    def __str__(self):
        # Return the describe() string
        pass

# Create two independent Citizen objects
# c1 = Citizen("Lucy", 3, "Alpha")
# c2 = Citizen("Alex", 1, "Gamma")

# Subclass with inheritance
# class SpecialCitizen(Citizen):
#     def __init__(self, name, level, sector, ability):
#         super().__init__(name, level, sector)
#         self.ability = ability
`

const CHECKS = [
  { id: 'c1', label: '__init__ sets up correctly',  hint: 'The Citizen class isn\'t storing the name, level, or sector. In __init__, use self.name = name to store each parameter.',      test: c => /def\s+__init__\s*\(/.test(c) && /self\.\w+\s*=\s*\w+/.test(c) },
  { id: 'c2', label: 'describe method correct',     hint: 'describe() returns wrong format or doesn\'t exist. Return an f-string combining self.name, self.level, self.sector.',         test: c => /def\s+describe\s*\(\s*self/.test(c) },
  { id: 'c3', label: 'promote changes level',       hint: 'promote() doesn\'t increase the level. Inside the method: self.level += 1',                                                   test: c => /def\s+promote\s*\(\s*self/.test(c) && /self\.level\s*[+\-]?=/.test(c) },
  { id: 'c4', label: '__str__ implemented',          hint: 'print(citizen) shows a memory address instead of a description. Implement __str__ to return the describe() string.',          test: c => /def\s+__str__\s*\(\s*self/.test(c) },
  { id: 'c5', label: 'Objects are independent',     hint: 'Each object should have its own independent data. Create at least two: c1 = Citizen("Lucy", 3, "Alpha") and c2 = Citizen(...).',   test: c => (c.match(/Citizen\s*\(/g) || []).length >= 2 },
  { id: 'c6', label: 'Inheritance works',           hint: 'Write class SpecialCitizen(Citizen): with super().__init__(...) called correctly inside its __init__.',                         test: c => /class\s+\w+\s*\(\s*Citizen\s*\)/.test(c) && /super\s*\(\s*\)\s*\.__init__/.test(c) },
]

const QUIZ = {
  q: 'self appears in every method but you never pass it when calling (c1.promote(), not c1.promote(c1)). What is self and why does Python not require you to pass it?',
  opts: [
    'self is a Python keyword meaning "the current file" — it is automatically available everywhere in the program.',
    'self refers to the object the method is called on — Python passes it automatically when you use dot notation (c1.promote() tells Python: self = c1).',
    'self is optional — you can name it anything and Python will figure out which object to use from context.',
    'self is only needed in __init__ — other methods access the object through a different built-in mechanism.',
  ],
  correct: 1,
}

function Scene({ passCount }) {
  return (
    <div className="ag-scene" style={{ '--ac': 'var(--violet)' }}>
      <span className="ag-scene-label">CLASS CONSTRUCTOR — GATE P-08</span>
      <div className="ag-py-terminal">
        <div className="ag-py-terminal-bar">
          <span className="ag-py-dot" style={{ background: 'var(--magenta)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--amber)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--lime)' }} />
          <span style={{ flex: 1, textAlign: 'center', fontSize: 9, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)' }}>citizen.py</span>
        </div>
        <div className="ag-py-output">
          {passCount === 0 && <div className="ag-py-line" style={{ opacity: 0.35 }}>$ python3 citizen.py</div>}
          {passCount >= 1 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>__init__ stores variables</span></div>}
          {passCount >= 2 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>describe() method ready</span></div>}
          {passCount >= 3 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>promote() modifies level</span></div>}
          {passCount >= 4 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>__str__ implemented</span></div>}
          {passCount >= 5 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>two independent objects created</span></div>}
          {passCount >= 6 && <div className="ag-py-line">&gt;&gt;&gt; <span style={{ color: 'var(--violet)' }}>ALL CHECKS PASSED!</span></div>}
        </div>
      </div>
    </div>
  )
}

export default function GateP08() {
  const { goto } = useNav()
  const { activeChild, completeAcademyGate } = useAcademy()
  const [code, setCode]           = useState(STARTER)
  const [running, setRunning]     = useState(false)
  const [quizOpen, setQuizOpen]   = useState(false)
  const [quizOrder, setQuizOrder] = useState(null)
  const [quizWrong, setQuizWrong] = useState(false)
  const [done, setDone]           = useState(false)

  const checks   = CHECKS.map(c => ({ ...c, passed: c.test(code) }))
  const allPassed = checks.every(c => c.passed)
  const passCount = checks.filter(c => c.passed).length

  async function handleRun() {
    if (!allPassed || running) return
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
        <span className="ag-rank-badge" style={{ '--ac': 'var(--violet)' }}>RANK C</span>
        <h1 className="ag-gate-name">The Class Constructor</h1>
        <span className="ag-concept-tag">Classes &amp; Objects</span>
        <span className="ag-xp-tag" style={{ color: 'var(--violet)' }}>+330 XP</span>
      </div>

      <div className="ag-body">
        <div className="ag-left">
          <Scene passCount={passCount} />
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
            {running ? '⟳ Running checks…' : allPassed ? '▶ BUILD CITIZENS' : `○ ${6 - passCount} check${6 - passCount !== 1 ? 's' : ''} remaining`}
          </button>
        </div>

        <div className="ag-right">
          <div className="ag-instruction">
            Create the Construct's <strong>Citizen class</strong> — a blueprint for citizen objects. Implement <strong>__init__</strong> to store data, <strong>describe()</strong> and <strong>__str__</strong> for display, <strong>promote()</strong> to level up, then create two independent citizen objects. Extend with a <strong>SpecialCitizen subclass</strong> using inheritance.
          </div>
          <div className="ag-py-editor">
            <div className="ag-py-editor-head">🐍 citizen.py</div>
            <textarea
              className="ag-py-code"
              value={code}
              onChange={e => setCode(e.target.value)}
              rows={14}
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="none"
              autoComplete="off"
            />
          </div>
        </div>
      </div>

      {quizOpen && (
        <div className="ag-quiz-bd">
          <div className={`ag-quiz-card${quizWrong ? ' wrong' : ''}`}>
            <div className="ag-quiz-eyebrow">Knowledge Check — Gate P-08</div>
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
            <span className="ag-done-emoji">🏗️</span>
            <span className="ag-done-xp">+330 XP</span>
            <h2 className="ag-done-title">The Class Constructor</h2>
            <p className="ag-done-flavor">The Class Constructor runs. Citizens are blueprinted, built, and independent. Python objects are the Construct's citizens made real.</p>
            <div className="ag-done-rewards">
              <span className="ag-done-reward">Blueprint Fragment</span>
              <span className="ag-done-reward">OOP Badge I</span>
            </div>
            <button className="ag-done-btn" onClick={() => goto('academy/dashboard')}>Builder HQ →</button>
          </div>
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import './AcademyGate.css'
import { useNav } from '../context/NavigationContext'
import { useAcademy } from '../context/AcademyContext'
import { stripComments } from '../lib/codeUtils'
import GateAIHint from '../components/GateAIHint'

const GATE_ID = 'P-18'
const GATE_XP = 385

const STARTER = `# The Inheritance Tower — Advanced OOP

# 1. Base class with dunder methods
# class Citizen:
#     def __init__(self, name, level):
#         self.name = name
#         self.level = level
#     def __repr__(self):
#         return f"Citizen({self.name}, {self.level})"
#     def __eq__(self, other):
#         return self.name == other.name and self.level == other.level

# 2. Classmethod and staticmethod
#     @classmethod
#     def from_string(cls, data):
#         name, level = data.split(":")
#         return cls(name, int(level))
#     @staticmethod
#     def validate_level(level):
#         return 1 <= level <= 5

# 3. Subclass with method override
# class SpecialCitizen(Citizen):
#     def __init__(self, name, level, ability):
#         super().__init__(name, level)
#         self.ability = ability
#     def describe(self):
#         return f"{self.name} — ability: {self.ability}"

# 4. Abstract base class
# from abc import ABC, abstractmethod
# class Role(ABC):
#     @abstractmethod
#     def get_permissions(self):
#         pass
# class NetrunnerRole(Role):
#     def get_permissions(self):
#         return ["hack", "breach"]
`

const CHECKS = [
  { id: 'c1', label: 'Inheritance chain correct',     hint: 'SpecialCitizen must inherit from Citizen and call super().__init__().',              test: c => /class\s+\w+\s*\(\s*\w+\s*\)/.test(c) && /super\s*\(\s*\)/.test(c) },
  { id: 'c2', label: 'Method overriding works',       hint: 'SpecialCitizen needs its own describe() or another overridden method.',              test: c => /def\s+describe\s*\(/.test(c) },
  { id: 'c3', label: 'Abstract class enforced',       hint: 'Import ABC, abstractmethod. Mark the method with @abstractmethod.',                  test: c => /\bABC\b/.test(c) && /\babstractmethod\b/.test(c) },
  { id: 'c4', label: '__repr__ implemented',          hint: 'print(citizen) shows a memory address. Implement __repr__ to return a readable string.',test: c => /def\s+__repr__\s*\(/.test(c) },
  { id: 'c5', label: '__eq__ compares correctly',     hint: '__eq__ must compare name and level attributes.',                                     test: c => /def\s+__eq__\s*\(/.test(c) },
  { id: 'c6', label: 'classmethod constructor works', hint: 'Use @classmethod and cls() to create instances from a string.',                      test: c => /@classmethod/.test(c) },
  { id: 'c7', label: 'staticmethod validates correctly',hint: 'Use @staticmethod — static methods don\'t receive self or cls.',                  test: c => /@staticmethod/.test(c) },
]

const QUIZ = {
  q: 'You used @classmethod for from_string() and @staticmethod for validate_level(). What\'s the key difference between them?',
  opts: [
    'Classmethods are faster because they bypass the instance lookup mechanism.',
    'Classmethods receive the class as first argument (cls) so they can create instances or access class attributes. Staticmethods receive nothing — they\'re just functions organized inside the class.',
    'Staticmethods can be called on instances, classmethods can only be called on the class itself.',
    'Classmethods are inherited by subclasses, staticmethods are not.',
  ],
  correct: 1,
}

function Scene({ passCount }) {
  return (
    <div className="ag-scene" style={{ '--ac': 'var(--violet)' }}>
      <span className="ag-scene-label">INHERITANCE TOWER — GATE P-18</span>
      <div className="ag-py-terminal">
        <div className="ag-py-terminal-bar">
          <span className="ag-py-dot" style={{ background: 'var(--magenta)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--amber)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--lime)' }} />
          <span style={{ flex: 1, textAlign: 'center', fontSize: 9, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)' }}>oop.py</span>
        </div>
        <div className="ag-py-output">
          {passCount === 0 && <div className="ag-py-line" style={{ opacity: 0.35 }}>&gt; running oop.py…</div>}
          {passCount >= 1 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>inheritance chain linked</span></div>}
          {passCount >= 2 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>method override active</span></div>}
          {passCount >= 3 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>abstract class enforced</span></div>}
          {passCount >= 4 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>__repr__ ready</span></div>}
          {passCount >= 5 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>__eq__ wired</span></div>}
          {passCount >= 6 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>classmethod ready</span></div>}
          {passCount >= 7 && <div className="ag-py-line">&gt; <span style={{ color: 'var(--violet)' }}>TOWER COMPLETE — ALL FLOORS CONNECTED!</span></div>}
        </div>
      </div>
    </div>
  )
}

export default function GateP18() {
  const { goto } = useNav()
  const { activeChild, completeAcademyGate } = useAcademy()
  const [code, setCode]           = useState(STARTER)
  const [running, setRunning]     = useState(false)
  const [quizOpen, setQuizOpen]   = useState(false)
  const [quizOrder, setQuizOrder] = useState(null)
  const [quizWrong, setQuizWrong] = useState(false)
  const [done, setDone]           = useState(false)

  const checks    = CHECKS.map(c => ({ ...c, passed: c.test(c.raw ? code : stripComments(code)) }))
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
        <span className="ag-rank-badge" style={{ '--ac': 'var(--violet)' }}>RANK B</span>
        <h1 className="ag-gate-name">The Inheritance Tower</h1>
        <span className="ag-concept-tag">Advanced OOP</span>
        <span className="ag-xp-tag" style={{ color: 'var(--violet)' }}>+385 XP</span>
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
            {running ? '⟳ Running checks…' : allPassed ? '▶ BUILD TOWER' : `○ ${7 - passCount} check${7 - passCount !== 1 ? 's' : ''} remaining`}
          </button>
          <GateAIHint code={code} checks={checks} gateId={GATE_ID} lang="python" done={done} />
        </div>

        <div className="ag-right">
          <div className="ag-instruction">
            Build the Construct's citizen hierarchy. Write a base class with <strong>__repr__</strong> and <strong>__eq__</strong>. Add a <strong>subclass</strong> that calls <strong>super()</strong> and overrides a method. Create an <strong>abstract base class</strong> (ABC). Add a <strong>@classmethod</strong> alternative constructor and a <strong>@staticmethod</strong> validator.
          </div>
          <div className="ag-py-editor">
            <div className="ag-py-editor-head">⚡ oop.py</div>
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
            <div className="ag-quiz-eyebrow">Knowledge Check — Gate P-18</div>
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
            <span className="ag-done-emoji">🏰</span>
            <span className="ag-done-xp">+385 XP</span>
            <h2 className="ag-done-title">The Inheritance Tower</h2>
            <p className="ag-done-flavor">The Inheritance Tower stands. Seven floors. One hierarchy. Abstract at the top, concrete at the bottom. OOP as it was meant to be.</p>
            <div className="ag-done-rewards">
              <span className="ag-done-reward">Tower Fragment</span>
              <span className="ag-done-reward">OOP Badge II</span>
            </div>
            <button className="ag-done-btn" onClick={() => goto('academy/dashboard')}>Builder HQ →</button>
          </div>
        </div>
      )}
    </div>
  )
}

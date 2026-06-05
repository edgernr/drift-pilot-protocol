import { useState } from 'react'
import './AcademyGate.css'
import { useNav } from '../context/NavigationContext'
import { useAcademy } from '../context/AcademyContext'
import { stripComments } from '../lib/codeUtils'
import GateAIHint from '../components/GateAIHint'

const GATE_ID = 'P-23'
const GATE_XP = 300

const STARTER = `# The Type System — Making Contracts Explicit

# 1. Basic type annotations on function
# def greet(name: str) -> str:
#     return f"Hello, {name}"

# 2. Optional type — value may be None
# from typing import Optional
# def find_citizen(name: str) -> Optional[dict]:
#     return citizens.get(name)

# 3. Collection types
# from typing import List, Dict
# def get_names(citizens: List[dict]) -> List[str]:
#     return [c["name"] for c in citizens]
# registry: Dict[str, int] = {}

# 4. Protocol — structural typing
# from typing import Protocol
# class Describable(Protocol):
#     def describe(self) -> str: ...

# 5. isinstance check at runtime
# def process(value: str | int) -> str:
#     if isinstance(value, int):
#         return str(value)
#     return value

# 6. Type hints are hints — not enforced at runtime
# Runtime vs static analysis comment:
# mypy / pyright check types statically
# Python ignores annotations at runtime
`

const CHECKS = [
  { id: 'c1', label: 'Function annotations present', hint: 'Add type hints to function parameters and return: def func(x: str) -> str:',               test: c => /def\s+\w+\s*\([^)]*:\s*\w+[^)]*\)\s*->/.test(c) },
  { id: 'c2', label: 'Optional type used',           hint: 'Import Optional from typing. Use Optional[type] when a value can be None.',               test: c => /\bOptional\b/.test(c) },
  { id: 'c3', label: 'List and Dict types used',     hint: 'Use List[...] and Dict[..., ...] from typing (or list[...] and dict[...] in Python 3.9+).', test: c => /\bList\b/.test(c) || /\bDict\b/.test(c) || /list\[/.test(c) || /dict\[/.test(c) },
  { id: 'c4', label: 'Protocol class defined',       hint: 'Import Protocol from typing. Create a Protocol class to define a structural interface.',   test: c => /\bProtocol\b/.test(c) },
  { id: 'c5', label: 'isinstance used at runtime',   hint: 'Use isinstance(value, type) to check types at runtime — type hints alone are not enforced.',test: c => /\bisinstance\s*\(/.test(c) },
  { id: 'c6', label: 'Runtime vs static comment',   hint: 'Add a comment explaining that type hints are for static tools (mypy/pyright), not Python itself.',test: c => /\bmypy\b|\bpyright\b|\bstatic\b/i.test(c) },
]

const QUIZ = {
  q: 'Python does not enforce type hints at runtime — you can pass a number where a string is expected and Python won\'t complain. What is the actual purpose of type hints then?',
  opts: [
    'They are just documentation — there is no technical benefit beyond making code readable.',
    'Static analysis tools like mypy and pyright, plus IDEs, use them to catch type errors before you run the code — like a compiler check for a dynamic language.',
    'They slow Python down slightly, so they should only be used in critical performance paths.',
    'They are required for Python to generate optimized bytecode in Python 3.10+.',
  ],
  correct: 1,
}

function Scene({ passCount }) {
  return (
    <div className="ag-scene" style={{ '--ac': 'var(--amber)' }}>
      <span className="ag-scene-label">TYPE SYSTEM — GATE P-23</span>
      <div className="ag-py-terminal">
        <div className="ag-py-terminal-bar">
          <span className="ag-py-dot" style={{ background: 'var(--magenta)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--amber)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--lime)' }} />
          <span style={{ flex: 1, textAlign: 'center', fontSize: 9, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)' }}>types.py</span>
        </div>
        <div className="ag-py-output">
          {passCount === 0 && <div className="ag-py-line" style={{ opacity: 0.35 }}>&gt; running types.py…</div>}
          {passCount >= 1 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>annotations active</span></div>}
          {passCount >= 2 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>Optional wired</span></div>}
          {passCount >= 3 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>collections typed</span></div>}
          {passCount >= 4 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>Protocol defined</span></div>}
          {passCount >= 5 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>runtime check active</span></div>}
          {passCount >= 6 && <div className="ag-py-line">&gt; <span style={{ color: 'var(--amber)' }}>CONTRACT SIGNED — TYPE SYSTEM ACTIVE!</span></div>}
        </div>
      </div>
    </div>
  )
}

export default function GateP23() {
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
        <span className="ag-rank-badge" style={{ '--ac': 'var(--amber)' }}>RANK B</span>
        <h1 className="ag-gate-name">The Type System</h1>
        <span className="ag-concept-tag">Type Hints</span>
        <span className="ag-xp-tag" style={{ color: 'var(--amber)' }}>+300 XP</span>
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
            className="ag-run-btn" style={{ '--ac': 'var(--amber)' }}
            onClick={handleRun} disabled={!allPassed || running}
          >
            {running ? '⟳ Running checks…' : allPassed ? '▶ SIGN CONTRACT' : `○ ${6 - passCount} check${6 - passCount !== 1 ? 's' : ''} remaining`}
          </button>
          <GateAIHint code={code} checks={checks} gateId={GATE_ID} lang="python" done={done} />
        </div>

        <div className="ag-right">
          <div className="ag-instruction">
            Make Python's contracts explicit with type hints. Add <strong>parameter and return annotations</strong>. Use <strong>Optional</strong> for nullable values. Type collections with <strong>List and Dict</strong>. Define structural interfaces with <strong>Protocol</strong>. Use <strong>isinstance</strong> for runtime checks. Understand the difference between <strong>static analysis and runtime</strong>.
          </div>
          <div className="ag-py-editor">
            <div className="ag-py-editor-head">⚡ types.py</div>
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
            <div className="ag-quiz-eyebrow">Knowledge Check — Gate P-23</div>
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
            <span className="ag-done-emoji">📋</span>
            <span className="ag-done-xp">+300 XP</span>
            <h2 className="ag-done-title">The Type System</h2>
            <p className="ag-done-flavor">Contracts signed. Types declared. Mypy runs silent. The Construct's code speaks its intentions before it runs.</p>
            <div className="ag-done-rewards">
              <span className="ag-done-reward">Type Fragment</span>
              <span className="ag-done-reward">Contract Badge I</span>
            </div>
            <button className="ag-done-btn" onClick={() => goto('academy/dashboard')}>Builder HQ →</button>
          </div>
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import './AcademyGate.css'
import { useNav } from '../context/NavigationContext'
import { useAcademy } from '../context/AcademyContext'
import { stripComments } from '../lib/codeUtils'
import GateAIHint from '../components/GateAIHint'

const GATE_ID = 'P-13'
const GATE_XP = 275

const STARTER = `# Module Network — Standard Library + Own Module

# 1. Standard library: import and use random
import random
citizen_id = random.randint(1000, 9999)

# 2. Use math for calculations
# import math
# power = math.sqrt(256)

# 3. Define a module function (simulate citizen_manager.py)
# def create_citizen(name, level):
#     return {"name": name, "level": level}

# 4. from ... import syntax
# from random import choice
# sector = choice(["Alpha", "Beta", "Gamma"])

# 5. Name guard — only runs when file is run directly
# if __name__ == "__main__":
#     print("Running as main script")
`

const CHECKS = [
  { id: 'c1', label: 'Standard library imported correctly', hint: 'The import statement is missing or uses wrong module name. Use import math, not import Math.',                test: c => /\bimport\s+(math|random|os|datetime|json)\b/.test(c) },
  { id: 'c2', label: 'random generates valid IDs',          hint: 'The random ID is outside 1000-9999 range. Use random.randint(1000, 9999).',                                  test: c => /random\.randint\s*\(/.test(c) },
  { id: 'c3', label: 'Own module function defined',         hint: 'citizen_manager.py is missing the required functions. Define: def create_citizen(name, level): ...',         test: c => /def\s+create_\w+\s*\(/.test(c) },
  { id: 'c4', label: 'Module imported correctly',           hint: 'main.py isn\'t importing from citizen_manager. Use: from citizen_manager import function_name.',              test: c => /\bfrom\s+\w+\s+import\b/.test(c) },
  { id: 'c5', label: '__name__ guard present',              hint: 'Test code in citizen_manager.py runs when imported. Wrap it: if __name__ == "__main__":',                     test: c => /__name__\s*==\s*["']__main__["']/.test(c) },
]

const QUIZ = {
  q: 'The __name__ == "__main__" guard prevents test code from running when citizen_manager is imported. Why would running test code on import be a problem?',
  opts: [
    'It\'s not a problem — test code always runs when a module is imported.',
    'Test code on import would run every time any file imports the module, potentially causing side effects, printing unwanted output, or running slow tests on every import.',
    'Python raises an error if test code runs during an import.',
    'Test code causes import to fail because Python expects only function definitions in importable modules.',
  ],
  correct: 1,
}

function Scene({ passCount }) {
  return (
    <div className="ag-scene" style={{ '--ac': 'var(--lime)' }}>
      <span className="ag-scene-label">MODULE NETWORK — GATE P-13</span>
      <div className="ag-py-terminal">
        <div className="ag-py-terminal-bar">
          <span className="ag-py-dot" style={{ background: 'var(--magenta)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--amber)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--lime)' }} />
          <span style={{ flex: 1, textAlign: 'center', fontSize: 9, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)' }}>main.py</span>
        </div>
        <div className="ag-py-output">
          {passCount === 0 && <div className="ag-py-line" style={{ opacity: 0.35 }}>$ python3 main.py</div>}
          {passCount >= 1 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>stdlib module imported</span></div>}
          {passCount >= 2 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>random.randint() generating IDs</span></div>}
          {passCount >= 3 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>module function defined</span></div>}
          {passCount >= 4 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>from...import connected</span></div>}
          {passCount >= 5 && <div className="ag-py-line">&gt;&gt;&gt; <span style={{ color: 'var(--lime)' }}>ALL CHECKS PASSED!</span></div>}
        </div>
      </div>
    </div>
  )
}

export default function GateP13() {
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
        <span className="ag-rank-badge" style={{ '--ac': 'var(--lime)' }}>RANK B</span>
        <h1 className="ag-gate-name">The Module Network</h1>
        <span className="ag-concept-tag">Modules</span>
        <span className="ag-xp-tag" style={{ color: 'var(--lime)' }}>+275 XP</span>
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
            className="ag-run-btn" style={{ '--ac': 'var(--lime)' }}
            onClick={handleRun} disabled={!allPassed || running}
          >
            {running ? '⟳ Running checks…' : allPassed ? '▶ CONNECT NETWORK' : `○ ${5 - passCount} check${5 - passCount !== 1 ? 's' : ''} remaining`}
          </button>
          <GateAIHint code={code} checks={checks} gateId={GATE_ID} lang="python" done={done} />
        </div>

        <div className="ag-right">
          <div className="ag-instruction">
            Wire the Construct's <strong>module network</strong>. Use the <strong>standard library</strong> (random, math, os), define your own <strong>module function</strong>, use <strong>from...import</strong> syntax, and protect test code with a <strong>__name__ guard</strong>. Code organized is code reused.
          </div>
          <div className="ag-py-editor">
            <div className="ag-py-editor-head">🐍 main.py</div>
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
            <div className="ag-quiz-eyebrow">Knowledge Check — Gate P-13</div>
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
          <div className="ag-done-card" style={{ '--ac': 'var(--lime)' }}>
            <span className="ag-done-emoji">🔗</span>
            <span className="ag-done-xp">+275 XP</span>
            <h2 className="ag-done-title">The Module Network</h2>
            <p className="ag-done-flavor">The Module Network connects. Code organized, reused, shared. The Construct's systems link together through Python modules.</p>
            <div className="ag-done-rewards">
              <span className="ag-done-reward">Module Fragment</span>
              <span className="ag-done-reward">Module Badge I</span>
            </div>
            <button className="ag-done-btn" onClick={() => goto('academy/dashboard')}>Builder HQ →</button>
          </div>
        </div>
      )}
    </div>
  )
}

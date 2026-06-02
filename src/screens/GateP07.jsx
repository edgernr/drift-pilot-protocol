import { useState } from 'react'
import './AcademyGate.css'
import { useNav } from '../context/NavigationContext'
import { useAcademy } from '../context/AcademyContext'

const GATE_ID = 'P-07'
const GATE_XP = 280

const STARTER = `# Dictionary District — Sector Database
sector = {
    "name": "Alpha",
    "population": 1000,
    "status": "active",
    "access_level": 3
}

# 1. Access sector["name"]

# 2. Update population to 1200

# 3. Add a new key: sector["founded"] = 2050

# 4. Delete the "access_level" key with del

# 5. Use .keys(), .values(), or .items()

# 6. Create nested dict: sector["sub_districts"] = {"North": 300, "South": 700}
#    Then access sector["sub_districts"]["North"]

# 7. Dict comprehension: double all population values
# populations = {"Alpha": 1000, "Beta": 800, "Gamma": 1200}
# doubled = {k: v*2 for k, v in populations.items()}
`

const CHECKS = [
  { id: 'c1', label: 'Dictionary created correctly', hint: 'The sector dictionary is missing required keys or uses wrong syntax. Use {"key": value} format.',                       test: c => /\{['"]?\w+['"]?\s*:/.test(c) },
  { id: 'c2', label: 'Value access correct',         hint: 'Values aren\'t being accessed. Use sector["key"] to get a value or sector.get("key") for safety.',                    test: c => /\w+\s*\[\s*["']\w+["']\s*\]/.test(c) },
  { id: 'c3', label: 'Values updated',               hint: 'The population update isn\'t working. Assign directly: sector["population"] = 1200',                                  test: c => /\w+\s*\[\s*["']\w+["']\s*\]\s*=/.test(c) },
  { id: 'c4', label: 'Key deleted',                  hint: 'The access_level key still exists. Use del sector["key"] to remove it.',                                               test: c => /\bdel\s+\w+\[/.test(c) },
  { id: 'c5', label: 'Keys/values iterated',         hint: 'Call sector.keys(), sector.values(), or sector.items() to iterate over the dictionary.',                               test: c => /\.(keys|values|items)\s*\(/.test(c) },
  { id: 'c6', label: 'Nested dict accessed',         hint: 'The sub-district value isn\'t being accessed correctly. Use sector["sub_districts"]["North"]',                         test: c => /\w+\s*\[\s*["']\w+["']\s*\]\s*\[\s*["']\w+["']\s*\]/.test(c) },
  { id: 'c7', label: 'Dict comprehension correct',   hint: 'The comprehension syntax is wrong or produces incorrect values. Try: {k: v*2 for k, v in populations.items()}',      test: c => /\{\s*\w+\s*:\s*\w+.+for\s+\w+.*in\s+\w+\.items\s*\(/.test(c) },
]

const QUIZ = {
  q: 'You need to find a citizen\'s access level using their ID number. Should you store this in a list or a dictionary, and why?',
  opts: [
    'List — lists are simpler and work for any type of data storage.',
    'Dictionary — you can look up a citizen by their ID directly (id → access_level), making lookup instant instead of searching through every item.',
    'Either works equally well — the choice is just personal preference.',
    'List — dictionaries can only store text as keys, not ID numbers.',
  ],
  correct: 1,
}

function Scene({ passCount }) {
  return (
    <div className="ag-scene" style={{ '--ac': 'var(--teal)' }}>
      <span className="ag-scene-label">DICTIONARY DISTRICT — GATE P-07</span>
      <div className="ag-py-terminal">
        <div className="ag-py-terminal-bar">
          <span className="ag-py-dot" style={{ background: 'var(--magenta)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--amber)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--lime)' }} />
          <span style={{ flex: 1, textAlign: 'center', fontSize: 9, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)' }}>sector_db.py</span>
        </div>
        <div className="ag-py-output">
          {passCount === 0 && <div className="ag-py-line" style={{ opacity: 0.35 }}>$ python3 sector_db.py</div>}
          {passCount >= 1 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>dictionary created</span></div>}
          {passCount >= 2 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>value accessed by key</span></div>}
          {passCount >= 3 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>value updated</span></div>}
          {passCount >= 4 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>key deleted</span></div>}
          {passCount >= 5 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>.items() iteration</span></div>}
          {passCount >= 6 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>nested dict accessed</span></div>}
          {passCount >= 7 && <div className="ag-py-line">&gt;&gt;&gt; <span style={{ color: 'var(--teal)' }}>ALL CHECKS PASSED!</span></div>}
        </div>
      </div>
    </div>
  )
}

export default function GateP07() {
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
        <span className="ag-rank-badge" style={{ '--ac': 'var(--teal)' }}>RANK D</span>
        <h1 className="ag-gate-name">The Dictionary District</h1>
        <span className="ag-concept-tag">Dictionaries</span>
        <span className="ag-xp-tag" style={{ color: 'var(--teal)' }}>+280 XP</span>
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
            className="ag-run-btn" style={{ '--ac': 'var(--teal)' }}
            onClick={handleRun} disabled={!allPassed || running}
          >
            {running ? '⟳ Running checks…' : allPassed ? '▶ RUN DATABASE' : `○ ${7 - passCount} check${7 - passCount !== 1 ? 's' : ''} remaining`}
          </button>
        </div>

        <div className="ag-right">
          <div className="ag-instruction">
            Build the Construct's <strong>sector database</strong> using Python dictionaries. Access and update values, add and delete keys, iterate with <strong>.keys()/.values()/.items()</strong>, create a <strong>nested dict</strong>, and transform data with a <strong>dict comprehension</strong>. Structured data done right.
          </div>
          <div className="ag-py-editor">
            <div className="ag-py-editor-head">🐍 sector_db.py</div>
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
            <div className="ag-quiz-eyebrow">Knowledge Check — Gate P-07</div>
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
            <span className="ag-done-emoji">🗺️</span>
            <span className="ag-done-xp">+280 XP</span>
            <h2 className="ag-done-title">The Dictionary District</h2>
            <p className="ag-done-flavor">The Dictionary District mapped. Every sector documented. Python dicts are the Construct's structured memory.</p>
            <div className="ag-done-rewards">
              <span className="ag-done-reward">Dict Fragment</span>
              <span className="ag-done-reward">Structure Badge I</span>
            </div>
            <button className="ag-done-btn" onClick={() => goto('academy/dashboard')}>Builder HQ →</button>
          </div>
        </div>
      )}
    </div>
  )
}

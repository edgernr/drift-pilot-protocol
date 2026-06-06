import { useState } from 'react'
import './AcademyGate.css'
import { useNav } from '../context/NavigationContext'
import { useAcademy } from '../context/AcademyContext'
import { stripComments } from '../lib/codeUtils'
import GateAIHint from '../components/GateAIHint'

const GATE_ID = 'P-10'
const GATE_XP = 275

const STARTER = `# File System — Persistent Data Storage
import json

# 1. Write citizens to a text file (mode "w")
with open("citizens.txt", "w") as f:
    f.write("Lucy\\n")
    f.write("Alex\\n")
    f.write("Sam\\n")

# 2. Read citizens back from the file (mode "r")
# with open("citizens.txt", "r") as f:
#     lines = f.readlines()

# 3. Append a new citizen (mode "a" — not "w")
# with open("citizens.txt", "a") as f:
#     f.write("Morgan\\n")

# 4. Save a dict to JSON
# citizens_data = {"Lucy": 3, "Alex": 1}
# with open("citizens.json", "w") as f:
#     json.dump(citizens_data, f)

# 5. Load from JSON
# with open("citizens.json", "r") as f:
#     loaded = json.load(f)
`

const CHECKS = [
  { id: 'c1', label: 'Text file written correctly',  hint: 'The citizens.txt file is empty or has wrong format. Use f.write() inside with open("file", "w").',     test: c => /open\s*\([^)]*["']w["']/.test(c) },
  { id: 'c2', label: 'File read correctly',           hint: 'Reading the file raises an error or returns wrong data. Use open("file", "r") and f.readlines() or f.read().', test: c => /open\s*\([^)]*["']r["']/.test(c) },
  { id: 'c3', label: 'File appended not overwritten', hint: 'Appending overwrites existing data. Use mode "a" not "w" to append.',                                 test: c => /open\s*\([^)]*["']a["']/.test(c) },
  { id: 'c4', label: 'JSON saved correctly',          hint: 'The JSON file is empty or invalid. Use json.dump(data, f) inside with open("file", "w").',             test: c => /json\.dump\s*\(/.test(c) },
  { id: 'c5', label: 'JSON loaded correctly',         hint: 'Loading the JSON raises an error. Use json.load(f) inside with open("file", "r").',                    test: c => /json\.load\s*\(/.test(c) },
]

const QUIZ = {
  q: 'You used with open(...) as f: instead of f = open(...). What happens if you forget to call f.close() with the regular approach?',
  opts: [
    'Python automatically closes all files when the program ends, so it does not matter.',
    'The file stays open, consuming system resources and potentially preventing other programs from accessing it until Python\'s garbage collector eventually closes it.',
    'Python raises an error immediately when you forget to close a file.',
    'The file gets corrupted — unclosed files always lose their last write of data.',
  ],
  correct: 1,
}

function Scene({ passCount }) {
  return (
    <div className="ag-scene" style={{ '--ac': 'var(--teal)' }}>
      <span className="ag-scene-label">FILE SYSTEM — GATE P-10</span>
      <div className="ag-py-terminal">
        <div className="ag-py-terminal-bar">
          <span className="ag-py-dot" style={{ background: 'var(--magenta)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--amber)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--lime)' }} />
          <span style={{ flex: 1, textAlign: 'center', fontSize: 9, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)' }}>files.py</span>
        </div>
        <div className="ag-py-output">
          {passCount === 0 && <div className="ag-py-line" style={{ opacity: 0.35 }}>$ python3 files.py</div>}
          {passCount >= 1 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>file written (mode "w")</span></div>}
          {passCount >= 2 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>file read (mode "r")</span></div>}
          {passCount >= 3 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>file appended (mode "a")</span></div>}
          {passCount >= 4 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>JSON saved</span></div>}
          {passCount >= 5 && <div className="ag-py-line">&gt;&gt;&gt; <span style={{ color: 'var(--teal)' }}>ALL CHECKS PASSED!</span></div>}
        </div>
      </div>
    </div>
  )
}

export default function GateP10() {
  const { goto } = useNav()
  const { activeChild, completeAcademyGate } = useAcademy()
  const [code, setCode]           = useState(STARTER)
  const [running, setRunning]     = useState(false)
  const [quizOpen, setQuizOpen]   = useState(false)
  const [quizOrder, setQuizOrder] = useState(null)
  const [quizWrong, setQuizWrong] = useState(false)
  const [done, setDone]           = useState(false)

  const checks   = CHECKS.map(c => ({ ...c, passed: c.test(c.raw ? code : stripComments(code)) }))
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
        <span className="ag-rank-badge" style={{ '--ac': 'var(--teal)' }}>RANK C</span>
        <h1 className="ag-gate-name">The File System</h1>
        <span className="ag-concept-tag">File I/O</span>
        <span className="ag-xp-tag" style={{ color: 'var(--teal)' }}>+275 XP</span>
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
            {running ? '⟳ Running checks…' : allPassed ? '▶ RUN PROGRAM' : `○ ${5 - passCount} check${5 - passCount !== 1 ? 's' : ''} remaining`}
          </button>
          <GateAIHint code={code} checks={checks} gateId={GATE_ID} lang="python" done={done} />
        </div>

        <div className="ag-right">
          <div className="ag-instruction">
            Save the Construct's data to <strong>files</strong> that survive between runs. Write with <strong>"w"</strong>, read with <strong>"r"</strong>, append with <strong>"a"</strong>. Use <strong>json.dump</strong> and <strong>json.load</strong> for structured data. Always use <strong>with open()</strong> — it closes the file automatically.
          </div>
          <div className="ag-py-editor">
            <div className="ag-py-editor-head">🐍 files.py</div>
            <textarea
              onPaste={e => e.preventDefault()}
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
            <div className="ag-quiz-eyebrow">Knowledge Check — Gate P-10</div>
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
            <span className="ag-done-emoji">💾</span>
            <span className="ag-done-xp">+275 XP</span>
            <h2 className="ag-done-title">The File System</h2>
            <p className="ag-done-flavor">The Construct remembers now. Data survives between sessions. Python file I/O gives the world permanent memory.</p>
            <div className="ag-done-rewards">
              <span className="ag-done-reward">File Fragment</span>
              <span className="ag-done-reward">Persistence Badge I</span>
            </div>
            <button className="ag-done-btn" onClick={() => goto('academy/dashboard')}>Builder HQ →</button>
          </div>
        </div>
      )}
    </div>
  )
}

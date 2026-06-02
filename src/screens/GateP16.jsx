import { useState } from 'react'
import './AcademyGate.css'
import { useNav } from '../context/NavigationContext'
import { useAcademy } from '../context/AcademyContext'

const GATE_ID = 'P-16'
const GATE_XP = 315

const STARTER = `# The String Forge — Processing Citizen Data Feeds

# 1. Strip whitespace from raw input
# raw = "  LUCY_ALPHA_5  "
# cleaned = raw.strip()

# 2. Split CSV data
# entries = "LUCY,ALEX,SAM".split(",")
# → ["LUCY", "ALEX", "SAM"]

# 3. Join data back
# "_".join(["LUCY", "ALPHA", "5"])
# → "LUCY_ALPHA_5"

# 4. Replace corrupted characters
# "CORRUPTED_DATA".replace("CORRUPTED", "CLEAN")

# 5. Validate format with startswith / endswith
# "LUCY_5".startswith("LUCY")  → True
# "LUCY_5".endswith("5")       → True

# 6. Palindrome check with slicing
# word = "RACECAR"
# is_palindrome = word[::-1] == word  → True

# 7. Multiline string — parse into dict
# report = """
# Sector: Alpha
# Population: 1000
# Status: active
# """
`

const CHECKS = [
  { id: 'c1', label: 'Whitespace stripped correctly',  hint: 'Raw data still has spaces. Call .strip() on each entry after splitting.',               test: c => /\.strip\s*\(\)/.test(c) },
  { id: 'c2', label: 'CSV data split correctly',       hint: 'Split on comma: data.split(",") — then strip each piece.',                              test: c => /\.split\s*\(/.test(c) },
  { id: 'c3', label: 'Data joined correctly',          hint: 'The separator goes between items, not at the end. Use separator.join(list).',           test: c => /\.join\s*\(/.test(c) },
  { id: 'c4', label: 'Replace cleans corruption',      hint: '.replace() takes what to find and what to replace with.',                               test: c => /\.replace\s*\(/.test(c) },
  { id: 'c5', label: 'Format validation works',        hint: 'Check the exact string. Use .startswith() AND .endswith().',                            test: c => /\.startswith\s*\(/.test(c) && /\.endswith\s*\(/.test(c) },
  { id: 'c6', label: 'Palindrome check correct',       hint: 'Reverse with [::-1] and compare to the original string.',                              test: c => /\[::-1\]/.test(c) },
  { id: 'c7', label: 'Multiline parsed correctly',     hint: 'Use triple-quoted strings (""") then split on newlines and colons.',                   test: c => /"""/.test(c) || /'''/.test(c) },
]

const QUIZ = {
  q: '"LISTEN" and "SILENT" are anagrams. You checked this by sorting both strings and comparing. Why does sorting work to detect anagrams?',
  opts: [
    'Sorting puts characters in the same order regardless of their original positions — two words with identical characters produce identical sorted strings.',
    'Sorting removes duplicate characters, making it easier to compare unique letters.',
    'Python\'s sort function has special anagram detection built in that activates when strings are compared after sorting.',
    'Sorting converts strings to lowercase automatically, making comparison case-insensitive.',
  ],
  correct: 0,
}

function Scene({ passCount }) {
  return (
    <div className="ag-scene" style={{ '--ac': 'var(--amber)' }}>
      <span className="ag-scene-label">STRING FORGE — GATE P-16</span>
      <div className="ag-py-terminal">
        <div className="ag-py-terminal-bar">
          <span className="ag-py-dot" style={{ background: 'var(--magenta)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--amber)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--lime)' }} />
          <span style={{ flex: 1, textAlign: 'center', fontSize: 9, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)' }}>strings.py</span>
        </div>
        <div className="ag-py-output">
          {passCount === 0 && <div className="ag-py-line" style={{ opacity: 0.35 }}>&gt; running strings.py…</div>}
          {passCount >= 1 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>strip active</span></div>}
          {passCount >= 2 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>split active</span></div>}
          {passCount >= 3 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>join active</span></div>}
          {passCount >= 4 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>replace active</span></div>}
          {passCount >= 5 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>validation active</span></div>}
          {passCount >= 6 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>palindrome active</span></div>}
          {passCount >= 7 && <div className="ag-py-line">&gt; <span style={{ color: 'var(--amber)' }}>STRING FORGE RUNNING CLEAN!</span></div>}
        </div>
      </div>
    </div>
  )
}

export default function GateP16() {
  const { goto } = useNav()
  const { activeChild, completeAcademyGate } = useAcademy()
  const [code, setCode]           = useState(STARTER)
  const [running, setRunning]     = useState(false)
  const [quizOpen, setQuizOpen]   = useState(false)
  const [quizOrder, setQuizOrder] = useState(null)
  const [quizWrong, setQuizWrong] = useState(false)
  const [done, setDone]           = useState(false)

  const checks    = CHECKS.map(c => ({ ...c, passed: c.test(code) }))
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
        <span className="ag-rank-badge" style={{ '--ac': 'var(--amber)' }}>RANK C</span>
        <h1 className="ag-gate-name">The String Forge</h1>
        <span className="ag-concept-tag">String Methods</span>
        <span className="ag-xp-tag" style={{ color: 'var(--amber)' }}>+315 XP</span>
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
            {running ? '⟳ Running checks…' : allPassed ? '▶ RUN FORGE' : `○ ${7 - passCount} check${7 - passCount !== 1 ? 's' : ''} remaining`}
          </button>
        </div>

        <div className="ag-right">
          <div className="ag-instruction">
            Process raw citizen data feeds with Python's <strong>string methods</strong>. <strong>strip()</strong> cleans whitespace. <strong>split()</strong> breaks CSV data. <strong>join()</strong> rebuilds it. <strong>replace()</strong> cleans corruption. <strong>startswith/endswith</strong> validate format. <strong>[::-1]</strong> reverses for palindrome checks. <strong>Triple quotes</strong> for multiline parsing.
          </div>
          <div className="ag-py-editor">
            <div className="ag-py-editor-head">⚡ strings.py</div>
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
            <div className="ag-quiz-eyebrow">Knowledge Check — Gate P-16</div>
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
            <span className="ag-done-emoji">📝</span>
            <span className="ag-done-xp">+315 XP</span>
            <h2 className="ag-done-title">The String Forge</h2>
            <p className="ag-done-flavor">The String Forge runs clean. Raw data enters. Structured data leaves. Text is just data waiting to be understood.</p>
            <div className="ag-done-rewards">
              <span className="ag-done-reward">String Fragment</span>
              <span className="ag-done-reward">Text Badge I</span>
            </div>
            <button className="ag-done-btn" onClick={() => goto('academy/dashboard')}>Builder HQ →</button>
          </div>
        </div>
      )}
    </div>
  )
}

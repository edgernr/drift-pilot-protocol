import { useState } from 'react'
import './AcademyGate.css'
import { useNav } from '../context/NavigationContext'
import { useAcademy } from '../context/AcademyContext'
import { stripComments } from '../lib/codeUtils'
import GateAIHint from '../components/GateAIHint'

const GATE_ID = 'P-14'
const GATE_XP = 360

const STARTER = `# The Complete System — Citizen Management CLI
import json

# 1. Citizen class — add promote() to complete it
class Citizen:
    def __init__(self, name, level):
        self.name = name
        self.level = level

    def __str__(self):
        return f"{self.name} (Level {self.level})"

    # def promote(self):
    #     self.level += 1

# 2. File persistence: save and load JSON
# def save_citizens(data, filename):
#     with open(filename, "w") as f:
#         json.dump(data, f)
#
# def load_citizens(filename):
#     with open(filename, "r") as f:
#         return json.load(f)

# 3. Menu loop with exit option
# while True:
#     choice = input("1) Add  2) List  3) Exit > ")
#     if choice == "3":
#         break

# 4. Error handling on file load
# try:
#     citizens = load_citizens("citizens.json")
# except FileNotFoundError:
#     citizens = []

# 5. List comprehension: filter citizens
# high_level = [c for c in citizens if c.level > 2]

# 6. from ... import (split code into modules)
# from citizen_manager import create_citizen
`

const CHECKS = [
  { id: 'c1', label: 'Citizen class complete',    hint: 'The Citizen class is missing required methods or __str__. Add __init__, describe, promote, and __str__.',               test: c => /class\s+Citizen/.test(c) && /def\s+__init__/.test(c) && /def\s+__str__/.test(c) && /def\s+promote/.test(c) },
  { id: 'c2', label: 'File persistence works',    hint: 'Data doesn\'t save or load correctly. Use json.dump to save and json.load to load citizen data.',                      test: c => /json\.dump\s*\(/.test(c) && /json\.load\s*\(/.test(c) },
  { id: 'c3', label: 'Menu loop functional',      hint: 'The menu shows once and exits. Wrap the menu in while True: and add a break for exit option.',                         test: c => /while\s+True/.test(c) && /\bbreak\b/.test(c) },
  { id: 'c4', label: 'Error handling present',    hint: 'File operations have no try/except. Wrap load_file() in try/except FileNotFoundError.',                                test: c => /\btry\s*:/.test(c) && /\bexcept\b/.test(c) },
  { id: 'c5', label: 'List comprehension used',   hint: 'No list comprehension found. Use one to filter or transform the citizen list: [c for c in citizens if ...]',           test: c => /\[\s*\w+\s+for\s+\w+\s+in\s+\w+/.test(c) },
  { id: 'c6', label: 'Code split into modules',   hint: 'All code is in one file. Move the Citizen class and file operations to separate modules.',                              test: c => /\bfrom\s+\w+\s+import\b/.test(c) },
]

const QUIZ = {
  q: 'You split the code into citizen_manager.py, data_manager.py, and main.py. If you needed to change how citizens are saved to files, which file would you change and why?',
  opts: [
    'main.py — it\'s the main file so all changes go there.',
    'data_manager.py — it owns file operations. Other files don\'t need to change because they use data_manager through its interface.',
    'All three files — changing how saving works affects everything.',
    'citizen_manager.py — citizens are the data being saved so their file controls saving.',
  ],
  correct: 1,
}

function Scene({ passCount }) {
  return (
    <div className="ag-scene" style={{ '--ac': 'var(--amber)' }}>
      <span className="ag-scene-label">COMPLETE SYSTEM — GATE P-14</span>
      <div className="ag-py-terminal">
        <div className="ag-py-terminal-bar">
          <span className="ag-py-dot" style={{ background: 'var(--magenta)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--amber)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--lime)' }} />
          <span style={{ flex: 1, textAlign: 'center', fontSize: 9, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)' }}>main.py</span>
        </div>
        <div className="ag-py-output">
          {passCount === 0 && <div className="ag-py-line" style={{ opacity: 0.35 }}>$ python3 main.py</div>}
          {passCount >= 1 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>Citizen class complete</span></div>}
          {passCount >= 2 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>file persistence working</span></div>}
          {passCount >= 3 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>menu loop functional</span></div>}
          {passCount >= 4 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>errors handled</span></div>}
          {passCount >= 5 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>list comprehension filtering</span></div>}
          {passCount >= 6 && <div className="ag-py-line">&gt;&gt;&gt; <span style={{ color: 'var(--amber)' }}>SYSTEM COMPLETE!</span></div>}
        </div>
      </div>
    </div>
  )
}

export default function GateP14() {
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
        <h1 className="ag-gate-name">The Complete System</h1>
        <span className="ag-concept-tag">Integration</span>
        <span className="ag-xp-tag" style={{ color: 'var(--amber)' }}>+360 XP</span>
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
            {running ? '⟳ Running checks…' : allPassed ? '▶ RUN SYSTEM' : `○ ${6 - passCount} check${6 - passCount !== 1 ? 's' : ''} remaining`}
          </button>
          <GateAIHint code={code} checks={checks} gateId={GATE_ID} lang="python" done={done} />
        </div>

        <div className="ag-right">
          <div className="ag-instruction">
            Build a <strong>complete CLI system</strong> — everything from Gate P-01 to P-13 in one program. Complete the <strong>Citizen class</strong>, add <strong>file persistence</strong>, a <strong>menu loop</strong>, <strong>error handling</strong>, a <strong>list comprehension</strong>, and split code with <strong>from...import</strong>. Your first real Python application.
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
            <div className="ag-quiz-eyebrow">Knowledge Check — Gate P-14</div>
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
            <span className="ag-done-emoji">🖥️</span>
            <span className="ag-done-xp">+360 XP</span>
            <h2 className="ag-done-title">The Complete System</h2>
            <p className="ag-done-flavor">The Complete System runs. A real Python application. Your first program that does something real. JavaScript awaits.</p>
            <div className="ag-done-rewards">
              <span className="ag-done-reward">System Fragment</span>
              <span className="ag-done-reward">Python Graduate Badge</span>
            </div>
            <button className="ag-done-btn" onClick={() => goto('academy/dashboard')}>Builder HQ →</button>
          </div>
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import './AcademyGate.css'
import { useNav } from '../context/NavigationContext'
import { useAcademy } from '../context/AcademyContext'
import { stripComments } from '../lib/codeUtils'
import GateAIHint from '../components/GateAIHint'

const GATE_ID = 'P-24'
const GATE_XP = 330

const STARTER = `# The Environment Protocol — Reproducible Environments

# 1. Pin exact versions in requirements.txt
# requests==2.31.0
# flask==3.0.0
# pytest==7.4.0

# 2. .env in .gitignore — never commit secrets
# .env
# .env.local
# __pycache__/

# 3. venv/ in .gitignore — never commit virtual environments
# venv/
# .venv/
# env/

# 4. Load environment variables with python-dotenv
# from dotenv import load_dotenv
# import os
# load_dotenv()
# DB_URL = os.getenv("DATABASE_URL")

# 5. .env.example — template with no real values
# DATABASE_URL=postgresql://user:password@host:5432/db
# SECRET_KEY=your-secret-key-here
# DEBUG=false

# 6. Setup instructions — how to run locally
# # Setup:
# # 1. python -m venv venv
# # 2. source venv/bin/activate  (or venv\\Scripts\\activate on Windows)
# # 3. pip install -r requirements.txt
# # 4. cp .env.example .env
`

const CHECKS = [
  { id: 'c1', label: 'Version pinning used',          hint: 'Pin exact versions with ==: requests==2.31.0 — not just requests or requests>=2.',        test: c => /\w+==[\d.]+/.test(c) },
  { id: 'c2', label: '.env in .gitignore',             hint: 'List .env (and .env.local) in your .gitignore — never commit real secrets.',              test: c => /\.env\b/.test(c) && /\.gitignore|gitignore/i.test(c) },
  { id: 'c3', label: 'venv/ in .gitignore',            hint: 'List venv/ or .venv/ in .gitignore — never commit virtual environment folders.',          test: c => /\bvenv\b/.test(c) },
  { id: 'c4', label: 'load_dotenv() used',             hint: 'Import load_dotenv from dotenv and call it before os.getenv() to load the .env file.',    test: c => /\bload_dotenv\s*\(/.test(c) },
  { id: 'c5', label: '.env.example created',           hint: 'Commit a .env.example with placeholder values so others know what variables are needed.',  test: c => /\.env\.example/.test(c) },
  { id: 'c6', label: 'Setup instructions present',    hint: 'Add comments explaining how to set up the project: venv, pip install, copy .env.',        test: c => /\bsetup\b|\bvenv\b.*\bactivate\b|\bpip install\b/i.test(c) },
]

const QUIZ = {
  q: 'A teammate says "I never pin package versions — I want the latest features automatically." What\'s the strongest argument against this?',
  opts: [
    'It makes the project look unprofessional in code reviews.',
    'A package update can silently break your code — your project works today but fails tomorrow with no code changes from you.',
    'Package managers get slower when versions aren\'t pinned.',
    'It forces your teammates to use older Python versions.',
  ],
  correct: 1,
}

function Scene({ passCount }) {
  return (
    <div className="ag-scene" style={{ '--ac': 'var(--lime)' }}>
      <span className="ag-scene-label">ENVIRONMENT PROTOCOL — GATE P-24</span>
      <div className="ag-py-terminal">
        <div className="ag-py-terminal-bar">
          <span className="ag-py-dot" style={{ background: 'var(--magenta)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--amber)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--lime)' }} />
          <span style={{ flex: 1, textAlign: 'center', fontSize: 9, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)' }}>environment.py</span>
        </div>
        <div className="ag-py-output">
          {passCount === 0 && <div className="ag-py-line" style={{ opacity: 0.35 }}>&gt; running environment.py…</div>}
          {passCount >= 1 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>versions pinned</span></div>}
          {passCount >= 2 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>.env protected</span></div>}
          {passCount >= 3 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>venv excluded</span></div>}
          {passCount >= 4 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>dotenv loaded</span></div>}
          {passCount >= 5 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>example template ready</span></div>}
          {passCount >= 6 && <div className="ag-py-line">&gt; <span style={{ color: 'var(--lime)' }}>PROTOCOL LOCKED — ENVIRONMENT REPRODUCIBLE!</span></div>}
        </div>
      </div>
    </div>
  )
}

export default function GateP24() {
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
        <h1 className="ag-gate-name">The Environment Protocol</h1>
        <span className="ag-concept-tag">Environments</span>
        <span className="ag-xp-tag" style={{ color: 'var(--lime)' }}>+330 XP</span>
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
            {running ? '⟳ Running checks…' : allPassed ? '▶ LOCK PROTOCOL' : `○ ${6 - passCount} check${6 - passCount !== 1 ? 's' : ''} remaining`}
          </button>
          <GateAIHint code={code} checks={checks} gateId={GATE_ID} lang="python" done={done} />
        </div>

        <div className="ag-right">
          <div className="ag-instruction">
            Make the Construct reproducible. <strong>Pin exact versions</strong> in requirements.txt. Keep <strong>.env out of git</strong>. Keep <strong>venv/ out of git</strong>. Use <strong>load_dotenv()</strong> to load secrets safely. Commit a <strong>.env.example</strong> template. Write clear <strong>setup instructions</strong>.
          </div>
          <div className="ag-py-editor">
            <div className="ag-py-editor-head">⚡ environment.py</div>
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
            <div className="ag-quiz-eyebrow">Knowledge Check — Gate P-24</div>
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
            <span className="ag-done-emoji">🌱</span>
            <span className="ag-done-xp">+330 XP</span>
            <h2 className="ag-done-title">The Environment Protocol</h2>
            <p className="ag-done-flavor">Pinned. Isolated. Reproducible. Anyone can clone this project and run it. That's the protocol. That's professionalism.</p>
            <div className="ag-done-rewards">
              <span className="ag-done-reward">Environment Fragment</span>
              <span className="ag-done-reward">Reproducibility Badge I</span>
            </div>
            <button className="ag-done-btn" onClick={() => goto('academy/dashboard')}>Builder HQ →</button>
          </div>
        </div>
      )}
    </div>
  )
}

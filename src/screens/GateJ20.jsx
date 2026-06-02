import { useState } from 'react'
import './AcademyGate.css'
import { useNav } from '../context/NavigationContext'
import { useAcademy } from '../context/AcademyContext'

const GATE_ID = 'J-20'
const GATE_XP = 330

const STARTER = `// The Build System — Vite, Bundling, and Deployment

// 1. Vite config — output directory and code splitting
// // vite.config.js
// export default {
//   build: {
//     outDir: "dist",
//     rollupOptions: {
//       output: {
//         manualChunks: { vendor: ["react", "react-dom"] }
//       }
//     }
//   }
// }

// 2. Environment variables with import.meta.env
// const apiUrl = import.meta.env.VITE_API_URL
// const isDev = import.meta.env.DEV

// 3. .env.production file
// VITE_API_URL=https://api.construct.net
// VITE_APP_NAME=The Construct

// 4. Tree shaking — only import what you use
// // Good — tree-shakeable (named import)
// import { format } from "date-fns"
// // Bad — imports entire library (harder to shake)
// import _ from "lodash"

// 5. npm scripts in package.json
// "scripts": {
//   "dev": "vite",
//   "build": "vite build",
//   "preview": "vite preview"
// }

// 6. Dev vs production differences
// // Dev: source maps, hot reload, no minification
// // Prod: minified, chunked, optimized assets
`

const CHECKS = [
  { id: 'c1', label: 'outDir and manualChunks in config', hint: 'Show a vite.config.js with build.outDir and build.rollupOptions.output.manualChunks.', test: c => /\boutDir\b/.test(c) && /\bmanualChunks\b/.test(c) },
  { id: 'c2', label: 'import.meta.env used',              hint: 'Use import.meta.env.VITE_API_URL or import.meta.env.DEV to access environment variables.', test: c => /\bimport\.meta\.env\b/.test(c) },
  { id: 'c3', label: '.env.production shown',             hint: 'Show .env.production file content with VITE_ prefixed variables.',                         test: c => /\.env\.production/.test(c) || /VITE_\w+\s*=/.test(c) },
  { id: 'c4', label: 'Tree shaking comment',              hint: 'Add a comment explaining tree shaking — named imports vs default imports.',                test: c => /tree.shak/i.test(c) || /\bnamed import\b|\bnamed\b.*\bimport\b/i.test(c) },
  { id: 'c5', label: 'npm scripts dev/build/preview',    hint: 'Show the scripts object with "dev", "build", and "preview" entries.',                      test: c => /"dev"\s*:/.test(c) && /"build"\s*:/.test(c) && /"preview"\s*:/.test(c) },
  { id: 'c6', label: 'Dev vs prod differences noted',     hint: 'Comment on what changes between dev (HMR, no minification) and production (minified, chunks).', test: c => /\bminif\w+\b|\bHMR\b|\bhot reload\b|\bsource map\b/i.test(c) },
]

const QUIZ = {
  q: 'ES modules are tree-shakeable but CommonJS (require) modules are not. What property of ES modules makes tree shaking possible that CommonJS lacks?',
  opts: [
    'ES modules use async loading so the bundler can skip unused code at runtime.',
    'ES module imports are static — declared at the top of the file — so the bundler knows at build time exactly which exports are used and can remove the rest.',
    'CommonJS modules are encrypted, so bundlers can\'t analyze them.',
    'ES modules have smaller file sizes, which makes them faster to process.',
  ],
  correct: 1,
}

function Scene({ passCount }) {
  return (
    <div className="ag-scene" style={{ '--ac': 'var(--magenta)' }}>
      <span className="ag-scene-label">BUILD SYSTEM — GATE J-20</span>
      <div className="ag-py-terminal">
        <div className="ag-py-terminal-bar">
          <span className="ag-py-dot" style={{ background: 'var(--magenta)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--amber)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--lime)' }} />
          <span style={{ flex: 1, textAlign: 'center', fontSize: 9, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)' }}>vite.config.js</span>
        </div>
        <div className="ag-py-output">
          {passCount === 0 && <div className="ag-py-line" style={{ opacity: 0.35 }}>&gt; running vite.config.js…</div>}
          {passCount >= 1 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>build config set</span></div>}
          {passCount >= 2 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>env variables wired</span></div>}
          {passCount >= 3 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>production env ready</span></div>}
          {passCount >= 4 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>tree shaking active</span></div>}
          {passCount >= 5 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>npm scripts ready</span></div>}
          {passCount >= 6 && <div className="ag-py-line">&gt; <span style={{ color: 'var(--magenta)' }}>BUILD SYSTEM ONLINE — READY TO DEPLOY!</span></div>}
        </div>
      </div>
    </div>
  )
}

export default function GateJ20() {
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
        <span className="ag-rank-badge" style={{ '--ac': 'var(--magenta)' }}>RANK B</span>
        <h1 className="ag-gate-name">The Build System</h1>
        <span className="ag-concept-tag">Build Tools</span>
        <span className="ag-xp-tag" style={{ color: 'var(--magenta)' }}>+330 XP</span>
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
            className="ag-run-btn" style={{ '--ac': 'var(--magenta)' }}
            onClick={handleRun} disabled={!allPassed || running}
          >
            {running ? '⟳ Running checks…' : allPassed ? '▶ INITIATE BUILD' : `○ ${6 - passCount} check${6 - passCount !== 1 ? 's' : ''} remaining`}
          </button>
        </div>

        <div className="ag-right">
          <div className="ag-instruction">
            Configure the Construct's build pipeline. Set <strong>outDir and manualChunks</strong> in vite.config.js. Access secrets via <strong>import.meta.env</strong>. Separate <strong>.env.production</strong> variables. Understand <strong>tree shaking</strong>. Set up <strong>npm scripts</strong>. Know the difference between <strong>dev and production</strong> builds.
          </div>
          <div className="ag-py-editor">
            <div className="ag-py-editor-head">⚡ vite.config.js</div>
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
            <div className="ag-quiz-eyebrow">Knowledge Check — Gate J-20</div>
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
            <span className="ag-done-emoji">🏭</span>
            <span className="ag-done-xp">+330 XP</span>
            <h2 className="ag-done-title">The Build System</h2>
            <p className="ag-done-flavor">Configured. Chunked. Tree-shaken. Deployed. The Build System runs. Code that ships is worth more than code that compiles.</p>
            <div className="ag-done-rewards">
              <span className="ag-done-reward">Build Fragment</span>
              <span className="ag-done-reward">Build Badge I</span>
            </div>
            <button className="ag-done-btn" onClick={() => goto('academy/dashboard')}>Builder HQ →</button>
          </div>
        </div>
      )}
    </div>
  )
}

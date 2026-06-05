import { useState } from 'react'
import './AcademyGate.css'
import { useNav } from '../context/NavigationContext'
import { useAcademy } from '../context/AcademyContext'
import { stripComments } from '../lib/codeUtils'
import GateAIHint from '../components/GateAIHint'

const GATE_ID = 'J-18'
const GATE_XP = 330

const STARTER = `// The TypeScript Gateway — Types for JavaScript

// 1. Basic type annotations
// function greet(name: string): string {
//   return "Hello, " + name
// }

// 2. Interface definition
// interface Citizen {
//   name: string
//   level: number
//   sector?: string
// }

// 3. Optional property
// interface Config {
//   debug?: boolean
//   timeout?: number
// }

// 4. Union type — multiple possible types
// type CitizenId = string | number
// function findCitizen(id: CitizenId): Citizen | null {
//   return null
// }

// 5. Type assertion — tell TS what type an element is
// const input = document.getElementById("name") as HTMLInputElement
// input.value = "LUCY"

// 6. Strict mode in tsconfig.json
// {
//   "compilerOptions": {
//     "strict": true,
//     "target": "ES2022",
//     "module": "ESNext"
//   }
// }
`

const CHECKS = [
  { id: 'c1', label: 'Type annotations on function',  hint: 'Add : string to a parameter and : string (or other type) as the return type.',            test: c => /:\s*string|:\s*number|:\s*boolean/.test(c) && /\)\s*:/.test(c) },
  { id: 'c2', label: 'interface defined',             hint: 'Use the interface keyword to define an object shape: interface Citizen { name: string }',  test: c => /\binterface\s+\w+/.test(c) },
  { id: 'c3', label: 'Optional property with ?',      hint: 'Mark a property as optional with ?: in an interface or type — sector?: string.',           test: c => /\w+\?:/.test(c) },
  { id: 'c4', label: 'Union type string | number',    hint: 'Define a union type with |: type MyId = string | number.',                                  test: c => /\bstring\s*\|\s*number\b|\bnumber\s*\|\s*string\b/.test(c) },
  { id: 'c5', label: 'as HTMLInputElement assertion', hint: 'Use "as HTMLInputElement" to cast document.getElementById() to the specific input type.',  test: c => /\bas\s+HTML\w+Element/.test(c) },
  { id: 'c6', label: '"strict": true in tsconfig',    hint: 'Show a tsconfig.json snippet with "strict": true in compilerOptions.',                     test: c => /"strict"\s*:\s*true/.test(c) },
]

const QUIZ = {
  q: 'You write TypeScript code with a type error. The editor shows a red underline, but when you run the JavaScript, it works fine. What does this tell you about TypeScript?',
  opts: [
    'TypeScript has a bug — it should prevent the code from running if there\'s a type error.',
    'TypeScript is a development tool that checks types before compilation, not at runtime — it catches mistakes early so they don\'t become runtime bugs.',
    'The JavaScript runtime ignores TypeScript errors because types are optional.',
    'You need to install a TypeScript runtime to enforce types at execution time.',
  ],
  correct: 1,
}

function Scene({ passCount }) {
  return (
    <div className="ag-scene" style={{ '--ac': 'var(--violet)' }}>
      <span className="ag-scene-label">TYPESCRIPT GATEWAY — GATE J-18</span>
      <div className="ag-py-terminal">
        <div className="ag-py-terminal-bar">
          <span className="ag-py-dot" style={{ background: 'var(--magenta)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--amber)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--lime)' }} />
          <span style={{ flex: 1, textAlign: 'center', fontSize: 9, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)' }}>types.ts</span>
        </div>
        <div className="ag-py-output">
          {passCount === 0 && <div className="ag-py-line" style={{ opacity: 0.35 }}>&gt; running types.ts…</div>}
          {passCount >= 1 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>annotations active</span></div>}
          {passCount >= 2 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>interface defined</span></div>}
          {passCount >= 3 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>optional property set</span></div>}
          {passCount >= 4 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>union type ready</span></div>}
          {passCount >= 5 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>assertion cast</span></div>}
          {passCount >= 6 && <div className="ag-py-line">&gt; <span style={{ color: 'var(--violet)' }}>GATEWAY OPEN — TYPE SYSTEM ACTIVE!</span></div>}
        </div>
      </div>
    </div>
  )
}

export default function GateJ18() {
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
        <h1 className="ag-gate-name">The TypeScript Gateway</h1>
        <span className="ag-concept-tag">TypeScript</span>
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
            {running ? '⟳ Running checks…' : allPassed ? '▶ OPEN GATEWAY' : `○ ${6 - passCount} check${6 - passCount !== 1 ? 's' : ''} remaining`}
          </button>
          <GateAIHint code={code} checks={checks} gateId={GATE_ID} lang="javascript" done={done} />
        </div>

        <div className="ag-right">
          <div className="ag-instruction">
            Cross into TypeScript. Add <strong>type annotations</strong> to functions. Define object shapes with <strong>interface</strong>. Mark fields <strong>optional</strong> with ?. Use <strong>union types</strong> with |. Cast DOM elements with <strong>as HTMLInputElement</strong>. Enable <strong>"strict": true</strong> in tsconfig.
          </div>
          <div className="ag-py-editor">
            <div className="ag-py-editor-head">⚡ types.ts</div>
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
            <div className="ag-quiz-eyebrow">Knowledge Check — Gate J-18</div>
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
            <span className="ag-done-emoji">🚪</span>
            <span className="ag-done-xp">+330 XP</span>
            <h2 className="ag-done-title">The TypeScript Gateway</h2>
            <p className="ag-done-flavor">The Gateway opens. JavaScript with memory. Types declared. Errors caught before execution. You crossed into typed territory.</p>
            <div className="ag-done-rewards">
              <span className="ag-done-reward">Type Gateway Fragment</span>
              <span className="ag-done-reward">TypeScript Badge I</span>
            </div>
            <button className="ag-done-btn" onClick={() => goto('academy/dashboard')}>Builder HQ →</button>
          </div>
        </div>
      )}
    </div>
  )
}

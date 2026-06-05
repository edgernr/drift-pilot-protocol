import { useState } from 'react'
import './AcademyGate.css'
import { useNav } from '../context/NavigationContext'
import { useAcademy } from '../context/AcademyContext'
import { stripComments } from '../lib/codeUtils'
import GateAIHint from '../components/GateAIHint'

const GATE_ID = 'J-19'
const GATE_XP = 330

const STARTER = `// The Testing Station — JavaScript Test Patterns

// 1. describe and it blocks
// describe("Citizen", () => {
//   it("creates a citizen with a name", () => {
//     const c = new Citizen("LUCY", 5)
//     expect(c.name).toBe("LUCY")
//   })
// })

// 2. expect with toBe and toEqual
// expect(1 + 1).toBe(2)
// expect({ name: "LUCY" }).toEqual({ name: "LUCY" })

// 3. Testing throws
// it("throws on invalid level", () => {
//   expect(() => new Citizen("LUCY", 0)).toThrow()
// })

// 4. Mock a module dependency
// vi.mock("./api", () => ({
//   fetchCitizen: vi.fn().mockResolvedValue({ name: "LUCY" })
// }))

// 5. Async test with await
// it("fetches citizen data", async () => {
//   const data = await fetchCitizen("C1001")
//   expect(data.name).toBe("LUCY")
// })

// 6. DOM testing — set up HTML
// document.body.innerHTML = '<button id="btn">Click</button>'
// const btn = document.getElementById("btn")
// btn.click()
// expect(handler).toHaveBeenCalled()
`

const CHECKS = [
  { id: 'c1', label: 'describe() and it() used',      hint: 'Wrap tests in describe("name", () => { it("...", () => { ... }) })',                       test: c => /\bdescribe\s*\(/.test(c) && /\bit\s*\(/.test(c) },
  { id: 'c2', label: 'expect().toBe() or .toEqual()', hint: 'Use expect(value).toBe(expected) for primitives, .toEqual() for objects.',                  test: c => /\bexpect\s*\(/.test(c) && (/\.toBe\s*\(/.test(c) || /\.toEqual\s*\(/.test(c)) },
  { id: 'c3', label: '.toThrow() tested',             hint: 'Wrap the call in a function: expect(() => riskyFn()).toThrow()',                            test: c => /\.toThrow\s*\(/.test(c) },
  { id: 'c4', label: 'vi.mock or jest.mock used',     hint: 'Use vi.mock("module", ...) or jest.mock("module", ...) to replace a module in tests.',     test: c => /\bvi\.mock\b/.test(c) || /\bjest\.mock\b/.test(c) },
  { id: 'c5', label: 'async it() with await',         hint: 'Write it("...", async () => { const data = await ... })',                                  test: c => /\basync\b/.test(c) && /\bawait\b/.test(c) && /\bit\s*\(/.test(c) },
  { id: 'c6', label: 'document.body.innerHTML set',   hint: 'Set document.body.innerHTML = "<html string>" to create DOM elements for testing.',        test: c => /\bdocument\.body\.innerHTML\b/.test(c) },
]

const QUIZ = {
  q: 'Why should you mock external API calls in unit tests instead of making real network requests?',
  opts: [
    'Mocking is required by test frameworks — real network calls cause a SyntaxError.',
    'Real API calls make tests slow, unreliable, and dependent on network availability and server uptime — mocks give instant, predictable responses every time.',
    'API calls use too much memory in a test environment.',
    'Real API calls can only be made in production environments.',
  ],
  correct: 1,
}

function Scene({ passCount }) {
  return (
    <div className="ag-scene" style={{ '--ac': 'var(--lime)' }}>
      <span className="ag-scene-label">TESTING STATION — GATE J-19</span>
      <div className="ag-py-terminal">
        <div className="ag-py-terminal-bar">
          <span className="ag-py-dot" style={{ background: 'var(--magenta)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--amber)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--lime)' }} />
          <span style={{ flex: 1, textAlign: 'center', fontSize: 9, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)' }}>tests.js</span>
        </div>
        <div className="ag-py-output">
          {passCount === 0 && <div className="ag-py-line" style={{ opacity: 0.35 }}>&gt; running tests.js…</div>}
          {passCount >= 1 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>test suite active</span></div>}
          {passCount >= 2 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>assertions passing</span></div>}
          {passCount >= 3 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>throw tested</span></div>}
          {passCount >= 4 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>mock injected</span></div>}
          {passCount >= 5 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>async test ready</span></div>}
          {passCount >= 6 && <div className="ag-py-line">&gt; <span style={{ color: 'var(--lime)' }}>STATION ACTIVE — ALL TESTS PASS!</span></div>}
        </div>
      </div>
    </div>
  )
}

export default function GateJ19() {
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
        <h1 className="ag-gate-name">The Testing Station</h1>
        <span className="ag-concept-tag">JS Testing</span>
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
            {running ? '⟳ Running checks…' : allPassed ? '▶ RUN STATION' : `○ ${6 - passCount} check${6 - passCount !== 1 ? 's' : ''} remaining`}
          </button>
          <GateAIHint code={code} checks={checks} gateId={GATE_ID} lang="javascript" done={done} />
        </div>

        <div className="ag-right">
          <div className="ag-instruction">
            Arm the Construct's test suite. Write tests with <strong>describe() and it()</strong>. Assert with <strong>expect().toBe()</strong> and <strong>toEqual()</strong>. Verify errors with <strong>.toThrow()</strong>. Replace dependencies with <strong>vi.mock/jest.mock</strong>. Test async code with <strong>async it() and await</strong>. Test DOM with <strong>innerHTML</strong>.
          </div>
          <div className="ag-py-editor">
            <div className="ag-py-editor-head">⚡ tests.js</div>
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
            <div className="ag-quiz-eyebrow">Knowledge Check — Gate J-19</div>
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
            <span className="ag-done-emoji">✅</span>
            <span className="ag-done-xp">+330 XP</span>
            <h2 className="ag-done-title">The Testing Station</h2>
            <p className="ag-done-flavor">Tests written. Mocks in place. Async covered. DOM tested. The Station is active. Code that is tested is code that can change safely.</p>
            <div className="ag-done-rewards">
              <span className="ag-done-reward">Test Station Fragment</span>
              <span className="ag-done-reward">Test Badge II</span>
            </div>
            <button className="ag-done-btn" onClick={() => goto('academy/dashboard')}>Builder HQ →</button>
          </div>
        </div>
      )}
    </div>
  )
}

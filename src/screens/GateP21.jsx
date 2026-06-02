import { useState } from 'react'
import './AcademyGate.css'
import { useNav } from '../context/NavigationContext'
import { useAcademy } from '../context/AcademyContext'

const GATE_ID = 'P-21'
const GATE_XP = 330

const STARTER = `# The Test Protocol — Writing Tests That Protect Code

# 1. Basic test with assert
# def test_add():
#     assert add(2, 3) == 5

# 2. pytest fixture
# @pytest.fixture
# def sample_citizen():
#     return {"name": "LUCY", "level": 5}

# 3. Parametrized test
# @pytest.mark.parametrize("n,expected", [(1, 1), (2, 4), (3, 9)])
# def test_square(n, expected):
#     assert square(n) == expected

# 4. Mock external dependency
# from unittest.mock import patch
# @patch("module.requests.get")
# def test_fetch(mock_get):
#     mock_get.return_value.json.return_value = {"data": []}

# 5. Test class grouping
# class TestCitizen:
#     def test_create(self):
#         pass
#     def test_level(self):
#         pass

# 6. TDD — write failing test first
# def test_new_feature():
#     # RED: write test before implementation
#     assert calculate_rank(500) == "B"
`

const CHECKS = [
  { id: 'c1', label: 'Test function with assert',      hint: 'Name your test function test_something() and use assert to check the result.',          test: c => /def\s+test_\w+\s*\(/.test(c) && /\bassert\b/.test(c) },
  { id: 'c2', label: '@pytest.fixture used',           hint: 'Decorate a function with @pytest.fixture to create reusable test setup data.',          test: c => /@pytest\.fixture/.test(c) },
  { id: 'c3', label: '@pytest.mark.parametrize used',  hint: 'Use @pytest.mark.parametrize("arg,expected", [...]) to run a test with multiple inputs.',test: c => /@pytest\.mark\.parametrize/.test(c) },
  { id: 'c4', label: 'Mock/patch used',                hint: 'Use @patch or unittest.mock.patch to replace external dependencies during testing.',     test: c => /\bpatch\b/.test(c) || /\bmock\b/i.test(c) },
  { id: 'c5', label: 'Test class defined',             hint: 'Group related tests in a class starting with Test. Methods inside are also test_ functions.',test: c => /class\s+Test\w+/.test(c) },
  { id: 'c6', label: 'TDD approach shown',             hint: 'Write a test for functionality that does not exist yet. Add a comment about RED-GREEN-REFACTOR.',test: c => /\bTDD\b|\bRED\b|\bfailing test\b/i.test(c) },
]

const QUIZ = {
  q: 'In TDD, you write a test before writing the implementation. The test fails immediately. Why is a failing test at this stage a GOOD sign?',
  opts: [
    'It isn\'t good — a failing test always means your code is broken and should be fixed immediately.',
    'It confirms the test is actually testing something real — if it passed without an implementation, it would be a useless test.',
    'Failing tests run faster, so the TDD cycle goes quicker.',
    'It signals to the team that you\'re still working on the feature.',
  ],
  correct: 1,
}

function Scene({ passCount }) {
  return (
    <div className="ag-scene" style={{ '--ac': 'var(--lime)' }}>
      <span className="ag-scene-label">TEST PROTOCOL — GATE P-21</span>
      <div className="ag-py-terminal">
        <div className="ag-py-terminal-bar">
          <span className="ag-py-dot" style={{ background: 'var(--magenta)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--amber)' }} />
          <span className="ag-py-dot" style={{ background: 'var(--lime)' }} />
          <span style={{ flex: 1, textAlign: 'center', fontSize: 9, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)' }}>test_protocol.py</span>
        </div>
        <div className="ag-py-output">
          {passCount === 0 && <div className="ag-py-line" style={{ opacity: 0.35 }}>&gt; running test_protocol.py…</div>}
          {passCount >= 1 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>test function active</span></div>}
          {passCount >= 2 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>fixture registered</span></div>}
          {passCount >= 3 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>parametrize active</span></div>}
          {passCount >= 4 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>mock injected</span></div>}
          {passCount >= 5 && <div className="ag-py-line">✓ <span style={{ color: 'var(--lime)' }}>test class ready</span></div>}
          {passCount >= 6 && <div className="ag-py-line">&gt; <span style={{ color: 'var(--lime)' }}>PROTOCOL ACTIVE — ALL TESTS GREEN!</span></div>}
        </div>
      </div>
    </div>
  )
}

export default function GateP21() {
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
        <span className="ag-rank-badge" style={{ '--ac': 'var(--lime)' }}>RANK B</span>
        <h1 className="ag-gate-name">The Test Protocol</h1>
        <span className="ag-concept-tag">Testing</span>
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
            {running ? '⟳ Running checks…' : allPassed ? '▶ RUN PROTOCOL' : `○ ${6 - passCount} check${6 - passCount !== 1 ? 's' : ''} remaining`}
          </button>
        </div>

        <div className="ag-right">
          <div className="ag-instruction">
            Protect the Construct's code with automated tests. Write a <strong>test function</strong> with assert. Use <strong>@pytest.fixture</strong> for reusable setup. Apply <strong>@pytest.mark.parametrize</strong> for multiple inputs. <strong>Mock</strong> external dependencies with patch. Group tests in a <strong>Test class</strong>. Practice <strong>TDD</strong> by writing a failing test first.
          </div>
          <div className="ag-py-editor">
            <div className="ag-py-editor-head">⚡ test_protocol.py</div>
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
            <div className="ag-quiz-eyebrow">Knowledge Check — Gate P-21</div>
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
            <h2 className="ag-done-title">The Test Protocol</h2>
            <p className="ag-done-flavor">Tests written. Code protected. The Protocol runs green. Code that isn't tested is code that waits to fail.</p>
            <div className="ag-done-rewards">
              <span className="ag-done-reward">Test Fragment</span>
              <span className="ag-done-reward">Quality Badge I</span>
            </div>
            <button className="ag-done-btn" onClick={() => goto('academy/dashboard')}>Builder HQ →</button>
          </div>
        </div>
      )}
    </div>
  )
}

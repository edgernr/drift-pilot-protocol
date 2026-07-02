import { useState } from 'react'

export default function QuestQuiz({ quiz, onPass, onFail }) {
  const [answer, setAnswer] = useState(null)
  const [checked, setChecked] = useState(false)

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'oklch(0 0 0 / 0.88)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="panel" style={{ maxWidth: 500, width: '90%', padding: '36px 32px' }}>
        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--violet)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 18 }}>
          Knowledge Check · Required to Submit
        </div>
        <h3 style={{ fontSize: 17, fontWeight: 500, marginBottom: 24, lineHeight: 1.5, letterSpacing: '-0.01em' }}>
          {quiz.question}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {quiz.options.map((opt, i) => {
            const isSelected = answer === i
            const isCorrect = i === quiz.correct
            let bg = 'oklch(1 0 0 / 0.03)'
            let border = '1px solid oklch(1 0 0 / 0.08)'
            if (checked) {
              if (isCorrect) { bg = 'oklch(0.45 0.18 135 / 0.2)'; border = '1px solid oklch(0.72 0.22 135 / 0.7)' }
              else if (isSelected) { bg = 'oklch(0.45 0.22 25 / 0.2)'; border = '1px solid oklch(0.62 0.22 25 / 0.7)' }
            } else if (isSelected) {
              bg = 'oklch(0.5 0.2 270 / 0.15)'; border = '1px solid var(--violet)'
            }
            return (
              <button
                key={i}
                onClick={() => !checked && setAnswer(i)}
                style={{ padding: '12px 16px', textAlign: 'left', borderRadius: 8, fontFamily: 'var(--f-mono)', fontSize: 12, background: bg, border, color: 'var(--ink-1)', cursor: checked ? 'default' : 'pointer', transition: 'all 0.15s' }}
              >
                {opt}
              </button>
            )
          })}
        </div>

        {!checked ? (
          <button
            className="btn btn-primary"
            disabled={answer === null}
            onClick={() => { setChecked(true); if (answer !== quiz.correct) onFail?.() }}
            style={{ width: '100%' }}
          >
            Check Answer →
          </button>
        ) : answer === quiz.correct ? (
          <button
            className="btn btn-primary"
            onClick={onPass}
            style={{ width: '100%', background: 'oklch(0.45 0.18 135)', borderColor: 'oklch(0.72 0.22 135)' }}
          >
            ✓ Correct — Submit Gate →
          </button>
        ) : (
          <div>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'oklch(0.72 0.22 25)', marginBottom: 14 }}>
              Incorrect — review the highlighted answer and try again
            </div>
            <button
              className="btn"
              onClick={() => { setAnswer(null); setChecked(false) }}
              style={{ width: '100%' }}
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

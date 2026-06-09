import { useState } from 'react'
import { useAcademy } from '../context/AcademyContext'
import { useNav } from '../context/NavigationContext'
import './AcademyOnboarding.css'

// ── Step constants ───────────────────────────────────────
const S_NAME       = 0
const S_AGE        = 1
const S_EXPERIENCE = 2
const S_INTENTION  = 3
const S_RESULT     = 4
const S_BLOCKED    = 10  // under-8
const S_REDIRECT   = 11  // 17+ or knows-JS at 14-16

// ── Option data ──────────────────────────────────────────
const AGE_OPTS = [
  { value: 'under8',  label: '7 or under', icon: '🌱', color: 'var(--block-green)' },
  { value: '8-10',    label: '8 – 10',     icon: '🟡', color: 'var(--builder-gold)' },
  { value: '11-13',   label: '11 – 13',    icon: '🟢', color: 'var(--block-green)' },
  { value: '14-16',   label: '14 – 16',    icon: '🔵', color: 'var(--teal)' },
  { value: '17plus',  label: '17 or older', icon: '⚡', color: 'var(--magenta)' },
]

const EXP_OPTS = [
  { value: 'never',  label: 'Never touched it',      desc: 'Complete beginner — start from zero' },
  { value: 'little', label: 'Tried a little',         desc: 'Scratch, games, some tinkering' },
  { value: 'basics', label: 'Know some basics',       desc: 'Variables, loops, some functions' },
  { value: 'knows',  label: 'Know Python or JS',      desc: 'Comfortable with a real language' },
]

const INT_OPTS = [
  { value: 'games',    label: 'Games',         icon: '🎮', desc: 'Score counters, movement, collision' },
  { value: 'websites', label: 'Websites',      icon: '🌐', desc: 'Pages that look good and work' },
  { value: 'apps',     label: 'Apps / Tools',  icon: '🔧', desc: 'Calculators, converters, organizers' },
  { value: 'curious',  label: 'Just curious',  icon: '🔭', desc: 'Explore everything — no pressure' },
  { value: 'curious',  label: "Don't know yet", icon: '✨', desc: 'Start exploring — find out as you go' },
]

// ── Track determination ──────────────────────────────────
function determineTrack(age, experience) {
  if (age === '8-10') {
    return { track: 'scratch', startGate: 'S-01', tierLabel: 'Junior', language: 'Block Coding', gateCount: 15 }
  }
  if (age === '11-13') {
    if (experience === 'never')  return { track: 'python',     startGate: 'P-01', tierLabel: 'Junior', language: 'Python',      gateCount: 24 }
    if (experience === 'little') return { track: 'python',     startGate: 'P-03', tierLabel: 'Junior', language: 'Python',      gateCount: 24 }
    if (experience === 'basics') return { track: 'python',     startGate: 'P-06', tierLabel: 'Junior', language: 'Python',      gateCount: 24 }
    if (experience === 'knows')  return { track: 'javascript', startGate: 'J-01', tierLabel: 'Junior', language: 'JavaScript',  gateCount: 21 }
  }
  if (age === '14-16') {
    if (experience === 'never')  return { track: 'python',     startGate: 'P-01', tierLabel: 'Teen', language: 'Python',      gateCount: 24 }
    if (experience === 'little') return { track: 'python',     startGate: 'P-03', tierLabel: 'Teen', language: 'Python',      gateCount: 24 }
    if (experience === 'basics') return { track: 'javascript', startGate: 'J-01', tierLabel: 'Teen', language: 'JavaScript',  gateCount: 21 }
  }
  return { track: 'python', startGate: 'P-01', tierLabel: 'Junior', language: 'Python', gateCount: 24 }
}

const TRACK_COLORS = {
  scratch:    'var(--builder-gold)',
  python:     'var(--block-green)',
  javascript: 'var(--teal)',
}

const TRACK_DESCS = {
  scratch:    'Visual block coding. No typing. Pure logic. The Construct takes shape one block at a time.',
  python:     'First real language. Readable and forgiving. The Construct gains rules and written laws.',
  javascript: 'First web language. The Construct connects to the outside world for the first time.',
}

// ── Progress width per step ──────────────────────────────
const PROGRESS = { [S_NAME]: 0.1, [S_AGE]: 0.3, [S_EXPERIENCE]: 0.55, [S_INTENTION]: 0.78, [S_RESULT]: 1 }

export default function AcademyOnboarding() {
  const { createChildProfile } = useAcademy()
  const { goto } = useNav()

  const [step, setStep]           = useState(S_NAME)
  const [name, setName]           = useState('')
  const [age, setAge]             = useState(null)
  const [experience, setExperience] = useState(null)
  const [intention, setIntention] = useState(null)
  const [trackResult, setTrackResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]         = useState(null)
  const [redirectReason, setRedirectReason] = useState('')

  // ── Handlers ──────────────────────────────────────────
  function handleAge(val) {
    setAge(val)
    if (val === 'under8') { setStep(S_BLOCKED); return }
    if (val === '17plus') { setRedirectReason('17+'); setStep(S_REDIRECT); return }
    setStep(S_EXPERIENCE)
  }

  function handleExperience(val) {
    setExperience(val)
    if (age === '14-16' && val === 'knows') { setRedirectReason('knows-js'); setStep(S_REDIRECT); return }
    setStep(S_INTENTION)
  }

  function handleIntention(val) {
    setIntention(val)
    const result = determineTrack(age, experience)
    setTrackResult(result)
    setStep(S_RESULT)
  }

  async function handleConfirm() {
    if (!name.trim()) { setError('Please enter a name.'); return }
    if (!trackResult) return
    setSubmitting(true)
    setError(null)
    const { ok, error: err } = await createChildProfile({
      name: name.trim(),
      age,
      track: trackResult.track,
      startGate: trackResult.startGate,
      intention: intention ?? 'curious',
    })
    setSubmitting(false)
    if (!ok) { setError(err || 'Something went wrong. Try again.'); return }
    goto('academy/dashboard')
  }

  function back() {
    if (step === S_NAME)       goto('academy')
    else if (step === S_AGE)        setStep(S_NAME)
    else if (step === S_EXPERIENCE) setStep(S_AGE)
    else if (step === S_INTENTION)  setStep(S_EXPERIENCE)
    else if (step === S_RESULT)     setStep(S_INTENTION)
  }

  const progressPct = PROGRESS[step] ?? 0

  // ── Render ─────────────────────────────────────────────
  return (
    <div className="ao-root">
      {/* Progress bar */}
      {step <= S_RESULT && (
        <div className="ao-progressbar">
          <div className="ao-progressbar-fill" style={{ width: `${progressPct * 100}%` }} />
        </div>
      )}

      {/* Back button */}
      {step <= S_RESULT && (
        <button className="ao-back" onClick={back}>← Back</button>
      )}

      {/* STEP 0 — Name */}
      {step === S_NAME && (
        <div className="ao-step" key="name">
          <div className="ao-step-label">STEP 1 OF 4</div>
          <h2 className="ao-question">What should we call<br />our Builder?</h2>
          <p className="ao-sub">They'll be known by this name in the Construct.</p>
          <input
            className="ao-name-input"
            type="text"
            placeholder="Enter name..."
            maxLength={32}
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && name.trim() && setStep(S_AGE)}
            autoFocus
          />
          <button
            className="ao-btn-primary"
            disabled={!name.trim()}
            onClick={() => setStep(S_AGE)}
          >
            NEXT →
          </button>
        </div>
      )}

      {/* STEP 1 — Age */}
      {step === S_AGE && (
        <div className="ao-step" key="age">
          <div className="ao-step-label">STEP 2 OF 4</div>
          <h2 className="ao-question">How old is <span className="ao-name-highlight">{name}</span>?</h2>
          <div className="ao-age-grid">
            {AGE_OPTS.map(opt => (
              <button
                key={opt.value}
                className="ao-age-btn"
                style={{ '--hc': opt.color }}
                onClick={() => handleAge(opt.value)}
              >
                <span className="ao-age-icon">{opt.icon}</span>
                <span className="ao-age-label">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2 — Experience */}
      {step === S_EXPERIENCE && (
        <div className="ao-step" key="exp">
          <div className="ao-step-label">STEP 3 OF 4</div>
          <h2 className="ao-question">Has <span className="ao-name-highlight">{name}</span><br />coded before?</h2>
          <div className="ao-exp-list">
            {EXP_OPTS.map(opt => (
              <button
                key={opt.value}
                className="ao-exp-btn"
                onClick={() => handleExperience(opt.value)}
              >
                <div className="ao-exp-label">{opt.label}</div>
                <div className="ao-exp-desc">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 3 — Intention */}
      {step === S_INTENTION && (
        <div className="ao-step" key="int">
          <div className="ao-step-label">STEP 4 OF 4</div>
          <h2 className="ao-question">What does <span className="ao-name-highlight">{name}</span><br />want to make?</h2>
          <div className="ao-int-grid">
            {INT_OPTS.map((opt, i) => (
              <button
                key={i}
                className={`ao-int-btn${i === INT_OPTS.length - 1 ? ' ao-int-last' : ''}`}
                onClick={() => handleIntention(opt.value)}
              >
                <span className="ao-int-icon">{opt.icon}</span>
                <div className="ao-int-label">{opt.label}</div>
                <div className="ao-int-desc">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 4 — Result */}
      {step === S_RESULT && trackResult && (
        <div className="ao-step ao-result-step" key="result">
          <div className="ao-result-label">BUILDER PROFILE READY</div>
          <div className="ao-result-name">{name}</div>

          <div className="ao-result-track" style={{ '--tc': TRACK_COLORS[trackResult.track] }}>
            <div className="ao-result-badge">{trackResult.language}</div>
            <div className="ao-result-tier">{trackResult.tierLabel} Track · Starts at {trackResult.startGate}</div>
          </div>

          <p className="ao-result-desc">{TRACK_DESCS[trackResult.track]}</p>

          <div className="ao-result-name-confirm">
            <label className="ao-label">Confirm Builder name:</label>
            <input
              className="ao-name-input ao-name-small"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={32}
            />
          </div>

          {error && <div className="ao-error">{error}</div>}

          <button
            className="ao-btn-primary ao-btn-enter"
            disabled={submitting || !name.trim()}
            onClick={handleConfirm}
          >
            {submitting ? 'ENTERING...' : 'ENTER HUNTER ACADEMY →'}
          </button>
        </div>
      )}

      {/* BLOCKED — under 8 */}
      {step === S_BLOCKED && (
        <div className="ao-step ao-message-step" key="blocked">
          <div className="ao-message-icon">🌱</div>
          <h2 className="ao-message-title">Not quite yet.</h2>
          <p className="ao-message-text">
            Hunter Academy opens at age 8. Come back when you're ready —
            it'll still be here.
          </p>
          <button className="ao-btn-ghost" onClick={() => goto('academy')}>
            ← Back to Academy
          </button>
        </div>
      )}

      {/* REDIRECT — 17+ or knows JS */}
      {step === S_REDIRECT && (
        <div className="ao-step ao-message-step" key="redirect">
          <div className="ao-message-icon">⚡</div>
          <h2 className="ao-message-title">You're ready for the real thing.</h2>
          <p className="ao-message-text">
            {redirectReason === '17+'
              ? `${name} is 17 or older — the main Drift platform is built for you.`
              : `${name} already knows the language. The Abyss is waiting.`}
          </p>
          <button className="ao-btn-primary" onClick={() => goto('signup')}>
            JOIN DRIFT PROTOCOL →
          </button>
          <button className="ao-btn-ghost" onClick={() => goto('academy')}>
            ← Back to Academy
          </button>
        </div>
      )}
    </div>
  )
}

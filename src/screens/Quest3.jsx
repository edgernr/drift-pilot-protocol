import { useState, useRef, useCallback, useEffect } from 'react'
import './Quest.css'
import './Quest3.css'
import { useNav } from '../context/NavigationContext'
import { useAuth } from '../context/AuthContext'
import { useQuestAnalytics } from '../hooks/useQuestAnalytics'
import QuestQuiz from './QuestQuiz'
import { supabase } from '../lib/supabase'

const VARIANTS = [
  `<!DOCTYPE html>
<html>
<head>
  <title>EVA City — Citizen Registration</title>
</head>
<body>

<!--
  BUILD: EVA CITY CITIZEN REGISTRATION FORM
  The Label Eater feeds on inputs without identity.
  Starve it by satisfying all 10 scanner conditions:

  1. Wrap everything in a <form>
  2. Name field: <input type="text"> with id + <label for="...">
  3. Email field: <input type="email"> with id + <label for="...">
  4. Sector: <select> with <option> children + <label for="...">
  5. Access level: at least 2 <input type="radio"> sharing a name
  6. Message: <textarea> with id + <label for="...">
  7. Labels: at least 3 <label for="..."> elements
  8. IDs: at least 3 inputs with matching id attributes
  9. Required: name and email have the required attribute
  10. Submit: a real <button> — not a <div>, not styled text
-->

</body>
</html>`,

  `<!DOCTYPE html>
<html>
<head>
  <title>EVA City — Mission Request</title>
</head>
<body>

<!--
  BUILD: EVA CITY MISSION REQUEST FORM
  The Label Eater feeds on inputs without identity.
  Starve it by satisfying all 10 scanner conditions:

  1. Wrap everything in a <form>
  2. Pilot name: <input type="text"> with id + <label for="...">
  3. Contact email: <input type="email"> with id + <label for="...">
  4. Mission type: <select> with <option> children + <label for="...">
  5. Priority level: at least 2 <input type="radio"> sharing a name
  6. Briefing notes: <textarea> with id + <label for="...">
  7. Labels: at least 3 <label for="..."> elements
  8. IDs: at least 3 inputs with matching id attributes
  9. Required: name and email have the required attribute
  10. Submit: a real <button> — not a <div>, not styled text
-->

</body>
</html>`,

  `<!DOCTYPE html>
<html>
<head>
  <title>EVA City — Sector Access Application</title>
</head>
<body>

<!--
  BUILD: SECTOR ACCESS APPLICATION FORM
  The Label Eater feeds on inputs without identity.
  Starve it by satisfying all 10 scanner conditions:

  1. Wrap everything in a <form>
  2. Applicant name: <input type="text"> with id + <label for="...">
  3. Applicant email: <input type="email"> with id + <label for="...">
  4. Sector: <select> with <option> children + <label for="...">
  5. Clearance level: at least 2 <input type="radio"> sharing a name
  6. Reason for access: <textarea> with id + <label for="...">
  7. Labels: at least 3 <label for="..."> elements
  8. IDs: at least 3 inputs with matching id attributes
  9. Required: name and email have the required attribute
  10. Submit: a real <button> — not a <div>, not styled text
-->

</body>
</html>`,
]

const QUIZ = {
  question: 'What happens if a <label for="name"> exists but the input has id="username"?',
  options: [
    'The label won\'t focus the input when clicked — they\'re disconnected',
    'The browser automatically matches labels to inputs by their position',
    'The form will refuse to submit until the mismatch is resolved',
    'The label text becomes invisible to screen readers',
  ],
  correct: 0,
}

const FORM_CHECKS = [
  {
    id: 'form',
    label: 'Registration wrapped in <form>',
    hint: 'All controls must live inside a <form> element — the container for the entire submission',
    test: code => /<form[^<>]*>/i.test(code) && /<\/form>/i.test(code),
  },
  {
    id: 'text',
    label: 'Name: <input type="text">',
    hint: "Collect the pilot's name with <input type=\"text\"> — not just any input",
    test: code => /<input[^>]+type=["']text["']/i.test(code),
  },
  {
    id: 'email',
    label: 'Email: <input type="email">',
    hint: 'Use type="email" — the browser validates the format. type="text" won\'t do',
    test: code => /<input[^>]+type=["']email["']/i.test(code),
  },
  {
    id: 'select',
    label: 'Sector: <select> with <option>s',
    hint: 'A fixed list of choices uses <select> with <option> children inside it',
    test: code => /<select[^<>]*>/i.test(code) && /<\/select>/i.test(code) && /<option[^<>]*>/i.test(code),
  },
  {
    id: 'radio',
    label: 'Access level: <input type="radio">',
    hint: 'Mutually exclusive choices use type="radio" — all options share the same name attribute',
    test: code => /<input[^>]+type=["']radio["']/i.test(code),
  },
  {
    id: 'textarea',
    label: 'Message: <textarea>',
    hint: 'Multi-line text input needs <textarea> — not another <input type="text">',
    test: code => /<textarea[^<>]*>/i.test(code) && /<\/textarea>/i.test(code),
  },
  {
    id: 'labels',
    label: 'Inputs labeled: <label for="...">',
    hint: 'Every major input needs a <label for="id"> matching the input\'s id — this is what the Label Eater cannot consume',
    test: code => (code.match(/<label[^>]+for=/gi) || []).length >= 3,
  },
  {
    id: 'ids',
    label: 'Inputs have id attributes',
    hint: 'Labels connect to inputs via matching id= on the input and for= on the label — both must exist',
    test: code => (code.match(/\bid=["'][^"']+["']/gi) || []).length >= 3,
  },
  {
    id: 'required',
    label: 'Critical fields marked required',
    hint: 'Name and email need the required attribute — the form should not submit empty',
    test: code => (code.match(/\brequired\b/gi) || []).length >= 2,
  },
  {
    id: 'button',
    label: 'Submit is a real <button>',
    hint: 'The submit control must be <button type="submit"> — not a <div>, not a styled box',
    test: code => /<button[^<>]*>/i.test(code) && /<\/button>/i.test(code),
  },
]

function getErrors(code) {
  const errs = new Set()
  for (const chk of FORM_CHECKS) {
    if (!chk.test(code)) errs.add(chk.id)
  }
  return errs
}

function lineNumbers(text) {
  const n = text.split('\n').length
  return Array.from({ length: n }, (_, i) => <div key={i}>{i + 1}</div>)
}

export default function Quest3() {
  const { goto } = useNav()
  const { completeQuest } = useAuth()
  const { onPaste, trackChange, getAnalytics, pasteBlocked } = useQuestAnalytics()

  const [startCode] = useState(() => VARIANTS[Math.floor(Math.random() * VARIANTS.length)])
  const [htmlCode, setHtmlCode] = useState(() => startCode)
  const [errors, setErrors] = useState(() => getErrors(startCode))
  const [xpPopKey, setXpPopKey] = useState(0)
  const [xpPopText, setXpPopText] = useState('')
  const [extracting, setExtracting] = useState(false)
  const [dungeonEntry, setDungeonEntry] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [quizOpen, setQuizOpen] = useState(false)
  const [aiReview, setAiReview] = useState(null)

  const iframeRef = useRef(null)
  const htmlLnRef = useRef(null)
  const htmlTaRef = useRef(null)

  const updatePreview = useCallback((html) => {
    if (!iframeRef.current) return
    const style = `<style>
      html { font-size: 9px; overflow: hidden; }
      body { margin: 0; padding: 5px 7px; background: #0c0810; color: #c0a8b8; font-family: 'Courier New', monospace; font-size: 1.05rem; line-height: 1.4; }
      form { display: flex; flex-direction: column; gap: 3px; }
      label { color: #906880; font-size: 0.9rem; display: block; }
      input, select, textarea { background: #1a1020; border: 1px solid #3a1e30; color: #d0b0c0; padding: 2px 3px; font-size: 0.9rem; width: 100%; box-sizing: border-box; font-family: inherit; }
      textarea { height: 18px; resize: none; }
      input[type="radio"] { width: auto; display: inline; margin-right: 3px; }
      fieldset { border: 1px solid #3a1e30; padding: 2px 4px; margin: 1px 0; }
      legend { color: #906880; font-size: 0.85rem; }
      button { background: oklch(0.28 0.1 25); border: 1px solid oklch(0.55 0.22 25); color: oklch(0.85 0.12 25); padding: 2px 8px; font-size: 0.9rem; cursor: pointer; margin-top: 2px; font-family: inherit; }
      select option { background: #1a1020; }
    </style>`
    iframeRef.current.srcdoc = style + html
  }, [])

  useEffect(() => { updatePreview(htmlCode) }, [htmlCode, updatePreview])

  const errorsLeft = errors.size

  useEffect(() => {
    if (errorsLeft !== 0) { setAiReview(null); return }
    setAiReview('loading')
    supabase.functions.invoke('grade-code', {
      body: { code: htmlCode, quest_title: 'Gate 03 — The Form Gate', requirements: 'Build a complete HTML form with: form element, labeled inputs using label[for] matching input[id], text input, email input, radio buttons, textarea, select with options, required attributes on key fields, and a submit button.', language: 'html' },
    }).then(({ data }) => setAiReview(data ?? null)).catch(() => setAiReview(null))
  }, [errorsLeft]) // eslint-disable-line react-hooks/exhaustive-deps
  const xpEarned = (10 - errorsLeft) * 30
  const xpPct = (xpEarned / 300) * 100
  const xpLabel = `${xpEarned} / 300 XP`
  const bossHpPct = (errorsLeft / 10) * 100

  const statusText = pasteBlocked
    ? '⊘ Paste disabled — type the code'
    : errorsLeft === 0
    ? 'Label Eater defeated — extract the data'
    : errorsLeft === 1
    ? '1 wound remaining — finish it'
    : `${errorsLeft} wounds remaining — the Label Eater feeds`

  const previewHint = errorsLeft === 0
    ? 'Form complete. Extract the data.'
    : 'The Label Eater cannot consume what is labeled.'

  function handleHtmlChange(e) {
    const val = e.target.value
    setHtmlCode(val)
    trackChange(val.length)
    const newErrors = getErrors(val)
    if (newErrors.size < errors.size) {
      setXpPopText('+30 XP')
      setXpPopKey(k => k + 1)
    }
    setErrors(newErrors)
    syncScroll(htmlTaRef, htmlLnRef)
  }

  function syncScroll(taRef, lnRef) {
    if (taRef.current && lnRef.current) lnRef.current.scrollTop = taRef.current.scrollTop
  }

  function handleTabKey(e) {
    if (e.key !== 'Tab') return
    e.preventDefault()
    const ta = e.target
    const s = ta.selectionStart, en = ta.selectionEnd
    const next = ta.value.slice(0, s) + '  ' + ta.value.slice(en)
    setHtmlCode(next)
    requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = s + 2 })
  }

  function handleExtract() {
    if (errorsLeft > 0 || extracting) return
    setQuizOpen(true)
  }

  function handleQuizPass() {
    setQuizOpen(false)
    setExtracting(true)
    setTimeout(() => setDungeonEntry(true), 750)
    setTimeout(() => { setDungeonEntry(false); setModalOpen(true) }, 3350)
  }

  const formSlotClass = [
    'dq-form-slot',
    errorsLeft > 0 ? 'locked' : 'open',
    extracting && 'extracting',
  ].filter(Boolean).join(' ')

  return (
    <div className="dq-wrap dq-wrap-g3">
      <div className="dq-topbar">
        <span className="dq-back" onClick={() => goto('dashboard')}>← Dashboard</span>
        <div className="dq-topbar-center">
          <span className="dq-chapter">RANK D GATE · GATE 03</span>
          <span className="dq-title-label">The Form Gate</span>
        </div>
        <div className="dq-xp-row">
          <div className="dq-xp-bar-wrap">
            <div className="dq-xp-fill" style={{ width: `${xpPct}%` }} />
          </div>
          <span className="dq-xp-text">{xpLabel}</span>
        </div>
      </div>

      <div className="dq-main">
        <aside className="dq-brief">
          <div className="dq-scene-art">
            <div className="dq-scene-torch left" />
            <div className="dq-scene-torch right" />
            <div className={`dq3-scene-eater${errorsLeft === 0 ? ' defeated' : ''}`} />
          </div>

          <div className="dq3-boss-hp">
            <div className="dq3-boss-name">
              <span className="dq3-boss-title">BOSS — THE LABEL EATER</span>
              <span className="dq3-boss-status" style={{ color: errorsLeft > 0 ? 'oklch(0.62 0.22 25)' : 'var(--lime)' }}>
                {errorsLeft > 0 ? `${errorsLeft} HP` : 'DEFEATED'}
              </span>
            </div>
            <div className="dq3-boss-bar">
              <div className="dq3-boss-bar-fill" style={{ width: `${bossHpPct}%` }} />
            </div>
          </div>

          <div className="dq-narrator-box">
            <div className="dq-narrator-label">▶ NARRATOR</div>
            <p className="dq-narrator-text">
              The Label Eater formed around the oldest broken form in the Abyss. It cannot consume
              elements with complete identity. Build the citizen registration form — correct types,
              associated labels, real button. <strong>Feed it a single unlabeled input and it grows.</strong>
            </p>
          </div>

          <div>
            <div className="dq-section-label">
              FORM SCANNER —{' '}
              <span style={{ color: errorsLeft > 0 ? 'oklch(0.62 0.22 25)' : 'var(--lime)' }}>
                {errorsLeft} WOUNDS
              </span>
            </div>
            <ul className="dq-objectives">
              {FORM_CHECKS.map(chk => {
                const fixed = !errors.has(chk.id)
                return (
                  <li key={chk.id} className={fixed ? 'done' : 'error'}>
                    <div className="dq-obj-box dq3-obj-box">{fixed ? '✓' : '×'}</div>
                    <div>
                      <span>{chk.label}</span>
                      {!fixed && <div className="dq-error-hint">{chk.hint}</div>}
                    </div>
                  </li>
                )
              })}
            </ul>
            {aiReview === 'loading' && <div style={{ marginTop: 10, fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.04em' }}>⟳ AI reviewing…</div>}
            {aiReview && aiReview !== 'loading' && (
              <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 6, background: aiReview.passed ? 'rgba(132,204,22,0.06)' : 'rgba(232,67,147,0.06)', borderLeft: `2px solid ${aiReview.passed ? 'var(--lime)' : 'var(--magenta)'}`, fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-2)', lineHeight: 1.7 }}>
                <span style={{ color: aiReview.passed ? 'var(--lime)' : 'var(--magenta)', fontWeight: 700, marginRight: 6 }}>AI</span>{aiReview.feedback}
              </div>
            )}
          </div>

          <div className="dq-rewards">
            <div className="dq-reward eva"><div className="l">REWARD</div><div className="v">+300 DRIFT</div></div>
            <div className="dq-reward xp"><div className="l">XP</div><div className="v">+300</div></div>
          </div>
        </aside>

        <div className="dq-editor-wrap">
          <div className="dq-tabs">
            <div className="dq-tab active">
              index.html
              <span className="dq-dot" />
            </div>
          </div>

          <div className="dq-editor-pane active">
            <div className="dq-editor-inner">
              <div className="dq-line-numbers" ref={htmlLnRef}>{lineNumbers(htmlCode)}</div>
              <textarea
                ref={htmlTaRef}
                className="dq-textarea"
                value={htmlCode}
                onChange={handleHtmlChange}
                onPaste={onPaste}
                onScroll={() => syncScroll(htmlTaRef, htmlLnRef)}
                onKeyDown={handleTabKey}
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
              />
            </div>
          </div>

          <div className="dq-editor-footer">
            <div className="dq-editor-status">
              <div className={`dq-dot-green${errorsLeft > 0 ? ' error' : ''}`} />
              <span>{statusText}</span>
            </div>
            <span key={xpPopKey} className={`dq-xp-pop${xpPopText ? ' pop' : ''}`}>{xpPopText}</span>
          </div>
        </div>

        <aside className="dq-preview-wrap">
          <div className="dq-preview-label">FORM PREVIEW</div>
          <div className="dq-dungeon-scene">
            <div className="dq-torch left" />
            <div className="dq-torch-bracket left" />
            <div className="dq-torch right" />
            <div className="dq-torch-bracket right" />
            <div className={formSlotClass} onClick={handleExtract}>
              <iframe ref={iframeRef} className="dq-form-iframe" sandbox="allow-scripts" title="preview" />
              <div className="dq-form-frame" />
              <div className="dq-enter-prompt">▶ Extract Data</div>
              {errorsLeft === 0 && <div className="dq-door-overlay" />}
              {errorsLeft === 0 && <div className="dq-form-open-chip">FORM COMPLETE</div>}
            </div>
          </div>
          <p className="dq-preview-hint">{previewHint}</p>
        </aside>
      </div>

      {quizOpen && <QuestQuiz quiz={QUIZ} onPass={handleQuizPass} />}

      {dungeonEntry && (
        <div className="dq-dungeon-entry">
          <div className="dq-de-corridor">
            <div className="dq-de-in1"><div className="dq-de-in2" /></div>
          </div>
          <div className="dq-de-torch left" />
          <div className="dq-de-torch right" />
          <div className="dq-de-xp">+300 XP</div>
          <div className="dq-de-label">Label Eater — Defeated</div>
        </div>
      )}

      <div className={`dq-complete-modal${modalOpen ? ' open' : ''}`}>
        <div className="dq-complete-inner">
          <span className="dq-badge-icon">⚗️</span>
          <div className="dq-complete-chip">BOSS DEFEATED</div>
          <h2>The Label Eater collapses.</h2>
          <p>It couldn't find a single unlabeled input to feed on. Every field had identity. Every type was correct. <strong>The dungeon had nothing left to consume.</strong></p>
          <div className="dq-complete-rewards">
            <div className="r"><div className="l">$DRIFT EARNED</div><div className="v">+300</div></div>
            <div className="r"><div className="l">XP GAINED</div><div className="v">+300</div></div>
            <div className="r"><div className="l">CORE</div><div className="v">Label Eater Core</div></div>
            <div className="r"><div className="l">RANK</div><div className="v">D License</div></div>
          </div>
          <div className="dq-next-quest">
            <div className="dq-nq-label">GATE 04 UNLOCKED</div>
            <div className="dq-nq-card" onClick={async () => { await completeQuest('act1-ch03', 300, getAnalytics()); goto('quest4') }}>
              <span className="dq-nq-emoji">🎨</span>
              <div>
                <div className="dq-nq-title">Gate 04 — Paint the City</div>
                <div className="dq-nq-sub">CSS Design Systems</div>
              </div>
              <span className="dq-nq-arrow">→</span>
            </div>
          </div>
          <button className="btn btn-primary" onClick={async () => { await completeQuest('act1-ch03', 300, getAnalytics()); goto('dashboard') }}>Continue →</button>
        </div>
      </div>
    </div>
  )
}

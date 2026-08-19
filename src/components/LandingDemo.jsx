import { useState } from 'react'
import './LandingDemo.css'

/**
 * Playable hero demo — no account, no backend, no network.
 *
 * The old landing page showed a *picture* of a gate: hardcoded objectives, a
 * fake progress bar, and a "Clear Gate" button that opened the signup form. A
 * visitor could not touch anything before creating an account. This is the
 * actual mechanic instead — find the mistakes, the thing fighting you dies.
 *
 * Deliberately uses the defect-hunt mechanic rather than a code editor: it
 * works for someone who has never programmed, it works on a phone, and it is
 * honest about the whole platform rather than only the coding half.
 */

const LINES = [
  { t: '<!DOCTYPE html>' },
  { t: '<html lang="en">' },
  { t: '  <head>' },
  { t: '    <title>The Document Tomb</title>' },
  { t: '  </head>' },
  { t: '  <body>' },
  { t: '    <h1>The seal is broken<h1>',
    why: 'A closing tag needs a slash — this should be </h1>. Without it the browser keeps nesting headings forever.' },
  { t: '    <img src="seal.png">',
    why: 'No alt text. Anyone using a screen reader has no idea this image exists.' },
  { t: '    <p>Something moved in the dark.</div>',
    why: 'Opened a <p>, closed a </div>. Mismatched tags — the browser will guess, and guess wrong.' },
  { t: '    <a>Descend</a>',
    why: 'A link with no href attribute is not a link. It goes nowhere and keyboards skip it.' },
  { t: '  </body>' },
  { t: '</html>' },
]

const BUGS = LINES.filter(l => l.why).length

export default function LandingDemo({ onDone }) {
  const [found, setFound] = useState([])
  const [misses, setMisses] = useState([])
  const [note, setNote] = useState(null)

  const enemyHp = Math.max(0, 100 - found.length * (100 / BUGS))
  const playerHp = Math.max(0, 100 - misses.length * 20)
  const won = found.length === BUGS
  const lost = playerHp === 0 && !won
  const over = won || lost

  function hit(i) {
    if (over) return
    const line = LINES[i]
    if (line.why) {
      if (found.includes(i)) return
      setFound(f => [...f, i])
      setNote({ ok: true, text: line.why })
      if (found.length + 1 === BUGS) onDone?.()
    } else {
      if (misses.includes(i)) return
      setMisses(m => [...m, i])
      setNote({ ok: false, text: 'That line is fine. Guessing costs you — real reviewers who flag everything are as useless as ones who flag nothing.' })
    }
  }

  function reset() { setFound([]); setMisses([]); setNote(null) }

  return (
    <div className="ldemo">
      <div className="ldemo-bars">
        <div className="ldemo-bar">
          <span className="ldemo-bar-lbl">You</span>
          <div className="ldemo-track"><div className="ldemo-fill you" style={{ width: `${playerHp}%` }} /></div>
        </div>
        <div className="ldemo-bar">
          <span className="ldemo-bar-lbl enemy">Broken page</span>
          <div className="ldemo-track"><div className="ldemo-fill enemy" style={{ width: `${enemyHp}%` }} /></div>
        </div>
      </div>

      <div className="ldemo-hint">
        {over ? '' : `Click the mistakes. ${BUGS - found.length} left.`}
      </div>

      <pre className="ldemo-code">
        {LINES.map((l, i) => {
          const isFound = found.includes(i)
          const isMiss = misses.includes(i)
          const clickable = !over && !isFound && !isMiss
          return (
            <code
              key={i}
              className={`ldemo-line${isFound ? ' found' : ''}${isMiss ? ' miss' : ''}${clickable ? ' live' : ''}`}
              onClick={() => hit(i)}
              role={clickable ? 'button' : undefined}
              tabIndex={clickable ? 0 : -1}
              onKeyDown={e => { if (clickable && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); hit(i) } }}
            >
              {isFound && <span className="ldemo-mark">✓</span>}
              {l.t}
            </code>
          )
        })}
      </pre>

      {note && !over && (
        <div className={`ldemo-note${note.ok ? ' ok' : ' bad'}`}>{note.text}</div>
      )}

      {won && (
        <div className="ldemo-end win">
          <strong>That was real HTML.</strong> You just did what a front-end developer does every day —
          read code, spot what's wrong, fix it. There are 200 more like this, and they get harder.
        </div>
      )}
      {lost && (
        <div className="ldemo-end lose">
          <strong>The page won.</strong> That happens. In the game you respawn at the gate with nothing lost.
          <button className="ldemo-retry" onClick={reset}>Try again</button>
        </div>
      )}
    </div>
  )
}

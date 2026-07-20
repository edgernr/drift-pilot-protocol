import { useCallback, useEffect, useRef, useState } from 'react'
import './CutscenePlayer.css'
import { speak, stopTts, prefetchTts, isTtsMuted, setTtsMuted } from '../../lib/tts'

// Flatten a line (string OR JSX like <>a <strong>b</strong></>) to plain text.
function nodeToText(node) {
  if (node == null || node === false || node === true) return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(nodeToText).join('')
  if (node.props && node.props.children != null) return nodeToText(node.props.children)
  return ''
}

// Map a card's speaker/tone to a character voice preset.
function voiceForCard(card) {
  const sp = (card.speaker || '').toUpperCase()
  const tone = card.tone || ''
  if (tone === 'gorgoroth' || sp.includes('GORGOROTH')) return 'gorgoroth'
  if (sp.includes('VERA')) return 'vera'
  if (sp.includes('PROCTOR') || tone === 'assoc') return 'proctor'
  return 'narrator'
}

/*
 * CutscenePlayer — the card-based cutscene system (Season 01 prologue).
 *
 * Contract:
 *   <CutscenePlayer scene={SCENE} onComplete={fn} skippable={bool} />
 *
 *   SCENE = {
 *     id:    'cs0',
 *     title: 'PATCH DAY',            // small kicker shown top-left
 *     cards: [
 *       {
 *         id:     'c1',
 *         art:    <SomeArt />,        // procedural SVG/CSS component, fills the frame
 *         lines:  ['string', ...],    // up to 3 copy lines, revealed in sequence
 *         speaker:'VERA',             // optional — renders a comms-style attribution
 *         tone:   'gorgoroth',        // optional — 'gorgoroth' (magenta) | 'vera' (cyan) | 'assoc' (gold)
 *         holdMs: 0,                  // optional — minimum ms before advance is allowed
 *       },
 *     ],
 *   }
 *
 * Advance: click / Space / Enter / →. The last card's advance fires onComplete.
 * Art components should render an <svg> or absolutely-positioned CSS scene
 * that fills its container (the .cs-art layer is position:absolute inset:0).
 */
export default function CutscenePlayer({ scene, onComplete, skippable = false }) {
  const [idx, setIdx] = useState(0)
  const [lineCount, setLineCount] = useState(1)
  const [locked, setLocked] = useState(false)
  const [muted, setMuted] = useState(isTtsMuted())
  const holdTimerRef = useRef(null)
  const doneRef = useRef(false)

  const card = scene.cards[idx]
  const totalLines = card?.lines?.length ?? 0

  // Per-card hold lock (minimum dwell before advancing)
  useEffect(() => {
    clearTimeout(holdTimerRef.current)
    if (card?.holdMs > 0) {
      setLocked(true)
      holdTimerRef.current = setTimeout(() => setLocked(false), card.holdMs)
    } else {
      setLocked(false)
    }
    return () => clearTimeout(holdTimerRef.current)
  }, [idx, card])

  const advance = useCallback(() => {
    if (locked || doneRef.current) return
    // Reveal remaining copy lines first, then move cards
    if (lineCount < totalLines) {
      setLineCount(c => c + 1)
      return
    }
    if (idx < scene.cards.length - 1) {
      setIdx(i => i + 1)
      setLineCount(1)
    } else {
      doneRef.current = true
      onComplete?.()
    }
  }, [locked, lineCount, totalLines, idx, scene.cards.length, onComplete])

  const skip = useCallback(() => {
    if (doneRef.current) return
    doneRef.current = true
    onComplete?.()
  }, [onComplete])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight') {
        e.preventDefault()
        advance()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [advance])

  // Narrate the newest revealed line; prefetch the next. Silent if TTS off/undeployed.
  useEffect(() => {
    const c = scene.cards[idx]
    if (!c) return
    const voice = voiceForCard(c)
    speak(nodeToText(c.lines?.[lineCount - 1]), voice)
    const nextSame = c.lines?.[lineCount]
    if (nextSame) prefetchTts(nodeToText(nextSame), voice)
    else {
      const nc = scene.cards[idx + 1]
      if (nc) prefetchTts(nodeToText(nc.lines?.[0]), voiceForCard(nc))
    }
  }, [idx, lineCount, scene])

  useEffect(() => () => stopTts(), [])

  const toggleMute = useCallback((e) => {
    e.stopPropagation()
    const m = !muted
    setMuted(m)
    setTtsMuted(m)
  }, [muted])

  if (!card) return null

  return (
    <div className={`cs-wrap cs-tone-${card.tone || 'none'}`} onClick={advance}>
      <div className="cs-art" key={`art-${idx}`}>{card.art}</div>

      <div className="cs-top">
        <span className="cs-kicker">{scene.title}</span>
        <span className="cs-dots">
          {scene.cards.map((c, i) => (
            <span key={c.id ?? i} className={`cs-dot ${i === idx ? 'on' : ''} ${i < idx ? 'done' : ''}`} />
          ))}
        </span>
        <button className="cs-mute" onClick={toggleMute} aria-label={muted ? 'Unmute narration' : 'Mute narration'}>
          {muted ? '🔇' : '🔊'}
        </button>
        {skippable && (
          <button className="cs-skip" onClick={(e) => { e.stopPropagation(); skip() }}>
            SKIP ▸▸
          </button>
        )}
      </div>

      <div className="cs-copy" key={`copy-${idx}`}>
        {card.speaker && <div className="cs-speaker">{card.speaker}</div>}
        {card.lines.slice(0, lineCount).map((line, i) => (
          <p className="cs-line" key={i}>{line}</p>
        ))}
      </div>

      <div className={`cs-continue ${locked ? 'locked' : ''}`}>
        {locked ? '· · ·' : lineCount < totalLines ? '▸' : idx < scene.cards.length - 1 ? '▸ CONTINUE' : '▸ PROCEED'}
      </div>
    </div>
  )
}

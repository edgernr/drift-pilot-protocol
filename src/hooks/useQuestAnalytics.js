import { useCallback, useRef, useState } from 'react'

/*
 * Anti-cheat / integrity telemetry for gate encounters.
 *
 * Why the old version failed: `onPaste` on a wrapper div does NOT intercept
 * Monaco's paste (Monaco reads the clipboard on its own hidden textarea), and a
 * `flagged` boolean written silently to the DB has zero visible consequence — so
 * a pasted ChatGPT solution cleared a gate in ~10s with no friction.
 *
 * This version:
 *   1. HARD-blocks paste at the Monaco layer (keybinding override + onDidPaste
 *      revert) so external code can't be dumped in.
 *   2. Detects BULK INSERTS precisely via Monaco change events — catches paste
 *      that slips the block, drag-drop, and devtools/setValue injection.
 *   3. Exposes LIVE `suspicious` + `reasons` so the shell can react on-screen
 *      the instant something looks off (deterrent, not just a hidden log).
 *
 * getAnalytics() still returns ONLY the columns quest_completions has
 * (time_taken, paste_count, flagged) — the richer signals drive UI, not the DB.
 */

const BIG_INSERT = 25       // a single edit adding ≥25 chars is not typing/one-token autocomplete

export function useQuestAnalytics({ minSeconds = 15 } = {}) {
  const startedAt = useRef(Date.now())
  const pasteEvents = useRef(0)
  const injectedChars = useRef(0)  // chars that arrived via bulk inserts (paste-that-slipped / injection)
  const bigInserts = useRef(0)
  const finalChars = useRef(0)
  const editorRef = useRef(null)
  const monacoRef = useRef(null)

  const [pasteBlocked, setPasteBlocked] = useState(false)
  const [suspicious, setSuspicious] = useState(false)
  const [reasons, setReasons] = useState([])
  const blockTimer = useRef(null)

  // Primary teeth: paste + bulk-insert (both directly kill the "dump a ChatGPT
  // answer" vector). Speed is a secondary soft signal — kept strict to avoid
  // false-flagging a fast legit solver.
  const computeReasons = useCallback(() => {
    const r = []
    const t = (Date.now() - startedAt.current) / 1000
    if (pasteEvents.current > 0) r.push('paste attempt blocked')
    if (injectedChars.current >= BIG_INSERT) r.push('bulk code insertion')
    if (t < minSeconds) r.push('implausible completion speed')
    return r
  }, [minSeconds])

  const refreshSuspicion = useCallback(() => {
    const r = computeReasons()
    setReasons(r)
    setSuspicious(r.length > 0)
  }, [computeReasons])

  const flashBlocked = useCallback(() => {
    setPasteBlocked(true)
    clearTimeout(blockTimer.current)
    blockTimer.current = setTimeout(() => setPasteBlocked(false), 2200)
  }, [])

  const recordPaste = useCallback(() => {
    pasteEvents.current += 1
    flashBlocked()
    refreshSuspicion()
  }, [flashBlocked, refreshSuspicion])

  // React backup handler (kept on the wrapper; Monaco-layer block is primary).
  const onPaste = useCallback((e) => {
    e.preventDefault()
    recordPaste()
  }, [recordPaste])

  // Monaco onMount: this is where the real paste block lives.
  const bindEditor = useCallback((editor, monaco) => {
    editorRef.current = editor
    monacoRef.current = monaco
    // Swallow the paste keybindings entirely — nothing gets inserted.
    const swallow = () => recordPaste()
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV, swallow)
    editor.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.Insert, swallow)
    // Catch pastes that bypass the keybinding (context menu, drag-drop,
    // middle-click) — revert exactly the pasted range.
    editor.onDidPaste((e) => {
      recordPaste()
      try {
        editor.executeEdits('anti-cheat', [{ range: e.range, text: '', forceMoveMarkers: true }])
      } catch { /* range gone — the change-level detector still flags it */ }
    })
  }, [recordPaste])

  // Editor onChange: (value, monacoChangeEvent). Classifies each edit as typing
  // vs. bulk insertion so injection is caught even if the paste block is bypassed.
  const onCodeChange = useCallback((value, ev) => {
    finalChars.current = (value || '').length
    const changes = ev?.changes
    if (changes) {
      for (const c of changes) {
        const inserted = c.text ? c.text.length : 0
        if (inserted >= BIG_INSERT) { injectedChars.current += inserted; bigInserts.current += 1 }
      }
    }
    refreshSuspicion()
  }, [refreshSuspicion])

  // Emits ONLY the columns quest_completions has.
  const getAnalytics = useCallback(() => {
    const time_taken = Math.round((Date.now() - startedAt.current) / 1000)
    const r = computeReasons()
    return { time_taken, paste_count: pasteEvents.current, flagged: r.length > 0 }
  }, [computeReasons])

  // Human-readable reasons for the integrity overlay.
  const getReasons = useCallback(() => computeReasons(), [computeReasons])

  return { onPaste, bindEditor, onCodeChange, getAnalytics, getReasons, pasteBlocked, suspicious, reasons }
}

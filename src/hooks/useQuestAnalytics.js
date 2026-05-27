import { useRef, useState } from 'react'

export function useQuestAnalytics() {
  const startedAt = useRef(Date.now())
  const [pasteCount, setPasteCount] = useState(0)
  const [pasteBlocked, setPasteBlocked] = useState(false)
  const lastLen = useRef(0)
  const rapidChanges = useRef(0)
  const pasteTimer = useRef(null)

  function onPaste(e) {
    e.preventDefault()
    setPasteCount(c => c + 1)
    setPasteBlocked(true)
    clearTimeout(pasteTimer.current)
    pasteTimer.current = setTimeout(() => setPasteBlocked(false), 2000)
  }

  function trackChange(newLen) {
    const delta = newLen - lastLen.current
    if (delta > 80) rapidChanges.current++
    lastLen.current = newLen
  }

  function getAnalytics() {
    const time_taken = Math.round((Date.now() - startedAt.current) / 1000)
    const flagged = time_taken < 90 || pasteCount > 0 || rapidChanges.current > 2
    return { time_taken, paste_count: pasteCount, flagged }
  }

  return { onPaste, trackChange, getAnalytics, pasteBlocked }
}

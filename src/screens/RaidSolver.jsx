import { useState, useCallback, useRef } from 'react'
import Raid01Combat from '../components/Raid01Combat'
import { FUNCTIONS, FUNCTIONS_BY_ID } from '../data/raids/raid01'

/*
 * RaidSolver — DEV-ONLY harness screen (rule #6: a function without a
 * machine-verified solution does not exist).
 *
 * Mounts RAID 01's combat shell in OFFLINE mode: shared state lives in local
 * React state instead of Supabase, and loadCode() serves each function's
 * `solution` as its stored code. The headless driver (scripts/solve-raid01.mjs)
 * then only has to wait for each function to load, watch the wards pass through
 * the real check pipeline, STRIKE, and assert the victory overlay — proving
 * end-to-end completability of all five functions through production combat code.
 *
 * Registered only when import.meta.env.DEV (see App.jsx). No auth required.
 */
export default function RaidSolver() {
  const [funcs, setFuncs] = useState({})
  const [events, setEvents] = useState([])
  const idRef = useRef(0)

  const onComplete = useCallback((fnId) => {
    setFuncs(prev => ({
      ...prev, [fnId]: { status: 'severed', claimed_by: 'solver', severed_by: 'solver' },
    }))
  }, [])

  const onEvent = useCallback((type, label) => {
    setEvents(prev => [{ id: ++idRef.current, type, label }, ...prev].slice(0, 60))
  }, [])

  // Rule #6 hook: stored code IS the authored solution.
  const loadCode = useCallback((fnId) => Promise.resolve(FUNCTIONS_BY_ID[fnId].solution), [])

  return (
    <Raid01Combat
      functions={funcs}
      members={[
        { user_id: 'solver', name: 'SOLVER', role: 'interface' },
      ]}
      myId="solver"
      events={events}
      onComplete={onComplete}
      onEvent={onEvent}
      loadCode={loadCode}
      saveCode={() => {}}
      onVictory={() => {}}
      onExit={() => {}}
    />
  )
}

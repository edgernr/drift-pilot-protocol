import { useState, useCallback, useRef } from 'react'
import Raid01Combat from '../components/Raid01Combat'
import { HEADS_BY_ID } from '../data/raids/raid01'

/*
 * RaidSolver — DEV-ONLY harness screen (bible §9.6 / rule #6: a head without a
 * machine-verified solution does not exist).
 *
 * Mounts RAID 01's combat shell in OFFLINE mode: shared state lives in local
 * React state instead of Supabase, and loadCode() serves each head's `solution`
 * as its stored code. The headless driver (scripts/solve-raid01.mjs) then only
 * has to CLAIM each head, watch the wards pass through the real check pipeline,
 * STRIKE, and assert the victory overlay — proving end-to-end severability of
 * all nine heads through production combat code.
 *
 * Registered only when import.meta.env.DEV (see App.jsx). No auth required.
 */
export default function RaidSolver() {
  const [heads, setHeads] = useState({})
  const [events, setEvents] = useState([])
  const idRef = useRef(0)

  const onClaim = useCallback((headId) => {
    setHeads(prev => (prev[headId]?.status === 'severed' ? prev : {
      ...prev, [headId]: { status: 'claimed', claimed_by: 'solver' },
    }))
  }, [])

  const onSever = useCallback((headId) => {
    setHeads(prev => ({
      ...prev, [headId]: { status: 'severed', claimed_by: 'solver', severed_by: 'solver' },
    }))
  }, [])

  const onEvent = useCallback((type, label) => {
    setEvents(prev => [{ id: ++idRef.current, type, label }, ...prev].slice(0, 60))
  }, [])

  // Rule #6 hook: stored code IS the authored solution.
  const loadCode = useCallback((headId) => Promise.resolve(HEADS_BY_ID[headId].solution), [])

  return (
    <Raid01Combat
      heads={heads}
      members={[{ user_id: 'solver', name: 'SOLVER', role: 'slayer' }]}
      myId="solver"
      events={events}
      onClaim={onClaim}
      onSever={onSever}
      onEvent={onEvent}
      loadCode={loadCode}
      saveCode={() => {}}
      onVictory={() => {}}
      onExit={() => {}}
    />
  )
}

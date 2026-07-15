import { useParams } from 'react-router-dom'
import ArenaShell from '../components/ArenaShell'
import gate01 from '../data/gates/gate01'
import gate02 from '../data/gates/gate02'
import gate03 from '../data/gates/gate03'
import gate04 from '../data/gates/gate04'
import gate05 from '../data/gates/gate05'
import gate06 from '../data/gates/gate06'
import gate07 from '../data/gates/gate07'
import gate08 from '../data/gates/gate08'
import gate09 from '../data/gates/gate09'
import gate10 from '../data/gates/gate10'

const GATES = {
  1: gate01, 2: gate02, 3: gate03, 4: gate04, 5: gate05,
  6: gate06, 7: gate07, 8: gate08, 9: gate09, 10: gate10,
}

/*
 * SolverGate — DEV-ONLY harness screen (bible §9.6: "a gate without a
 * machine-verified solution does not exist").
 *
 * Mounts a gate through the real ArenaShell (the universal shell) with two mods:
 *   - variant pinned to 0 (solutions are authored against variants[0])
 *   - the editor's starter code IS the config's `solution`
 * The headless driver (scripts/solve-gates.mjs) then only has to observe the
 * wards pass, click CAST, answer the quiz, and assert the completion overlay —
 * proving end-to-end completability of the config through production code.
 *
 * Registered only when import.meta.env.DEV (see App.jsx). No auth: with no
 * user, EncounterShell skips completeQuest but still shows the completion
 * overlay — exactly what the harness asserts.
 */
export default function SolverGate() {
  const { gateNum } = useParams()
  const base = GATES[Number(gateNum)]
  if (!base) {
    return <div style={{ color: '#eaf6f5', padding: 40, fontFamily: 'monospace' }}>SOLVER: unknown gate "{gateNum}"</div>
  }
  const solution = typeof base.solution === 'function' ? base.solution(0) : base.solution
  const cfg = {
    ...base,
    variants: base.variants ? [base.variants[0]] : base.variants,
    getStarterCode: () => solution ?? '/* RULE #6 VIOLATION: no solution field on this config */',
  }
  return <ArenaShell key={base.id} config={cfg} />
}

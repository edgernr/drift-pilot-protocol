import { useCallback, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNav } from '../context/NavigationContext'
import CutscenePlayer from '../components/cutscene/CutscenePlayer'
import FallScene from '../components/cutscene/FallScene'
import PrologueEncounter from '../components/PrologueEncounter'
import cs0PatchDay from '../data/cutscenes/cs0PatchDay'
import cs1Rupture from '../data/cutscenes/cs1Rupture'
import cs2TheMark from '../data/cutscenes/cs2TheMark'
import cs4Signal from '../data/cutscenes/cs4Signal'
import examConfig from '../data/gates/prologueExam'
import gorgorothConfig from '../data/gates/prologueGorgoroth'

/*
 * PROLOGUE — "ZERO HOUR" (Level 1 of the Season 01 rework).
 * One route, one linear state machine — no goto() between beats, so the
 * route-transition overlay never flashes mid-flow:
 *
 *   cs0 (PATCH DAY)  → exam (tutorial, un-losable)
 *   → cs1 (RUPTURE)  → gorgoroth (rigged, mandatory loss)
 *   → cs2 (THE MARK) → fall (CS-3, vertical parallax)
 *   → cs4 (SIGNAL)   → prologue_done=true → goto('quest')  [Gate 01 = Level 2]
 *
 * The prologue pays no XP/Shards — Gate 01 is the first real payout.
 */
const STAGES = ['cs0', 'exam', 'cs1', 'gorgoroth', 'cs2', 'fall', 'cs4']

export default function Prologue() {
  const { profile, markPrologueDone } = useAuth()
  const { goto } = useNav()
  const [stage, setStage] = useState('cs0')

  const next = useCallback(() => {
    setStage(s => STAGES[STAGES.indexOf(s) + 1] ?? s)
  }, [])

  const finish = useCallback(async () => {
    // GateRoute bounces prologue_done===false hunters back here — make sure the
    // flag really lands before we route into Gate 01 (one retry on failure).
    const ok = await markPrologueDone()
    if (!ok) await markPrologueDone()
    goto('quest')
  }, [markPrologueDone, goto])

  // Admins can skip individual cutscenes while testing; the fights and the
  // loss are never skippable — the loss is canon.
  const skippable = !!profile?.is_admin

  switch (stage) {
    case 'cs0':
      return <CutscenePlayer scene={cs0PatchDay} onComplete={next} skippable={skippable} />
    case 'exam':
      return <PrologueEncounter config={examConfig} onWin={next} />
    case 'cs1':
      return <CutscenePlayer scene={cs1Rupture} onComplete={next} skippable={skippable} />
    case 'gorgoroth':
      return <PrologueEncounter config={gorgorothConfig} onLoss={next} />
    case 'cs2':
      return <CutscenePlayer scene={cs2TheMark} onComplete={next} skippable={skippable} />
    case 'fall':
      return <FallScene onComplete={next} />
    case 'cs4':
      return <CutscenePlayer scene={cs4Signal} onComplete={finish} skippable={skippable} />
    default:
      return null
  }
}

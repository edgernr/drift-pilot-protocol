import { useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNav } from '../context/NavigationContext'
import CutscenePlayer from '../components/cutscene/CutscenePlayer'
import cs5FirstKill from '../data/cutscenes/cs5FirstKill'

// CS-5 "FIRST KILL" — plays after Contract 001 (Gate 01) closes:
// VERA walks the payout, the presence map, and finds Mara's carving.
export default function Interlude1() {
  const { profile } = useAuth()
  const { goto } = useNav()
  const next = useCallback(() => goto('quest2'), [goto])
  return <CutscenePlayer scene={cs5FirstKill} onComplete={next} skippable={!!profile?.is_admin} />
}

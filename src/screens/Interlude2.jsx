import { useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNav } from '../context/NavigationContext'
import CutscenePlayer from '../components/cutscene/CutscenePlayer'
import cs6DRank from '../data/cutscenes/cs6DRank'

// CS-6 "D-RANK" — plays after the Label Eater falls (Gate 03):
// the promotion, and far above, Gorgoroth's tapping stops.
export default function Interlude2() {
  const { profile } = useAuth()
  const { goto } = useNav()
  const next = useCallback(() => goto('quest4'), [goto])
  return <CutscenePlayer scene={cs6DRank} onComplete={next} skippable={!!profile?.is_admin} />
}

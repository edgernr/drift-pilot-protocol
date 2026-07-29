import { createContext, useContext, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

const SCREEN_NAMES = {
  '/': 'HOME',
  '/login': 'LOGIN',
  '/signup': 'ENLISTMENT',
  '/terms': 'FLIGHT RULES — TERMS OF SERVICE',
  '/privacy': 'PRIVACY POLICY',
  '/downloads': 'DOWNLOAD DESKTOP APP',
  '/dashboard': 'SEEKER HQ',
  '/dashboard/admin': 'ASSOCIATION COMMAND',
  '/guild': 'GUILDS',
  '/prologue': 'ZERO HOUR — TOWER OF HUNTERS',
  '/interlude1': 'FIRST KILL — CONTRACT PAYOUT',
  '/interlude2': 'RANK D — PROMOTION',
  '/quest': 'GATE 01 — THE DOCUMENT TOMB',
  '/quest2': 'GATE 02 — THE SEMANTIC CRYPT',
  '/quest3': 'GATE 03 — THE REGISTRY HALL',
  '/quest4': 'GATE 04 — PAINT THE CITY',
  '/quest5': 'GATE 05 — THE GRAVITY ANCHOR',
  '/quest6': 'GATE 06 — THE INFINITE GRID',
  '/quest7': 'GATE 07 — GHOST FEEDBACK',
  '/quest8': 'GATE 08 — THE COLLAPSE',
  '/quest9': 'GATE 09 — THE CONTROL ROOM',
  '/quest10': 'GATE 10 — THE STATIC CITY',
  '/raid01': 'RAID 01 — THE BROODGATE',
  // Void Academy
  '/academy': 'VOID ACADEMY',
  '/academy/onboarding': 'BUILDER SETUP',
  '/academy/dashboard': 'VOID ACADEMY — BUILDER HQ',
  '/academy/gate/s01': 'GATE S-01 — THE FIRST BLOCK',
  '/academy/gate/s02': 'GATE S-02 — THE REPEAT MACHINE',
  '/academy/gate/s03': 'GATE S-03 — THE DECISION POINT',
  '/academy/gate/s04': 'GATE S-04 — THE MEMORY BOX',
  '/academy/gate/s05': 'GATE S-05 — THE EVENT TOWER',
  '/academy/gate/s06': 'GATE S-06 — THE GLITCH BLOCK',
  '/academy/gate/s07': 'GATE S-07 — THE FUNCTION MACHINE',
  '/academy/gate/s08': 'GATE S-08 — THE COUNTER LOOP',
  '/academy/gate/s09': 'GATE S-09 — THE MULTI-SPRITE WORLD',
  '/academy/gate/s10': 'GATE S-10 — THE COMPLETE WORLD',
  '/academy/gate/s11': 'GATE S-11 — THE GLITCH KING',
  '/academy/gate/s12': 'GATE S-12 — THE ANIMATION STUDIO',
  '/academy/gate/s13': 'GATE S-13 — THE SOUND SYSTEM',
  '/academy/gate/s14': 'GATE S-14 — THE CLONE FACTORY',
  '/academy/gate/s15': 'GATE S-15 — THE MINI GAME JAM',
  '/academy/gate/p01': 'GATE P-01 — FIRST WORDS',
  '/academy/gate/p02': 'GATE P-02 — THE NUMBER ENGINE',
  '/academy/gate/p03': 'GATE P-03 — THE CONDITION WRITER',
  '/academy/gate/p04': 'GATE P-04 — THE LOOP WRITER',
  '/academy/gate/p05': 'GATE P-05 — THE FUNCTION FORGE',
  '/academy/gate/p06': 'GATE P-06 — THE LIST LIBRARY',
  '/academy/gate/p07': 'GATE P-07 — THE DICTIONARY DISTRICT',
  '/academy/gate/p08': 'GATE P-08 — THE CLASS CONSTRUCTOR',
  '/academy/gate/p09': 'GATE P-09 — THE ERROR HANDLER',
  '/academy/gate/p10': 'GATE P-10 — THE FILE SYSTEM',
  '/academy/gate/p11': 'GATE P-11 — THE DATA STRUCTURES FORGE',
  '/academy/gate/p12': 'GATE P-12 — THE ALGORITHM MIND',
  '/academy/gate/p13': 'GATE P-13 — THE MODULE NETWORK',
  '/academy/gate/p14': 'GATE P-14 — THE COMPLETE SYSTEM',
  '/academy/gate/p15': 'GATE P-15 — THE ROT DETECTOR',
  '/academy/gate/j01': 'GATE J-01 — THE DOM AWAKENS',
  '/academy/gate/j02': 'GATE J-02 — THE EVENT SYSTEM',
  '/academy/gate/j03': 'GATE J-03 — THE ASYNC SIGNAL',
  '/academy/gate/j04': 'GATE J-04 — THE STATE MACHINE',
  '/academy/gate/j05': 'GATE J-05 — THE MODULE SYSTEM',
  '/academy/gate/j06': 'GATE J-06 — THE ARRAY TOOLKIT',
  '/academy/gate/j07': 'GATE J-07 — THE COMPLETE INTERFACE',
  '/academy/gate/j08': 'GATE J-08 — THE PERFORMANCE LAYER',
  '/academy/gate/j09': 'GATE J-09 — THE REACT AWAKENING',
  '/academy/gate/j10': 'GATE J-10 — THE HOOK CIRCUIT',
  '/academy/signup':   'ACADEMY SIGN UP',
  '/academy/gate/p16': 'GATE P-16 — THE STRING FORGE',
  '/academy/gate/p17': 'GATE P-17 — THE COMPREHENSION ENGINE',
  '/academy/gate/p18': 'GATE P-18 — THE INHERITANCE TOWER',
  '/academy/gate/p19': 'GATE P-19 — THE GENERATOR NETWORK',
  '/academy/gate/p20': 'GATE P-20 — THE DECORATOR CHAMBER',
  '/academy/gate/p21': 'GATE P-21 — THE TEST PROTOCOL',
  '/academy/gate/p22': 'GATE P-22 — THE CONTEXT MANAGER',
  '/academy/gate/p23': 'GATE P-23 — THE TYPE SYSTEM',
  '/academy/gate/p24': 'GATE P-24 — THE ENVIRONMENT PROTOCOL',
  '/academy/gate/j11': 'GATE J-11 — THE SCOPE CHAMBER',
  '/academy/gate/j12': 'GATE J-12 — THE PROTOTYPE CHAIN',
  '/academy/gate/j13': 'GATE J-13 — THE EVENT LOOP DEPTHS',
  '/academy/gate/j14': 'GATE J-14 — THE REGEX FORGE',
  '/academy/gate/j15': 'GATE J-15 — THE ERROR ARCHITECTURE',
  '/academy/gate/j16': 'GATE J-16 — THE BROWSER API VAULT',
  '/academy/gate/j17': 'GATE J-17 — THE FORM DEPTHS',
  '/academy/gate/j18': 'GATE J-18 — THE TYPESCRIPT GATEWAY',
  '/academy/gate/j19': 'GATE J-19 — THE TESTING STATION',
  '/academy/gate/j20': 'GATE J-20 — THE BUILD SYSTEM',
  '/academy/gate/j21': 'GATE J-21 — THE REACT INTRODUCTION',
}

const Ctx = createContext(null)

export function NavigationProvider({ children }) {
  const navigate = useNavigate()
  const [nav, setNav] = useState({ loading: false, target: '', progress: 0 })

  const goto = useCallback((screen) => {
    const path = screen === 'landing' ? '/' : `/${screen}`

    setNav({ loading: true, target: SCREEN_NAMES[path] ?? screen.toUpperCase(), progress: 15 })

    const t1 = setTimeout(() => setNav(s => ({ ...s, progress: 45 })), 60)
    const t2 = setTimeout(() => setNav(s => ({ ...s, progress: 70 })), 180)

    setTimeout(() => {
      clearTimeout(t1)
      clearTimeout(t2)
      navigate(path)
      window.scrollTo({ top: 0, behavior: 'instant' })
      setNav(s => ({ ...s, progress: 100 }))
      setTimeout(() => setNav({ loading: false, target: '', progress: 0 }), 350)
    }, 380)
  }, [navigate])

  return (
    <Ctx.Provider value={{ goto, ...nav }}>
      {children}
    </Ctx.Provider>
  )
}

export const useNav = () => useContext(Ctx)

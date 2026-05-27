import { createContext, useContext, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

const SCREEN_NAMES = {
  '/': 'HOME',
  '/login': 'LOGIN',
  '/signup': 'ENLISTMENT',
  '/dashboard': 'PILOT HQ',
  '/quest': 'GATE 01 — THE DOCUMENT TOMB',
  '/quest2': 'GATE 02 — THE SEMANTIC CRYPT',
  '/quest3': 'GATE 03 — THE FORM GATE',
  '/quest4': 'GATE 04 — PAINT THE CITY',
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

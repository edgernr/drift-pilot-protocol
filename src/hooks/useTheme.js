import { useState, useEffect } from 'react'

export function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem('hp_theme') ?? 'dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('hp_theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')
  return { theme, toggleTheme }
}

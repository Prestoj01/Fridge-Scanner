import { useEffect, useState } from 'react'
import { resolvedTheme, storedTheme, switchTheme, type Theme } from '../lib/theme'

/** The current theme, kept in sync with the device until the user picks one. */
export function useTheme(): { theme: Theme; toggle: (origin?: { x: number; y: number }) => void } {
  const [theme, setThemeState] = useState<Theme>(resolvedTheme)

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      if (storedTheme() === null) setThemeState(query.matches ? 'dark' : 'light')
    }
    query.addEventListener('change', onChange)
    return () => {
      query.removeEventListener('change', onChange)
    }
  }, [])

  const toggle = (origin?: { x: number; y: number }) => {
    const next = theme === 'dark' ? 'light' : 'dark'
    switchTheme(next, origin)
    setThemeState(next)
  }

  return { theme, toggle }
}

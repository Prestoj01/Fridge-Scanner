import { useEffect, useState } from 'react'

export type View = 'flow' | 'saved' | 'list'

function viewFromHash(hash: string): View {
  if (hash === '#saved') return 'saved'
  if (hash === '#list') return 'list'
  return 'flow'
}

/**
 * Which page is showing, kept in the URL hash so the browser back button
 * and links like #saved work.
 */
export function useHashView(): { view: View; open: (view: View) => void } {
  const [view, setView] = useState<View>(() => viewFromHash(window.location.hash))

  useEffect(() => {
    const onChange = () => {
      setView(viewFromHash(window.location.hash))
    }
    window.addEventListener('hashchange', onChange)
    return () => {
      window.removeEventListener('hashchange', onChange)
    }
  }, [])

  const open = (next: View) => {
    if (next === 'flow') {
      // Drop the hash without leaving a "#" behind.
      history.pushState(null, '', window.location.pathname + window.location.search)
    } else {
      history.pushState(null, '', `#${next}`)
    }
    setView(next)
  }

  return { view, open }
}

import { isRecipeHash } from '../lib/shareLink'
import { useEffect, useState } from 'react'

export type View = 'flow' | 'saved' | 'list' | 'shared'

function viewFromHash(hash: string): View {
  if (hash === '#saved') return 'saved'
  if (hash === '#list') return 'list'
  if (isRecipeHash(hash)) return 'shared'
  return 'flow'
}

/**
 * Which page is showing, kept in the URL hash so the browser back button
 * and links like #saved work.
 */
export function useHashView(): { view: View; hash: string; open: (view: View) => void } {
  const [hash, setHash] = useState(() => window.location.hash)
  const view = viewFromHash(hash)

  useEffect(() => {
    const onChange = () => {
      setHash(window.location.hash)
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
      setHash('')
    } else {
      history.pushState(null, '', `#${next}`)
      setHash(`#${next}`)
    }
  }

  return { view, hash, open }
}

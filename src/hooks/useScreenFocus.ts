import { useEffect, useRef } from 'react'

// Set once the visitor has clicked, tapped, or pressed a key. Until then a
// screen is the first thing on the page and should not take focus.
let interacted = false
if (typeof document !== 'undefined') {
  const mark = () => {
    interacted = true
  }
  document.addEventListener('pointerdown', mark, { once: true, capture: true })
  document.addEventListener('keydown', mark, { once: true, capture: true })
}

/**
 * Moves focus to a screen's heading when the screen appears after a step or
 * page change. Screen readers announce the new screen, and keyboard users
 * continue from the top of it instead of from a button that no longer exists.
 */
export function useScreenFocus<T extends HTMLElement>(
  /** Focus again whenever this changes, for screens that swap their content. */
  key?: string,
) {
  const ref = useRef<T>(null)
  useEffect(() => {
    if (interacted) ref.current?.focus({ preventScroll: true })
  }, [key])
  return ref
}

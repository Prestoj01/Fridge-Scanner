import { AnimatePresence, m, useReducedMotion } from 'motion/react'
import type { Tone } from '../lib/status'

interface StatusLineProps {
  text: string
  /** Pulses the dot while working; colors it when done or on a problem. */
  tone: Tone
}

/** A small live kicker that says what the app is doing. */
export function StatusLine({ text, tone }: StatusLineProps) {
  const calm = useReducedMotion() ?? false
  return (
    <p className={`status-line status-line--${tone} kicker`} aria-hidden="true">
      <span className="status-line__dot" />
      <AnimatePresence mode="wait" initial={false}>
        <m.span
          key={text}
          initial={calm ? false : { opacity: 0, y: '0.6em' }}
          animate={{ opacity: 1, y: '0em' }}
          exit={calm ? { opacity: 0 } : { opacity: 0, y: '-0.6em' }}
          transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
        >
          {text}
        </m.span>
      </AnimatePresence>
    </p>
  )
}

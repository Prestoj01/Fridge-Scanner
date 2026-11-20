import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

interface StatusLineProps {
  text: string
  /** Pulses the dot while something is in progress. */
  busy: boolean
}

/** A small live kicker that says what the app is doing. */
export function StatusLine({ text, busy }: StatusLineProps) {
  const calm = useReducedMotion() ?? false
  return (
    <p className={`status-line kicker${busy ? ' status-line--busy' : ''}`} aria-hidden="true">
      <span className="status-line__dot" />
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={text}
          initial={calm ? false : { opacity: 0, y: '0.6em' }}
          animate={{ opacity: 1, y: '0em' }}
          exit={calm ? { opacity: 0 } : { opacity: 0, y: '-0.6em' }}
          transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
        >
          {text}
        </motion.span>
      </AnimatePresence>
    </p>
  )
}

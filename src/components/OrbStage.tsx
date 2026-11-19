import { AnimatePresence, motion } from 'motion/react'
import type { OrbMood } from '../lib/orb'
import { Orb } from './Orb'

interface OrbStageProps {
  mood: OrbMood
  caption: string
  /** Hero on the first screen, compact beside the headline afterwards. */
  size: 'hero' | 'compact'
}

const glide = { type: 'spring', stiffness: 120, damping: 20, mass: 0.9 } as const

/** Holds the orb and its handwritten caption, and glides between sizes. */
export function OrbStage({ mood, caption, size }: OrbStageProps) {
  return (
    <motion.div layout className={`orb-stage orb-stage--${size}`} transition={glide}>
      <motion.div layout className="orb-stage__orb" transition={glide}>
        <Orb mood={mood} />
      </motion.div>
      <motion.div layout="position" className="orb-stage__caption" transition={glide}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={caption}
            className="hand"
            aria-hidden="true"
            initial={{ opacity: 0, y: 8, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -6, filter: 'blur(6px)' }}
            transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
          >
            {caption}
          </motion.p>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

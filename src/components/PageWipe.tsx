import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { STEPS, stepIndex } from '../lib/steps'
import type { StepId } from '../types'

const COLORS: Record<StepId, string> = {
  upload: 'var(--tomato)',
  review: 'var(--sunshine)',
  recipes: 'var(--cobalt)',
}

/**
 * A full-screen color panel that sweeps across when the step changes,
 * like turning a magazine page. Decorative and click-through.
 */
export function PageWipe({ step }: { step: StepId }) {
  const calm = useReducedMotion() ?? false
  if (calm) return null
  return (
    <AnimatePresence initial={false}>
      <motion.div
        key={step}
        className="page-wipe"
        style={{ background: COLORS[step] }}
        initial={{ clipPath: 'inset(0 100% 0 0)' }}
        animate={{ clipPath: ['inset(0 100% 0 0)', 'inset(0 0% 0 0)', 'inset(0 0 0 100%)'] }}
        transition={{ duration: 1, times: [0, 0.45, 1], ease: [0.65, 0, 0.35, 1] }}
      >
        <span className="page-wipe__number">{String(stepIndex(step) + 1).padStart(2, '0')}</span>
        <span className="page-wipe__label">{STEPS[stepIndex(step)]?.label}</span>
      </motion.div>
    </AnimatePresence>
  )
}

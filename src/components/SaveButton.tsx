import { Heart } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { useSaved } from '../lib/savedContext'
import type { Recipe } from '../types'

/** A heart that saves a recipe, with a little pop when it fills. */
export function SaveButton({ recipe }: { recipe: Recipe }) {
  const { isSaved, toggle } = useSaved()
  const calm = useReducedMotion() ?? false
  const saved = isSaved(recipe)
  return (
    <motion.button
      type="button"
      className={`save-button${saved ? ' save-button--on' : ''}`}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${recipe.title} from saved` : `Save ${recipe.title}`}
      onClick={() => {
        toggle(recipe)
      }}
      whileTap={calm ? {} : { scale: 0.85 }}
    >
      <motion.span
        key={saved ? 'on' : 'off'}
        initial={calm || !saved ? false : { scale: 0.4, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 12 }}
      >
        <Heart
          size={22}
          strokeWidth={2.2}
          fill={saved ? 'currentColor' : 'none'}
          aria-hidden="true"
        />
      </motion.span>
      <span className="save-button__label">{saved ? 'Saved' : 'Save'}</span>
    </motion.button>
  )
}

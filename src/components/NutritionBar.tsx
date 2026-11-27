import { motion, useReducedMotion } from 'motion/react'
import type { Nutrition } from '../types'

const MACROS = [
  { key: 'protein', label: 'Protein', kcalPerGram: 4 },
  { key: 'carbs', label: 'Carbs', kcalPerGram: 4 },
  { key: 'fat', label: 'Fat', kcalPerGram: 9 },
] as const

/** Protein, carbs, and fat as shares of the calories, with grams below. */
export function NutritionBar({ nutrition }: { nutrition: Nutrition }) {
  const calm = useReducedMotion() ?? false
  const energy = MACROS.map((macro) => nutrition[macro.key] * macro.kcalPerGram)
  const total = energy.reduce((sum, value) => sum + value, 0) || 1

  return (
    <figure className="macros">
      <div className="macros__bar" aria-hidden="true">
        {MACROS.map((macro, index) => (
          <motion.span
            key={macro.key}
            className={`macros__segment macros__segment--${macro.key}`}
            style={{ flexGrow: energy[index] ?? 0, originX: 0 }}
            initial={calm ? false : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 + index * 0.12, ease: [0.2, 0.8, 0.2, 1] }}
          />
        ))}
      </div>
      <figcaption className="macros__legend">
        {MACROS.map((macro, index) => (
          <span key={macro.key} className="tabular">
            <span className={`macros__dot macros__segment--${macro.key}`} aria-hidden="true" />
            {macro.label} {nutrition[macro.key]}g
            <span className="visually-hidden">
              {' '}
              ({Math.round(((energy[index] ?? 0) / total) * 100)}% of calories)
            </span>
          </span>
        ))}
        <span className="macros__note">Estimated, per serving</span>
      </figcaption>
    </figure>
  )
}

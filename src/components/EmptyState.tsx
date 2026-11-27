import { m, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'
import type { FoodKind } from '../lib/foodKind'
import { Food } from './food/Food'

interface EmptyStateProps {
  /** A food illustration that wobbles gently, inviting action. */
  food: FoodKind
  title: string
  description: string
  /** Optional call to action, e.g. a button. */
  children?: ReactNode
}

export function EmptyState({ food, title, description, children }: EmptyStateProps) {
  const calm = useReducedMotion() ?? false
  return (
    <div className="empty-state">
      <m.div
        className="empty-state__art"
        animate={calm ? { rotate: -6 } : { rotate: [-10, 8, -10], y: [0, -6, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Food kind={food} size={88} />
      </m.div>
      <h3 className="empty-state__title">{title}</h3>
      <p className="empty-state__description">{description}</p>
      {children}
    </div>
  )
}

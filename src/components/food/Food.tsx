import { useId, type ReactNode } from 'react'
import type { FoodKind } from '../../lib/foodKind'
import { FOOD_ART } from './art'

interface FoodProps {
  kind: FoodKind
  /** Rendered size in px (the art is drawn on a 120×120 grid). */
  size?: number
  /** Hide the soft ground shadow, e.g. when foods overlap. */
  shadow?: boolean
  className?: string
}

/** Shared gradients: a specular highlight and a soft ground shadow. */
function CommonDefs({ id }: { id: string }) {
  return (
    <>
      <radialGradient id={`${id}-shine`}>
        <stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#fff" stopOpacity="0" />
      </radialGradient>
      <radialGradient id={`${id}-shadow`}>
        <stop offset="0%" stopColor="#000" stopOpacity="0.32" />
        <stop offset="100%" stopColor="#000" stopOpacity="0" />
      </radialGradient>
    </>
  )
}

/**
 * A glossy, 3D-style food illustration drawn in SVG: shaded volume, a
 * specular highlight, and a soft shadow. Decorative.
 */
export function Food({ kind, size = 64, shadow = true, className }: FoodProps): ReactNode {
  const id = `f${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const art = FOOD_ART[kind]
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={className === undefined ? 'food' : `food ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <CommonDefs id={id} />
        {art.defs(id)}
      </defs>
      {shadow && <ellipse cx={60} cy={110} rx={36} ry={6} fill={`url(#${id}-shadow)`} />}
      {art.body(id)}
    </svg>
  )
}

import { foodKind } from '../lib/foodKind'
import { Food } from './food/Food'

interface TickerProps {
  /** Ingredient names to show. Staples are shown when the list is empty. */
  names: readonly string[]
}

const STAPLES = [
  'eggs',
  'tomatoes',
  'spinach',
  'avocado',
  'lemon',
  'broccoli',
  'cheese',
  'rice',
  'carrots',
  'salmon',
]

/** A magazine-style band that scrolls ingredients across the page. Decorative. */
export function Ticker({ names }: TickerProps) {
  const items = names.length > 0 ? names : STAPLES
  // Repeat until the strip is long enough to loop seamlessly on wide screens.
  const repeats = Math.max(2, Math.ceil(12 / items.length) * 2)
  const strip = Array.from({ length: repeats }, () => items).flat()
  // Keep the speed constant regardless of how many items there are.
  const duration = `${String(strip.length * 2.2)}s`

  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker__track" style={{ animationDuration: duration }}>
        {strip.map((name, index) => (
          <span key={index} className="ticker__item">
            <Food kind={foodKind(name)} size={28} shadow={false} />
            {name}
            <span className="ticker__star">✶</span>
          </span>
        ))}
      </div>
    </div>
  )
}

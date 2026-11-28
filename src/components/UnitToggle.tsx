import { setUnits, useUnits } from '../hooks/useUnits'
import type { UnitSystem } from '../lib/units'

const OPTIONS: readonly { value: UnitSystem; label: string }[] = [
  { value: 'us', label: 'US' },
  { value: 'metric', label: 'Metric' },
]

/** Switches every recipe between cups and ounces and grams and milliliters. */
export function UnitToggle() {
  const units = useUnits()
  return (
    <div className="unit-toggle" role="group" aria-label="Units">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={units === option.value}
          onClick={() => {
            setUnits(option.value)
          }}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

import { ChevronDown } from 'lucide-react'
import { STAPLE_OPTIONS, type Staple } from '../lib/staples'
import { Icon } from './Icon'

interface StaplesPickerProps {
  staples: readonly Staple[]
  onChange: (staples: Staple[]) => void
}

const label = (staple: string) => staple.charAt(0).toUpperCase() + staple.slice(1)

/** "Always in your kitchen": staples that count as available for every recipe. */
export function StaplesPicker({ staples, onChange }: StaplesPickerProps) {
  const toggle = (staple: Staple) => {
    onChange(
      staples.includes(staple)
        ? staples.filter((item) => item !== staple)
        : STAPLE_OPTIONS.filter((item) => item === staple || staples.includes(item)),
    )
  }

  return (
    <details className="staples">
      <summary>
        <span>
          Always in your kitchen
          <span className="staples__count tabular"> ({staples.length})</span>
        </span>
        <Icon icon={ChevronDown} className="staples__chevron" />
      </summary>
      <fieldset className="toggles">
        <legend className="staples__hint">
          Tick what you always have. Recipes count these as on hand and never list them as missing.
        </legend>
        <div className="toggles__options">
          {STAPLE_OPTIONS.map((staple) => (
            <label key={staple} className="toggle">
              <input
                type="checkbox"
                checked={staples.includes(staple)}
                onChange={() => {
                  toggle(staple)
                }}
              />
              <span>{label(staple)}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </details>
  )
}

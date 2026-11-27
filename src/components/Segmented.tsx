import { motion } from 'motion/react'

interface SegmentedProps<T extends string | number> {
  legend: string
  name: string
  options: readonly { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
}

/** A row of radio buttons with a thumb that slides to the chosen one. */
export function Segmented<T extends string | number>({
  legend,
  name,
  options,
  value,
  onChange,
}: SegmentedProps<T>) {
  return (
    <fieldset className="segmented">
      <legend>{legend}</legend>
      <div
        className="segmented__options"
        style={{ gridTemplateColumns: `repeat(${String(options.length)}, 1fr)` }}
      >
        {options.map((option) => (
          <label key={String(option.value)} className="segmented__option">
            {value === option.value && (
              <motion.span
                layoutId={`${name}-thumb`}
                className="segmented__thumb"
                transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              />
            )}
            <input
              type="radio"
              name={name}
              value={String(option.value)}
              checked={value === option.value}
              className="visually-hidden"
              onChange={() => {
                onChange(option.value)
              }}
            />
            <span className="segmented__label">{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

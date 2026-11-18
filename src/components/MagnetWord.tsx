import type { CSSProperties } from 'react'
import { MAGNET_COLORS, tilt } from '../lib/fun'

interface MagnetWordProps {
  text: string
  /** Offsets the color cycle so neighbouring words do not start on the same color. */
  offset?: number
}

/** Renders a word as alphabet fridge magnets: one colored, tilted block per letter. */
export function MagnetWord({ text, offset = 0 }: MagnetWordProps) {
  return (
    <span className="magnet-word" aria-label={text} role="img">
      {Array.from({ length: text.length }, (_, index) => text.charAt(index)).map(
        (letter, index) => (
          <span
            key={index}
            aria-hidden="true"
            className={`magnet-letter magnet--${MAGNET_COLORS[(index + offset) % MAGNET_COLORS.length] ?? 'cherry'}`}
            style={
              { '--tilt': `${String(tilt(`${text}${String(index)}`, 9))}deg` } as CSSProperties
            }
          >
            {letter}
          </span>
        ),
      )}
    </span>
  )
}

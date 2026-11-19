import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useMemo } from 'react'
import { blobLoop } from '../lib/blob'
import type { OrbMood } from '../lib/orb'

interface AmbientProps {
  mood: OrbMood
}

interface Field {
  color: string
  className: string
  seed: number
  /** How far it drifts, in px. */
  drift: number
  /** Seconds per drift loop. */
  duration: number
  /** Scroll parallax strength. */
  depth: number
}

const FIELDS: readonly Field[] = [
  {
    color: 'var(--sage)',
    className: 'ambient__field--sage',
    seed: 5,
    drift: 60,
    duration: 26,
    depth: 0.25,
  },
  {
    color: 'var(--peach)',
    className: 'ambient__field--peach',
    seed: 9,
    drift: 80,
    duration: 32,
    depth: 0.45,
  },
  {
    color: 'var(--butter)',
    className: 'ambient__field--butter',
    seed: 2,
    drift: 50,
    duration: 22,
    depth: 0.15,
  },
]

/** How strongly each field glows for a mood: [sage, peach, butter]. */
const EMPHASIS: Record<OrbMood, readonly [number, number, number]> = {
  idle: [1, 1, 1],
  hungry: [1, 1.1, 1],
  excited: [1, 1.15, 1.15],
  scanning: [0.9, 1.35, 1],
  thinking: [1.1, 1.1, 1.2],
  happy: [1, 1.15, 1.45],
  sad: [0.85, 0.8, 0.8],
}

function AmbientField({ field, emphasis }: { field: Field; emphasis: number }) {
  const reduceMotion = useReducedMotion() ?? false
  const shapes = useMemo(() => blobLoop(80, 14, field.seed), [field.seed])
  const { scrollY } = useScroll()
  const parallax = useTransform(scrollY, (value) => value * -field.depth)
  const d = field.drift

  return (
    <motion.div className={`ambient__field ${field.className}`} style={{ y: parallax }}>
      <motion.div
        animate={
          reduceMotion
            ? { scale: emphasis }
            : { x: [0, d, -d * 0.6, 0], y: [0, -d * 0.7, d * 0.5, 0], scale: emphasis }
        }
        transition={{
          x: { duration: field.duration, repeat: Infinity, ease: 'easeInOut' },
          y: { duration: field.duration * 1.2, repeat: Infinity, ease: 'easeInOut' },
          scale: { duration: 2.4, ease: [0.65, 0, 0.35, 1] },
        }}
      >
        <svg viewBox="0 0 200 200" width="100%" height="100%" aria-hidden="true">
          <motion.path
            fill={field.color}
            initial={false}
            animate={
              reduceMotion
                ? { d: shapes[0] ?? '' }
                : {
                    d: shapes,
                    transition: {
                      duration: field.duration * 0.6,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    },
                  }
            }
          />
        </svg>
      </motion.div>
    </motion.div>
  )
}

/**
 * Soft color fields drifting behind the page, with a faint paper grain.
 * They shift with scroll and respond to the orb's mood.
 */
export function Ambient({ mood }: AmbientProps) {
  const emphasis = EMPHASIS[mood]
  return (
    <div className={`ambient ambient--${mood}`} aria-hidden="true">
      {FIELDS.map((field, index) => (
        <AmbientField key={field.className} field={field} emphasis={emphasis[index] ?? 1} />
      ))}
      <div className="ambient__grain" />
    </div>
  )
}

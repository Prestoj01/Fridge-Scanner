import { motion, useReducedMotion } from 'motion/react'
import { useMemo } from 'react'
import { hashString, MAGNET_COLORS } from '../lib/fun'

interface ConfettiProps {
  /** Seeds the burst so it is stable across re-renders. Change it to fire again. */
  seed: string
  pieces?: number
}

function unit(seed: string): number {
  return (hashString(seed) % 10_000) / 10_000
}

/** A one-shot burst of magnet-colored confetti from the top of the page. */
export function Confetti({ seed, pieces = 48 }: ConfettiProps) {
  const reduceMotion = useReducedMotion() ?? false

  const bits = useMemo(
    () =>
      Array.from({ length: pieces }, (_, index) => {
        const r = (salt: string) => unit(`${seed}:${String(index)}:${salt}`)
        const angle = (r('angle') - 0.5) * Math.PI * 1.1
        const power = 140 + r('power') * 260
        return {
          color: MAGNET_COLORS[index % MAGNET_COLORS.length] ?? 'cherry',
          x: Math.sin(angle) * power,
          peak: -Math.cos(angle) * power * 0.9,
          fall: 380 + r('fall') * 320,
          spin: (r('spin') - 0.5) * 1080,
          size: 7 + r('size') * 9,
          round: r('round') > 0.6,
          duration: 1.4 + r('duration') * 0.9,
        }
      }),
    [seed, pieces],
  )

  if (reduceMotion) return null

  return (
    <div className="confetti" aria-hidden="true">
      {bits.map((bit, index) => (
        <motion.span
          key={index}
          className={`confetti__piece magnet--${bit.color}`}
          style={{
            width: bit.size,
            height: bit.round ? bit.size : bit.size * 0.55,
            borderRadius: bit.round ? '50%' : 2,
          }}
          initial={{ x: 0, y: 0, rotate: 0, opacity: 1, scale: 0.4 }}
          animate={{
            x: [0, bit.x * 0.8, bit.x],
            y: [0, bit.peak, bit.fall],
            rotate: bit.spin,
            opacity: [1, 1, 0],
            scale: 1,
          }}
          transition={{ duration: bit.duration, ease: 'easeOut', times: [0, 0.3, 1] }}
        />
      ))}
    </div>
  )
}

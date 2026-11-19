import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import { useEffect, useId, useMemo, useRef } from 'react'
import { blobLoop } from '../lib/blob'
import type { OrbMood } from '../lib/orb'

interface OrbProps {
  mood: OrbMood
}

interface MoodStyle {
  /** Seconds for one full morph loop. */
  morph: number
  /** Seconds for one breath. */
  breathe: number
  wobble: number
  scale: number
  /** 0 = closed, 1 = full bloom. */
  bloom: number
}

const MOODS: Record<OrbMood, MoodStyle> = {
  idle: { morph: 10, breathe: 4.5, wobble: 6, scale: 1, bloom: 0 },
  hungry: { morph: 7, breathe: 2.6, wobble: 9, scale: 1, bloom: 0 },
  excited: { morph: 5, breathe: 2.2, wobble: 10, scale: 1.03, bloom: 0.45 },
  scanning: { morph: 2.4, breathe: 1.3, wobble: 14, scale: 0.98, bloom: 0 },
  thinking: { morph: 4.2, breathe: 2.8, wobble: 9, scale: 0.95, bloom: 0 },
  happy: { morph: 6.5, breathe: 3.2, wobble: 8, scale: 1.04, bloom: 1 },
  sad: { morph: 14, breathe: 5.5, wobble: 3, scale: 0.8, bloom: 0 },
}

const PETALS = 8
const PETAL_FILLS = ['var(--peach)', 'var(--sage)', 'var(--butter)', 'var(--sage)'] as const

/**
 * The app's living centerpiece: a soft, morphing orb that breathes, ripples
 * while scanning, swirls while cooking, blooms on success, and wilts on
 * errors. Decorative; the page text carries every state.
 */
export function Orb({ mood }: OrbProps) {
  const id = useId().replace(/:/g, '')
  const reduceMotion = useReducedMotion() ?? false
  const style = MOODS[mood]
  const wrapRef = useRef<HTMLDivElement>(null)

  const outer = useMemo(() => blobLoop(62, style.wobble, 3), [style.wobble])
  const inner = useMemo(() => blobLoop(40, style.wobble * 0.8, 11), [style.wobble])

  // Lean gently toward the pointer.
  const leanX = useMotionValue(0)
  const leanY = useMotionValue(0)
  const x = useSpring(leanX, { stiffness: 60, damping: 14 })
  const y = useSpring(leanY, { stiffness: 60, damping: 14 })

  useEffect(() => {
    if (reduceMotion) return
    const follow = (event: PointerEvent) => {
      const box = wrapRef.current?.getBoundingClientRect()
      if (!box) return
      const dx = event.clientX - (box.left + box.width / 2)
      const dy = event.clientY - (box.top + box.height / 2)
      const distance = Math.hypot(dx, dy) || 1
      const pull = Math.min(distance / 300, 1) * (box.width * 0.06)
      leanX.set((dx / distance) * pull)
      leanY.set((dy / distance) * pull)
    }
    window.addEventListener('pointermove', follow)
    return () => {
      window.removeEventListener('pointermove', follow)
    }
  }, [leanX, leanY, reduceMotion])

  const morph = (shapes: string[], duration: number) =>
    reduceMotion
      ? { d: shapes[0] ?? '' }
      : { d: shapes, transition: { duration, repeat: Infinity, ease: 'easeInOut' as const } }

  return (
    <motion.div ref={wrapRef} className={`orb orb--${mood}`} style={{ x, y }} aria-hidden="true">
      <motion.div
        className="orb__breath"
        animate={
          reduceMotion
            ? { scale: style.scale }
            : { scale: [style.scale, style.scale * 1.045, style.scale] }
        }
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: style.breathe, repeat: Infinity, ease: 'easeInOut' }
        }
      >
        <svg viewBox="0 0 200 200" className="orb__svg">
          <defs>
            <radialGradient id={`${id}-fill`} cx="38%" cy="32%" r="78%">
              <stop offset="0%" stopColor="#fff6dc" />
              <stop offset="38%" stopColor="var(--butter)" />
              <stop offset="74%" stopColor="var(--peach)" />
              <stop offset="100%" stopColor="#d9876a" />
            </radialGradient>
            <radialGradient id={`${id}-leaf`} cx="60%" cy="65%" r="70%">
              <stop offset="0%" stopColor="#cfe0c2" />
              <stop offset="100%" stopColor="var(--sage)" />
            </radialGradient>
            <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="16" />
            </filter>
          </defs>

          {/* Ripples while waiting for or reading photos */}
          <g className="orb__ripples">
            {[0, 1, 2].map((i) => (
              <circle
                key={i}
                cx={100}
                cy={100}
                r={64}
                style={{ animationDelay: `${String(i * 0.6)}s` }}
              />
            ))}
          </g>

          {/* Petals unfurl on success */}
          <g>
            {Array.from({ length: PETALS }, (_, i) => (
              <g key={i} transform={`translate(100 100) rotate(${String((360 / PETALS) * i)})`}>
                <motion.ellipse
                  cx={0}
                  fill={PETAL_FILLS[i % PETAL_FILLS.length]}
                  opacity={0.85}
                  initial={false}
                  animate={{
                    cy: -58 - 24 * style.bloom,
                    rx: 12 * style.bloom,
                    ry: 26 * style.bloom,
                  }}
                  transition={
                    style.bloom > 0
                      ? { type: 'spring', stiffness: 120, damping: 14, delay: 0.15 + i * 0.05 }
                      : // Closing uses a plain ease: a spring would overshoot below zero.
                        { duration: 0.35, ease: 'easeIn' }
                  }
                />
              </g>
            ))}
          </g>

          <g filter={`url(#${id}-glow)`} opacity={0.6}>
            <motion.path fill="var(--peach)" initial={false} animate={morph(outer, style.morph)} />
          </g>

          <g className="orb__spin">
            <circle cx={100} cy={100} r={96} fill="none" />
            <motion.path
              fill={`url(#${id}-fill)`}
              initial={false}
              animate={morph(outer, style.morph)}
            />
            <motion.path
              fill={`url(#${id}-leaf)`}
              opacity={0.55}
              initial={false}
              animate={morph(inner, style.morph * 1.3)}
              style={{ x: 14, y: 16 }}
            />
            <ellipse
              cx={78}
              cy={70}
              rx={20}
              ry={12}
              fill="#fff"
              opacity={0.4}
              transform="rotate(-25 78 70)"
            />
          </g>

          {/* Seeds orbit while cooking */}
          <g className="orb__orbit">
            <circle cx={100} cy={100} r={92} fill="none" />
            <circle cx={100} cy={10} r={6} fill="var(--sage)" />
            <circle cx={178} cy={145} r={5} fill="var(--butter)" />
            <circle cx={22} cy={145} r={4.5} fill="var(--peach)" />
          </g>
        </svg>
      </motion.div>
    </motion.div>
  )
}

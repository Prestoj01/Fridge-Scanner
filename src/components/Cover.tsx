import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react'
import { useEffect, useRef } from 'react'
import type { FoodKind } from '../lib/foodKind'
import { Food } from './food/Food'

interface CoverProps {
  /** Busy covers spin their foods faster, e.g. while photos are read. */
  busy?: boolean
}

interface Placement {
  kind: FoodKind
  /** Center position in % of the cover. */
  x: number
  y: number
  size: number
  rotate: number
  /** 0.3 (far) to 1 (near): how far it follows the pointer. */
  depth: number
  bob: number
}

const PLACEMENTS: readonly Placement[] = [
  { kind: 'broccoli', x: 18, y: 30, size: 92, rotate: -12, depth: 0.5, bob: 4.2 },
  { kind: 'tomato', x: 50, y: 52, size: 140, rotate: 6, depth: 1, bob: 3.6 },
  { kind: 'egg', x: 82, y: 28, size: 84, rotate: 18, depth: 0.6, bob: 4.8 },
  { kind: 'avocado', x: 74, y: 62, size: 100, rotate: -16, depth: 0.85, bob: 3.9 },
  { kind: 'lemon', x: 22, y: 76, size: 90, rotate: 10, depth: 0.7, bob: 4.4 },
  { kind: 'carrot', x: 46, y: 16, size: 70, rotate: 24, depth: 0.35, bob: 5.2 },
  { kind: 'cheese', x: 62, y: 88, size: 64, rotate: -8, depth: 0.4, bob: 5.6 },
]

function FloatingFood({
  placement,
  index,
  pointerX,
  pointerY,
  busy,
  calm,
}: {
  placement: Placement
  index: number
  pointerX: MotionValue<number>
  pointerY: MotionValue<number>
  busy: boolean
  calm: boolean
}) {
  const x = useTransform(pointerX, (value) => value * 28 * placement.depth)
  const y = useTransform(pointerY, (value) => value * 20 * placement.depth)
  const sway = busy ? 360 : 8

  return (
    <motion.div
      className="cover__food"
      style={{
        left: `${String(placement.x)}%`,
        top: `${String(placement.y)}%`,
        width: `calc(${String(placement.size)}px * var(--cover-scale))`,
        height: `calc(${String(placement.size)}px * var(--cover-scale))`,
        x,
        y,
        zIndex: Math.round(placement.depth * 10),
      }}
      initial={calm ? false : { opacity: 0, scale: 0.4, rotate: placement.rotate - 40 }}
      animate={{ opacity: 1, scale: 1, rotate: placement.rotate }}
      transition={{ type: 'spring', stiffness: 180, damping: 14, delay: 0.15 + index * 0.08 }}
    >
      <motion.div
        animate={
          calm
            ? {}
            : busy
              ? { rotate: [0, sway], y: [0, -14, 0] }
              : { y: [0, -12, 0], rotate: [0, sway, 0] }
        }
        transition={{
          duration: busy ? 1.4 + index * 0.15 : placement.bob,
          repeat: Infinity,
          ease: busy ? 'linear' : 'easeInOut',
        }}
        whileHover={{ scale: 1.18, rotate: [0, -12, 10, 0], transition: { duration: 0.5 } }}
      >
        <Food kind={placement.kind} size={placement.size} className="cover__art" />
      </motion.div>
    </motion.div>
  )
}

/**
 * The magazine cover: a bold color block with glossy foods floating at
 * different depths. They bob, follow the pointer, and wiggle on hover.
 */
export function Cover({ busy = false }: CoverProps) {
  const calm = useReducedMotion() ?? false
  const ref = useRef<HTMLDivElement>(null)
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const pointerX = useSpring(rawX, { stiffness: 80, damping: 16 })
  const pointerY = useSpring(rawY, { stiffness: 80, damping: 16 })

  useEffect(() => {
    if (calm) return
    const move = (event: PointerEvent) => {
      const box = ref.current?.getBoundingClientRect()
      if (!box) return
      rawX.set(Math.max(-1, Math.min(1, ((event.clientX - box.left) / box.width) * 2 - 1)))
      rawY.set(Math.max(-1, Math.min(1, ((event.clientY - box.top) / box.height) * 2 - 1)))
    }
    window.addEventListener('pointermove', move)
    return () => {
      window.removeEventListener('pointermove', move)
    }
  }, [calm, rawX, rawY])

  return (
    <div ref={ref} className="cover" aria-hidden="true">
      <span className="cover__kicker kicker">Fridge to table</span>
      <motion.span
        className="cover__sticker"
        animate={calm ? { rotate: -8 } : { rotate: [-12, -4, -12] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span>
          100%
          <br />
          your
          <br />
          fridge
        </span>
      </motion.span>
      {PLACEMENTS.map((placement, index) => (
        <FloatingFood
          key={placement.kind}
          placement={placement}
          index={index}
          pointerX={pointerX}
          pointerY={pointerY}
          busy={busy}
          calm={calm}
        />
      ))}
    </div>
  )
}

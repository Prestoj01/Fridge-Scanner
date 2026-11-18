import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react'
import { useEffect, type ReactElement } from 'react'

/* Hand-drawn food, each on a 64×64 grid with the same 3px outline. */
const LINE = {
  stroke: '#2b1d16',
  strokeWidth: 3,
  strokeLinejoin: 'round' as const,
  strokeLinecap: 'round' as const,
}

const DOODLES = {
  egg: (
    <g {...LINE}>
      <path
        d="M14 30 C10 16 30 8 40 14 C54 12 58 30 50 40 C46 52 26 56 18 46 C10 42 10 36 14 30 Z"
        fill="#fffdf6"
      />
      <circle cx={34} cy={32} r={9} fill="#ffcf4a" />
    </g>
  ),
  tomato: (
    <g {...LINE}>
      <circle cx={32} cy={36} r={20} fill="#e2412f" />
      <path
        d="M32 18 L26 12 M32 18 L38 12 M32 18 L24 20 M32 18 L40 20 M32 18 V10"
        stroke="#2f8f5b"
        strokeWidth={4}
      />
    </g>
  ),
  carrot: (
    <g {...LINE}>
      <path d="M40 18 L14 54 L48 26 Z" fill="#ff8a3d" />
      <path d="M42 20 L50 8 M44 22 L58 16 M40 18 L40 6" stroke="#2f8f5b" strokeWidth={4} />
      <path d="M26 40 L30 42 M32 32 L36 34" />
    </g>
  ),
  lemon: (
    <g {...LINE}>
      <circle cx={32} cy={32} r={22} fill="#ffcf4a" />
      <circle cx={32} cy={32} r={16} fill="#fff1a8" />
      <path
        d="M32 16 V48 M16 32 H48 M21 21 L43 43 M43 21 L21 43"
        stroke="#e8b730"
        strokeWidth={2.5}
      />
    </g>
  ),
  peas: (
    <g {...LINE}>
      <path d="M8 36 C16 20 48 20 56 30 C48 44 18 46 8 36 Z" fill="#57c79a" />
      <circle cx={22} cy={33} r={5} fill="#8fe0b8" />
      <circle cx={32} cy={32} r={5} fill="#8fe0b8" />
      <circle cx={42} cy={31} r={5} fill="#8fe0b8" />
    </g>
  ),
  cheese: (
    <g {...LINE}>
      <path d="M8 44 L54 22 L56 46 Z" fill="#ffcf4a" />
      <circle cx={40} cy={38} r={3.5} fill="#e8b730" strokeWidth={2} />
      <circle cx={28} cy={42} r={2.5} fill="#e8b730" strokeWidth={2} />
    </g>
  ),
  broccoli: (
    <g {...LINE}>
      <path d="M28 40 L26 56 H38 L36 40 Z" fill="#9fdc7c" />
      <path
        d="M14 34 C8 26 16 16 24 20 C26 10 40 10 42 20 C52 16 58 28 50 34 C48 42 18 44 14 34 Z"
        fill="#3fa564"
      />
    </g>
  ),
  avocado: (
    <g {...LINE}>
      <path
        d="M32 6 C44 6 50 30 50 40 C50 52 42 58 32 58 C22 58 14 52 14 40 C14 30 20 6 32 6 Z"
        fill="#3f7d3a"
      />
      <path
        d="M32 14 C40 14 44 32 44 40 C44 48 38 52 32 52 C26 52 20 48 20 40 C20 32 24 14 32 14 Z"
        fill="#cfe89a"
        strokeWidth={2}
      />
      <circle cx={32} cy={40} r={7} fill="#8a5a3c" />
    </g>
  ),
  strawberry: (
    <g {...LINE}>
      <path d="M12 24 C12 16 52 16 52 24 C52 40 40 56 32 58 C24 56 12 40 12 24 Z" fill="#e2412f" />
      <path d="M20 18 L32 10 L44 18 L32 22 Z" fill="#2f8f5b" />
      <g fill="#ffe08a" stroke="none">
        <circle cx={24} cy={30} r={1.8} />
        <circle cx={36} cy={28} r={1.8} />
        <circle cx={30} cy={38} r={1.8} />
        <circle cx={40} cy={38} r={1.8} />
        <circle cx={26} cy={44} r={1.8} />
        <circle cx={34} cy={48} r={1.8} />
      </g>
    </g>
  ),
  mushroom: (
    <g {...LINE}>
      <path d="M26 34 L24 54 H40 L38 34 Z" fill="#fff4dc" />
      <path d="M8 34 C8 14 56 14 56 34 Z" fill="#c8653d" />
      <circle cx={22} cy={26} r={3} fill="#fff4dc" strokeWidth={2} />
      <circle cx={38} cy={22} r={3.5} fill="#fff4dc" strokeWidth={2} />
    </g>
  ),
} satisfies Record<string, ReactElement>

type DoodleKind = keyof typeof DOODLES

interface Placement {
  kind: DoodleKind
  top: number
  left: number
  size: number
  /** 0.2 (far) to 1 (near): how strongly it reacts to pointer and scroll. */
  depth: number
  rotate: number
  duration: number
}

const PLACEMENTS: readonly Placement[] = [
  { kind: 'tomato', top: 4, left: 78, size: 54, depth: 0.6, rotate: -12, duration: 6.5 },
  { kind: 'egg', top: 13, left: 3, size: 60, depth: 0.9, rotate: 10, duration: 7.2 },
  { kind: 'carrot', top: 30, left: 88, size: 58, depth: 0.5, rotate: 20, duration: 8.1 },
  { kind: 'lemon', top: 44, left: 1, size: 50, depth: 0.35, rotate: 0, duration: 9.4 },
  { kind: 'peas', top: 58, left: 86, size: 62, depth: 0.8, rotate: -18, duration: 6.9 },
  { kind: 'broccoli', top: 72, left: 5, size: 58, depth: 0.55, rotate: 8, duration: 7.7 },
  { kind: 'cheese', top: 86, left: 82, size: 54, depth: 0.4, rotate: -6, duration: 8.8 },
  { kind: 'avocado', top: 92, left: 12, size: 52, depth: 0.7, rotate: 14, duration: 7.4 },
  { kind: 'strawberry', top: 22, left: 18, size: 40, depth: 0.25, rotate: -10, duration: 9.9 },
  { kind: 'mushroom', top: 52, left: 70, size: 42, depth: 0.25, rotate: 6, duration: 10.6 },
  { kind: 'lemon', top: 6, left: 40, size: 34, depth: 0.2, rotate: 30, duration: 11.2 },
  { kind: 'egg', top: 78, left: 60, size: 36, depth: 0.2, rotate: -24, duration: 10.1 },
]

function Doodle({
  placement,
  pointerX,
  pointerY,
  scrollY,
}: {
  placement: Placement
  pointerX: MotionValue<number>
  pointerY: MotionValue<number>
  scrollY: MotionValue<number>
}) {
  const { depth } = placement
  const x = useTransform(pointerX, (value) => value * 26 * depth)
  const y = useTransform(
    [pointerY, scrollY],
    ([py = 0, sy = 0]: number[]) => py * 26 * depth - sy * depth * 0.35,
  )

  return (
    <motion.div
      className="doodle"
      style={{
        top: `${String(placement.top)}%`,
        left: `${String(placement.left)}%`,
        width: `calc(${String(placement.size)}px * var(--doodle-scale))`,
        height: `calc(${String(placement.size)}px * var(--doodle-scale))`,
        x,
        y,
        opacity: 0.35 + depth * 0.45,
      }}
    >
      <motion.svg
        viewBox="0 0 64 64"
        width="100%"
        height="100%"
        initial={{ rotate: placement.rotate }}
        animate={{
          y: [0, -14, 0],
          rotate: [placement.rotate, placement.rotate + 10, placement.rotate],
        }}
        transition={{ duration: placement.duration, repeat: Infinity, ease: 'easeInOut' }}
      >
        {DOODLES[placement.kind]}
      </motion.svg>
    </motion.div>
  )
}

/**
 * Food doodles drifting behind the page. They float on their own and shift
 * with the pointer and scroll at different depths for a parallax effect.
 */
export function FoodDoodles() {
  const reduceMotion = useReducedMotion() ?? false
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const pointerX = useSpring(rawX, { stiffness: 60, damping: 18 })
  const pointerY = useSpring(rawY, { stiffness: 60, damping: 18 })
  const { scrollY } = useScroll()

  useEffect(() => {
    if (reduceMotion) return
    const move = (event: PointerEvent) => {
      rawX.set((event.clientX / window.innerWidth) * 2 - 1)
      rawY.set((event.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', move)
    return () => {
      window.removeEventListener('pointermove', move)
    }
  }, [rawX, rawY, reduceMotion])

  return (
    <div className="doodles" aria-hidden="true">
      {PLACEMENTS.map((placement, index) => (
        <Doodle
          key={index}
          placement={placement}
          pointerX={pointerX}
          pointerY={pointerY}
          scrollY={scrollY}
        />
      ))}
    </div>
  )
}

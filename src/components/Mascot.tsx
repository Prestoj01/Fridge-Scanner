import {
  AnimatePresence,
  motion,
  useAnimate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  type TargetAndTransition,
  type Transition,
} from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { POKE_LINES, type Mood } from '../lib/mascot'

interface MascotProps {
  mood: Mood
  line: string
}

const LOOPS: Record<Mood, { animate: TargetAndTransition; transition: Transition }> = {
  idle: {
    animate: { y: [0, -3, 0], scaleY: [1, 1.015, 1] },
    transition: { duration: 2.6, repeat: Infinity, ease: 'easeInOut' },
  },
  hungry: {
    animate: { rotate: [-3, 3, -3], y: [0, -4, 0] },
    transition: { duration: 1.1, repeat: Infinity, ease: 'easeInOut' },
  },
  excited: {
    animate: { y: [0, -18, 0, -8, 0], rotate: [0, -6, 6, -2, 0] },
    transition: { duration: 0.9, repeat: Infinity, repeatDelay: 0.5, ease: 'easeOut' },
  },
  scanning: {
    animate: { x: [-5, 5, -5], rotate: [-4, 4, -4] },
    transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' },
  },
  thinking: {
    animate: { rotate: [0, -5, 0, 3, 0], y: [0, -2, 0] },
    transition: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' },
  },
  happy: {
    animate: { y: [0, -10, 0] },
    transition: { duration: 0.5, repeat: Infinity, repeatDelay: 0.9, ease: 'easeOut' },
  },
  sad: {
    animate: { y: 5, rotate: -5, scaleY: 0.95 },
    transition: { type: 'spring', stiffness: 120, damping: 12 },
  },
}

/** Where the pupils rest for moods that do not follow the pointer. */
const GAZE: Partial<Record<Mood, { x: number; y: number }>> = {
  thinking: { x: 2.5, y: -3.5 },
  sad: { x: 0, y: 3 },
}

const MAX_PUPIL_OFFSET = 4

function Mouth({ mood }: { mood: Mood }) {
  const stroke = {
    fill: 'none',
    stroke: 'var(--mascot-line)',
    strokeWidth: 4,
    strokeLinecap: 'round' as const,
  }
  switch (mood) {
    case 'happy':
    case 'excited':
      return (
        <g>
          <path
            d={mood === 'excited' ? 'M44 99 Q58 122 72 99 Z' : 'M47 100 Q58 116 69 100 Z'}
            fill="var(--mascot-line)"
            stroke="var(--mascot-line)"
            strokeWidth={3}
            strokeLinejoin="round"
          />
          <ellipse cx={58} cy={mood === 'excited' ? 110 : 107} rx={6} ry={3.5} fill="#ff8fa0" />
        </g>
      )
    case 'hungry':
      return <ellipse cx={58} cy={106} rx={7} ry={8.5} fill="var(--mascot-line)" />
    case 'scanning':
      return <ellipse cx={58} cy={106} rx={4} ry={3} fill="var(--mascot-line)" />
    case 'thinking':
      return <path d="M50 105 Q54 101 58 105 T66 105" {...stroke} />
    case 'sad':
      return <path d="M49 109 Q58 100 67 109" {...stroke} />
    case 'idle':
      return <path d="M49 102 Q58 111 67 102" {...stroke} />
  }
}

/**
 * Chilly, the living fridge. Purely decorative: every state it shows is also
 * in the page text. Its eyes follow the pointer and it reacts when poked.
 */
export function Mascot({ mood, line }: MascotProps) {
  const reduceMotion = useReducedMotion() ?? false
  const svgRef = useRef<SVGSVGElement>(null)
  const [scope, animate] = useAnimate<HTMLButtonElement>()
  const [poke, setPoke] = useState<{ count: number; line: string } | null>(null)
  const pokeCount = useRef(0)

  const gazeX = useMotionValue(0)
  const gazeY = useMotionValue(0)
  const pupilX = useSpring(gazeX, { stiffness: 260, damping: 18 })
  const pupilY = useSpring(gazeY, { stiffness: 260, damping: 18 })
  const fixedGaze = GAZE[mood]

  useEffect(() => {
    if (fixedGaze) {
      gazeX.set(fixedGaze.x)
      gazeY.set(fixedGaze.y)
      return
    }
    if (reduceMotion || mood === 'scanning') {
      gazeX.set(0)
      gazeY.set(0)
      return
    }
    const follow = (event: PointerEvent) => {
      const svg = svgRef.current
      if (!svg) return
      const box = svg.getBoundingClientRect()
      const dx = event.clientX - (box.left + box.width * 0.48)
      const dy = event.clientY - (box.top + box.height * 0.52)
      const distance = Math.hypot(dx, dy) || 1
      const reach = Math.min(distance / 60, 1) * MAX_PUPIL_OFFSET
      gazeX.set((dx / distance) * reach)
      gazeY.set((dy / distance) * reach)
    }
    window.addEventListener('pointermove', follow)
    return () => {
      window.removeEventListener('pointermove', follow)
    }
  }, [fixedGaze, gazeX, gazeY, mood, reduceMotion])

  // Clear the poke reply after a moment.
  useEffect(() => {
    if (!poke) return
    const id = window.setTimeout(() => {
      setPoke(null)
    }, 2200)
    return () => {
      window.clearTimeout(id)
    }
  }, [poke])

  const handlePoke = () => {
    const count = pokeCount.current++
    setPoke({ count, line: POKE_LINES[count % POKE_LINES.length] ?? POKE_LINES[0] })
    if (!reduceMotion) {
      void animate(
        scope.current,
        { rotate: [0, -14, 11, -7, 4, 0], scale: [1, 1.08, 1] },
        { duration: 0.6 },
      )
    }
  }

  const doorOpen = mood === 'hungry' || mood === 'excited'
  const happyEyes = mood === 'happy' || mood === 'excited'
  const shownLine = poke?.line ?? line
  const loop = LOOPS[mood]

  return (
    <div className="mascot">
      <AnimatePresence mode="wait" initial={false}>
        <motion.p
          key={shownLine}
          className="mascot__bubble"
          aria-hidden="true"
          initial={{ opacity: 0, scale: 0.6, y: 10, rotate: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -6 }}
          transition={{ type: 'spring', stiffness: 420, damping: 22 }}
        >
          {shownLine}
        </motion.p>
      </AnimatePresence>

      <button
        ref={scope}
        type="button"
        className={`mascot__button mascot--${mood}`}
        aria-label="Poke Chilly the fridge"
        onClick={handlePoke}
      >
        <motion.div className="mascot__body" animate={loop.animate} transition={loop.transition}>
          <svg ref={svgRef} viewBox="0 0 120 160" width="112" height="150" aria-hidden="true">
            <ellipse cx={60} cy={154} rx={42} ry={5} fill="rgb(0 0 0 / 18%)" />
            <rect x={26} y={136} width={16} height={13} rx={4} fill="var(--mascot-line)" />
            <rect x={78} y={136} width={16} height={13} rx={4} fill="var(--mascot-line)" />

            {/* Freezer interior, revealed when the door swings open */}
            <rect x={16} y={10} width={88} height={40} rx={16} fill="#fff4b8" />
            <rect x={26} y={30} width={12} height={12} rx={3} fill="#bfe9ff" />
            <rect x={42} y={34} width={10} height={8} rx={3} fill="#bfe9ff" />
            <path d="M18 44 H102" stroke="#e6cf62" strokeWidth={3} />

            {/* Fridge body */}
            <path
              d="M14 52 H106 V118 A22 22 0 0 1 84 140 H36 A22 22 0 0 1 14 118 Z"
              fill="var(--mascot-body)"
              stroke="var(--mascot-line)"
              strokeWidth={4}
              strokeLinejoin="round"
            />
            <rect
              x={89}
              y={62}
              width={7}
              height={30}
              rx={3.5}
              fill="#f2f4f5"
              stroke="var(--mascot-line)"
              strokeWidth={2.5}
            />
            <rect x={22} y={60} width={6} height={30} rx={3} fill="rgb(255 255 255 / 30%)" />

            {/* Freezer door */}
            <motion.g
              animate={{ scaleX: doorOpen ? -0.2 : 1 }}
              transition={{ type: 'spring', stiffness: 170, damping: 14 }}
              style={{ originX: 0, originY: 0.5 }}
            >
              <path
                d="M36 8 H84 A22 22 0 0 1 106 30 V52 H14 V30 A22 22 0 0 1 36 8 Z"
                fill="var(--mascot-body)"
                stroke="var(--mascot-line)"
                strokeWidth={4}
                strokeLinejoin="round"
              />
              <rect
                x={89}
                y={22}
                width={7}
                height={20}
                rx={3.5}
                fill="#f2f4f5"
                stroke="var(--mascot-line)"
                strokeWidth={2.5}
              />
              <rect x={22} y={16} width={6} height={20} rx={3} fill="rgb(255 255 255 / 30%)" />
            </motion.g>

            {/* Face */}
            <ellipse cx={33} cy={99} rx={6} ry={3.5} fill="#ffb3c0" opacity={0.8} />
            <ellipse cx={83} cy={99} rx={6} ry={3.5} fill="#ffb3c0" opacity={0.8} />

            {happyEyes ? (
              <g fill="none" stroke="var(--mascot-line)" strokeWidth={4.5} strokeLinecap="round">
                <path d="M36 86 Q44 75 52 86" />
                <path d="M64 86 Q72 75 80 86" />
              </g>
            ) : (
              <g className="mascot__eyes">
                {[44, 72].map((cx) => (
                  <g key={cx}>
                    <ellipse
                      cx={cx}
                      cy={83}
                      rx={10}
                      ry={11.5}
                      fill="#fff"
                      stroke="var(--mascot-line)"
                      strokeWidth={3}
                    />
                    <motion.g style={{ x: pupilX, y: pupilY }}>
                      <g className="mascot__pupil">
                        <circle cx={cx} cy={84} r={5.2} fill="var(--mascot-line)" />
                        <circle cx={cx - 1.8} cy={82} r={1.7} fill="#fff" />
                      </g>
                    </motion.g>
                  </g>
                ))}
              </g>
            )}

            {mood === 'sad' && (
              <g stroke="var(--mascot-line)" strokeWidth={3.5} strokeLinecap="round">
                <path d="M35 69 L51 73" />
                <path d="M81 69 L65 73" />
              </g>
            )}
            {mood === 'thinking' && (
              <path
                d="M64 68 Q72 63 80 68"
                fill="none"
                stroke="var(--mascot-line)"
                strokeWidth={3.5}
                strokeLinecap="round"
              />
            )}

            <Mouth mood={mood} />
          </svg>
        </motion.div>
      </button>
    </div>
  )
}

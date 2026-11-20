import { motion, useReducedMotion } from 'motion/react'
import { foodKind, type FoodKind } from '../lib/foodKind'
import { Food } from './food/Food'

interface MixingBowlProps {
  /** Ingredient names; their foods drop into the bowl in turn. */
  names: readonly string[]
}

const FALLBACK: readonly FoodKind[] = ['tomato', 'egg', 'leaf', 'lemon']
const DROP_SECONDS = 1.1

/** Foods tumble one by one into a wobbling mixing bowl while recipes cook. */
export function MixingBowl({ names }: MixingBowlProps) {
  const calm = useReducedMotion() ?? false
  const kinds = [...new Set(names.map(foodKind))].filter((kind) => kind !== 'jar').slice(0, 6)
  const foods = kinds.length > 0 ? kinds : FALLBACK
  const cycle = foods.length * DROP_SECONDS

  return (
    <div className="mixing-bowl" aria-hidden="true">
      {foods.map((kind, index) => (
        <motion.div
          key={kind}
          className="mixing-bowl__food"
          initial={{ y: -150, opacity: 0, rotate: -40 }}
          animate={
            calm
              ? { y: -10, opacity: 1, rotate: 0, x: (index - (foods.length - 1) / 2) * 26 }
              : { y: [-150, 30], opacity: [0, 1, 1, 0], rotate: [-40, 200] }
          }
          transition={
            calm
              ? { duration: 0 }
              : {
                  duration: DROP_SECONDS,
                  delay: index * DROP_SECONDS,
                  repeat: Infinity,
                  repeatDelay: cycle - DROP_SECONDS,
                  ease: [0.55, 0, 0.9, 0.4],
                  opacity: {
                    duration: DROP_SECONDS,
                    times: [0, 0.15, 0.8, 1],
                    delay: index * DROP_SECONDS,
                    repeat: Infinity,
                    repeatDelay: cycle - DROP_SECONDS,
                  },
                }
          }
        >
          <Food kind={kind} size={64} shadow={false} />
        </motion.div>
      ))}
      <motion.svg
        viewBox="0 0 200 110"
        className="mixing-bowl__bowl"
        animate={calm ? { rotate: 0 } : { rotate: [-2, 2, -2], y: [0, 3, 0] }}
        transition={{ duration: DROP_SECONDS, repeat: Infinity, ease: 'easeInOut' }}
      >
        <defs>
          <linearGradient id="bowl-body" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6a82ff" />
            <stop offset="60%" stopColor="#2f4bff" />
            <stop offset="100%" stopColor="#1a2fb8" />
          </linearGradient>
        </defs>
        <ellipse cx={100} cy={22} rx={92} ry={14} fill="#1a2fb8" />
        <path
          d="M8 22 L192 22 C188 72 150 104 100 104 C50 104 12 72 8 22 Z"
          fill="url(#bowl-body)"
        />
        <ellipse cx={100} cy={22} rx={92} ry={14} fill="none" stroke="#8fa0ff" strokeWidth={4} />
        <path
          d="M30 40 C36 64 52 82 70 90"
          stroke="#fff"
          strokeOpacity="0.45"
          strokeWidth={8}
          strokeLinecap="round"
          fill="none"
        />
      </motion.svg>
    </div>
  )
}

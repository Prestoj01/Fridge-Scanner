import { Pause, Play, RotateCcw, Timer } from 'lucide-react'
import { m, useReducedMotion } from 'motion/react'
import type { StepTimers } from '../hooks/useStepTimers'
import { formatClock, type StepTimer as Found } from '../lib/timers'
import { Icon } from './Icon'

interface StepTimerProps {
  step: number
  found: Found
  timers: StepTimers
}

/** The countdown for one cooking step: start, pause, reset, and a ring that empties. */
export function StepTimer({ step, found, timers }: StepTimerProps) {
  const calm = useReducedMotion() ?? false
  const timer = timers.timers.get(step)
  const left = timers.secondsLeft(step)

  if (!timer || left === null) {
    return (
      <button
        type="button"
        className="timer-start"
        onClick={() => {
          timers.start(step, found.seconds)
        }}
      >
        <Icon icon={Timer} size={24} />
        Start {found.label} timer
      </button>
    )
  }

  const running = timer.endsAt !== null
  const progress = timer.total > 0 ? left / timer.total : 0
  const radius = 52
  const circumference = 2 * Math.PI * radius

  return (
    <div className={`timer${timer.done ? ' timer--done' : ''}`} role="timer" aria-live="off">
      <m.div
        className="timer__dial"
        animate={timer.done && !calm ? { scale: [1, 1.06, 1] } : { scale: 1 }}
        transition={timer.done ? { duration: 0.6, repeat: Infinity } : { duration: 0.2 }}
      >
        <svg viewBox="0 0 120 120" aria-hidden="true">
          <circle cx={60} cy={60} r={radius} className="timer__track" />
          <circle
            cx={60}
            cy={60}
            r={radius}
            className="timer__ring"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
          />
        </svg>
        <span className="timer__clock tabular">{timer.done ? 'Done!' : formatClock(left)}</span>
      </m.div>
      <p className="visually-hidden" aria-live="assertive">
        {timer.done ? `Time is up for step ${String(step + 1)}.` : ''}
      </p>
      <div className="timer__controls">
        {!timer.done &&
          (running ? (
            <button
              type="button"
              onClick={() => {
                timers.pause(step)
              }}
            >
              <Icon icon={Pause} size={20} />
              Pause
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                timers.start(step, found.seconds)
              }}
            >
              <Icon icon={Play} size={20} />
              Resume
            </button>
          ))}
        <button
          type="button"
          onClick={() => {
            timers.reset(step)
          }}
        >
          <Icon icon={RotateCcw} size={20} />
          {timer.done ? 'Clear' : 'Reset'}
        </button>
      </div>
    </div>
  )
}

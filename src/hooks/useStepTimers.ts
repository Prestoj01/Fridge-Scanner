import { useEffect, useRef, useState } from 'react'
import { playChime } from '../lib/chime'

export interface TimerState {
  total: number
  /** Seconds left when last paused or started. */
  remaining: number
  /** When it will reach zero, in ms since epoch; null while paused. */
  endsAt: number | null
  done: boolean
}

export interface StepTimers {
  timers: ReadonlyMap<number, TimerState>
  /** Seconds left right now for a step's timer. */
  secondsLeft: (step: number) => number | null
  start: (step: number, seconds: number) => void
  pause: (step: number) => void
  reset: (step: number) => void
}

/** Independent countdowns per recipe step that keep running across steps. */
export function useStepTimers(): StepTimers {
  const [timers, setTimers] = useState<ReadonlyMap<number, TimerState>>(new Map())
  const [now, setNow] = useState(() => Date.now())
  const running = [...timers.values()].some((timer) => timer.endsAt !== null)
  const latest = useRef(timers)
  // Finish events already handled, keyed by step and end time, so a timer
  // chimes once even if several ticks run before the next render.
  const handled = useRef(new Set<string>())

  useEffect(() => {
    latest.current = timers
  }, [timers])

  // While any timer runs, tick four times a second and finish any that ran out.
  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => {
      const tick = Date.now()
      setNow(tick)
      const finished = [...latest.current.entries()].filter(
        ([step, timer]) =>
          timer.endsAt !== null &&
          timer.endsAt <= tick &&
          !handled.current.has(`${String(step)}:${String(timer.endsAt)}`),
      )
      if (finished.length === 0) return
      for (const [step, timer] of finished) {
        handled.current.add(`${String(step)}:${String(timer.endsAt)}`)
      }
      setTimers((current) => {
        const next = new Map(current)
        for (const [step, timer] of finished) {
          next.set(step, { ...timer, remaining: 0, endsAt: null, done: true })
        }
        return next
      })
      playChime()
    }, 250)
    return () => {
      window.clearInterval(id)
    }
  }, [running])

  const update = (step: number, change: (timer: TimerState | undefined) => TimerState | null) => {
    setTimers((current) => {
      const next = new Map(current)
      const value = change(current.get(step))
      if (value === null) next.delete(step)
      else next.set(step, value)
      return next
    })
  }

  return {
    timers,
    secondsLeft: (step) => {
      const timer = timers.get(step)
      if (!timer) return null
      return timer.endsAt === null ? timer.remaining : Math.max(0, (timer.endsAt - now) / 1000)
    },
    start: (step, seconds) => {
      const startedAt = Date.now()
      setNow(startedAt)
      update(step, (timer) => {
        const remaining = timer && !timer.done ? timer.remaining : seconds
        return { total: seconds, remaining, endsAt: startedAt + remaining * 1000, done: false }
      })
    },
    pause: (step) => {
      const pausedAt = Date.now()
      update(step, (timer) =>
        timer && timer.endsAt !== null
          ? { ...timer, remaining: Math.max(0, (timer.endsAt - pausedAt) / 1000), endsAt: null }
          : (timer ?? null),
      )
    },
    reset: (step) => {
      update(step, () => null)
    },
  }
}

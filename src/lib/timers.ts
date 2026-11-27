/**
 * Finds a cooking time in a recipe step, e.g. "Simmer for 25 to 30
 * minutes" -> 25 minutes. Ranges use the lower bound, since it is the
 * first moment worth checking.
 */

export interface StepTimer {
  seconds: number
  /** Human label for the button, e.g. "25 min". */
  label: string
}

const UNIT_SECONDS: Record<string, number> = {
  second: 1,
  sec: 1,
  minute: 60,
  min: 60,
  hour: 3600,
  hr: 3600,
}

const PATTERN =
  /(\d+(?:\.\d+)?)(?:\s*(?:to|-|–|or)\s*\d+(?:\.\d+)?)?\s*(seconds?|secs?|minutes?|mins?|hours?|hrs?)\b/i

export function formatDuration(seconds: number): string {
  if (seconds >= 3600) {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.round((seconds % 3600) / 60)
    return minutes > 0 ? `${String(hours)} hr ${String(minutes)} min` : `${String(hours)} hr`
  }
  if (seconds >= 60) return `${String(Math.round(seconds / 60))} min`
  return `${String(seconds)} sec`
}

export function findTimer(step: string): StepTimer | null {
  const match = PATTERN.exec(step)
  if (!match) return null
  const amount = Number(match[1])
  const unit = (match[2] ?? '').toLowerCase().replace(/s$/, '')
  const perUnit = UNIT_SECONDS[unit]
  if (perUnit === undefined || !Number.isFinite(amount) || amount <= 0) return null
  const seconds = Math.round(amount * perUnit)
  if (seconds > 6 * 3600) return null
  return { seconds, label: formatDuration(seconds) }
}

/** "4:05" style clock for a countdown. */
export function formatClock(seconds: number): string {
  const safe = Math.max(0, Math.ceil(seconds))
  const hours = Math.floor(safe / 3600)
  const minutes = Math.floor((safe % 3600) / 60)
  const rest = String(safe % 60).padStart(2, '0')
  return hours > 0
    ? `${String(hours)}:${String(minutes).padStart(2, '0')}:${rest}`
    : `${String(minutes)}:${rest}`
}

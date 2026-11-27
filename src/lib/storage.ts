/**
 * Small, failure-tolerant wrappers around localStorage. Storage can be
 * unavailable (private mode, disabled) or hold stale or hand-edited data,
 * so every read is validated and every write may silently do nothing.
 */

const PREFIX = 'fridge-scanner:'

export function readStored<T>(key: string, parse: (value: unknown) => T | null): T | null {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (raw === null) return null
    return parse(JSON.parse(raw) as unknown)
  } catch {
    return null
  }
}

export function writeStored(key: string, value: unknown): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    // Full or unavailable storage: the app keeps working without it.
  }
}

export function removeStored(key: string): void {
  try {
    localStorage.removeItem(PREFIX + key)
  } catch {
    // Nothing to do.
  }
}

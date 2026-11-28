import { useSyncExternalStore } from 'react'
import { readStored, writeStored } from '../lib/storage'
import type { UnitSystem } from '../lib/units'

const KEY = 'units'
const listeners = new Set<() => void>()

/** The US, Liberia, and Myanmar cook in cups and ounces; everyone else in metric. */
function localDefault(): UnitSystem {
  const language = typeof navigator === 'undefined' ? 'en-US' : navigator.language
  return /-(US|LR|MM)$/i.test(language) ? 'us' : 'metric'
}

const parse = (value: unknown): UnitSystem | null =>
  value === 'us' || value === 'metric' ? value : null

let current: UnitSystem | null = null

function read(): UnitSystem {
  current ??= readStored(KEY, parse) ?? localDefault()
  return current
}

export function setUnits(system: UnitSystem): void {
  current = system
  writeStored(KEY, system)
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** The unit system for recipe amounts, shared by every card and cooking mode. */
export function useUnits(): UnitSystem {
  return useSyncExternalStore(subscribe, read, read)
}

/** For tests: forget the cached choice so storage is read again. */
export function resetUnits(): void {
  current = null
}

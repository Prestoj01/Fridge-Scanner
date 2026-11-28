import { DEFAULT_PREFERENCES, type Ingredient, type Preferences } from '../types'
import { readStored, removeStored, writeStored } from './storage'
import { isRecord, parsePreferences } from './validate'

const KEY = 'pantry'

export interface Pantry {
  ingredients: Ingredient[]
  preferences: Preferences
}

function parsePantry(value: unknown): Pantry | null {
  if (!isRecord(value) || !Array.isArray(value.ingredients)) return null
  const ingredients = value.ingredients.flatMap((item): Ingredient[] => {
    if (!isRecord(item) || typeof item.id !== 'string' || typeof item.name !== 'string') return []
    const name = item.name.trim().slice(0, 60)
    if (name === '') return []
    return [
      {
        id: item.id,
        name,
        source: item.source === 'detected' ? 'detected' : 'manual',
        ...(item.useSoon === true ? { useSoon: true } : {}),
      },
    ]
  })
  // Older saves stored only a diet at the top level.
  const preferences = parsePreferences(
    isRecord(value.preferences) ? value.preferences : { diet: value.diet },
  )
  return { ingredients: ingredients.slice(0, 60), preferences }
}

/** The ingredient list and diet from the last visit, if any. */
export function loadPantry(): Pantry {
  return (
    readStored(KEY, parsePantry) ?? { ingredients: [], preferences: { ...DEFAULT_PREFERENCES } }
  )
}

export function savePantry(pantry: Pantry): void {
  const defaults = JSON.stringify(DEFAULT_PREFERENCES) === JSON.stringify(pantry.preferences)
  if (pantry.ingredients.length === 0 && defaults) removeStored(KEY)
  else writeStored(KEY, pantry)
}

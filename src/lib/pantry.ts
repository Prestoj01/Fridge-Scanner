import type { Diet, Ingredient } from '../types'
import { readStored, removeStored, writeStored } from './storage'
import { isRecord, parseDiet } from './validate'

const KEY = 'pantry'

export interface Pantry {
  ingredients: Ingredient[]
  diet: Diet
}

function parsePantry(value: unknown): Pantry | null {
  if (!isRecord(value) || !Array.isArray(value.ingredients)) return null
  const ingredients = value.ingredients.flatMap((item): Ingredient[] => {
    if (!isRecord(item) || typeof item.id !== 'string' || typeof item.name !== 'string') return []
    const name = item.name.trim().slice(0, 60)
    if (name === '') return []
    return [{ id: item.id, name, source: item.source === 'detected' ? 'detected' : 'manual' }]
  })
  return { ingredients: ingredients.slice(0, 60), diet: parseDiet(value.diet) }
}

/** The ingredient list and diet from the last visit, if any. */
export function loadPantry(): Pantry {
  return readStored(KEY, parsePantry) ?? { ingredients: [], diet: 'any' }
}

export function savePantry(pantry: Pantry): void {
  if (pantry.ingredients.length === 0 && pantry.diet === 'any') removeStored(KEY)
  else writeStored(KEY, pantry)
}

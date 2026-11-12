import type { Ingredient } from '../types'

/** Trims, collapses inner whitespace, and lowercases an ingredient name. */
export function normalizeIngredientName(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ').toLowerCase()
}

/**
 * Returns a new list with the ingredient added, or the same list if the name
 * is blank or already present.
 */
export function addIngredient(list: readonly Ingredient[], rawName: string): readonly Ingredient[] {
  const name = normalizeIngredientName(rawName)
  if (name === '' || list.some((item) => item.name === name)) return list
  return [...list, { id: crypto.randomUUID(), name }]
}

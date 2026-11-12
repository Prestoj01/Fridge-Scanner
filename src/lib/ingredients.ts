import type { Ingredient } from '../types'

/** Trims, collapses inner whitespace, and lowercases an ingredient name. */
export function normalizeIngredientName(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ').toLowerCase()
}

/**
 * Returns a new list with the ingredients added, skipping blanks and names
 * already present. Returns the same list if nothing was added.
 */
export function addIngredients(
  list: readonly Ingredient[],
  rawNames: readonly string[],
  source: Ingredient['source'],
): readonly Ingredient[] {
  const known = new Set(list.map((item) => item.name))
  const added: Ingredient[] = []
  for (const rawName of rawNames) {
    const name = normalizeIngredientName(rawName)
    if (name === '' || known.has(name)) continue
    known.add(name)
    added.push({ id: crypto.randomUUID(), name, source })
  }
  return added.length === 0 ? list : [...list, ...added]
}

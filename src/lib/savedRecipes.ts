import type { Recipe } from '../types'
import { readStored, writeStored } from './storage'
import { isRecord, parseRecipe } from './validate'

const KEY = 'saved-recipes'
export const MAX_SAVED = 50

/** Recipes get new ids each time they are generated, so match saved ones by title. */
export function recipeKey(recipe: Pick<Recipe, 'title'>): string {
  return recipe.title.trim().toLowerCase().replace(/\s+/g, ' ')
}

function parseSaved(value: unknown): Recipe[] | null {
  if (!Array.isArray(value)) return null
  return value
    .flatMap((item): Recipe[] => {
      const content = parseRecipe(item)
      if (!content || !isRecord(item) || typeof item.id !== 'string') return []
      return [{ ...content, id: item.id, source: item.source === 'ai' ? 'ai' : 'library' }]
    })
    .slice(0, MAX_SAVED)
}

export function loadSavedRecipes(): Recipe[] {
  return readStored(KEY, parseSaved) ?? []
}

export function storeSavedRecipes(recipes: readonly Recipe[]): void {
  writeStored(KEY, recipes.slice(0, MAX_SAVED))
}

/** Adds the recipe to the front, or removes it if it is already saved. */
export function toggleSaved(list: readonly Recipe[], recipe: Recipe): Recipe[] {
  const key = recipeKey(recipe)
  if (list.some((item) => recipeKey(item) === key)) {
    return list.filter((item) => recipeKey(item) !== key)
  }
  return [recipe, ...list].slice(0, MAX_SAVED)
}

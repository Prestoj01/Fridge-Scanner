import type { Recipe } from '../types'
import { foodKind, type FoodKind } from './foodKind'

/** Up to three distinct foods that represent a recipe, for its illustration. */
export function recipeFoods(recipe: Pick<Recipe, 'usedIngredients' | 'ingredients'>): FoodKind[] {
  const names = recipe.usedIngredients.length > 0 ? recipe.usedIngredients : recipe.ingredients
  const kinds: FoodKind[] = []
  for (const name of names) {
    const kind = foodKind(name)
    if (kind !== 'jar' && !kinds.includes(kind)) kinds.push(kind)
    if (kinds.length === 3) break
  }
  return kinds.length > 0 ? kinds : ['jar']
}

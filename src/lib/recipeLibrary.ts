import { LIBRARY, type LibraryRecipe } from '../data/recipes'
import type { Diet, RecipeContent } from '../types'

const MAX_SUGGESTIONS = 6

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * True if the ingredient name contains the term as a whole word, allowing a
 * plural ending. "cherry tomatoes" matches "tomato"; "eggplant" does not
 * match "egg".
 */
export function matchesTerm(ingredientName: string, term: string): boolean {
  return new RegExp(`\\b${escapeRegExp(term)}(?:e?s)?\\b`, 'i').test(ingredientName)
}

function fitsDiet(recipe: LibraryRecipe, diet: Diet): boolean {
  if (diet === 'vegan') return recipe.vegan
  if (diet === 'vegetarian') return recipe.vegetarian
  return true
}

/**
 * Suggests recipes from the built-in library, best match first. A recipe
 * qualifies when the user has at least half of its core ingredients.
 */
export function suggestFromLibrary(
  ingredientNames: readonly string[],
  diet: Diet,
): RecipeContent[] {
  const scored = LIBRARY.filter((recipe) => fitsDiet(recipe, diet)).map((recipe) => {
    const used = new Set<string>()
    const missing: string[] = []
    let matched = 0

    for (const core of recipe.core) {
      const hits = ingredientNames.filter((name) =>
        core.match.some((term) => matchesTerm(name, term)),
      )
      if (hits.length === 0) {
        missing.push(core.name)
      } else {
        matched += 1
        for (const hit of hits) used.add(hit)
      }
    }

    return { recipe, used: [...used], missing, score: matched / recipe.core.length }
  })

  return scored
    .filter((entry) => entry.score >= 0.5)
    .sort((a, b) => b.score - a.score || a.missing.length - b.missing.length)
    .slice(0, MAX_SUGGESTIONS)
    .map(({ recipe, used, missing }) => ({
      title: recipe.title,
      summary: recipe.summary,
      timeMinutes: recipe.timeMinutes,
      servings: recipe.servings,
      ingredients: [...recipe.ingredients],
      usedIngredients: used,
      missingIngredients: missing,
      steps: [...recipe.steps],
      healthNote: recipe.healthNote,
    }))
}

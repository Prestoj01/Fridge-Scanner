import { LIBRARY, type LibraryRecipe } from '../data/recipes'
import type { Diet, Preferences, RecipeContent } from '../types'
import { fitsGoal } from './goals'
import { scaleLine } from './scale'

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
  preferences: Preferences,
  /** Titles already shown, to skip when asking for something different. */
  exclude: readonly string[] = [],
  /** Share of a recipe's core ingredients the user must have. */
  minScore = 0.5,
  /** Ingredients to use up first; recipes that use more of them rank higher. */
  useSoon: readonly string[] = [],
): RecipeContent[] {
  const urgent = new Set(useSoon.map((name) => name.toLowerCase()))
  const skip = new Set(exclude.map((title) => title.trim().toLowerCase()))
  const eligible = LIBRARY.filter(
    (recipe) =>
      fitsDiet(recipe, preferences.diet) &&
      fitsGoal(recipe.nutrition, preferences.goal) &&
      (preferences.maxMinutes === null || recipe.timeMinutes <= preferences.maxMinutes) &&
      !recipe.allergens.some((allergen) => preferences.avoid.includes(allergen)) &&
      !skip.has(recipe.title.toLowerCase()),
  )
  const scored = eligible.map((recipe) => {
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

    return {
      recipe,
      used: [...used],
      missing,
      score: matched / recipe.core.length,
      usesUp: [...used].filter((name) => urgent.has(name.toLowerCase())).length,
      // A chosen cuisine ranks first among equally good matches.
      cuisineMatch: preferences.cuisine !== 'any' && recipe.cuisine === preferences.cuisine,
    }
  })

  return scored
    .filter((entry) => entry.score >= minScore)
    .sort(
      (a, b) =>
        b.usesUp - a.usesUp ||
        Number(b.cuisineMatch) - Number(a.cuisineMatch) ||
        b.score - a.score ||
        a.missing.length - b.missing.length,
    )
    .slice(0, MAX_SUGGESTIONS)
    .map(({ recipe, used, missing }) => ({
      title: recipe.title,
      summary: recipe.summary,
      timeMinutes: recipe.timeMinutes,
      servings: preferences.servings,
      ingredients: recipe.ingredients.map((line) =>
        scaleLine(line, preferences.servings / recipe.servings),
      ),
      usedIngredients: used,
      missingIngredients: missing,
      steps: [...recipe.steps],
      healthNote: recipe.healthNote,
      nutrition: { ...recipe.nutrition },
    }))
}

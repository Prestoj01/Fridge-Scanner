import { describe, expect, it } from 'vitest'
import type { RecipeContent } from '../types'
import { isRecipeHash, recipeFromHash, recipeHash } from './shareLink'

const recipe: RecipeContent = {
  title: 'Crème fraîche omelette — très bon',
  summary: 'Unicode survives: ½ cup, 200°C, ✓',
  timeMinutes: 12,
  servings: 2,
  ingredients: ['4 eggs', '½ cup crème fraîche'],
  usedIngredients: ['eggs'],
  missingIngredients: ['crème fraîche'],
  steps: ['Whisk.', 'Cook for 3 minutes.'],
  healthNote: 'Protein-rich.',
  nutrition: { calories: 320, protein: 18, carbs: 3, fat: 26 },
}

describe('share links', () => {
  it('round-trips a recipe through the URL hash, including unicode', () => {
    const hash = recipeHash(recipe)
    expect(isRecipeHash(hash)).toBe(true)
    expect(hash).toMatch(/^#recipe=[A-Za-z0-9_-]+$/)
    expect(recipeFromHash(hash)).toMatchObject({
      title: recipe.title,
      summary: recipe.summary,
      ingredients: recipe.ingredients,
      nutrition: recipe.nutrition,
      // The sender's shopping needs do not travel with the link.
      missingIngredients: [],
    })
  })

  it('rejects damaged or unrelated hashes', () => {
    expect(recipeFromHash('#saved')).toBeNull()
    expect(recipeFromHash('#recipe=not-base64!!')).toBeNull()
    expect(recipeFromHash(`#recipe=${btoa('{"title":"No steps"}')}`)).toBeNull()
  })
})

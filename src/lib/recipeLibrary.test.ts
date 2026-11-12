import { describe, expect, it } from 'vitest'
import { LIBRARY } from '../data/recipes'
import { matchesTerm, suggestFromLibrary } from './recipeLibrary'
import { parseRecipe } from './validate'

describe('matchesTerm', () => {
  it('matches whole words and plurals only', () => {
    expect(matchesTerm('cherry tomatoes', 'tomato')).toBe(true)
    expect(matchesTerm('eggs', 'egg')).toBe(true)
    expect(matchesTerm('eggplant', 'egg')).toBe(false)
    expect(matchesTerm('red bell pepper', 'pepper')).toBe(true)
  })
})

describe('suggestFromLibrary', () => {
  it('ranks full matches first and reports what is used and missing', () => {
    const [first] = suggestFromLibrary(['eggs', 'baby spinach', 'cherry tomatoes'], 'any')
    expect(first?.title).toBe('Spinach and tomato omelette')
    expect(first?.usedIngredients).toEqual(['eggs', 'baby spinach', 'cherry tomatoes'])
    expect(first?.missingIngredients).toEqual([])
  })

  it('lists missing core ingredients for partial matches', () => {
    const results = suggestFromLibrary(['bread', 'avocado'], 'any')
    const toast = results.find((recipe) => recipe.title === 'Avocado toast with egg')
    expect(toast?.missingIngredients).toEqual(['eggs'])
  })

  it('respects the diet', () => {
    const names = ['eggs', 'spinach', 'tomato', 'tofu', 'onion', 'chicken', 'broccoli']
    const vegan = suggestFromLibrary(names, 'vegan')
    expect(vegan.length).toBeGreaterThan(0)
    expect(vegan.map((recipe) => recipe.title)).not.toContain('Spinach and tomato omelette')
    for (const recipe of vegan) {
      expect(recipe.title).not.toMatch(/chicken|egg|salmon|tuna|turkey/i)
    }
  })

  it('returns nothing when no recipe is at least half covered', () => {
    expect(suggestFromLibrary(['ketchup'], 'any')).toEqual([])
    expect(suggestFromLibrary([], 'any')).toEqual([])
  })
})

describe('library data', () => {
  it('every recipe is complete and vegan implies vegetarian', () => {
    for (const recipe of LIBRARY) {
      expect(parseRecipe(recipe), recipe.title).not.toBeNull()
      expect(recipe.core.length, recipe.title).toBeGreaterThanOrEqual(3)
      if (recipe.vegan) expect(recipe.vegetarian, recipe.title).toBe(true)
    }
  })
})

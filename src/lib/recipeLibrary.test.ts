import { describe, expect, it } from 'vitest'
import { LIBRARY } from '../data/recipes'
import { DEFAULT_PREFERENCES, type Preferences } from '../types'
import { matchesTerm, suggestFromLibrary } from './recipeLibrary'

const prefs = (patch: Partial<Preferences> = {}): Preferences => ({
  ...DEFAULT_PREFERENCES,
  servings: 1,
  ...patch,
})
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
    const [first] = suggestFromLibrary(['eggs', 'baby spinach', 'cherry tomatoes'], prefs())
    expect(first?.title).toBe('Spinach and tomato omelette')
    expect(first?.usedIngredients).toEqual(['eggs', 'baby spinach', 'cherry tomatoes'])
    expect(first?.missingIngredients).toEqual([])
  })

  it('lists missing core ingredients for partial matches', () => {
    const results = suggestFromLibrary(['bread', 'avocado'], prefs())
    const toast = results.find((recipe) => recipe.title === 'Avocado toast with egg')
    expect(toast?.missingIngredients).toEqual(['eggs'])
  })

  it('respects the diet', () => {
    const names = ['eggs', 'spinach', 'tomato', 'tofu', 'onion', 'chicken', 'broccoli']
    const vegan = suggestFromLibrary(names, prefs({ diet: 'vegan' }))
    expect(vegan.length).toBeGreaterThan(0)
    expect(vegan.map((recipe) => recipe.title)).not.toContain('Spinach and tomato omelette')
    for (const recipe of vegan) {
      expect(recipe.title).not.toMatch(/chicken|egg|salmon|tuna|turkey/i)
    }
  })

  it('returns nothing when no recipe is at least half covered', () => {
    expect(suggestFromLibrary(['ketchup'], prefs())).toEqual([])
    expect(suggestFromLibrary([], prefs())).toEqual([])
  })
})

describe('suggestFromLibrary preferences', () => {
  const pantry = [
    'eggs',
    'spinach',
    'tomato',
    'bread',
    'avocado',
    'rice',
    'pasta',
    'garlic',
    'chickpeas',
    'cucumber',
    'lemon',
  ]

  it('respects a time limit', () => {
    const quick = suggestFromLibrary(pantry, prefs({ maxMinutes: 15 }))
    expect(quick.length).toBeGreaterThan(0)
    expect(quick.every((recipe) => recipe.timeMinutes <= 15)).toBe(true)
  })

  it('leaves out recipes with avoided allergens', () => {
    const titles = suggestFromLibrary(pantry, prefs({ avoid: ['eggs', 'gluten'] })).map(
      (r) => r.title,
    )
    expect(titles).not.toContain('Spinach and tomato omelette')
    expect(titles).not.toContain('Tomato garlic pasta')
    expect(titles).toContain('Chickpea cucumber salad')
  })

  it('ranks the chosen cuisine first', () => {
    const [first] = suggestFromLibrary(pantry, prefs({ cuisine: 'italian' }))
    expect(first?.title).toBe('Tomato garlic pasta')
  })

  it('scales ingredient amounts to the servings asked for', () => {
    const omelette = suggestFromLibrary(['eggs', 'spinach', 'tomato'], prefs({ servings: 2 }))[0]
    expect(omelette?.servings).toBe(2)
    expect(omelette?.ingredients[0]).toBe('4 eggs')
  })

  it('can loosen the match threshold for alternatives', () => {
    const strict = suggestFromLibrary(['eggs'], prefs())
    const loose = suggestFromLibrary(['eggs'], prefs(), [], 0.25)
    expect(loose.length).toBeGreaterThan(strict.length)
  })

  it('skips excluded titles', () => {
    const titles = suggestFromLibrary(['eggs', 'spinach', 'tomato'], prefs(), [
      'Spinach and tomato omelette',
    ]).map((r) => r.title)
    expect(titles).not.toContain('Spinach and tomato omelette')
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

describe('suggestFromLibrary use-it-up', () => {
  it('ranks recipes that use ingredients marked to use soon first', () => {
    const names = ['eggs', 'spinach', 'tomato', 'oats', 'banana', 'milk']
    const plain = suggestFromLibrary(names, DEFAULT_PREFERENCES)
    const urgent = suggestFromLibrary(names, DEFAULT_PREFERENCES, [], 0.5, ['banana'])
    expect(plain.map((recipe) => recipe.title)).toEqual(
      expect.arrayContaining(urgent.map((recipe) => recipe.title)),
    )
    expect(urgent[0]?.usedIngredients).toContain('banana')
  })
})

describe('suggestFromLibrary health goals', () => {
  const names = LIBRARY.flatMap((recipe) => recipe.core.map((core) => core.name))

  it.each([
    ['high-protein', (r: { nutrition?: { protein: number } }) => (r.nutrition?.protein ?? 0) >= 20],
    ['low-carb', (r: { nutrition?: { carbs: number } }) => (r.nutrition?.carbs ?? 99) <= 20],
    ['light', (r: { nutrition?: { calories: number } }) => (r.nutrition?.calories ?? 999) <= 350],
  ] as const)('only suggests %s recipes for that goal', (goal, fits) => {
    const recipes = suggestFromLibrary(names, { ...DEFAULT_PREFERENCES, goal })
    expect(recipes.length).toBeGreaterThan(0)
    expect(recipes.every(fits)).toBe(true)
  })
})

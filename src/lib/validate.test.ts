import { describe, expect, it } from 'vitest'
import {
  parseDiet,
  parseIngredientNames,
  parsePreferences,
  parseRecipe,
  parseRecipes,
} from './validate'

describe('parseIngredientNames', () => {
  it('normalizes, de-duplicates, and drops non-strings', () => {
    expect(parseIngredientNames([' Eggs ', 'eggs', 42, '', 'Red  Onion'])).toEqual([
      'eggs',
      'red onion',
    ])
  })

  it('returns an empty list for non-arrays', () => {
    expect(parseIngredientNames('eggs')).toEqual([])
  })
})

describe('parseDiet', () => {
  it('falls back to any', () => {
    expect(parseDiet('vegan')).toBe('vegan')
    expect(parseDiet('keto')).toBe('any')
  })
})

describe('parseRecipe', () => {
  const valid = {
    title: 'Veggie omelette',
    summary: 'Quick and filling.',
    timeMinutes: 12.4,
    servings: 1,
    ingredients: ['2 eggs', '1 handful spinach'],
    usedIngredients: ['eggs', 'spinach'],
    missingIngredients: [],
    steps: ['Whisk the eggs.', 'Cook with the spinach.'],
    healthNote: 'High in protein.',
  }

  it('accepts a well-formed recipe and rounds numbers', () => {
    expect(parseRecipe(valid)).toEqual({ ...valid, timeMinutes: 12 })
  })

  it('fills defaults for missing optional fields', () => {
    const recipe = parseRecipe({ title: 'Toast', ingredients: ['bread'], steps: ['Toast it.'] })
    expect(recipe).toMatchObject({ timeMinutes: 30, servings: 2, summary: '', healthNote: '' })
  })

  it('rejects recipes without a title, ingredients, or steps', () => {
    expect(parseRecipe({ ...valid, title: '' })).toBeNull()
    expect(parseRecipe({ ...valid, steps: [] })).toBeNull()
    expect(parseRecipe('nope')).toBeNull()
  })
})

describe('parseRecipes', () => {
  it('keeps only valid recipes', () => {
    const good = { title: 'Toast', ingredients: ['bread'], steps: ['Toast it.'] }
    expect(parseRecipes([good, null, { title: 'Broken' }])).toHaveLength(1)
    expect(parseRecipes({})).toEqual([])
  })
})

describe('parsePreferences', () => {
  it('keeps valid values and drops the rest', () => {
    expect(
      parsePreferences({
        diet: 'vegan',
        maxMinutes: 30,
        avoid: ['nuts', 'bacon', 'soy'],
        cuisine: 'indian',
        servings: 4,
      }),
    ).toEqual({
      diet: 'vegan',
      maxMinutes: 30,
      avoid: ['nuts', 'soy'],
      cuisine: 'indian',
      servings: 4,
    })
  })

  it('falls back to defaults', () => {
    expect(parsePreferences({ maxMinutes: 17, cuisine: 'martian', servings: 99 })).toEqual({
      diet: 'any',
      maxMinutes: null,
      avoid: [],
      cuisine: 'any',
      servings: 8,
    })
    expect(parsePreferences(null).servings).toBe(2)
  })
})

describe('nutrition', () => {
  const base = { title: 'Toast', ingredients: ['bread'], steps: ['Toast it.'] }

  it('keeps a plausible estimate, rounded', () => {
    expect(
      parseRecipe({ ...base, nutrition: { calories: 410.6, protein: 20, carbs: 50.2, fat: 12 } })
        ?.nutrition,
    ).toEqual({ calories: 411, protein: 20, carbs: 50, fat: 12 })
  })

  it('drops missing or implausible estimates', () => {
    expect(parseRecipe(base)?.nutrition).toBeUndefined()
    expect(
      parseRecipe({ ...base, nutrition: { calories: 99999, protein: 1, carbs: 1, fat: 1 } })
        ?.nutrition,
    ).toBeUndefined()
    expect(
      parseRecipe({ ...base, nutrition: { calories: 300, protein: '20g', carbs: 1, fat: 1 } })
        ?.nutrition,
    ).toBeUndefined()
  })
})

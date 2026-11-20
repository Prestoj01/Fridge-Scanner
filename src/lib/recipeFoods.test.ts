import { describe, expect, it } from 'vitest'
import { recipeFoods } from './recipeFoods'

describe('recipeFoods', () => {
  it('picks up to three distinct foods from the ingredients used', () => {
    expect(
      recipeFoods({
        usedIngredients: ['eggs', 'baby spinach', 'cherry tomatoes', 'feta', 'more eggs'],
        ingredients: [],
      }),
    ).toEqual(['egg', 'leaf', 'tomato'])
  })

  it('falls back to the full ingredient lines, then to a jar', () => {
    expect(recipeFoods({ usedIngredients: [], ingredients: ['2 cups rice'] })).toEqual(['grain'])
    expect(recipeFoods({ usedIngredients: ['ketchup'], ingredients: [] })).toEqual(['jar'])
  })
})

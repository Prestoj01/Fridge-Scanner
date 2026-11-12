import { describe, expect, it } from 'vitest'
import { addIngredient, normalizeIngredientName } from './ingredients'

describe('normalizeIngredientName', () => {
  it('trims, collapses whitespace, and lowercases', () => {
    expect(normalizeIngredientName('  Cherry   Tomatoes ')).toBe('cherry tomatoes')
  })
})

describe('addIngredient', () => {
  it('adds a normalized ingredient', () => {
    const result = addIngredient([], ' Spinach ')
    expect(result.map((item) => item.name)).toEqual(['spinach'])
  })

  it('ignores blanks and duplicates', () => {
    const list = addIngredient([], 'eggs')
    expect(addIngredient(list, '   ')).toBe(list)
    expect(addIngredient(list, 'EGGS')).toBe(list)
  })
})

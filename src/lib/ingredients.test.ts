import { describe, expect, it } from 'vitest'
import { addIngredients, normalizeIngredientName } from './ingredients'

describe('normalizeIngredientName', () => {
  it('trims, collapses whitespace, and lowercases', () => {
    expect(normalizeIngredientName('  Cherry   Tomatoes ')).toBe('cherry tomatoes')
  })
})

describe('addIngredients', () => {
  it('adds normalized ingredients with their source', () => {
    const result = addIngredients([], [' Spinach ', 'Eggs'], 'detected')
    expect(result.map((item) => [item.name, item.source])).toEqual([
      ['spinach', 'detected'],
      ['eggs', 'detected'],
    ])
  })

  it('ignores blanks and duplicates', () => {
    const list = addIngredients([], ['eggs'], 'manual')
    expect(addIngredients(list, ['   ', 'EGGS', 'eggs'], 'manual')).toBe(list)
    expect(addIngredients(list, ['milk', 'Milk'], 'manual')).toHaveLength(2)
  })
})

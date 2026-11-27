import { afterEach, describe, expect, it } from 'vitest'
import { loadPantry, savePantry } from './pantry'

afterEach(() => {
  localStorage.clear()
})

describe('pantry storage', () => {
  it('round-trips ingredients and diet', () => {
    savePantry({ ingredients: [{ id: 'a', name: 'eggs', source: 'detected' }], diet: 'vegetarian' })
    expect(loadPantry()).toEqual({
      ingredients: [{ id: 'a', name: 'eggs', source: 'detected' }],
      diet: 'vegetarian',
    })
  })

  it('returns an empty pantry for missing or corrupt data', () => {
    expect(loadPantry()).toEqual({ ingredients: [], diet: 'any' })
    localStorage.setItem('fridge-scanner:pantry', '{not json')
    expect(loadPantry()).toEqual({ ingredients: [], diet: 'any' })
  })

  it('drops malformed entries and clears storage when empty', () => {
    localStorage.setItem(
      'fridge-scanner:pantry',
      JSON.stringify({ ingredients: [{ id: 'a', name: ' milk ' }, { name: 3 }], diet: 'keto' }),
    )
    expect(loadPantry()).toEqual({
      ingredients: [{ id: 'a', name: 'milk', source: 'manual' }],
      diet: 'any',
    })
    savePantry({ ingredients: [], diet: 'any' })
    expect(localStorage.getItem('fridge-scanner:pantry')).toBeNull()
  })
})

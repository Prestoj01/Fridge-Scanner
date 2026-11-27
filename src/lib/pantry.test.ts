import { afterEach, describe, expect, it } from 'vitest'
import { DEFAULT_PREFERENCES } from '../types'
import { loadPantry, savePantry } from './pantry'

afterEach(() => {
  localStorage.clear()
})

const empty = { ingredients: [], preferences: DEFAULT_PREFERENCES }

describe('pantry storage', () => {
  it('round-trips ingredients and preferences', () => {
    const pantry = {
      ingredients: [{ id: 'a', name: 'eggs', source: 'detected' as const }],
      preferences: { ...DEFAULT_PREFERENCES, diet: 'vegetarian' as const, maxMinutes: 30 },
    }
    savePantry(pantry)
    expect(loadPantry()).toEqual(pantry)
  })

  it('returns an empty pantry for missing or corrupt data', () => {
    expect(loadPantry()).toEqual(empty)
    localStorage.setItem('fridge-scanner:pantry', '{not json')
    expect(loadPantry()).toEqual(empty)
  })

  it('reads the older diet-only format and drops malformed entries', () => {
    localStorage.setItem(
      'fridge-scanner:pantry',
      JSON.stringify({ ingredients: [{ id: 'a', name: ' milk ' }, { name: 3 }], diet: 'vegan' }),
    )
    expect(loadPantry()).toEqual({
      ingredients: [{ id: 'a', name: 'milk', source: 'manual' }],
      preferences: { ...DEFAULT_PREFERENCES, diet: 'vegan' },
    })
  })

  it('clears storage when there is nothing worth keeping', () => {
    savePantry({
      ingredients: [{ id: 'a', name: 'eggs', source: 'manual' }],
      preferences: DEFAULT_PREFERENCES,
    })
    savePantry(empty)
    expect(localStorage.getItem('fridge-scanner:pantry')).toBeNull()
  })
})

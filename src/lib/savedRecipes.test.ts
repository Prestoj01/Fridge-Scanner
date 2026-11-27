import { afterEach, describe, expect, it } from 'vitest'
import type { Recipe } from '../types'
import { loadSavedRecipes, recipeKey, storeSavedRecipes, toggleSaved } from './savedRecipes'

const recipe = (title: string, id = title): Recipe => ({
  id,
  source: 'library',
  title,
  summary: '',
  timeMinutes: 10,
  servings: 1,
  ingredients: ['2 eggs'],
  usedIngredients: ['eggs'],
  missingIngredients: [],
  steps: ['Cook.'],
  healthNote: '',
})

afterEach(() => {
  localStorage.clear()
})

describe('saved recipes', () => {
  it('matches recipes by title, not id', () => {
    expect(recipeKey({ title: '  Spinach  Omelette ' })).toBe('spinach omelette')
    const list = toggleSaved([], recipe('Omelette', 'a'))
    expect(toggleSaved(list, recipe('omelette', 'b'))).toEqual([])
  })

  it('adds new saves to the front', () => {
    const list = toggleSaved(toggleSaved([], recipe('One')), recipe('Two'))
    expect(list.map((item) => item.title)).toEqual(['Two', 'One'])
  })

  it('persists and validates', () => {
    storeSavedRecipes([recipe('Toast')])
    expect(loadSavedRecipes()[0]?.title).toBe('Toast')
    localStorage.setItem('fridge-scanner:saved-recipes', JSON.stringify([{ title: 'No id' }, 5]))
    expect(loadSavedRecipes()).toEqual([])
  })
})

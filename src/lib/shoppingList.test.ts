import { afterEach, describe, expect, it } from 'vitest'
import {
  addToList,
  isOnList,
  listAsText,
  loadShoppingList,
  storeShoppingList,
} from './shoppingList'

afterEach(() => {
  localStorage.clear()
})

describe('shopping list', () => {
  it('adds new items once, normalized', () => {
    const list = addToList([], ['Soy Sauce', 'soy  sauce', 'Garlic'], 'Stir-fry')
    expect(list.map((item) => [item.name, item.forRecipe])).toEqual([
      ['soy sauce', 'Stir-fry'],
      ['garlic', 'Stir-fry'],
    ])
  })

  it('re-opens checked items instead of duplicating them', () => {
    const [first] = addToList([], ['garlic'], null)
    if (!first) throw new Error('expected an item')
    const list = addToList([{ ...first, checked: true }], ['Garlic'], null)
    expect(list).toEqual([{ ...first, checked: false }])
  })

  it('knows when a recipe’s items are already on the list', () => {
    const list = addToList([], ['garlic', 'pasta'], null)
    expect(isOnList(list, ['Garlic'])).toBe(true)
    expect(isOnList(list, ['garlic', 'basil'])).toBe(false)
  })

  it('formats open items as text and persists', () => {
    const list = addToList([], ['garlic', 'pasta'], null)
    const [garlic, pasta] = list
    if (!garlic || !pasta) throw new Error('expected items')
    expect(listAsText([garlic, { ...pasta, checked: true }])).toBe(
      'Shopping list\n\nPRODUCE\n• garlic',
    )
    expect(listAsText(list)).toBe('Shopping list\n\nPRODUCE\n• garlic\n\nPANTRY\n• pasta')
    storeShoppingList(list)
    expect(loadShoppingList()).toEqual(list)
  })
})

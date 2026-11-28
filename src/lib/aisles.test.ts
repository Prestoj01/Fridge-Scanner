import { describe, expect, it } from 'vitest'
import { aisleFor, groupByAisle } from './aisles'

describe('aisleFor', () => {
  it.each([
    ['spinach', 'Produce'],
    ['bell pepper', 'Produce'],
    ['black pepper', 'Spices and sauces'],
    ['soy sauce', 'Spices and sauces'],
    ['olive oil', 'Spices and sauces'],
    ['peanut butter', 'Pantry'],
    ['canned tomatoes', 'Pantry'],
    ['black beans', 'Pantry'],
    ['eggs', 'Dairy and eggs'],
    ['greek yogurt', 'Dairy and eggs'],
    ['chicken breasts', 'Meat and fish'],
    ['tortillas', 'Bakery'],
    ['frozen peas', 'Frozen'],
    ['paper towels', 'Other'],
  ])('puts %s in %s', (name, aisle) => {
    expect(aisleFor(name)).toBe(aisle)
  })
})

describe('groupByAisle', () => {
  it('groups in store order and keeps each item order', () => {
    const items = [{ name: 'milk' }, { name: 'lemon' }, { name: 'eggs' }, { name: 'rice' }]
    expect(groupByAisle(items)).toEqual([
      { aisle: 'Produce', items: [{ name: 'lemon' }] },
      { aisle: 'Dairy and eggs', items: [{ name: 'milk' }, { name: 'eggs' }] },
      { aisle: 'Pantry', items: [{ name: 'rice' }] },
    ])
  })
})

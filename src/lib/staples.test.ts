import { describe, expect, it } from 'vitest'
import { DEFAULT_STAPLES, isCoveredByStaples, loadStaples, saveStaples } from './staples'

describe('isCoveredByStaples', () => {
  it('covers staples, plurals, generic names, and plain descriptors', () => {
    expect(isCoveredByStaples('salt', DEFAULT_STAPLES)).toBe(true)
    expect(isCoveredByStaples('Oil', DEFAULT_STAPLES)).toBe(true)
    expect(isCoveredByStaples('extra virgin olive oil', DEFAULT_STAPLES)).toBe(true)
    expect(isCoveredByStaples('pepper', DEFAULT_STAPLES)).toBe(true)
    expect(isCoveredByStaples('egg', ['eggs'])).toBe(true)
    expect(isCoveredByStaples('red onion', ['onion'])).toBe(true)
    expect(isCoveredByStaples('cumin', ['spices'])).toBe(true)
  })

  it('does not cover different foods that share a word', () => {
    expect(isCoveredByStaples('bell pepper', DEFAULT_STAPLES)).toBe(false)
    expect(isCoveredByStaples('coconut milk', ['milk'])).toBe(false)
    expect(isCoveredByStaples('rice vinegar', ['rice'])).toBe(false)
    expect(isCoveredByStaples('egg noodles', ['eggs'])).toBe(false)
    expect(isCoveredByStaples('garlic', DEFAULT_STAPLES)).toBe(false)
  })
})

describe('staples storage', () => {
  it('starts with oil, salt, and pepper, and remembers changes', () => {
    expect(loadStaples()).toEqual(DEFAULT_STAPLES)
    saveStaples(['garlic', 'eggs'])
    expect(loadStaples()).toEqual(['garlic', 'eggs'])
  })
})

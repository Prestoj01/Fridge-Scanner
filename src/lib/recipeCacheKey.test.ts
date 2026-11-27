import { describe, expect, it } from 'vitest'
import { DEFAULT_PREFERENCES } from '../types'
import { recipeCacheKey } from './recipeCacheKey'

describe('recipeCacheKey', () => {
  it('ignores order, case, spacing, and duplicates', () => {
    expect(recipeCacheKey(['Eggs', ' rice', 'eggs'], DEFAULT_PREFERENCES)).toBe(
      recipeCacheKey(['rice', 'eggs'], DEFAULT_PREFERENCES),
    )
  })

  it('changes with any preference or excluded title', () => {
    const base = recipeCacheKey(['rice'], DEFAULT_PREFERENCES)
    expect(recipeCacheKey(['rice'], { ...DEFAULT_PREFERENCES, servings: 4 })).not.toBe(base)
    expect(recipeCacheKey(['rice'], { ...DEFAULT_PREFERENCES, avoid: ['nuts'] })).not.toBe(base)
    expect(recipeCacheKey(['rice'], DEFAULT_PREFERENCES, ['Fried rice'])).not.toBe(base)
  })
})

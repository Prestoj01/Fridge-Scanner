import { describe, expect, it } from 'vitest'
import { hashString, pick, tintFor, unit } from './fun'

describe('fun helpers', () => {
  it('are deterministic', () => {
    expect(hashString('eggs')).toBe(hashString('eggs'))
    expect(tintFor('eggs')).toBe(tintFor('eggs'))
    expect(unit('eggs')).toBe(unit('eggs'))
  })

  it('stay within bounds', () => {
    for (const seed of ['a', 'eggs', 'cherry tomatoes', 'z'.repeat(40)]) {
      const value = unit(seed)
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
      expect(['x', 'y']).toContain(pick(seed, ['x', 'y']))
    }
  })
})

import { describe, expect, it } from 'vitest'
import { hashString, magnetColor, pick, tilt } from './fun'

describe('fun helpers', () => {
  it('are deterministic', () => {
    expect(hashString('eggs')).toBe(hashString('eggs'))
    expect(magnetColor('eggs')).toBe(magnetColor('eggs'))
    expect(tilt('eggs')).toBe(tilt('eggs'))
  })

  it('stay within bounds', () => {
    for (const seed of ['a', 'eggs', 'cherry tomatoes', 'z'.repeat(40)]) {
      expect(Math.abs(tilt(seed, 3))).toBeLessThanOrEqual(3)
      expect(['x', 'y']).toContain(pick(seed, ['x', 'y']))
    }
  })
})

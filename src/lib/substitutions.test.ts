import { describe, expect, it } from 'vitest'
import { substitutesFor } from './substitutions'

describe('substitutesFor', () => {
  it('suggests stand-ins for common ingredients', () => {
    expect(substitutesFor('soy sauce')[0]).toBe('tamari')
    expect(substitutesFor('Greek yogurt')).toContain('sour cream')
    expect(substitutesFor('cooked rice')).toContain('quinoa')
  })

  it('prefers the more specific match', () => {
    expect(substitutesFor('sweet potato')[0]).toBe('butternut squash')
    expect(substitutesFor('peanut butter')[0]).toBe('sunflower seed butter')
  })

  it('returns nothing for unknown ingredients', () => {
    expect(substitutesFor('dragon fruit')).toEqual([])
  })
})

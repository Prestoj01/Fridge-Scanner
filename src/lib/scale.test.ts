import { describe, expect, it } from 'vitest'
import { formatAmount, parseAmount, scaleLine } from './scale'

describe('parseAmount', () => {
  it('reads whole numbers, fractions, decimals, and glyphs', () => {
    expect(parseAmount('2 eggs')?.value).toBe(2)
    expect(parseAmount('1 1/2 cups rice')?.value).toBe(1.5)
    expect(parseAmount('1/4 cup oats')?.value).toBe(0.25)
    expect(parseAmount('1.5 tbsp oil')?.value).toBe(1.5)
    expect(parseAmount('½ onion')?.value).toBe(0.5)
  })

  it('ignores lines without a leading amount', () => {
    expect(parseAmount('Juice of 1 lemon')).toBeNull()
    expect(parseAmount('salt to taste')).toBeNull()
  })
})

describe('formatAmount', () => {
  it('uses kitchen fractions', () => {
    expect(formatAmount(1.5)).toBe('1½')
    expect(formatAmount(0.33)).toBe('⅓')
    expect(formatAmount(2.98)).toBe('3')
    expect(formatAmount(0.75)).toBe('¾')
    expect(formatAmount(12.4)).toBe('12')
  })
})

describe('scaleLine', () => {
  it('scales the leading amount only', () => {
    expect(scaleLine('2 eggs', 1.5)).toBe('3 eggs')
    expect(scaleLine('1 1/2 cups cooked rice', 0.5)).toBe('¾ cups cooked rice')
    expect(scaleLine('1 can (15 oz) beans', 2)).toBe('2 can (15 oz) beans')
    expect(scaleLine('Juice of 1 lemon', 2)).toBe('Juice of 1 lemon')
    expect(scaleLine('2 eggs', 1)).toBe('2 eggs')
  })
})

import { describe, expect, it } from 'vitest'
import { foodKind } from './foodKind'

describe('foodKind', () => {
  it('maps common ingredients to illustrations', () => {
    expect(foodKind('cherry tomatoes')).toBe('tomato')
    expect(foodKind('eggs')).toBe('egg')
    expect(foodKind('baby spinach')).toBe('leaf')
    expect(foodKind('limes')).toBe('lemon')
    expect(foodKind('sweet potato')).toBe('carrot')
    expect(foodKind('red bell pepper')).toBe('pepper')
    expect(foodKind('cream cheese')).toBe('cheese')
    expect(foodKind('greek yogurt')).toBe('milk')
    expect(foodKind('chicken breast')).toBe('meat')
    expect(foodKind('salmon fillet')).toBe('fish')
    expect(foodKind('brown rice')).toBe('grain')
    expect(foodKind('black beans')).toBe('grain')
    expect(foodKind('garlic')).toBe('onion')
    expect(foodKind('sourdough bread')).toBe('bread')
  })

  it('avoids false matches and falls back to a jar', () => {
    expect(foodKind('eggplant')).toBe('jar')
    expect(foodKind('peanut butter')).toBe('jar')
    expect(foodKind('ketchup')).toBe('jar')
    expect(foodKind('something unusual')).toBe('jar')
  })
})

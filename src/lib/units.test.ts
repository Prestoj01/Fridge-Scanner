import { describe, expect, it } from 'vitest'
import { convertLine, convertStep } from './units'

describe('convertLine', () => {
  it('turns US volumes and weights into metric', () => {
    expect(convertLine('2 cups broccoli florets', 'metric')).toBe('480 ml broccoli florets')
    expect(convertLine('1/4 cup oats or granola', 'metric')).toBe('60 ml oats or granola')
    expect(convertLine('5 cups water', 'metric')).toBe('1.2 l water')
    expect(convertLine('1 lb ground turkey', 'metric')).toBe('450 g ground turkey')
    expect(convertLine('8 oz salmon', 'metric')).toBe('230 g salmon')
  })

  it('uses a conversion the line already gives', () => {
    expect(convertLine('6 oz (170 g) pasta', 'metric')).toBe('170 g pasta')
    expect(convertLine('6 oz (170 g) pasta', 'us')).toBe('6 oz (170 g) pasta')
  })

  it('turns metric into US units', () => {
    expect(convertLine('200 g pasta', 'us')).toBe('7 oz pasta')
    expect(convertLine('450 g chicken', 'us')).toBe('1 lb chicken')
    expect(convertLine('250 ml milk', 'us')).toBe('1 cup milk')
    expect(convertLine('30 ml olive oil', 'us')).toBe('2 tbsp olive oil')
  })

  it('leaves spoons, counts, and lines without amounts alone', () => {
    expect(convertLine('2 tbsp soy sauce', 'metric')).toBe('2 tbsp soy sauce')
    expect(convertLine('2 eggs', 'metric')).toBe('2 eggs')
    expect(convertLine('Salt to taste', 'metric')).toBe('Salt to taste')
    expect(convertLine('2 cloves garlic', 'us')).toBe('2 cloves garlic')
    // "g" must be a whole word: "2 green onions" is not grams.
    expect(convertLine('2 green onions', 'us')).toBe('2 green onions')
  })
})

describe('convertStep', () => {
  it('shows one oven temperature in the chosen system', () => {
    const step = 'Heat the oven to 400°F (200°C).'
    expect(convertStep(step, 'metric')).toBe('Heat the oven to 200°C.')
    expect(convertStep(step, 'us')).toBe('Heat the oven to 400°F.')
    expect(convertStep('Bake at 180°C.', 'us')).toBe('Bake at 355°F.')
    expect(convertStep('Bake at 350°F.', 'metric')).toBe('Bake at 175°C.')
  })
})

import { describe, expect, it } from 'vitest'
import { imageFileName } from './shareImage'

describe('imageFileName', () => {
  it('makes a tidy file name', () => {
    expect(imageFileName('Chicken & broccoli stir-fry!')).toBe('chicken-broccoli-stir-fry.png')
    expect(imageFileName('Crème brûlée')).toBe('creme-brulee.png')
    expect(imageFileName('!!!')).toBe('recipe.png')
  })
})

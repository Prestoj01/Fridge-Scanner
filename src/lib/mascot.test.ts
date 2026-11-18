import { describe, expect, it } from 'vitest'
import { COOKING_LINES, mascotState, SCANNING_LINES, type MascotInputs } from './mascot'

const base: MascotInputs = {
  aiEnabled: true,
  step: 'upload',
  photoCount: 0,
  ingredientCount: 0,
  recipeCount: 0,
  detectedCount: null,
  detection: { status: 'idle' },
  generation: { status: 'idle' },
}

describe('mascotState', () => {
  it('is hungry for photos, then excited, then scanning', () => {
    expect(mascotState(base).mood).toBe('hungry')
    expect(mascotState({ ...base, photoCount: 2 }).mood).toBe('excited')
    const scanning = mascotState({ ...base, photoCount: 2, detection: { status: 'loading' } })
    expect(scanning).toEqual({ mood: 'scanning', lines: SCANNING_LINES })
  })

  it('is calm in offline mode and sad on errors', () => {
    expect(mascotState({ ...base, aiEnabled: false }).mood).toBe('idle')
    expect(mascotState({ ...base, detection: { status: 'error', message: 'x' } }).mood).toBe('sad')
  })

  it('reacts to detection results on the review step', () => {
    const review = { ...base, step: 'review' as const }
    expect(mascotState({ ...review, detectedCount: 0 }).mood).toBe('sad')
    expect(mascotState({ ...review, detectedCount: 1, ingredientCount: 1 }).lines[0]).toBe(
      'Found 1 goodie!',
    )
    expect(mascotState(review).mood).toBe('thinking')
    expect(mascotState({ ...review, ingredientCount: 3 }).mood).toBe('happy')
  })

  it('cooks, celebrates, or sulks on the recipes step', () => {
    const recipes = { ...base, step: 'recipes' as const }
    expect(mascotState({ ...recipes, generation: { status: 'loading' } }).lines).toBe(COOKING_LINES)
    expect(mascotState({ ...recipes, recipeCount: 5 })).toEqual({
      mood: 'excited',
      lines: ['5 recipes! Let’s cook!'],
    })
    expect(mascotState(recipes).mood).toBe('sad')
  })
})

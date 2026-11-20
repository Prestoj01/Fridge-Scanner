import { describe, expect, it } from 'vitest'
import { COOKING_LINES, statusState, SCANNING_LINES, type StatusInputs } from './status'

const base: StatusInputs = {
  aiEnabled: true,
  step: 'upload',
  photoCount: 0,
  ingredientCount: 0,
  recipeCount: 0,
  detectedCount: null,
  detection: { status: 'idle' },
  generation: { status: 'idle' },
}

describe('statusState', () => {
  it('invites photos, gets excited, then scans', () => {
    expect(statusState(base).mood).toBe('hungry')
    expect(statusState({ ...base, photoCount: 2 }).mood).toBe('excited')
    const scanning = statusState({ ...base, photoCount: 2, detection: { status: 'loading' } })
    expect(scanning).toEqual({ mood: 'scanning', lines: SCANNING_LINES })
  })

  it('is calm in offline mode and wilts on errors', () => {
    expect(statusState({ ...base, aiEnabled: false }).mood).toBe('idle')
    expect(statusState({ ...base, detection: { status: 'error', message: 'x' } }).mood).toBe('sad')
  })

  it('reacts to detection results on the review step', () => {
    const review = { ...base, step: 'review' as const }
    expect(statusState({ ...review, detectedCount: 0 }).mood).toBe('sad')
    expect(statusState({ ...review, detectedCount: 1, ingredientCount: 1 }).lines[0]).toBe(
      'found 1 good thing',
    )
    expect(statusState(review).mood).toBe('idle')
    expect(statusState({ ...review, ingredientCount: 3 }).mood).toBe('excited')
  })

  it('thinks, blooms, or wilts on the recipes step', () => {
    const recipes = { ...base, step: 'recipes' as const }
    expect(statusState({ ...recipes, generation: { status: 'loading' } }).lines).toBe(COOKING_LINES)
    expect(statusState({ ...recipes, recipeCount: 5 })).toEqual({
      mood: 'happy',
      lines: ['dinner’s sorted: 5 ideas'],
    })
    expect(statusState(recipes).mood).toBe('sad')
  })
})

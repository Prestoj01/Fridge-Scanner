import { describe, expect, it } from 'vitest'
import { COOKING_LINES, orbState, SCANNING_LINES, type OrbInputs } from './orb'

const base: OrbInputs = {
  aiEnabled: true,
  step: 'upload',
  photoCount: 0,
  ingredientCount: 0,
  recipeCount: 0,
  detectedCount: null,
  detection: { status: 'idle' },
  generation: { status: 'idle' },
}

describe('orbState', () => {
  it('invites photos, gets excited, then scans', () => {
    expect(orbState(base).mood).toBe('hungry')
    expect(orbState({ ...base, photoCount: 2 }).mood).toBe('excited')
    const scanning = orbState({ ...base, photoCount: 2, detection: { status: 'loading' } })
    expect(scanning).toEqual({ mood: 'scanning', lines: SCANNING_LINES })
  })

  it('is calm in offline mode and wilts on errors', () => {
    expect(orbState({ ...base, aiEnabled: false }).mood).toBe('idle')
    expect(orbState({ ...base, detection: { status: 'error', message: 'x' } }).mood).toBe('sad')
  })

  it('reacts to detection results on the review step', () => {
    const review = { ...base, step: 'review' as const }
    expect(orbState({ ...review, detectedCount: 0 }).mood).toBe('sad')
    expect(orbState({ ...review, detectedCount: 1, ingredientCount: 1 }).lines[0]).toBe(
      'found 1 good thing',
    )
    expect(orbState(review).mood).toBe('idle')
    expect(orbState({ ...review, ingredientCount: 3 }).mood).toBe('excited')
  })

  it('thinks, blooms, or wilts on the recipes step', () => {
    const recipes = { ...base, step: 'recipes' as const }
    expect(orbState({ ...recipes, generation: { status: 'loading' } }).lines).toBe(COOKING_LINES)
    expect(orbState({ ...recipes, recipeCount: 5 })).toEqual({
      mood: 'happy',
      lines: ['dinner’s sorted: 5 ideas'],
    })
    expect(orbState(recipes).mood).toBe('sad')
  })
})

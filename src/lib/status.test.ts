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
  it('invites photos, counts them, then scans', () => {
    expect(statusState(base)).toEqual({
      tone: 'neutral',
      lines: ['Start with a photo of your shelves'],
    })
    expect(statusState({ ...base, photoCount: 2 })).toEqual({
      tone: 'good',
      lines: ['2 photos ready to scan'],
    })
    const scanning = statusState({ ...base, photoCount: 2, detection: { status: 'loading' } })
    expect(scanning).toEqual({ tone: 'busy', lines: SCANNING_LINES })
  })

  it('asks a question in offline mode and flags errors', () => {
    expect(statusState({ ...base, aiEnabled: false }).tone).toBe('neutral')
    expect(statusState({ ...base, detection: { status: 'error', message: 'x' } }).tone).toBe(
      'problem',
    )
  })

  it('reacts to detection results on the review step', () => {
    const review = { ...base, step: 'review' as const }
    expect(statusState({ ...review, detectedCount: 0 }).tone).toBe('problem')
    expect(statusState({ ...review, detectedCount: 1, ingredientCount: 1 }).lines[0]).toBe(
      'Spotted 1 ingredient',
    )
    expect(statusState(review).tone).toBe('neutral')
    expect(statusState({ ...review, ingredientCount: 3 }).lines[0]).toBe(
      '3 ingredients on the list',
    )
  })

  it('works, succeeds, or flags a problem on the recipes step', () => {
    const recipes = { ...base, step: 'recipes' as const }
    expect(statusState({ ...recipes, generation: { status: 'loading' } }).lines).toBe(COOKING_LINES)
    expect(statusState({ ...recipes, recipeCount: 5 })).toEqual({
      tone: 'good',
      lines: ['Dinner’s sorted: 5 ideas'],
    })
    expect(statusState(recipes).tone).toBe('problem')
  })
})

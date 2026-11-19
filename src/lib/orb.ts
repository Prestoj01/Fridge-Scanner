import type { AsyncState, StepId } from '../types'

export type OrbMood = 'idle' | 'hungry' | 'excited' | 'scanning' | 'thinking' | 'happy' | 'sad'

export interface OrbState {
  mood: OrbMood
  /** One or more caption lines. Several lines rotate while the state lasts. */
  lines: readonly [string, ...string[]]
}

export interface OrbInputs {
  aiEnabled: boolean
  step: StepId
  photoCount: number
  ingredientCount: number
  recipeCount: number
  detectedCount: number | null
  detection: AsyncState
  generation: AsyncState
}

export const SCANNING_LINES = [
  'reading the shelves…',
  'spotting the greens…',
  'counting eggs…',
  'checking the crisper…',
  'almost there…',
] as const

export const COOKING_LINES = [
  'simmering some ideas…',
  'balancing the plate…',
  'adding fresh herbs…',
  'tasting as we go…',
] as const

function plural(count: number, word: string): string {
  return `${String(count)} ${word}${count === 1 ? '' : 's'}`
}

/** Decides how the orb behaves and what its caption says for the current app state. */
export function orbState(input: OrbInputs): OrbState {
  switch (input.step) {
    case 'upload': {
      if (input.detection.status === 'loading') return { mood: 'scanning', lines: SCANNING_LINES }
      if (input.detection.status === 'error') {
        return { mood: 'sad', lines: ['that didn’t quite work, try again?'] }
      }
      if (!input.aiEnabled) return { mood: 'idle', lines: ['what’s in there today?'] }
      if (input.photoCount === 0) return { mood: 'hungry', lines: ['show me what you’ve got'] }
      return { mood: 'excited', lines: ['looking good, ready when you are'] }
    }
    case 'review': {
      if (input.detectedCount === 0) return { mood: 'sad', lines: ['hmm, nothing I could spot'] }
      if (input.detectedCount !== null && input.ingredientCount > 0) {
        return { mood: 'happy', lines: [`found ${plural(input.detectedCount, 'good thing')}`] }
      }
      if (input.ingredientCount === 0)
        return { mood: 'idle', lines: ['start with a few favorites'] }
      return { mood: 'excited', lines: ['nice, keep going'] }
    }
    case 'recipes': {
      if (input.generation.status === 'loading') return { mood: 'thinking', lines: COOKING_LINES }
      if (input.generation.status === 'error') {
        return { mood: 'sad', lines: ['the kitchen needs a moment'] }
      }
      if (input.recipeCount === 0)
        return { mood: 'sad', lines: ['nothing yet, add a little more?'] }
      return { mood: 'happy', lines: [`dinner’s sorted: ${plural(input.recipeCount, 'idea')}`] }
    }
  }
}

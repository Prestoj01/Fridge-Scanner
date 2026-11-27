import type { AsyncState, StepId } from '../types'

/** How the status dot looks: pulsing while working, green when done, red on a problem. */
export type Tone = 'neutral' | 'busy' | 'good' | 'problem'

export interface StatusState {
  tone: Tone
  /** One or more status lines. Several lines rotate while the state lasts. */
  lines: readonly [string, ...string[]]
}

export interface StatusInputs {
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
  'Reading the shelves…',
  'Spotting the greens…',
  'Counting the eggs…',
  'Checking the crisper…',
  'Almost there…',
] as const

export const COOKING_LINES = [
  'Simmering some ideas…',
  'Balancing the plate…',
  'Adding fresh herbs…',
  'Tasting as we go…',
] as const

function plural(count: number, word: string): string {
  return `${String(count)} ${word}${count === 1 ? '' : 's'}`
}

/** What the status line says, and how its dot looks, for the current state. */
export function statusState(input: StatusInputs): StatusState {
  switch (input.step) {
    case 'upload': {
      if (input.detection.status === 'loading') return { tone: 'busy', lines: SCANNING_LINES }
      if (input.detection.status === 'error') {
        return { tone: 'problem', lines: ['The scan didn’t work. Try again'] }
      }
      if (!input.aiEnabled) return { tone: 'neutral', lines: ['What’s in the fridge today?'] }
      if (input.photoCount === 0) {
        return { tone: 'neutral', lines: ['Start with a photo of your shelves'] }
      }
      return { tone: 'good', lines: [`${plural(input.photoCount, 'photo')} ready to scan`] }
    }
    case 'review': {
      if (input.detectedCount === 0) {
        return { tone: 'problem', lines: ['Nothing spotted. Add items by hand'] }
      }
      if (input.ingredientCount === 0) {
        return { tone: 'neutral', lines: ['Start with a few favorites'] }
      }
      // The headline already gives the count, so point to the next move.
      return { tone: 'good', lines: ['Set your preferences, then find recipes'] }
    }
    case 'recipes': {
      if (input.generation.status === 'loading') return { tone: 'busy', lines: COOKING_LINES }
      if (input.generation.status === 'error') {
        return { tone: 'problem', lines: ['Recipes didn’t load. Try again'] }
      }
      if (input.recipeCount === 0) {
        return { tone: 'problem', lines: ['No match yet. Add a little more?'] }
      }
      return { tone: 'good', lines: [`Dinner’s sorted: ${plural(input.recipeCount, 'idea')}`] }
    }
  }
}

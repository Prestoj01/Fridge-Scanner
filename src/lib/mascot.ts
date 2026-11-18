import type { AsyncState, StepId } from '../types'

export type Mood = 'idle' | 'hungry' | 'excited' | 'scanning' | 'thinking' | 'happy' | 'sad'

export interface MascotState {
  mood: Mood
  /** One or more lines. Several lines rotate while the state lasts. */
  lines: readonly [string, ...string[]]
}

export interface MascotInputs {
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
  'Checking the crisper drawer…',
  'Squinting at the top shelf…',
  'Is that cheese? It’s cheese.',
  'Counting eggs… one, two…',
  'Peeking behind the ketchup…',
] as const

export const COOKING_LINES = [
  'Preheating some ideas…',
  'Flipping through cookbooks…',
  'Chopping veggies in my head…',
  'Tasting… needs a pinch of salt.',
  'Plating it up nicely…',
] as const

export const POKE_LINES = [
  'Hey, that tickles!',
  'I’m cool. Literally.',
  'Close my door, please!',
  'Got any leftovers?',
  'Stay fresh out there.',
] as const

function plural(count: number, word: string): string {
  return `${String(count)} ${word}${count === 1 ? '' : 's'}`
}

/** Decides how Chilly the fridge feels and what it says for the current app state. */
export function mascotState(input: MascotInputs): MascotState {
  switch (input.step) {
    case 'upload': {
      if (input.detection.status === 'loading') return { mood: 'scanning', lines: SCANNING_LINES }
      if (input.detection.status === 'error') {
        return { mood: 'sad', lines: ['Ugh, my eyes went fuzzy. Try again?'] }
      }
      if (!input.aiEnabled) return { mood: 'idle', lines: ['Tell me what you’ve got!'] }
      if (input.photoCount === 0) return { mood: 'hungry', lines: ['Feed me photos!'] }
      return { mood: 'excited', lines: ['Ooh, snacks! Hit Detect when ready.'] }
    }
    case 'review': {
      if (input.detectedCount === 0) return { mood: 'sad', lines: ['I couldn’t spot any food…'] }
      if (input.detectedCount !== null && input.ingredientCount > 0) {
        return { mood: 'happy', lines: [`Found ${plural(input.detectedCount, 'goodie')}!`] }
      }
      if (input.ingredientCount === 0) return { mood: 'thinking', lines: ['So… what’s in there?'] }
      return { mood: 'happy', lines: ['Yum. Keep ’em coming!'] }
    }
    case 'recipes': {
      if (input.generation.status === 'loading') return { mood: 'thinking', lines: COOKING_LINES }
      if (input.generation.status === 'error') {
        return { mood: 'sad', lines: ['The kitchen’s closed for a sec.'] }
      }
      if (input.recipeCount === 0) return { mood: 'sad', lines: ['Nothing to cook… yet!'] }
      return { mood: 'excited', lines: [`${plural(input.recipeCount, 'recipe')}! Let’s cook!`] }
    }
  }
}

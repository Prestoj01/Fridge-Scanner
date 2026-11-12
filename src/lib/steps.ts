import type { Step, StepId } from '../types'

export const STEPS: readonly Step[] = [
  { id: 'upload', label: 'Photos' },
  { id: 'review', label: 'Ingredients' },
  { id: 'recipes', label: 'Recipes' },
]

export function stepIndex(id: StepId): number {
  return STEPS.findIndex((step) => step.id === id)
}

export function previousStep(id: StepId): StepId | null {
  return STEPS[stepIndex(id) - 1]?.id ?? null
}

import type { Goal, Nutrition } from '../types'

/** What each health goal means per serving. Shared by the library and the AI prompt. */
export const GOAL_RULES: Record<
  Exclude<Goal, 'balanced'>,
  { prompt: string; fits: (n: Nutrition) => boolean }
> = {
  'high-protein': {
    prompt: 'high in protein, with at least 20 g of protein per serving',
    fits: (n) => n.protein >= 20,
  },
  'low-carb': {
    prompt: 'low in carbohydrates, with at most 20 g of carbs per serving',
    fits: (n) => n.carbs <= 20,
  },
  light: {
    prompt: 'light, with at most 350 calories per serving',
    fits: (n) => n.calories <= 350,
  },
}

export function fitsGoal(nutrition: Nutrition, goal: Goal): boolean {
  return goal === 'balanced' || GOAL_RULES[goal].fits(nutrition)
}

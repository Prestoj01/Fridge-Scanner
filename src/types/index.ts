export type StepId = 'upload' | 'review' | 'recipes'

export interface Step {
  id: StepId
  label: string
}

export interface Photo {
  id: string
  name: string
  file: File
  /** Object URL for local preview. Revoked when the photo is removed. */
  url: string
}

export interface Ingredient {
  id: string
  name: string
  /** Whether the ingredient came from photo detection or was typed in. */
  source: 'detected' | 'manual'
  /** Marked to use up first, for example because it expires soon. */
  useSoon?: boolean
}

export type Diet = 'any' | 'vegetarian' | 'vegan'

export const GOALS = ['balanced', 'high-protein', 'low-carb', 'light'] as const
/** A health goal that steers which recipes are suggested. */
export type Goal = (typeof GOALS)[number]

export const ALLERGENS = ['dairy', 'eggs', 'gluten', 'nuts', 'fish', 'soy'] as const
export type Allergen = (typeof ALLERGENS)[number]

export const CUISINES = [
  'any',
  'italian',
  'mexican',
  'asian',
  'mediterranean',
  'american',
  'indian',
] as const
export type Cuisine = (typeof CUISINES)[number]

/** How the user wants their recipes. */
export interface Preferences {
  diet: Diet
  /** Longest acceptable total time, or null for no limit. */
  maxMinutes: number | null
  /** Ingredients to leave out entirely. */
  avoid: Allergen[]
  cuisine: Cuisine
  servings: number
  goal: Goal
}

export const DEFAULT_PREFERENCES: Preferences = {
  diet: 'any',
  maxMinutes: null,
  avoid: [],
  cuisine: 'any',
  servings: 2,
  goal: 'balanced',
}

export const TIME_LIMITS = [15, 30, 45] as const
export const MAX_SERVINGS = 8

/** Estimated nutrition for one serving. Grams except calories. */
export interface Nutrition {
  calories: number
  protein: number
  carbs: number
  fat: number
}

/** Recipe content, as produced by the API or the built-in library. */
export interface RecipeContent {
  title: string
  summary: string
  timeMinutes: number
  servings: number
  /** Full ingredient lines with amounts, e.g. "2 eggs". */
  ingredients: string[]
  /** Which of the user's ingredients the recipe uses. */
  usedIngredients: string[]
  /** Ingredients the user would still need to get. */
  missingIngredients: string[]
  steps: string[]
  healthNote: string
  /** Per-serving estimate, when known. */
  nutrition?: Nutrition
}

export interface Recipe extends RecipeContent {
  id: string
  source: 'ai' | 'library'
}

/** Status of an async action such as detection or recipe generation. */
export type AsyncState =
  { status: 'idle' } | { status: 'loading' } | { status: 'error'; message: string }

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
}

export type Diet = 'any' | 'vegetarian' | 'vegan'

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
}

export interface Recipe extends RecipeContent {
  id: string
  source: 'ai' | 'library'
}

/** Status of an async action such as detection or recipe generation. */
export type AsyncState =
  { status: 'idle' } | { status: 'loading' } | { status: 'error'; message: string }

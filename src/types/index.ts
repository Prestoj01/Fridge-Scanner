export type StepId = 'upload' | 'review' | 'recipes'

export interface Step {
  id: StepId
  label: string
}

export interface Photo {
  id: string
  name: string
  /** Object URL for local preview. Revoked when the photo is removed. */
  url: string
}

export interface Ingredient {
  id: string
  name: string
}

export interface Recipe {
  id: string
  title: string
  summary: string
  ingredients: string[]
  steps: string[]
}

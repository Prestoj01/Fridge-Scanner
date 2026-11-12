import { useState } from 'react'
import { addIngredient as addToList } from '../lib/ingredients'
import { nextStep, previousStep } from '../lib/steps'
import type { Ingredient, Photo, Recipe, StepId } from '../types'

export interface ScanFlow {
  step: StepId
  photos: readonly Photo[]
  ingredients: readonly Ingredient[]
  recipes: readonly Recipe[]
  goNext: () => void
  goBack: () => void
  addPhotos: (files: readonly File[]) => void
  removePhoto: (id: string) => void
  addIngredient: (name: string) => void
  removeIngredient: (id: string) => void
  reset: () => void
}

/** Owns all state for the Upload -> Review -> Recipes flow. */
export function useScanFlow(): ScanFlow {
  const [step, setStep] = useState<StepId>('upload')
  const [photos, setPhotos] = useState<readonly Photo[]>([])
  const [ingredients, setIngredients] = useState<readonly Ingredient[]>([])
  // Recipes are populated in a later step, once the API is wired up.
  const [recipes, setRecipes] = useState<readonly Recipe[]>([])

  const goNext = () => {
    setStep((current) => nextStep(current) ?? current)
  }

  const goBack = () => {
    setStep((current) => previousStep(current) ?? current)
  }

  const addPhotos = (files: readonly File[]) => {
    const added = files
      .filter((file) => file.type.startsWith('image/'))
      .map((file) => ({
        id: crypto.randomUUID(),
        name: file.name,
        url: URL.createObjectURL(file),
      }))
    if (added.length > 0) setPhotos((current) => [...current, ...added])
  }

  const removePhoto = (id: string) => {
    const photo = photos.find((item) => item.id === id)
    if (!photo) return
    URL.revokeObjectURL(photo.url)
    setPhotos((current) => current.filter((item) => item.id !== id))
  }

  const addIngredient = (name: string) => {
    setIngredients((current) => addToList(current, name))
  }

  const removeIngredient = (id: string) => {
    setIngredients((current) => current.filter((item) => item.id !== id))
  }

  const reset = () => {
    for (const photo of photos) URL.revokeObjectURL(photo.url)
    setPhotos([])
    setIngredients([])
    setRecipes([])
    setStep('upload')
  }

  return {
    step,
    photos,
    ingredients,
    recipes,
    goNext,
    goBack,
    addPhotos,
    removePhoto,
    addIngredient,
    removeIngredient,
    reset,
  }
}

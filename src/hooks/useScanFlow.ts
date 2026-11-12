import { useRef, useState } from 'react'
import { detectIngredients, fetchRecipes } from '../lib/api'
import { API_URL } from '../lib/config'
import { prepareImage } from '../lib/image'
import { addIngredients } from '../lib/ingredients'
import { suggestFromLibrary } from '../lib/recipeLibrary'
import { previousStep } from '../lib/steps'
import type { AsyncState, Diet, Ingredient, Photo, Recipe, RecipeContent, StepId } from '../types'
import { API_LIMITS } from '../types/api'

export interface ScanFlow {
  /** True when a backend URL is configured, so photo detection and AI recipes work. */
  aiEnabled: boolean
  step: StepId
  photos: readonly Photo[]
  ingredients: readonly Ingredient[]
  recipes: readonly Recipe[]
  diet: Diet
  detection: AsyncState
  /** How many ingredients the last detection found, or null if none has run. */
  detectedCount: number | null
  generation: AsyncState
  goBack: () => void
  addPhotos: (files: readonly File[]) => void
  removePhoto: (id: string) => void
  detect: () => Promise<void>
  enterManually: () => void
  addIngredient: (name: string) => void
  removeIngredient: (id: string) => void
  setDiet: (diet: Diet) => void
  findRecipes: () => Promise<void>
  showLibraryRecipes: () => void
  reset: () => void
}

const IDLE: AsyncState = { status: 'idle' }
const LOADING: AsyncState = { status: 'loading' }

function toRecipes(contents: readonly RecipeContent[], source: Recipe['source']): Recipe[] {
  return contents.map((content) => ({ ...content, id: crypto.randomUUID(), source }))
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Try again.'
}

/** Owns all state for the Upload -> Review -> Recipes flow. */
export function useScanFlow(): ScanFlow {
  const aiEnabled = API_URL !== ''

  const [step, setStep] = useState<StepId>('upload')
  const [photos, setPhotos] = useState<readonly Photo[]>([])
  const [ingredients, setIngredients] = useState<readonly Ingredient[]>([])
  const [recipes, setRecipes] = useState<readonly Recipe[]>([])
  const [diet, setDiet] = useState<Diet>('any')
  const [detection, setDetection] = useState<AsyncState>(IDLE)
  const [detectedCount, setDetectedCount] = useState<number | null>(null)
  const [generation, setGeneration] = useState<AsyncState>(IDLE)

  // Each async action takes a ticket. A result is ignored if a newer action
  // (or a reset) has started since, so stale replies never overwrite state.
  const ticket = useRef(0)

  const goBack = () => {
    ticket.current += 1
    setDetection(IDLE)
    setGeneration(IDLE)
    setStep((current) => previousStep(current) ?? current)
  }

  const addPhotos = (files: readonly File[]) => {
    const room = API_LIMITS.maxImages - photos.length
    const added = files
      .filter((file) => file.type.startsWith('image/'))
      .slice(0, Math.max(room, 0))
      .map((file) => ({
        id: crypto.randomUUID(),
        name: file.name,
        file,
        url: URL.createObjectURL(file),
      }))
    if (added.length > 0) setPhotos((current) => [...current, ...added])
    setDetection(IDLE)
  }

  const removePhoto = (id: string) => {
    const photo = photos.find((item) => item.id === id)
    if (!photo) return
    URL.revokeObjectURL(photo.url)
    setPhotos((current) => current.filter((item) => item.id !== id))
  }

  const detect = async () => {
    if (photos.length === 0) return
    const mine = ++ticket.current
    setDetection(LOADING)
    try {
      const images = await Promise.all(photos.map((photo) => prepareImage(photo.file)))
      const names = await detectIngredients(images)
      if (mine !== ticket.current) return
      setIngredients((current) => addIngredients(current, names, 'detected'))
      setDetectedCount(names.length)
      setDetection(IDLE)
      setStep('review')
    } catch (error) {
      if (mine !== ticket.current) return
      setDetection({ status: 'error', message: errorMessage(error) })
    }
  }

  const enterManually = () => {
    ticket.current += 1
    setDetection(IDLE)
    setDetectedCount(null)
    setStep('review')
  }

  const addIngredient = (name: string) => {
    setIngredients((current) => addIngredients(current, [name], 'manual'))
  }

  const removeIngredient = (id: string) => {
    setIngredients((current) => current.filter((item) => item.id !== id))
  }

  const showLibraryRecipes = () => {
    ticket.current += 1
    const names = ingredients.map((item) => item.name)
    setRecipes(toRecipes(suggestFromLibrary(names, diet), 'library'))
    setGeneration(IDLE)
    setStep('recipes')
  }

  const findRecipes = async () => {
    if (ingredients.length === 0) return
    if (!aiEnabled) {
      showLibraryRecipes()
      return
    }
    const mine = ++ticket.current
    setRecipes([])
    setGeneration(LOADING)
    setStep('recipes')
    try {
      const contents = await fetchRecipes(
        ingredients.map((item) => item.name),
        diet,
      )
      if (mine !== ticket.current) return
      setRecipes(toRecipes(contents, 'ai'))
      setGeneration(IDLE)
    } catch (error) {
      if (mine !== ticket.current) return
      setGeneration({ status: 'error', message: errorMessage(error) })
    }
  }

  const reset = () => {
    ticket.current += 1
    for (const photo of photos) URL.revokeObjectURL(photo.url)
    setPhotos([])
    setIngredients([])
    setRecipes([])
    setDetection(IDLE)
    setDetectedCount(null)
    setGeneration(IDLE)
    setStep('upload')
  }

  return {
    aiEnabled,
    step,
    photos,
    ingredients,
    recipes,
    diet,
    detection,
    detectedCount,
    generation,
    goBack,
    addPhotos,
    removePhoto,
    detect,
    enterManually,
    addIngredient,
    removeIngredient,
    setDiet,
    findRecipes,
    showLibraryRecipes,
    reset,
  }
}

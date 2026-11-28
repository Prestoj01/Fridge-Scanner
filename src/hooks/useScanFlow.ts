import { useEffect, useRef, useState } from 'react'
import { ApiError, detectIngredients, fetchRecipes } from '../lib/api'
import { API_URL } from '../lib/config'
import { prepareImage } from '../lib/image'
import { addIngredients } from '../lib/ingredients'
import { loadPantry, savePantry } from '../lib/pantry'
import { suggestFromLibrary } from '../lib/recipeLibrary'
import { previousStep } from '../lib/steps'
import type {
  AsyncState,
  Ingredient,
  Photo,
  Preferences,
  Recipe,
  RecipeContent,
  StepId,
} from '../types'
import { API_LIMITS } from '../types/api'

export interface ScanFlow {
  /** True when a backend URL is configured, so photo detection and AI recipes work. */
  aiEnabled: boolean
  step: StepId
  photos: readonly Photo[]
  ingredients: readonly Ingredient[]
  recipes: readonly Recipe[]
  preferences: Preferences
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
  setPreferences: (preferences: Preferences) => void
  findRecipes: () => Promise<void>
  /** What "something different" is doing right now, if anything. */
  refining: Refining
  /** A short note when no different recipe could be found. */
  refineNote: string | null
  /** Why the built-in library is showing instead of AI recipes, if it is. */
  fallbackNote: string | null
  swapRecipe: (id: string) => Promise<void>
  moreRecipes: () => Promise<void>
  showLibraryRecipes: () => void
  clearIngredients: () => void
  reset: () => void
}

export type Refining = { kind: 'idle' } | { kind: 'swap'; id: string } | { kind: 'more' }

const NOT_REFINING: Refining = { kind: 'idle' }
const IDLE: AsyncState = { status: 'idle' }
const LOADING: AsyncState = { status: 'loading' }

function toRecipes(contents: readonly RecipeContent[], source: Recipe['source']): Recipe[] {
  return contents.map((content) => ({ ...content, id: crypto.randomUUID(), source }))
}

/** The browser knows it has no connection. */
function isOffline(): boolean {
  return typeof navigator !== 'undefined' && !navigator.onLine
}

const OFFLINE_NOTE = 'You’re offline, so these come from the built-in recipe library.'

function fallbackNoteFor(error: unknown): string {
  if (isOffline() || (error instanceof ApiError && error.code === 'network')) return OFFLINE_NOTE
  if (error instanceof ApiError && error.code === 'rate_limited') {
    return 'The AI kitchen is busy right now, so these come from the built-in library.'
  }
  return 'The AI kitchen couldn’t answer, so these come from the built-in library.'
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Try again.'
}

/** Owns all state for the Upload -> Review -> Recipes flow. */
export function useScanFlow(): ScanFlow {
  const aiEnabled = API_URL !== ''

  const [step, setStep] = useState<StepId>('upload')
  const [photos, setPhotos] = useState<readonly Photo[]>([])
  // The ingredient list and preferences persist between visits.
  const [pantry] = useState(loadPantry)
  const [ingredients, setIngredients] = useState<readonly Ingredient[]>(pantry.ingredients)
  const [recipes, setRecipes] = useState<readonly Recipe[]>([])
  const [preferences, setPreferences] = useState<Preferences>(pantry.preferences)
  const [detection, setDetection] = useState<AsyncState>(IDLE)
  const [detectedCount, setDetectedCount] = useState<number | null>(null)
  const [generation, setGeneration] = useState<AsyncState>(IDLE)
  const [refining, setRefining] = useState<Refining>(NOT_REFINING)
  const [refineNote, setRefineNote] = useState<string | null>(null)
  const [fallbackNote, setFallbackNote] = useState<string | null>(null)

  useEffect(() => {
    savePantry({ ingredients: [...ingredients], preferences })
  }, [ingredients, preferences])

  // Each async action takes a ticket. A result is ignored if a newer action
  // (or a reset) has started since, so stale replies never overwrite state.
  const ticket = useRef(0)

  const goBack = () => {
    ticket.current += 1
    setRefining(NOT_REFINING)
    setRefineNote(null)
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
    setRecipes(toRecipes(suggestFromLibrary(names, preferences), 'library'))
    setRefineNote(null)
    setFallbackNote(null)
    setGeneration(IDLE)
    setStep('recipes')
  }

  const findRecipes = async () => {
    if (ingredients.length === 0) return
    if (!aiEnabled) {
      showLibraryRecipes()
      return
    }
    const names = ingredients.map((item) => item.name)
    const mine = ++ticket.current
    setRecipes([])
    setRefineNote(null)
    setFallbackNote(null)
    setStep('recipes')
    // With no connection there is no point waiting on the network.
    if (isOffline()) {
      setRecipes(toRecipes(suggestFromLibrary(names, preferences), 'library'))
      setFallbackNote(OFFLINE_NOTE)
      setGeneration(IDLE)
      return
    }
    setGeneration(LOADING)
    try {
      const contents = await fetchRecipes(names, preferences)
      if (mine !== ticket.current) return
      setRecipes(toRecipes(contents, 'ai'))
      setGeneration(IDLE)
    } catch (error) {
      if (mine !== ticket.current) return
      // Fall back to the built-in library when it has something to offer.
      const library = suggestFromLibrary(names, preferences)
      if (library.length > 0) {
        setRecipes(toRecipes(library, 'library'))
        setFallbackNote(fallbackNoteFor(error))
        setGeneration(IDLE)
      } else {
        setGeneration({ status: 'error', message: errorMessage(error) })
      }
    }
  }

  /** Clears the remembered ingredient list without leaving the current step. */
  const clearIngredients = () => {
    setIngredients([])
  }

  /** New recipes that differ from the ones on screen, from the API or the library. */
  const differentRecipes = async (): Promise<{
    found: RecipeContent[]
    source: Recipe['source']
  }> => {
    const names = ingredients.map((item) => item.name)
    const shown = recipes.map((recipe) => recipe.title)
    const seen = new Set(shown.map((title) => title.toLowerCase()))
    const fresh = (list: RecipeContent[]) =>
      list.filter((item) => !seen.has(item.title.toLowerCase()))
    // Alternatives may ask for a little more shopping than the first picks.
    const fromLibrary = () => fresh(suggestFromLibrary(names, preferences, shown, 0.25))
    if (!aiEnabled || isOffline()) return { found: fromLibrary(), source: 'library' }
    try {
      return { found: fresh(await fetchRecipes(names, preferences, shown)), source: 'ai' }
    } catch (error) {
      const found = fromLibrary()
      if (found.length === 0) throw error
      setFallbackNote(fallbackNoteFor(error))
      return { found, source: 'library' }
    }
  }

  const refine = async (mode: Refining, apply: (found: Recipe[]) => void): Promise<void> => {
    const mine = ++ticket.current
    setRefining(mode)
    setRefineNote(null)
    try {
      const { found, source } = await differentRecipes()
      if (mine !== ticket.current) return
      if (found.length === 0) {
        setRefineNote(
          aiEnabled
            ? 'No new ideas came back. Try adding an ingredient or loosening a preference.'
            : 'That is every match in the built-in library. Add ingredients for new ideas.',
        )
      } else {
        apply(toRecipes(found, source))
      }
    } catch (error) {
      if (mine !== ticket.current) return
      setRefineNote(errorMessage(error))
    } finally {
      if (mine === ticket.current) setRefining(NOT_REFINING)
    }
  }

  const swapRecipe = (id: string) =>
    refine({ kind: 'swap', id }, (found) => {
      const [next] = found
      if (!next) return
      setRecipes((current) => current.map((recipe) => (recipe.id === id ? next : recipe)))
    })

  const moreRecipes = () =>
    refine({ kind: 'more' }, (found) => {
      setRecipes((current) => [...current, ...found])
    })

  const reset = () => {
    ticket.current += 1
    for (const photo of photos) URL.revokeObjectURL(photo.url)
    setPhotos([])
    setIngredients([])
    setRecipes([])
    setFallbackNote(null)
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
    preferences,
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
    setPreferences,
    findRecipes,
    refining,
    refineNote,
    fallbackNote,
    swapRecipe,
    moreRecipes,
    showLibraryRecipes,
    clearIngredients,
    reset,
  }
}

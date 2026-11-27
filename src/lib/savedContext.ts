import { createContext, useContext } from 'react'
import type { Recipe } from '../types'

export interface SavedApi {
  saved: readonly Recipe[]
  isSaved: (recipe: Recipe) => boolean
  toggle: (recipe: Recipe) => void
}

export const SavedContext = createContext<SavedApi | null>(null)

export function useSaved(): SavedApi {
  const api = useContext(SavedContext)
  if (!api) throw new Error('useSaved must be used inside <SavedProvider>')
  return api
}

import { useEffect, useState, type ReactNode } from 'react'
import { SavedContext, type SavedApi } from '../lib/savedContext'
import { loadSavedRecipes, recipeKey, storeSavedRecipes, toggleSaved } from '../lib/savedRecipes'
import type { Recipe } from '../types'

/** Holds the user's saved recipes and keeps them in browser storage. */
export function SavedProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<readonly Recipe[]>(loadSavedRecipes)

  useEffect(() => {
    storeSavedRecipes(saved)
  }, [saved])

  const keys = new Set(saved.map(recipeKey))
  const api: SavedApi = {
    saved,
    isSaved: (recipe) => keys.has(recipeKey(recipe)),
    toggle: (recipe) => {
      setSaved((current) => toggleSaved(current, recipe))
    },
  }
  return <SavedContext.Provider value={api}>{children}</SavedContext.Provider>
}

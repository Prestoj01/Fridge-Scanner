import type { Recipe, RecipeContent } from '../types'
import { parseRecipe } from './validate'

const PARAM = 'recipe='

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(value: string): string {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(base64 + '='.repeat((4 - (base64.length % 4)) % 4))
  return new TextDecoder().decode(Uint8Array.from(binary, (char) => char.charCodeAt(0)))
}

/** The URL hash that carries a whole recipe, so a link works without a server. */
export function recipeHash(recipe: RecipeContent): string {
  const content: RecipeContent = {
    title: recipe.title,
    summary: recipe.summary,
    timeMinutes: recipe.timeMinutes,
    servings: recipe.servings,
    ingredients: recipe.ingredients,
    usedIngredients: recipe.usedIngredients,
    missingIngredients: [],
    steps: recipe.steps,
    healthNote: recipe.healthNote,
    ...(recipe.nutrition ? { nutrition: recipe.nutrition } : {}),
  }
  return `#${PARAM}${toBase64Url(JSON.stringify(content))}`
}

export function recipeLink(recipe: RecipeContent): string {
  return `${window.location.origin}${window.location.pathname}${recipeHash(recipe)}`
}

export function isRecipeHash(hash: string): boolean {
  return hash.startsWith(`#${PARAM}`)
}

/** Reads a shared recipe from a URL hash; null if it is missing or damaged. */
export function recipeFromHash(hash: string): Recipe | null {
  if (!isRecipeHash(hash)) return null
  try {
    const content = parseRecipe(JSON.parse(fromBase64Url(hash.slice(PARAM.length + 1))) as unknown)
    return content ? { ...content, id: 'shared', source: 'library' } : null
  } catch {
    return null
  }
}

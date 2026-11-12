/**
 * Defensive parsing of untrusted JSON. Used by the Worker on model output
 * and by the web app on API responses, so neither trusts the other blindly.
 */
import { API_LIMITS } from '../types/api'
import type { Diet, RecipeContent } from '../types'
import { normalizeIngredientName } from './ingredients'

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function cleanText(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return ''
  return value.replace(/\s+/g, ' ').trim().slice(0, maxLength)
}

function cleanTextList(value: unknown, maxItems: number, maxLength: number): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => cleanText(item, maxLength))
    .filter((item) => item !== '')
    .slice(0, maxItems)
}

function cleanCount(value: unknown, fallback: number, max: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback
  return Math.min(Math.max(Math.round(value), 1), max)
}

/** Normalizes, de-duplicates, and caps a list of ingredient names. */
export function parseIngredientNames(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  const names = new Set<string>()
  for (const item of value) {
    if (typeof item !== 'string') continue
    const name = normalizeIngredientName(item).slice(0, API_LIMITS.maxIngredientLength)
    if (name !== '') names.add(name)
    if (names.size >= API_LIMITS.maxIngredients) break
  }
  return [...names]
}

export function parseDiet(value: unknown): Diet {
  return value === 'vegetarian' || value === 'vegan' ? value : 'any'
}

/** Returns a clean recipe, or null if it lacks a title, ingredients, or steps. */
export function parseRecipe(value: unknown): RecipeContent | null {
  if (!isRecord(value)) return null
  const title = cleanText(value.title, 120)
  const ingredients = cleanTextList(value.ingredients, 30, 160)
  const steps = cleanTextList(value.steps, 20, 600)
  if (title === '' || ingredients.length === 0 || steps.length === 0) return null

  return {
    title,
    summary: cleanText(value.summary, 300),
    timeMinutes: cleanCount(value.timeMinutes, 30, 600),
    servings: cleanCount(value.servings, 2, 24),
    ingredients,
    usedIngredients: cleanTextList(value.usedIngredients, 30, 60),
    missingIngredients: cleanTextList(value.missingIngredients, 15, 60),
    steps,
    healthNote: cleanText(value.healthNote, 300),
  }
}

export function parseRecipes(value: unknown): RecipeContent[] {
  if (!Array.isArray(value)) return []
  return value
    .map(parseRecipe)
    .filter((recipe): recipe is RecipeContent => recipe !== null)
    .slice(0, API_LIMITS.maxRecipes)
}

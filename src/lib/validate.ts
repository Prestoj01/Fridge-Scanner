/**
 * Defensive parsing of untrusted JSON. Used by the Worker on model output
 * and by the web app on API responses, so neither trusts the other blindly.
 */
import { API_LIMITS } from '../types/api'
import {
  ALLERGENS,
  CUISINES,
  DEFAULT_PREFERENCES,
  GOALS,
  MAX_SERVINGS,
  TIME_LIMITS,
  type Allergen,
  type Cuisine,
  type Diet,
  type Goal,
  type Nutrition,
  type Preferences,
  type RecipeContent,
} from '../types'
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
/** Reads a per-serving nutrition estimate; null if any value is missing or implausible. */
export function parseNutrition(value: unknown): Nutrition | null {
  if (!isRecord(value)) return null
  const read = (key: string, max: number): number | null => {
    const raw = value[key]
    if (typeof raw !== 'number' || !Number.isFinite(raw) || raw < 0 || raw > max) return null
    return Math.round(raw)
  }
  const calories = read('calories', 3000)
  const protein = read('protein', 300)
  const carbs = read('carbs', 500)
  const fat = read('fat', 300)
  if (calories === null || protein === null || carbs === null || fat === null || calories === 0) {
    return null
  }
  return { calories, protein, carbs, fat }
}

export function parseRecipe(value: unknown): RecipeContent | null {
  if (!isRecord(value)) return null
  const title = cleanText(value.title, 120)
  const ingredients = cleanTextList(value.ingredients, 30, 160)
  const steps = cleanTextList(value.steps, 20, 600)
  if (title === '' || ingredients.length === 0 || steps.length === 0) return null
  const nutrition = parseNutrition(value.nutrition)

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
    ...(nutrition ? { nutrition } : {}),
  }
}

export function parseRecipes(value: unknown): RecipeContent[] {
  if (!Array.isArray(value)) return []
  return value
    .map(parseRecipe)
    .filter((recipe): recipe is RecipeContent => recipe !== null)
    .slice(0, API_LIMITS.maxRecipes)
}

/** Reads preferences from untrusted input, falling back to defaults field by field. */
export function parsePreferences(value: unknown): Preferences {
  if (!isRecord(value)) return { ...DEFAULT_PREFERENCES, avoid: [] }
  const maxMinutes = TIME_LIMITS.find((limit) => limit === value.maxMinutes) ?? null
  const avoid = Array.isArray(value.avoid)
    ? ALLERGENS.filter((allergen: Allergen) => (value.avoid as unknown[]).includes(allergen))
    : []
  const cuisine: Cuisine = CUISINES.find((option) => option === value.cuisine) ?? 'any'
  const servings =
    typeof value.servings === 'number' && Number.isInteger(value.servings)
      ? Math.min(Math.max(value.servings, 1), MAX_SERVINGS)
      : DEFAULT_PREFERENCES.servings
  const goal: Goal = GOALS.find((option) => option === value.goal) ?? 'balanced'
  return { diet: parseDiet(value.diet), maxMinutes, avoid, cuisine, servings, goal }
}

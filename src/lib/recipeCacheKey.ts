import type { Preferences } from '../types'

const sorted = (values: readonly string[]) =>
  [...new Set(values.map((value) => value.trim().toLowerCase()))].filter(Boolean).sort()

/**
 * A stable key for a recipe request. The same pantry and preferences give the
 * same key no matter the order or case of the ingredients. Shared by the app
 * and the Worker so both caches agree on what counts as the same request.
 */
export function recipeCacheKey(
  ingredients: readonly string[],
  preferences: Preferences,
  exclude: readonly string[] = [],
  useSoon: readonly string[] = [],
): string {
  return JSON.stringify([
    sorted(useSoon),
    sorted(ingredients),
    preferences.diet,
    preferences.maxMinutes,
    sorted(preferences.avoid),
    preferences.cuisine,
    preferences.servings,
    preferences.goal,
    sorted(exclude),
  ])
}

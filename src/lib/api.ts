import type { Diet, RecipeContent } from '../types'
import type { ApiErrorCode, ApiImage, DetectRequest, RecipesRequest } from '../types/api'
import { API_URL } from './config'
import { isRecord, parseIngredientNames, parseRecipes } from './validate'

const TIMEOUT_MS = 60_000

export type ApiFailure = ApiErrorCode | 'network' | 'timeout' | 'bad_response'

const FALLBACK_MESSAGES: Record<ApiFailure, string> = {
  bad_request: 'The request was not accepted.',
  forbidden: 'This site is not allowed to use the AI service.',
  not_found: 'The AI service address looks wrong.',
  payload_too_large: 'Those photos are too large. Try fewer or smaller photos.',
  rate_limited: 'Too many requests right now. Try again in a few minutes.',
  not_configured: 'The AI service is not set up yet.',
  upstream_error: 'The AI service had a problem. Try again.',
  network: 'Could not reach the AI service. Check your connection and try again.',
  timeout: 'The AI service took too long to respond. Try again.',
  bad_response: 'The AI service sent an unexpected reply. Try again.',
}

const KNOWN_CODES = new Set<string>(Object.keys(FALLBACK_MESSAGES))

export class ApiError extends Error {
  readonly code: ApiFailure

  constructor(code: ApiFailure, message?: string) {
    super(message ?? FALLBACK_MESSAGES[code])
    this.name = 'ApiError'
    this.code = code
  }
}

function errorFromBody(body: unknown): ApiError {
  const error = isRecord(body) ? body.error : null
  if (isRecord(error) && typeof error.code === 'string' && KNOWN_CODES.has(error.code)) {
    const message = typeof error.message === 'string' ? error.message : undefined
    return new ApiError(error.code as ApiFailure, message)
  }
  return new ApiError('upstream_error')
}

async function post(path: string, payload: unknown): Promise<unknown> {
  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
  } catch (error) {
    const timedOut = error instanceof DOMException && error.name === 'TimeoutError'
    throw new ApiError(timedOut ? 'timeout' : 'network')
  }

  let body: unknown
  try {
    body = await response.json()
  } catch {
    throw new ApiError(response.ok ? 'bad_response' : 'upstream_error')
  }
  if (!response.ok) throw errorFromBody(body)
  return body
}

/** Sends prepared photos to the API and returns the ingredient names it found. */
export async function detectIngredients(images: ApiImage[]): Promise<string[]> {
  const payload: DetectRequest = { images }
  const body = await post('/detect', payload)
  if (!isRecord(body) || !Array.isArray(body.ingredients)) throw new ApiError('bad_response')
  return parseIngredientNames(body.ingredients)
}

/** Asks the API for healthy recipes based on the given ingredients. */
export async function fetchRecipes(ingredients: string[], diet: Diet): Promise<RecipeContent[]> {
  const payload: RecipesRequest = { ingredients, diet }
  const body = await post('/recipes', payload)
  if (!isRecord(body) || !Array.isArray(body.recipes)) throw new ApiError('bad_response')
  return parseRecipes(body.recipes)
}

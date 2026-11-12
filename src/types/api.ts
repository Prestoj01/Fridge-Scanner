/**
 * Request and response shapes shared by the web app and the Worker in
 * `worker/`. Keep both sides in sync by importing from here.
 */
import type { Diet, RecipeContent } from './index'

export interface ApiImage {
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp'
  /** Base64-encoded image bytes, without a data URL prefix. */
  data: string
}

export interface DetectRequest {
  images: ApiImage[]
}

export interface DetectResponse {
  ingredients: string[]
}

export interface RecipesRequest {
  ingredients: string[]
  diet: Diet
}

export interface RecipesResponse {
  recipes: RecipeContent[]
}

export type ApiErrorCode =
  | 'bad_request'
  | 'forbidden'
  | 'not_found'
  | 'payload_too_large'
  | 'rate_limited'
  | 'not_configured'
  | 'upstream_error'

export interface ApiErrorBody {
  error: { code: ApiErrorCode; message: string }
}

export const API_LIMITS = {
  maxImages: 4,
  /** Max base64 characters per image (about 3 MB of image data). */
  maxImageChars: 4_000_000,
  maxIngredients: 40,
  maxIngredientLength: 40,
  maxRecipes: 4,
} as const

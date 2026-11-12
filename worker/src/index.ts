/**
 * Fridge Scanner API. A small Cloudflare Worker that keeps the Gemini API key
 * off the client and exposes two endpoints:
 *
 *   POST /detect   photos -> ingredient names
 *   POST /recipes  ingredient names -> healthy recipes
 */
import { isRecord, parseDiet, parseIngredientNames, parseRecipes } from '../../src/lib/validate'
import {
  API_LIMITS,
  type ApiErrorBody,
  type ApiErrorCode,
  type ApiImage,
  type DetectResponse,
  type RecipesResponse,
} from '../../src/types/api'
import { generateJson, UpstreamError } from './gemini'
import {
  DETECT_PROMPT,
  DETECT_SCHEMA,
  DETECT_SYSTEM,
  RECIPES_SCHEMA,
  RECIPES_SYSTEM,
  recipesPrompt,
} from './prompts'

export interface Env {
  GEMINI_API_KEY?: string
  GEMINI_MODEL?: string
  ALLOWED_ORIGINS?: string
}

const DEFAULT_MODEL = 'gemini-3.5-flash-lite'
const MAX_BODY_BYTES = 18_000_000
const IMAGE_TYPES: readonly string[] = ['image/jpeg', 'image/png', 'image/webp']

class HttpError extends Error {
  readonly status: number
  readonly code: ApiErrorCode

  constructor(status: number, code: ApiErrorCode, message: string) {
    super(message)
    this.name = 'HttpError'
    this.status = status
    this.code = code
  }
}

/**
 * Best-effort rate limit. State lives in one Worker isolate, so it slows down
 * a single abusive client but is not a hard guarantee. The free Gemini quota
 * is the real ceiling.
 */
const RATE_LIMIT = { windowMs: 10 * 60_000, maxRequests: 20 }
const hits = new Map<string, number[]>()

export function isRateLimited(clientId: string, now: number): boolean {
  const recent = (hits.get(clientId) ?? []).filter((time) => now - time < RATE_LIMIT.windowMs)
  if (recent.length >= RATE_LIMIT.maxRequests) {
    hits.set(clientId, recent)
    return true
  }
  recent.push(now)
  hits.set(clientId, recent)
  if (hits.size > 5_000) hits.clear()
  return false
}

export function resetRateLimit(): void {
  hits.clear()
}

function allowedOrigins(env: Env): string[] {
  return (env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin !== '')
}

function corsHeaders(origin: string | null, env: Env): Record<string, string> {
  if (origin === null || !allowedOrigins(env).includes(origin)) return {}
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }
}

function json(body: unknown, status: number, headers: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers },
  })
}

async function readJsonBody(request: Request): Promise<Record<string, unknown>> {
  const declared = Number(request.headers.get('Content-Length') ?? '0')
  if (declared > MAX_BODY_BYTES) {
    throw new HttpError(413, 'payload_too_large', 'The request is too large.')
  }
  const text = await request.text()
  if (text.length > MAX_BODY_BYTES) {
    throw new HttpError(413, 'payload_too_large', 'The request is too large.')
  }
  let body: unknown
  try {
    body = JSON.parse(text)
  } catch {
    throw new HttpError(400, 'bad_request', 'The request body must be JSON.')
  }
  if (!isRecord(body))
    throw new HttpError(400, 'bad_request', 'The request body must be an object.')
  return body
}

function parseImages(value: unknown): ApiImage[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new HttpError(400, 'bad_request', 'Send at least one image.')
  }
  if (value.length > API_LIMITS.maxImages) {
    throw new HttpError(400, 'bad_request', `Send at most ${String(API_LIMITS.maxImages)} images.`)
  }
  return value.map((item): ApiImage => {
    if (
      !isRecord(item) ||
      typeof item.data !== 'string' ||
      typeof item.mimeType !== 'string' ||
      !IMAGE_TYPES.includes(item.mimeType) ||
      item.data === '' ||
      !/^[A-Za-z0-9+/]+={0,2}$/.test(item.data)
    ) {
      throw new HttpError(400, 'bad_request', 'Each image needs a mimeType and base64 data.')
    }
    if (item.data.length > API_LIMITS.maxImageChars) {
      throw new HttpError(413, 'payload_too_large', 'An image is too large.')
    }
    return { mimeType: item.mimeType as ApiImage['mimeType'], data: item.data }
  })
}

function requireApiKey(env: Env): string {
  if (!env.GEMINI_API_KEY) {
    throw new HttpError(503, 'not_configured', 'The AI service is not set up yet.')
  }
  return env.GEMINI_API_KEY
}

async function handleDetect(request: Request, env: Env): Promise<DetectResponse> {
  const body = await readJsonBody(request)
  const images = parseImages(body.images)
  const result = await generateJson({
    apiKey: requireApiKey(env),
    model: env.GEMINI_MODEL ?? DEFAULT_MODEL,
    system: DETECT_SYSTEM,
    prompt: DETECT_PROMPT,
    images,
    schema: DETECT_SCHEMA,
  })
  return { ingredients: parseIngredientNames(isRecord(result) ? result.ingredients : null) }
}

async function handleRecipes(request: Request, env: Env): Promise<RecipesResponse> {
  const body = await readJsonBody(request)
  const ingredients = parseIngredientNames(body.ingredients)
  if (ingredients.length === 0) {
    throw new HttpError(400, 'bad_request', 'Send at least one ingredient.')
  }
  const diet = parseDiet(body.diet)
  const result = await generateJson({
    apiKey: requireApiKey(env),
    model: env.GEMINI_MODEL ?? DEFAULT_MODEL,
    system: RECIPES_SYSTEM,
    prompt: recipesPrompt(ingredients, diet),
    schema: RECIPES_SCHEMA,
  })
  return { recipes: parseRecipes(isRecord(result) ? result.recipes : null) }
}

async function route(request: Request, env: Env): Promise<unknown> {
  const { pathname } = new URL(request.url)
  const path = pathname.replace(/\/+$/, '') || '/'

  if (request.method === 'GET' && (path === '/' || path === '/health')) {
    return { ok: true, configured: Boolean(env.GEMINI_API_KEY) }
  }
  if (path !== '/detect' && path !== '/recipes') {
    throw new HttpError(404, 'not_found', 'Not found.')
  }
  if (request.method !== 'POST') throw new HttpError(400, 'bad_request', 'Use POST.')

  const clientId = request.headers.get('CF-Connecting-IP') ?? 'unknown'
  if (isRateLimited(clientId, Date.now())) {
    throw new HttpError(429, 'rate_limited', 'Too many requests. Try again in a few minutes.')
  }
  return path === '/detect' ? handleDetect(request, env) : handleRecipes(request, env)
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin')
    const cors = corsHeaders(origin, env)

    try {
      // Browsers send an Origin header; reject pages that are not on the list.
      if (origin !== null && !allowedOrigins(env).includes(origin)) {
        throw new HttpError(403, 'forbidden', 'This origin is not allowed.')
      }
      if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })
      return json(await route(request, env), 200, cors)
    } catch (error) {
      let status = 500
      let code: ApiErrorCode = 'upstream_error'
      let message = 'Something went wrong.'
      if (error instanceof HttpError) {
        ;({ status, code, message } = error)
      } else if (error instanceof UpstreamError) {
        status = error.status
        code = error.status === 429 ? 'rate_limited' : 'upstream_error'
        message = error.message
      } else {
        console.error('Unhandled error', error)
      }
      const body: ApiErrorBody = { error: { code, message } }
      return json(body, status, cors)
    }
  },
}

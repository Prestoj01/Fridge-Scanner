// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { extractText, parseJsonLoosely } from './gemini'
import worker, { type Env } from './index'
import { checkLimits, isRateLimited, resetRateLimit, type RateLimiter } from './limits'

const ORIGIN = 'https://example.github.io'
const env: Env = { GEMINI_API_KEY: 'test-key', ALLOWED_ORIGINS: ORIGIN }

function post(path: string, body: unknown, origin: string | null = ORIGIN): Request {
  return new Request(`https://api.test${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(origin === null ? {} : { Origin: origin }) },
    body: JSON.stringify(body),
  })
}

/** Makes the next Gemini call reply with the given JSON payload. */
function mockGemini(payload: unknown, status = 200) {
  const fetchMock = vi.fn(() =>
    Promise.resolve(
      new Response(JSON.stringify({ output_text: JSON.stringify(payload) }), { status }),
    ),
  )
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

async function errorCode(response: Response): Promise<string> {
  const body = (await response.json()) as { error: { code: string } }
  return body.error.code
}

const image = { mimeType: 'image/jpeg', data: 'aGVsbG8=' }

beforeEach(() => {
  resetRateLimit()
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('routing and CORS', () => {
  it('reports health and whether a key is configured', async () => {
    const response = await worker.fetch(new Request('https://api.test/health'), {})
    expect(await response.json()).toEqual({ ok: true, configured: false })
  })

  it('answers preflight for an allowed origin', async () => {
    const request = new Request('https://api.test/detect', {
      method: 'OPTIONS',
      headers: { Origin: ORIGIN },
    })
    const response = await worker.fetch(request, env)
    expect(response.status).toBe(204)
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(ORIGIN)
  })

  it('rejects origins that are not on the list', async () => {
    const response = await worker.fetch(post('/recipes', {}, 'https://evil.example'), env)
    expect(response.status).toBe(403)
    expect(response.headers.get('Access-Control-Allow-Origin')).toBeNull()
  })

  it('returns 404 for unknown paths', async () => {
    const response = await worker.fetch(post('/nope', {}), env)
    expect(response.status).toBe(404)
  })

  it('returns 503 when no API key is set', async () => {
    const response = await worker.fetch(post('/recipes', { ingredients: ['eggs'] }), {
      ALLOWED_ORIGINS: ORIGIN,
    })
    expect(response.status).toBe(503)
    expect(await errorCode(response)).toBe('not_configured')
  })
})

describe('POST /detect', () => {
  it('sends images to Gemini and returns clean ingredient names', async () => {
    const fetchMock = mockGemini({ ingredients: [' Eggs', 'eggs', 'Baby Spinach'] })
    const response = await worker.fetch(post('/detect', { images: [image] }), env)

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ ingredients: ['eggs', 'baby spinach'] })

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toContain('/v1beta/interactions')
    expect(new Headers(init.headers).get('x-goog-api-key')).toBe('test-key')
    const sent = JSON.parse(init.body as string) as { input: { type: string }[]; store: boolean }
    expect(sent.input.map((part) => part.type)).toEqual(['text', 'image'])
    expect(sent.store).toBe(false)
  })

  it('rejects missing, malformed, and too many images', async () => {
    const tooMany = Array.from({ length: 5 }, () => image)
    for (const images of [
      [],
      [{ mimeType: 'image/gif', data: 'aGk=' }],
      [{ data: '!!' }],
      tooMany,
    ]) {
      const response = await worker.fetch(post('/detect', { images }), env)
      expect(response.status).toBe(400)
    }
  })

  it('rejects a body that is not JSON', async () => {
    const request = new Request('https://api.test/detect', { method: 'POST', body: 'nope' })
    expect((await worker.fetch(request, env)).status).toBe(400)
  })
})

describe('POST /recipes', () => {
  const recipe = {
    title: 'Spinach omelette',
    summary: 'Fast and filling.',
    timeMinutes: 10,
    servings: 1,
    ingredients: ['2 eggs', '1 handful spinach'],
    usedIngredients: ['eggs', 'spinach'],
    missingIngredients: [],
    steps: ['Whisk the eggs.', 'Cook with the spinach for 3 minutes.'],
    healthNote: 'High in protein.',
    nutrition: { calories: 250, protein: 18, carbs: 6, fat: 16 },
  }

  it('returns validated recipes and passes the diet to the model', async () => {
    const fetchMock = mockGemini({ recipes: [recipe, { title: 'Broken' }] })
    const response = await worker.fetch(
      post('/recipes', { ingredients: ['Eggs', 'spinach'], diet: 'vegetarian' }),
      env,
    )

    expect(await response.json()).toEqual({ recipes: [recipe] })
    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    const sent = JSON.parse(init.body as string) as { input: { text: string }[] }
    expect(sent.input[0]?.text).toContain('- eggs')
    expect(sent.input[0]?.text).toContain('must be vegetarian')
    expect(sent.input[0]?.text).toContain('for 2 servings')
  })

  it('passes time, avoided foods, cuisine, servings, and seen titles to the model', async () => {
    const fetchMock = mockGemini({ recipes: [] })
    await worker.fetch(
      post('/recipes', {
        ingredients: ['rice'],
        diet: 'any',
        maxMinutes: 15,
        avoid: ['nuts', 'dairy', 'plutonium'],
        cuisine: 'indian',
        servings: 4,
        exclude: ['Fried rice', 42, ''],
      }),
      env,
    )
    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    const text = (JSON.parse(init.body as string) as { input: { text: string }[] }).input[0]?.text
    expect(text).toContain('15 minutes or less')
    expect(text).toContain('Do not use any dairy, nuts')
    expect(text).not.toContain('plutonium')
    expect(text).toContain('Indian cooking')
    expect(text).toContain('for 4 servings')
    expect(text).toContain('- Fried rice')
  })

  it('requires at least one ingredient', async () => {
    const response = await worker.fetch(post('/recipes', { ingredients: [] }), env)
    expect(response.status).toBe(400)
  })

  it('maps a Gemini quota error to 429 without leaking details', async () => {
    mockGemini({ secret: 'provider detail' }, 429)
    const response = await worker.fetch(post('/recipes', { ingredients: ['eggs'] }), env)
    expect(response.status).toBe(429)
    expect(await response.text()).not.toContain('provider detail')
  })

  it('maps other Gemini failures to 502', async () => {
    mockGemini({}, 500)
    const response = await worker.fetch(post('/recipes', { ingredients: ['eggs'] }), env)
    expect(response.status).toBe(502)
    expect(await errorCode(response)).toBe('upstream_error')
  })
})

describe('recipe cache', () => {
  const recipe = {
    title: 'Rice bowl',
    summary: '',
    timeMinutes: 10,
    servings: 2,
    ingredients: ['1 cup rice'],
    usedIngredients: ['rice'],
    missingIngredients: [],
    steps: ['Cook the rice.'],
    healthNote: '',
    nutrition: { calories: 300, protein: 6, carbs: 60, fat: 2 },
  }

  function memoryCache() {
    const store = new Map<string, string>()
    return {
      store,
      match: (url: string) =>
        Promise.resolve(store.has(url) ? new Response(store.get(url)) : undefined),
      put: async (url: string, response: Response) => {
        store.set(url, await response.text())
      },
    }
  }

  it('answers the same request from the cache without calling Gemini again', async () => {
    const cache = memoryCache()
    vi.stubGlobal('caches', { default: cache })
    const fetchMock = mockGemini({ recipes: [recipe] })

    const first = await worker.fetch(post('/recipes', { ingredients: ['Rice', 'eggs'] }), env)
    expect(await first.json()).toEqual({ recipes: [recipe] })
    // Same pantry in a different order and case is the same request.
    const second = await worker.fetch(post('/recipes', { ingredients: ['eggs', 'rice'] }), env)
    expect(await second.json()).toEqual({ recipes: [recipe] })
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(cache.store.size).toBe(1)
  })

  it('treats different preferences as a different request', async () => {
    vi.stubGlobal('caches', { default: memoryCache() })
    const fetchMock = mockGemini({ recipes: [recipe] })
    await worker.fetch(post('/recipes', { ingredients: ['rice'] }), env)
    await worker.fetch(post('/recipes', { ingredients: ['rice'], diet: 'vegan' }), env)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('does not cache empty replies', async () => {
    const cache = memoryCache()
    vi.stubGlobal('caches', { default: cache })
    mockGemini({ recipes: [] })
    await worker.fetch(post('/recipes', { ingredients: ['rice'] }), env)
    expect(cache.store.size).toBe(0)
  })
})

describe('rate limiting', () => {
  it('blocks a client after 20 requests in the window, then recovers', () => {
    for (let i = 0; i < 20; i++) expect(isRateLimited('1.2.3.4', 1_000)).toBe(false)
    expect(isRateLimited('1.2.3.4', 2_000)).toBe(true)
    expect(isRateLimited('5.6.7.8', 2_000)).toBe(false)
    expect(isRateLimited('1.2.3.4', 1_000 + 10 * 60_000)).toBe(false)
  })

  it('gives photo detection a smaller budget than recipes', () => {
    for (let i = 0; i < 10; i++) expect(isRateLimited('1.2.3.4', 1_000, 'detect')).toBe(false)
    expect(isRateLimited('1.2.3.4', 1_000, 'detect')).toBe(true)
    expect(isRateLimited('1.2.3.4', 1_000, 'recipes')).toBe(false)
  })

  const limiter = (success: boolean): RateLimiter & { keys: string[] } => {
    const keys: string[] = []
    return {
      keys,
      limit: ({ key }) => {
        keys.push(key)
        return Promise.resolve({ success })
      },
    }
  }

  it('uses the Cloudflare limiters per client and for everyone', async () => {
    const client = limiter(true)
    const global = limiter(false)
    const result = await checkLimits(
      { CLIENT_LIMITER: client, GLOBAL_LIMITER: global },
      '9.9.9.9',
      'recipes',
      1_000,
    )
    expect(result).toBe('global')
    expect(client.keys).toEqual(['9.9.9.9'])
    expect(global.keys).toEqual(['all'])
  })

  it('only checks the detect limiter for photos', async () => {
    const detect = limiter(false)
    expect(await checkLimits({ DETECT_LIMITER: detect }, 'a', 'recipes', 1_000)).toBe('ok')
    expect(await checkLimits({ DETECT_LIMITER: detect }, 'a', 'detect', 1_000)).toBe('client')
  })

  it('lets requests through if a limiter fails', async () => {
    const broken: RateLimiter = { limit: () => Promise.reject(new Error('down')) }
    expect(await checkLimits({ CLIENT_LIMITER: broken }, 'a', 'recipes', 1_000)).toBe('ok')
  })

  it('returns 429 from the endpoint when a limiter refuses', async () => {
    const response = await worker.fetch(post('/recipes', { ingredients: ['eggs'] }), {
      ...env,
      GLOBAL_LIMITER: limiter(false),
    })
    expect(response.status).toBe(429)
    expect(await errorCode(response)).toBe('rate_limited')
  })
})

describe('Gemini response parsing', () => {
  it('prefers output_text', () => {
    expect(extractText({ output_text: '{"a":1}' })).toBe('{"a":1}')
  })

  it('falls back to text parts in model_output steps, skipping thoughts', () => {
    const body = {
      steps: [
        { type: 'thought', summary: [{ type: 'text', text: 'thinking' }] },
        {
          type: 'model_output',
          content: [
            { type: 'text', text: '{"a":' },
            { type: 'text', text: '1}' },
          ],
        },
      ],
    }
    expect(extractText(body)).toBe('{"a":1}')
  })

  it('returns null when there is no text', () => {
    expect(extractText({ steps: [] })).toBeNull()
  })

  it('parses JSON wrapped in a code fence', () => {
    expect(parseJsonLoosely('```json\n{"a":1}\n```')).toEqual({ a: 1 })
    expect(parseJsonLoosely('no json here')).toBeUndefined()
  })
})

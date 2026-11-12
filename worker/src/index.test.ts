// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { extractText, parseJsonLoosely } from './gemini'
import worker, { isRateLimited, resetRateLimit, type Env } from './index'

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

describe('rate limiting', () => {
  it('blocks a client after 20 requests in the window, then recovers', () => {
    for (let i = 0; i < 20; i++) expect(isRateLimited('1.2.3.4', 1_000)).toBe(false)
    expect(isRateLimited('1.2.3.4', 2_000)).toBe(true)
    expect(isRateLimited('5.6.7.8', 2_000)).toBe(false)
    expect(isRateLimited('1.2.3.4', 1_000 + 10 * 60_000)).toBe(false)
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

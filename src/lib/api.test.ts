import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, detectIngredients, fetchRecipes } from './api'

vi.mock('./config', () => ({ API_URL: 'https://api.test' }))

function mockFetch(body: unknown, status = 200) {
  const fetchMock = vi.fn(() => Promise.resolve(new Response(JSON.stringify(body), { status })))
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('detectIngredients', () => {
  it('posts images and returns cleaned names', async () => {
    const fetchMock = mockFetch({ ingredients: ['Eggs', 'eggs', ' Milk '] })
    const names = await detectIngredients([{ mimeType: 'image/jpeg', data: 'aGk=' }])

    expect(names).toEqual(['eggs', 'milk'])
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('https://api.test/detect')
    expect(init.method).toBe('POST')
  })

  it('rejects a reply with the wrong shape', async () => {
    mockFetch({ nope: true })
    await expect(detectIngredients([])).rejects.toMatchObject({ code: 'bad_response' })
  })
})

describe('fetchRecipes', () => {
  it('returns only valid recipes', async () => {
    const recipe = { title: 'Toast', ingredients: ['2 slices bread'], steps: ['Toast it.'] }
    mockFetch({ recipes: [recipe, { title: 'Broken' }] })
    const recipes = await fetchRecipes(['bread'], 'any')
    expect(recipes.map((item) => item.title)).toEqual(['Toast'])
  })

  it('surfaces the error code and message from the API', async () => {
    mockFetch({ error: { code: 'rate_limited', message: 'Slow down.' } }, 429)
    const error = await fetchRecipes(['bread'], 'any').catch((caught: unknown) => caught)
    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ code: 'rate_limited', message: 'Slow down.' })
  })

  it('maps an unknown error body to upstream_error', async () => {
    mockFetch({ message: 'bad gateway' }, 502)
    await expect(fetchRecipes(['bread'], 'any')).rejects.toMatchObject({ code: 'upstream_error' })
  })

  it('maps a network failure to a friendly error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new TypeError('Failed to fetch'))),
    )
    await expect(fetchRecipes(['bread'], 'any')).rejects.toMatchObject({ code: 'network' })
  })
})

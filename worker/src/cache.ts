/**
 * Caches recipe replies in Cloudflare's edge cache (free, per location), so
 * the same pantry and preferences do not spend Gemini quota twice.
 */
import type { RecipesResponse } from '../../src/types/api'

const TTL_SECONDS = 24 * 60 * 60
const CACHE_ORIGIN = 'https://recipes-cache.internal'

/** Cloudflare exposes its edge cache as `caches.default`. */
function edgeCache(): Cache | null {
  const storage = (globalThis as { caches?: CacheStorage & { default?: Cache } }).caches
  return storage?.default ?? null
}

async function cacheUrl(key: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(key))
  const hex = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0'))
  return `${CACHE_ORIGIN}/recipes/${hex.join('')}`
}

export async function readCachedRecipes(key: string): Promise<RecipesResponse | null> {
  const cache = edgeCache()
  if (!cache) return null
  try {
    const hit = await cache.match(await cacheUrl(key))
    return hit ? ((await hit.json()) as RecipesResponse) : null
  } catch {
    return null
  }
}

export async function writeCachedRecipes(key: string, value: RecipesResponse): Promise<void> {
  const cache = edgeCache()
  if (!cache || value.recipes.length === 0) return
  try {
    const response = new Response(JSON.stringify(value), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': `public, max-age=${String(TTL_SECONDS)}`,
      },
    })
    await cache.put(await cacheUrl(key), response)
  } catch {
    // Caching is an optimization; a failure just means the next request asks the model.
  }
}

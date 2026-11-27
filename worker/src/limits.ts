/**
 * Rate limits, in layers:
 *
 * 1. Cloudflare's Rate Limiting bindings (free on every plan). They count
 *    across all Worker locations, per client and for the whole app.
 * 2. A per-isolate sliding window, used as a backstop and when the bindings
 *    are missing (local dev, tests).
 *
 * Photo detection costs more model work than recipes, so it has a tighter
 * per-client budget.
 */

/** The shape of a `[[ratelimits]]` binding from wrangler.toml. */
export interface RateLimiter {
  limit(options: { key: string }): Promise<{ success: boolean }>
}

export interface LimitBindings {
  /** Per client, per minute. */
  CLIENT_LIMITER?: RateLimiter
  /** Photo detection per client, per minute. */
  DETECT_LIMITER?: RateLimiter
  /** Everyone together, per minute, to protect the shared Gemini quota. */
  GLOBAL_LIMITER?: RateLimiter
}

export type Endpoint = 'detect' | 'recipes'

const WINDOW_MS = 10 * 60_000
const WINDOW_MAX: Record<Endpoint, number> = { recipes: 20, detect: 10 }
const MAX_TRACKED = 5_000
const hits = new Map<string, number[]>()

/** Sliding-window check within one isolate. Records the hit when allowed. */
export function isRateLimited(
  clientId: string,
  now: number,
  endpoint: Endpoint = 'recipes',
): boolean {
  const key = `${endpoint}:${clientId}`
  const recent = (hits.get(key) ?? []).filter((time) => now - time < WINDOW_MS)
  if (recent.length >= WINDOW_MAX[endpoint]) {
    hits.set(key, recent)
    return true
  }
  recent.push(now)
  // Drop the oldest entry instead of clearing everything, so a flood of new
  // clients cannot reset everyone's counters.
  if (!hits.has(key) && hits.size >= MAX_TRACKED) {
    const oldest = hits.keys().next()
    if (!oldest.done) hits.delete(oldest.value)
  }
  hits.set(key, recent)
  return false
}

export function resetRateLimit(): void {
  hits.clear()
}

async function allowed(limiter: RateLimiter | undefined, key: string): Promise<boolean> {
  if (!limiter) return true
  try {
    return (await limiter.limit({ key })).success
  } catch {
    // A limiter outage should not take the app down; the isolate window still applies.
    return true
  }
}

export type LimitResult = 'ok' | 'client' | 'global'

/** Runs every layer and says which one, if any, refused the request. */
export async function checkLimits(
  bindings: LimitBindings,
  clientId: string,
  endpoint: Endpoint,
  now: number,
): Promise<LimitResult> {
  if (isRateLimited(clientId, now, endpoint)) return 'client'
  if (!(await allowed(bindings.CLIENT_LIMITER, clientId))) return 'client'
  if (endpoint === 'detect' && !(await allowed(bindings.DETECT_LIMITER, clientId))) return 'client'
  if (!(await allowed(bindings.GLOBAL_LIMITER, 'all'))) return 'global'
  return 'ok'
}

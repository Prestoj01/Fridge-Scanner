/** Small deterministic helpers for organic, per-item variety. */

/** Stable 32-bit hash of a string (FNV-1a). */
export function hashString(text: string): number {
  let hash = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

/** Picks an item from a non-empty list based on a seed string, so the same seed always gets the same item. */
export function pick<T>(seed: string, items: readonly [T, ...T[]]): T {
  return items[hashString(seed) % items.length] ?? items[0]
}

/** A stable number in [0, 1) for a seed string. */
export function unit(seed: string): number {
  return (hashString(seed) % 10_000) / 10_000
}

export const TINTS = ['sage', 'peach', 'butter'] as const
export type Tint = (typeof TINTS)[number]

/** A stable soft tint for an item, so the same ingredient always gets the same color. */
export function tintFor(seed: string): Tint {
  return pick(seed, TINTS)
}

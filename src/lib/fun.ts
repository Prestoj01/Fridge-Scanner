/** Small deterministic helpers for playful, per-item variety. */

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

/** A small, stable tilt in degrees between -max and +max for a seed string. */
export function tilt(seed: string, max = 4): number {
  const unit = (hashString(`${seed}:tilt`) % 1000) / 999
  return Math.round((unit * 2 - 1) * max * 10) / 10
}

export const MAGNET_COLORS = ['cherry', 'butter', 'mint', 'sky', 'grape', 'tangerine'] as const
export type MagnetColor = (typeof MAGNET_COLORS)[number]

export function magnetColor(seed: string): MagnetColor {
  return pick(seed, MAGNET_COLORS)
}

import { readStored, writeStored } from './storage'

/**
 * Pantry staples: things most kitchens keep on hand. The ones you tick count
 * as available for every recipe, so they are never listed as missing.
 */
export const STAPLE_OPTIONS = [
  'olive oil',
  'salt',
  'black pepper',
  'garlic',
  'onion',
  'butter',
  'eggs',
  'milk',
  'flour',
  'rice',
  'pasta',
  'oats',
  'soy sauce',
  'vinegar',
  'honey',
  'lemon',
  'canned tomatoes',
  'spices',
] as const

export type Staple = (typeof STAPLE_OPTIONS)[number]

export const DEFAULT_STAPLES: readonly Staple[] = ['olive oil', 'salt', 'black pepper']

const KEY = 'staples'

function parseStaples(value: unknown): Staple[] | null {
  if (!Array.isArray(value)) return null
  return STAPLE_OPTIONS.filter((staple) => value.includes(staple))
}

export function loadStaples(): Staple[] {
  return readStored(KEY, parseStaples) ?? [...DEFAULT_STAPLES]
}

export function saveStaples(staples: readonly Staple[]): void {
  writeStored(KEY, staples)
}

/** Generic words that cover several staples ("oil" for olive oil, "pepper" for black pepper). */
const ALIASES: Partial<Record<Staple, readonly string[]>> = {
  'olive oil': ['oil', 'cooking oil', 'vegetable oil'],
  'black pepper': ['pepper', 'ground pepper'],
  salt: ['sea salt', 'kosher salt'],
  spices: ['cumin', 'paprika', 'chili powder', 'oregano', 'cinnamon', 'spice'],
}

/** Words that describe a staple without making it a different food. */
const DESCRIPTORS = new Set([
  'fresh',
  'large',
  'small',
  'red',
  'white',
  'yellow',
  'brown',
  'whole',
  'plain',
  'dried',
  'ground',
  'minced',
  'unsalted',
  'salted',
  'extra',
  'virgin',
  'all-purpose',
  'low-sodium',
  'light',
])

function sameFood(name: string, term: string): boolean {
  if (name === term || name === `${term}s` || name === `${term}es`) return true
  if (term.endsWith('s') && name === term.slice(0, -1)) return true
  // "red onion" or "extra virgin olive oil", but not "coconut milk" or "bell pepper".
  if (!name.endsWith(` ${term}`)) return false
  return name
    .slice(0, -term.length - 1)
    .split(/\s+/)
    .every((word) => DESCRIPTORS.has(word))
}

/** True when an ingredient is covered by one of the ticked staples. */
export function isCoveredByStaples(name: string, staples: readonly Staple[]): boolean {
  const clean = name.trim().toLowerCase().replace(/\s+/g, ' ')
  return staples.some((staple) =>
    [staple, ...(ALIASES[staple] ?? [])].some((term) => sameFood(clean, term)),
  )
}

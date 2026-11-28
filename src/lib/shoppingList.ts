import { groupByAisle } from './aisles'
import { normalizeIngredientName } from './ingredients'
import { readStored, writeStored } from './storage'
import { isRecord } from './validate'

const KEY = 'shopping-list'
const MAX_ITEMS = 100

export interface ShoppingItem {
  id: string
  name: string
  checked: boolean
  /** The recipe that needed it, if any. */
  forRecipe: string | null
}

function parseList(value: unknown): ShoppingItem[] | null {
  if (!Array.isArray(value)) return null
  return value
    .flatMap((item): ShoppingItem[] => {
      if (!isRecord(item) || typeof item.id !== 'string' || typeof item.name !== 'string') return []
      const name = normalizeIngredientName(item.name).slice(0, 60)
      if (name === '') return []
      return [
        {
          id: item.id,
          name,
          checked: item.checked === true,
          forRecipe: typeof item.forRecipe === 'string' ? item.forRecipe.slice(0, 120) : null,
        },
      ]
    })
    .slice(0, MAX_ITEMS)
}

export function loadShoppingList(): ShoppingItem[] {
  return readStored(KEY, parseList) ?? []
}

export function storeShoppingList(items: readonly ShoppingItem[]): void {
  writeStored(KEY, items)
}

/** Adds names that are not on the list yet; re-opens ones that were checked off. */
export function addToList(
  items: readonly ShoppingItem[],
  names: readonly string[],
  forRecipe: string | null,
): ShoppingItem[] {
  const next = [...items]
  for (const raw of names) {
    const name = normalizeIngredientName(raw)
    if (name === '') continue
    const existing = next.findIndex((item) => item.name === name)
    const found = next[existing]
    if (found) {
      if (found.checked) next[existing] = { ...found, checked: false }
      continue
    }
    next.push({ id: crypto.randomUUID(), name, checked: false, forRecipe })
  }
  return next.slice(0, MAX_ITEMS)
}

export function isOnList(items: readonly ShoppingItem[], names: readonly string[]): boolean {
  const open = new Set(items.filter((item) => !item.checked).map((item) => item.name))
  return names.every((name) => open.has(normalizeIngredientName(name)))
}

/** Plain text for copying or sharing: open items, grouped by store aisle. */
export function listAsText(items: readonly ShoppingItem[]): string {
  const groups = groupByAisle(items.filter((item) => !item.checked))
  const lines = ['Shopping list']
  for (const group of groups) {
    lines.push('', group.aisle.toUpperCase(), ...group.items.map((item) => `• ${item.name}`))
  }
  return lines.join('\n')
}

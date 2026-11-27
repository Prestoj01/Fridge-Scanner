import { createContext, useContext } from 'react'
import type { ShoppingItem } from './shoppingList'

export interface ShoppingApi {
  items: readonly ShoppingItem[]
  add: (names: readonly string[], forRecipe: string | null) => void
  toggle: (id: string) => void
  remove: (id: string) => void
  clearChecked: () => void
}

export const ShoppingContext = createContext<ShoppingApi | null>(null)

export function useShopping(): ShoppingApi {
  const api = useContext(ShoppingContext)
  if (!api) throw new Error('useShopping must be used inside <ShoppingProvider>')
  return api
}

import { useEffect, useState, type ReactNode } from 'react'
import { ShoppingContext, type ShoppingApi } from '../lib/shoppingContext'
import {
  addToList,
  loadShoppingList,
  storeShoppingList,
  type ShoppingItem,
} from '../lib/shoppingList'

/** Holds the shopping list and keeps it in browser storage. */
export function ShoppingProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<readonly ShoppingItem[]>(loadShoppingList)

  useEffect(() => {
    storeShoppingList(items)
  }, [items])

  const api: ShoppingApi = {
    items,
    add: (names, forRecipe) => {
      setItems((current) => addToList(current, names, forRecipe))
    },
    toggle: (id) => {
      setItems((current) =>
        current.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)),
      )
    },
    remove: (id) => {
      setItems((current) => current.filter((item) => item.id !== id))
    },
    clearChecked: () => {
      setItems((current) => current.filter((item) => !item.checked))
    },
  }
  return <ShoppingContext.Provider value={api}>{children}</ShoppingContext.Provider>
}

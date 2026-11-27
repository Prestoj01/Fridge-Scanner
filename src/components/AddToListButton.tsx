import { Check, Plus } from 'lucide-react'
import { useShopping } from '../lib/shoppingContext'
import { isOnList } from '../lib/shoppingList'
import { Icon } from './Icon'

interface AddToListButtonProps {
  names: readonly string[]
  recipeTitle: string
}

/** Adds a recipe's missing ingredients to the shopping list. */
export function AddToListButton({ names, recipeTitle }: AddToListButtonProps) {
  const { items, add } = useShopping()
  if (isOnList(items, names)) {
    return (
      <a href="#list" className="add-to-list add-to-list--done">
        <Icon icon={Check} size={16} />
        On your shopping list
      </a>
    )
  }
  return (
    <button
      type="button"
      className="add-to-list"
      onClick={() => {
        add(names, recipeTitle)
      }}
    >
      <Icon icon={Plus} size={16} />
      Add {names.length === 1 ? 'it' : `all ${String(names.length)}`} to shopping list
    </button>
  )
}

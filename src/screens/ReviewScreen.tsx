import { ChevronLeft, ListPlus, X } from 'lucide-react'
import { useState, type SyntheticEvent } from 'react'
import { EmptyState } from '../components/EmptyState'
import { Icon } from '../components/Icon'
import type { Diet, Ingredient } from '../types'

interface ReviewScreenProps {
  ingredients: readonly Ingredient[]
  /** How many ingredients the last photo detection found, or null if none ran. */
  detectedCount: number | null
  diet: Diet
  onAddIngredient: (name: string) => void
  onRemoveIngredient: (id: string) => void
  onDietChange: (diet: Diet) => void
  onBack: () => void
  onFindRecipes: () => void
}

const DIETS: readonly { value: Diet; label: string }[] = [
  { value: 'any', label: 'Anything' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
]

function plural(count: number, word: string): string {
  return `${String(count)} ${word}${count === 1 ? '' : 's'}`
}

function headline(count: number, detectedCount: number | null): string {
  if (detectedCount !== null && detectedCount > 0) {
    return `We spotted ${plural(detectedCount, 'ingredient')}`
  }
  if (count === 0) return 'What do you have to cook with?'
  return `${plural(count, 'ingredient')} on your list`
}

function intro(detectedCount: number | null): string {
  if (detectedCount === null)
    return 'Type an ingredient and press Enter. Separate several with commas.'
  if (detectedCount === 0)
    return 'We could not spot any food in those photos. Type what you have instead.'
  return 'Remove anything we got wrong and add what we missed.'
}

export default function ReviewScreen({
  ingredients,
  detectedCount,
  diet,
  onAddIngredient,
  onRemoveIngredient,
  onDietChange,
  onBack,
  onFindRecipes,
}: ReviewScreenProps) {
  const [draft, setDraft] = useState('')

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()
    // Allow several at once: "eggs, milk, spinach".
    for (const name of draft.split(',')) onAddIngredient(name)
    setDraft('')
  }

  return (
    <section className="screen" aria-labelledby="review-heading">
      <button type="button" className="button button--ghost screen__back" onClick={onBack}>
        <Icon icon={ChevronLeft} />
        Photos
      </button>

      <header className="screen__header">
        <h2 id="review-heading">{headline(ingredients.length, detectedCount)}</h2>
        <p className="screen__intro">{intro(detectedCount)}</p>
      </header>

      <form className="input-group" onSubmit={handleSubmit}>
        <input
          type="text"
          value={draft}
          placeholder="eggs, spinach, rice"
          aria-label="Ingredient name"
          autoComplete="off"
          enterKeyHint="done"
          maxLength={200}
          onChange={(event) => {
            setDraft(event.target.value)
          }}
        />
        <button type="submit" className="button" disabled={draft.trim() === ''}>
          Add
        </button>
      </form>

      {ingredients.length === 0 ? (
        <EmptyState
          icon={ListPlus}
          title="Your list is empty"
          description="Start with a protein, a vegetable, and a grain for the best matches."
        />
      ) : (
        <ul className="chip-list" aria-label="Your ingredients">
          {ingredients.map((ingredient) => (
            <li key={ingredient.id} className="chip">
              {ingredient.name}
              <button
                type="button"
                aria-label={`Remove ${ingredient.name}`}
                onClick={() => {
                  onRemoveIngredient(ingredient.id)
                }}
              >
                <Icon icon={X} size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <fieldset className="segmented">
        <legend>Diet</legend>
        <div className="segmented__options">
          {DIETS.map((option) => (
            <label key={option.value} className="segmented__option">
              <input
                type="radio"
                name="diet"
                value={option.value}
                checked={diet === option.value}
                className="visually-hidden"
                onChange={() => {
                  onDietChange(option.value)
                }}
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="screen__actions">
        <button
          type="button"
          className="button button--primary"
          disabled={ingredients.length === 0}
          onClick={onFindRecipes}
        >
          Find recipes
        </button>
      </div>
    </section>
  )
}

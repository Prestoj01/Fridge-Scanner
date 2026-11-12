import { useState, type SyntheticEvent } from 'react'
import { EmptyState } from '../components/EmptyState'
import { Notice } from '../components/Notice'
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
  { value: 'any', label: 'No preference' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
]

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
      <h2 id="review-heading">Review ingredients</h2>
      <p className="screen__intro">Confirm what you have. Add anything missing, remove mistakes.</p>

      {detectedCount !== null && (
        <Notice>
          {detectedCount === 0
            ? 'We could not spot any food in those photos. Add your ingredients below.'
            : `Found ${String(detectedCount)} ${detectedCount === 1 ? 'ingredient' : 'ingredients'} in your photos. Check the list before continuing.`}
        </Notice>
      )}

      <form className="add-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={draft}
          placeholder="e.g. eggs, spinach"
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
          icon="🥕"
          title="No ingredients yet"
          description="Type what you have above. Separate several with commas."
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
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <label className="field">
        <span>Diet</span>
        <select
          value={diet}
          onChange={(event) => {
            const choice = DIETS.find((option) => option.value === event.target.value)
            if (choice) onDietChange(choice.value)
          }}
        >
          {DIETS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <div className="screen__actions">
        <button type="button" className="button" onClick={onBack}>
          Back
        </button>
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

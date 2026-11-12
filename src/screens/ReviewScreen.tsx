import { useState, type SyntheticEvent } from 'react'
import { EmptyState } from '../components/EmptyState'
import type { Ingredient } from '../types'

interface ReviewScreenProps {
  ingredients: readonly Ingredient[]
  onAddIngredient: (name: string) => void
  onRemoveIngredient: (id: string) => void
  onBack: () => void
  onNext: () => void
}

export default function ReviewScreen({
  ingredients,
  onAddIngredient,
  onRemoveIngredient,
  onBack,
  onNext,
}: ReviewScreenProps) {
  const [draft, setDraft] = useState('')

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()
    onAddIngredient(draft)
    setDraft('')
  }

  return (
    <section className="screen" aria-labelledby="review-heading">
      <h2 id="review-heading">Review ingredients</h2>
      <p className="screen__intro">Confirm what you have. Add anything missing, remove mistakes.</p>

      <form className="add-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={draft}
          placeholder="e.g. spinach"
          aria-label="Ingredient name"
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
          description="Automatic detection is coming soon. For now, add ingredients by hand above."
        />
      ) : (
        <ul className="chip-list">
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

      <div className="screen__actions">
        <button type="button" className="button" onClick={onBack}>
          Back
        </button>
        <button type="button" className="button button--primary" onClick={onNext}>
          Find recipes
        </button>
      </div>
    </section>
  )
}

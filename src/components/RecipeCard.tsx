import type { Recipe } from '../types'

interface RecipeCardProps {
  recipe: Recipe
  /** Open the first card so the user sees a full recipe right away. */
  defaultOpen?: boolean
}

export function RecipeCard({ recipe, defaultOpen = false }: RecipeCardProps) {
  return (
    <article className="recipe-card">
      <h3>{recipe.title}</h3>
      {recipe.summary !== '' && <p className="recipe-card__summary">{recipe.summary}</p>}

      <ul className="recipe-card__meta" aria-label="Recipe details">
        <li>⏱ {recipe.timeMinutes} min</li>
        <li>
          🍽 {recipe.servings} {recipe.servings === 1 ? 'serving' : 'servings'}
        </li>
        <li>
          {recipe.missingIngredients.length === 0
            ? '✓ You have everything'
            : `🛒 ${String(recipe.missingIngredients.length)} to buy`}
        </li>
      </ul>

      {recipe.missingIngredients.length > 0 && (
        <p className="recipe-card__missing">
          <strong>You still need:</strong> {recipe.missingIngredients.join(', ')}
        </p>
      )}

      <details open={defaultOpen}>
        <summary>Ingredients and steps</summary>
        <h4>Ingredients</h4>
        <ul>
          {recipe.ingredients.map((line, index) => (
            <li key={index}>{line}</li>
          ))}
        </ul>
        <h4>Steps</h4>
        <ol>
          {recipe.steps.map((line, index) => (
            <li key={index}>{line}</li>
          ))}
        </ol>
      </details>

      {recipe.healthNote !== '' && (
        <p className="recipe-card__health">
          <span aria-hidden="true">💚</span> {recipe.healthNote}
        </p>
      )}
    </article>
  )
}

import { Check, ChevronDown, Clock, Leaf, ShoppingBasket, Users } from 'lucide-react'
import type { Recipe } from '../types'
import { Icon } from './Icon'

interface RecipeCardProps {
  recipe: Recipe
  /** Open the first card so the user sees a full recipe right away. */
  defaultOpen?: boolean
}

export function RecipeCard({ recipe, defaultOpen = false }: RecipeCardProps) {
  const ready = recipe.missingIngredients.length === 0

  return (
    <article className="recipe-card">
      <header className="recipe-card__header">
        <h3>{recipe.title}</h3>
        {recipe.summary !== '' && <p className="recipe-card__summary">{recipe.summary}</p>}
      </header>

      <dl className="recipe-card__meta">
        <div>
          <dt className="visually-hidden">Time</dt>
          <Icon icon={Clock} size={16} />
          <dd>{recipe.timeMinutes} min</dd>
        </div>
        <div>
          <dt className="visually-hidden">Serves</dt>
          <Icon icon={Users} size={16} />
          <dd>
            {recipe.servings} {recipe.servings === 1 ? 'serving' : 'servings'}
          </dd>
        </div>
      </dl>

      {ready ? (
        <p className="recipe-card__status recipe-card__status--ready">
          <Icon icon={Check} size={16} />
          You have everything
        </p>
      ) : (
        <p className="recipe-card__status recipe-card__status--missing">
          <Icon icon={ShoppingBasket} size={16} />
          Need {recipe.missingIngredients.join(', ')}
        </p>
      )}

      {recipe.healthNote !== '' && (
        <p className="recipe-card__health">
          <Icon icon={Leaf} size={16} />
          {recipe.healthNote}
        </p>
      )}

      <details open={defaultOpen}>
        <summary>
          Ingredients and steps
          <Icon icon={ChevronDown} className="recipe-card__chevron" />
        </summary>
        <div className="recipe-card__body">
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
        </div>
      </details>
    </article>
  )
}

import { EmptyState } from '../components/EmptyState'
import type { Recipe } from '../types'

interface RecipesScreenProps {
  recipes: readonly Recipe[]
  onBack: () => void
  onReset: () => void
}

export default function RecipesScreen({ recipes, onBack, onReset }: RecipesScreenProps) {
  return (
    <section className="screen" aria-labelledby="recipes-heading">
      <h2 id="recipes-heading">Recipes</h2>
      <p className="screen__intro">Healthy ideas based on what you have.</p>

      {recipes.length === 0 ? (
        <EmptyState
          icon="🍳"
          title="No recipes yet"
          description="Recipe suggestions are coming soon. They will appear here with step-by-step instructions."
        />
      ) : (
        <ul className="recipe-list">
          {recipes.map((recipe) => (
            <li key={recipe.id} className="recipe-card">
              <h3>{recipe.title}</h3>
              <p>{recipe.summary}</p>
              <ol>
                {recipe.steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </li>
          ))}
        </ul>
      )}

      <div className="screen__actions">
        <button type="button" className="button" onClick={onBack}>
          Back
        </button>
        <button type="button" className="button button--primary" onClick={onReset}>
          Start over
        </button>
      </div>
    </section>
  )
}

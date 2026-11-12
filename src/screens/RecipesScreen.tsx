import { EmptyState } from '../components/EmptyState'
import { Loading } from '../components/Loading'
import { Notice } from '../components/Notice'
import { RecipeCard } from '../components/RecipeCard'
import type { AsyncState, Recipe } from '../types'

interface RecipesScreenProps {
  recipes: readonly Recipe[]
  generation: AsyncState
  onRetry: () => void
  onUseLibrary: () => void
  onBack: () => void
  onReset: () => void
}

export default function RecipesScreen({
  recipes,
  generation,
  onRetry,
  onUseLibrary,
  onBack,
  onReset,
}: RecipesScreenProps) {
  const fromLibrary = recipes.some((recipe) => recipe.source === 'library')

  return (
    <section className="screen" aria-labelledby="recipes-heading">
      <h2 id="recipes-heading">Recipes</h2>
      <p className="screen__intro">Healthy ideas based on what you have.</p>

      {generation.status === 'loading' && <Loading label="Cooking up ideas…" />}

      {generation.status === 'error' && (
        <>
          <Notice tone="error">{generation.message}</Notice>
          <div className="screen__actions">
            <button type="button" className="button" onClick={onUseLibrary}>
              Use built-in recipes
            </button>
            <button type="button" className="button button--primary" onClick={onRetry}>
              Try again
            </button>
          </div>
        </>
      )}

      {generation.status === 'idle' &&
        (recipes.length === 0 ? (
          <EmptyState
            icon="🍳"
            title="No recipes found"
            description="Nothing matched those ingredients. Go back and add a few more, such as a protein, a vegetable, or a grain."
          />
        ) : (
          <>
            {fromLibrary && <Notice>These recipes come from the built-in library.</Notice>}
            <ul className="recipe-list">
              {recipes.map((recipe, index) => (
                <li key={recipe.id}>
                  <RecipeCard recipe={recipe} defaultOpen={index === 0} />
                </li>
              ))}
            </ul>
          </>
        ))}

      {generation.status !== 'error' && (
        <div className="screen__actions">
          <button type="button" className="button" onClick={onBack}>
            Back
          </button>
          <button
            type="button"
            className="button button--primary"
            disabled={generation.status === 'loading'}
            onClick={onReset}
          >
            Start over
          </button>
        </div>
      )}
      {generation.status === 'error' && (
        <button type="button" className="button button--link" onClick={onBack}>
          Back to ingredients
        </button>
      )}
    </section>
  )
}

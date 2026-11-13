import { ChevronLeft, CookingPot, RotateCcw } from 'lucide-react'
import { EmptyState } from '../components/EmptyState'
import { Icon } from '../components/Icon'
import { Notice } from '../components/Notice'
import { RecipeCard } from '../components/RecipeCard'
import { RecipeSkeleton } from '../components/RecipeSkeleton'
import type { AsyncState, Recipe } from '../types'

interface RecipesScreenProps {
  recipes: readonly Recipe[]
  generation: AsyncState
  onRetry: () => void
  onUseLibrary: () => void
  onBack: () => void
  onReset: () => void
}

function summaryLine(recipes: readonly Recipe[]): string {
  const ready = recipes.filter((recipe) => recipe.missingIngredients.length === 0).length
  const readyText =
    ready === 0
      ? 'Each needs a few extra ingredients.'
      : ready === recipes.length
        ? 'You can make all of them with what you have.'
        : `${String(ready)} use only what you have.`
  return readyText
}

export default function RecipesScreen({
  recipes,
  generation,
  onRetry,
  onUseLibrary,
  onBack,
  onReset,
}: RecipesScreenProps) {
  const back = (
    <button type="button" className="button button--ghost screen__back" onClick={onBack}>
      <Icon icon={ChevronLeft} />
      Ingredients
    </button>
  )

  if (generation.status === 'loading') {
    return (
      <section className="screen" aria-labelledby="recipes-heading" aria-busy="true">
        {back}
        <header className="screen__header">
          <h2 id="recipes-heading">Finding healthy recipes…</h2>
          <p className="screen__intro" role="status">
            Matching your ingredients. This takes a few seconds.
          </p>
        </header>
        <div className="recipe-list">
          <RecipeSkeleton />
          <RecipeSkeleton />
          <RecipeSkeleton />
        </div>
      </section>
    )
  }

  if (generation.status === 'error') {
    return (
      <section className="screen" aria-labelledby="recipes-heading">
        {back}
        <header className="screen__header">
          <h2 id="recipes-heading">We could not get recipes</h2>
        </header>
        <Notice tone="error">{generation.message}</Notice>
        <div className="screen__actions">
          <button type="button" className="button button--primary" onClick={onRetry}>
            Try again
          </button>
          <button type="button" className="button button--ghost" onClick={onUseLibrary}>
            Use built-in recipes
          </button>
        </div>
      </section>
    )
  }

  if (recipes.length === 0) {
    return (
      <section className="screen" aria-labelledby="recipes-heading">
        {back}
        <header className="visually-hidden">
          <h2 id="recipes-heading">Recipes</h2>
        </header>
        <EmptyState
          icon={CookingPot}
          title="No recipes match"
          description="Add a few more ingredients, such as a protein, a vegetable, or a grain."
        >
          <button type="button" className="button button--primary" onClick={onBack}>
            Add ingredients
          </button>
        </EmptyState>
      </section>
    )
  }

  return (
    <section className="screen" aria-labelledby="recipes-heading">
      {back}
      <header className="screen__header">
        <h2 id="recipes-heading">
          {recipes.length} healthy {recipes.length === 1 ? 'recipe' : 'recipes'} for you
        </h2>
        <p className="screen__intro">{summaryLine(recipes)}</p>
        {recipes.some((recipe) => recipe.source === 'library') && (
          <p className="screen__source">From the built-in library</p>
        )}
      </header>
      <ul className="recipe-list">
        {recipes.map((recipe, index) => (
          <li key={recipe.id}>
            <RecipeCard recipe={recipe} defaultOpen={index === 0} />
          </li>
        ))}
      </ul>
      <div className="screen__actions">
        <button type="button" className="button button--ghost" onClick={onReset}>
          <Icon icon={RotateCcw} size={16} />
          Start over
        </button>
      </div>
    </section>
  )
}

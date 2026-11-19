import { CookingPot, RotateCcw } from 'lucide-react'
import { motion } from 'motion/react'
import { EmptyState } from '../components/EmptyState'
import { Icon } from '../components/Icon'
import { Notice } from '../components/Notice'
import { RevealText } from '../components/RevealText'
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
  if (generation.status === 'loading') {
    return (
      <section className="screen" aria-labelledby="recipes-heading" aria-busy="true">
        <header className="screen__header">
          <h2 id="recipes-heading">
            <RevealText text="Finding *healthy* recipes…" />
          </h2>
          <p className="screen__intro" role="status">
            Matching your ingredients. This takes a few seconds.
          </p>
        </header>
        <div className="recipe-list">
          <RecipeSkeleton />
          <RecipeSkeleton />
        </div>
      </section>
    )
  }

  if (generation.status === 'error') {
    return (
      <section className="screen" aria-labelledby="recipes-heading">
        <header className="screen__header">
          <h2 id="recipes-heading">
            <RevealText text="We could not *get recipes*" />
          </h2>
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
      <header className="screen__header">
        <h2 id="recipes-heading">
          <RevealText
            text={`${String(recipes.length)} healthy *${recipes.length === 1 ? 'recipe' : 'recipes'}* for you`}
          />
        </h2>
        <p className="screen__intro">{summaryLine(recipes)}</p>
        {recipes.some((recipe) => recipe.source === 'library') && (
          <p className="screen__source">From the built-in library</p>
        )}
      </header>
      <ul className="recipe-list">
        {recipes.map((recipe, index) => (
          <motion.li
            key={recipe.id}
            initial={{ opacity: 0, y: 70, clipPath: 'inset(14% 8% 0% 8% round 28px)' }}
            whileInView={{ opacity: 1, y: 0, clipPath: 'inset(0% 0% 0% 0% round 28px)' }}
            viewport={{ once: true, amount: 'some' }}
            transition={{
              duration: 0.9,
              ease: [0.2, 0.8, 0.2, 1],
              delay: index < 2 ? 0.35 + index * 0.15 : 0,
            }}
          >
            <RecipeCard recipe={recipe} index={index} defaultOpen={index === 0} />
          </motion.li>
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

import { RotateCcw } from 'lucide-react'
import { m, useReducedMotion } from 'motion/react'
import { EmptyState } from '../components/EmptyState'
import { Icon } from '../components/Icon'
import { Notice } from '../components/Notice'
import { RevealText } from '../components/RevealText'
import { useScreenFocus } from '../hooks/useScreenFocus'
import { MixingBowl } from '../components/MixingBowl'
import { RecipeCard } from '../components/RecipeCard'
import { RecipeSkeleton } from '../components/RecipeSkeleton'
import type { Refining } from '../hooks/useScanFlow'
import type { AsyncState, Recipe } from '../types'

interface RecipesScreenProps {
  recipes: readonly Recipe[]
  /** The user's ingredient names, for the loading scene. */
  ingredientNames: readonly string[]
  generation: AsyncState
  onRetry: () => void
  onUseLibrary: () => void
  onBack: () => void
  onReset: () => void
  refining: Refining
  refineNote: string | null
  /** Shown when the built-in library stands in for the AI. */
  fallbackNote?: string | null
  onSwap: (id: string) => void
  onMore: () => void
}

/** Matches the two-column recipe layout in index.css. */
const TWO_UP = '(min-width: 64rem)'

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
  ingredientNames,
  generation,
  onRetry,
  onUseLibrary,
  onBack,
  onReset,
  refining,
  refineNote,
  fallbackNote = null,
  onSwap,
  onMore,
}: RecipesScreenProps) {
  // In the two-up desktop spread, an open first card would leave a hole beside it.
  const twoUp = typeof window.matchMedia === 'function' && window.matchMedia(TWO_UP).matches
  const headingRef = useScreenFocus<HTMLHeadingElement>(generation.status)
  const calm = useReducedMotion() ?? false
  if (generation.status === 'loading') {
    return (
      <section className="screen" aria-labelledby="recipes-heading" aria-busy="true">
        <header className="screen__header">
          <h2 id="recipes-heading" ref={headingRef} tabIndex={-1}>
            <RevealText text="Finding *healthy* recipes…" />
          </h2>
          <p className="screen__intro" role="status">
            Matching your ingredients. This takes a few seconds.
          </p>
        </header>
        <MixingBowl names={ingredientNames} />
        <div className="recipe-list">
          <RecipeSkeleton />
        </div>
      </section>
    )
  }

  if (generation.status === 'error') {
    return (
      <section className="screen" aria-labelledby="recipes-heading">
        <header className="screen__header">
          <h2 id="recipes-heading" ref={headingRef} tabIndex={-1}>
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
          <h2 id="recipes-heading" ref={headingRef} tabIndex={-1}>
            Recipes
          </h2>
        </header>
        <EmptyState
          food="grain"
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
        <h2 id="recipes-heading" ref={headingRef} tabIndex={-1}>
          <RevealText
            text={`${String(recipes.length)} healthy *${recipes.length === 1 ? 'recipe' : 'recipes'}* for you`}
          />
        </h2>
        <p className="screen__intro">{summaryLine(recipes)}</p>
        {fallbackNote === null && recipes.some((recipe) => recipe.source === 'library') && (
          <p className="screen__source">From the built-in library</p>
        )}
      </header>
      {fallbackNote !== null && (
        <Notice>
          {fallbackNote}{' '}
          <button type="button" className="link-button" onClick={onRetry}>
            Try the AI again
          </button>
        </Notice>
      )}
      <ul className="recipe-list">
        {recipes.map((recipe, index) => (
          <m.li
            key={recipe.id}
            variants={{
              hidden: { opacity: 0, y: 70, clipPath: 'inset(0% 0% 100% 0%)' },
              shown: { opacity: 1, y: 0, clipPath: 'inset(0% 0% 0% 0%)' },
            }}
            initial={calm ? false : 'hidden'}
            whileInView="shown"
            viewport={{ once: true, amount: 'some' }}
            transition={{
              duration: 0.9,
              ease: [0.2, 0.8, 0.2, 1],
              delay: index < 2 ? 0.35 + index * 0.15 : 0,
            }}
          >
            <RecipeCard
              recipe={recipe}
              index={index}
              defaultOpen={index === 0 && !twoUp}
              onSwap={() => {
                onSwap(recipe.id)
              }}
              swapping={refining.kind === 'swap' && refining.id === recipe.id}
              busy={refining.kind !== 'idle'}
            />
          </m.li>
        ))}
      </ul>
      {refineNote !== null && <Notice>{refineNote}</Notice>}
      <div className="screen__actions">
        <button
          type="button"
          className="button button--primary"
          disabled={refining.kind !== 'idle'}
          aria-busy={refining.kind === 'more'}
          onClick={onMore}
        >
          {refining.kind === 'more' ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Finding more…
            </>
          ) : (
            'More ideas'
          )}
        </button>
        <button type="button" className="button button--ghost" onClick={onReset}>
          <Icon icon={RotateCcw} size={16} />
          Start over
        </button>
      </div>
    </section>
  )
}

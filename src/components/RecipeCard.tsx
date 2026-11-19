import { ChevronDown, Clock, Leaf, ShoppingBasket, Users } from 'lucide-react'
import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import type { Recipe } from '../types'
import { Icon } from './Icon'

interface RecipeCardProps {
  recipe: Recipe
  /** Position in the list, shown as a large number. */
  index: number
  /** Open the first card so the user sees a full recipe right away. */
  defaultOpen?: boolean
}

function handNote(recipe: Recipe): string {
  const missing = recipe.missingIngredients.length
  if (missing === 0) return 'ready to cook!'
  return missing === 1 ? 'just 1 thing to grab' : `${String(missing)} things to grab`
}

export function RecipeCard({ recipe, index, defaultOpen = false }: RecipeCardProps) {
  const ready = recipe.missingIngredients.length === 0
  const cardRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: cardRef, offset: ['start end', 'end start'] })
  const numberY = useTransform(scrollYProgress, [0, 1], [28, -28])

  return (
    <article className="recipe-card" ref={cardRef}>
      <div className="recipe-card__top">
        <motion.span
          className="recipe-card__number tabular"
          aria-hidden="true"
          style={{ y: numberY }}
        >
          {String(index + 1).padStart(2, '0')}
        </motion.span>
        <span className={`hand recipe-card__note${ready ? ' recipe-card__note--ready' : ''}`}>
          {handNote(recipe)}
        </span>
      </div>

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
        <p className="recipe-card__status recipe-card__status--ready">You have everything</p>
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
            {recipe.ingredients.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
          <h4>Steps</h4>
          <ol>
            {recipe.steps.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ol>
        </div>
      </details>
    </article>
  )
}

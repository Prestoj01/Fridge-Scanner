import { ListPlus, X } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useState, type SyntheticEvent } from 'react'
import { EmptyState } from '../components/EmptyState'
import { Icon } from '../components/Icon'
import { RevealText } from '../components/RevealText'
import { Food } from '../components/food/Food'
import { foodKind } from '../lib/foodKind'
import type { Diet, Ingredient } from '../types'

interface ReviewScreenProps {
  ingredients: readonly Ingredient[]
  /** How many ingredients the last photo detection found, or null if none ran. */
  detectedCount: number | null
  diet: Diet
  onAddIngredient: (name: string) => void
  onRemoveIngredient: (id: string) => void
  onDietChange: (diet: Diet) => void
  onFindRecipes: () => void
}

const DIETS: readonly { value: Diet; label: string }[] = [
  { value: 'any', label: 'Anything' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
]

function plural(count: number, word: string): string {
  return `${String(count)} ${word}${count === 1 ? '' : 's'}`
}

function headline(count: number, detectedCount: number | null): string {
  if (detectedCount !== null && detectedCount > 0) {
    return `We spotted *${plural(detectedCount, 'ingredient')}*`
  }
  if (count === 0) return 'What do you have to *cook with?*'
  return `*${plural(count, 'ingredient')}* on your list`
}

function intro(detectedCount: number | null): string {
  if (detectedCount === null)
    return 'Type an ingredient and press Enter. Separate several with commas.'
  if (detectedCount === 0)
    return 'We could not spot any food in those photos. Type what you have instead.'
  return 'Remove anything we got wrong and add what we missed.'
}

export default function ReviewScreen({
  ingredients,
  detectedCount,
  diet,
  onAddIngredient,
  onRemoveIngredient,
  onDietChange,
  onFindRecipes,
}: ReviewScreenProps) {
  const [draft, setDraft] = useState('')
  const calm = useReducedMotion() ?? false
  // Magnets present on arrival drop in one by one; later ones drop at once.
  const [settled, setSettled] = useState(false)
  useEffect(() => {
    const id = window.setTimeout(() => {
      setSettled(true)
    }, 900)
    return () => {
      window.clearTimeout(id)
    }
  }, [])

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()
    // Allow several at once: "eggs, milk, spinach".
    for (const name of draft.split(',')) onAddIngredient(name)
    setDraft('')
  }

  return (
    <section className="screen" aria-labelledby="review-heading">
      <header className="screen__header">
        <h2 id="review-heading">
          <RevealText text={headline(ingredients.length, detectedCount)} />
        </h2>
        <p className="screen__intro">{intro(detectedCount)}</p>
      </header>

      <form className="input-group" onSubmit={handleSubmit}>
        <input
          type="text"
          value={draft}
          placeholder="eggs, spinach, rice"
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
          icon={ListPlus}
          title="Your list is empty"
          description="Start with a protein, a vegetable, and a grain for the best matches."
        />
      ) : (
        <ul className="pantry" aria-label="Your ingredients">
          <AnimatePresence mode="popLayout">
            {ingredients.map((ingredient, index) => (
              <motion.li
                key={ingredient.id}
                layout
                className="pantry__item"
                initial={calm ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 40, transition: { duration: 0.25, ease: 'easeIn' } }}
                transition={{
                  duration: 0.45,
                  ease: [0.2, 0.8, 0.2, 1],
                  delay: settled ? 0 : index * 0.06,
                }}
              >
                <motion.span
                  className="pantry__food"
                  initial={calm ? false : { scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 320,
                    damping: 14,
                    delay: (settled ? 0 : index * 0.06) + 0.1,
                  }}
                  whileHover={{
                    rotate: [0, -14, 12, 0],
                    scale: 1.15,
                    transition: { duration: 0.5 },
                  }}
                >
                  <Food kind={foodKind(ingredient.name)} size={44} shadow={false} />
                </motion.span>
                <span className="pantry__name">{ingredient.name}</span>
                <button
                  type="button"
                  className="pantry__remove"
                  aria-label={`Remove ${ingredient.name}`}
                  onClick={() => {
                    onRemoveIngredient(ingredient.id)
                  }}
                >
                  <Icon icon={X} size={20} />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      <fieldset className="segmented">
        <legend>Diet</legend>
        <div className="segmented__options">
          {DIETS.map((option) => (
            <label key={option.value} className="segmented__option">
              {diet === option.value && (
                <motion.span
                  layoutId="diet-thumb"
                  className="segmented__thumb"
                  transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                />
              )}
              <input
                type="radio"
                name="diet"
                value={option.value}
                checked={diet === option.value}
                className="visually-hidden"
                onChange={() => {
                  onDietChange(option.value)
                }}
              />
              <span className="segmented__label">{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="screen__actions">
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

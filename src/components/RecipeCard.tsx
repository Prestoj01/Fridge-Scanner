import {
  ChevronDown,
  ChefHat,
  Clock,
  Flame,
  Hourglass,
  Leaf,
  RefreshCw,
  ShoppingBasket,
  Users,
} from 'lucide-react'
import { m, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { Suspense, useRef, useState } from 'react'
import type { FoodKind } from '../lib/foodKind'
import { CookingMode } from '../lib/lazyViews'
import { matchesTerm } from '../lib/recipeLibrary'
import { recipeFoods } from '../lib/recipeFoods'
import { substitutesFor } from '../lib/substitutions'
import { convertLine, convertStep } from '../lib/units'
import { useUnits } from '../hooks/useUnits'
import type { Recipe } from '../types'
import { AddToListButton } from './AddToListButton'
import { Food } from './food/Food'
import { Icon } from './Icon'
import { NutritionBar } from './NutritionBar'
import { SaveButton } from './SaveButton'
import { UnitToggle } from './UnitToggle'
import { ShareButton } from './ShareButton'
import { ShareImageButton } from './ShareImageButton'

interface RecipeCardProps {
  recipe: Recipe
  /** Position in the list, shown as a large number. */
  index: number
  /** Open the first card so the user sees a full recipe right away. */
  defaultOpen?: boolean
  /** Offers "Something different" when provided. */
  onSwap?: () => void
  swapping?: boolean
  /** Disables the swap button while another change is running. */
  busy?: boolean
  /** Ingredients marked to use up first; the card says which ones it uses. */
  useSoon?: readonly string[]
}

const SPREAD_COLORS = ['tomato', 'sunshine', 'cobalt', 'basil', 'blush'] as const

function stickerText(recipe: Recipe): string {
  const missing = recipe.missingIngredients.length
  if (missing === 0) return 'Ready to cook!'
  return missing === 1 ? 'Just 1 thing to grab' : `${String(missing)} things to grab`
}

interface Spot {
  x: number
  y: number
  size: number
  rotate: number
  depth: number
}

function SpreadFood({
  kind,
  spot,
  order,
  drift,
  calm,
}: {
  kind: FoodKind
  spot: Spot
  order: number
  drift: MotionValue<number>
  calm: boolean
}) {
  const y = useTransform(drift, (value) => (calm ? 0 : value * spot.depth))
  return (
    <m.div
      className="spread__food"
      style={{
        left: `${String(spot.x)}%`,
        top: `${String(spot.y)}%`,
        width: `calc(${String(spot.size)}px * var(--spread-scale))`,
        height: `calc(${String(spot.size)}px * var(--spread-scale))`,
        y,
        zIndex: Math.round(spot.depth * 10),
      }}
      // Pops in when the card's own reveal plays ('hidden' -> 'shown').
      variants={{
        hidden: { scale: 0, rotate: spot.rotate - 60 },
        shown: {
          scale: 1,
          rotate: spot.rotate,
          transition: { type: 'spring', stiffness: 160, damping: 12, delay: 0.35 + order * 0.12 },
        },
      }}
      {...(calm ? { initial: false } : {})}
    >
      <Food kind={kind} size={spot.size} className="spread__food-art" />
    </m.div>
  )
}

/** Where each food sits in the art block, by how many there are. */
const LAYOUTS: Record<number, readonly Spot[]> = {
  1: [{ x: 62, y: 55, size: 150, rotate: 8, depth: 1 }],
  2: [
    { x: 50, y: 58, size: 130, rotate: -8, depth: 1 },
    { x: 80, y: 36, size: 92, rotate: 14, depth: 0.5 },
  ],
  3: [
    { x: 52, y: 60, size: 124, rotate: -6, depth: 1 },
    { x: 82, y: 34, size: 88, rotate: 16, depth: 0.55 },
    { x: 84, y: 76, size: 76, rotate: -14, depth: 0.75 },
  ],
}

/** "No soy sauce? Try tamari…" for each missing ingredient with a known stand-in. */
function Swaps({ missing }: { missing: readonly string[] }) {
  const swaps = missing
    .map((name) => ({ name, options: substitutesFor(name) }))
    .filter((swap) => swap.options.length > 0)
  if (swaps.length === 0) return null
  return (
    <ul className="swaps">
      {swaps.map((swap) => (
        <li key={swap.name}>
          <span className="swaps__label">No {swap.name}?</span> Try {swap.options.join(', or ')}.
        </li>
      ))}
    </ul>
  )
}

export function RecipeCard({
  recipe,
  index,
  defaultOpen = false,
  onSwap,
  swapping = false,
  busy = false,
  useSoon = [],
}: RecipeCardProps) {
  const usesUp = useSoon.filter((name) =>
    recipe.usedIngredients.some((used) => {
      const a = used.toLowerCase()
      return a === name || matchesTerm(a, name) || matchesTerm(name, a)
    }),
  )
  const calm = useReducedMotion() ?? false
  const units = useUnits()
  const [cooking, setCooking] = useState(false)
  const ready = recipe.missingIngredients.length === 0
  const color = SPREAD_COLORS[index % SPREAD_COLORS.length] ?? 'tomato'
  const foods = recipeFoods(recipe)
  const layout = LAYOUTS[foods.length] ?? LAYOUTS[1] ?? []

  const artRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: artRef, offset: ['start end', 'end start'] })
  const drift = useTransform(scrollYProgress, [0, 1], [40, -40])

  return (
    <article className="recipe-card">
      <div className="spread__frame">
        <div ref={artRef} className={`spread__art spread__art--${color}`} aria-hidden="true">
          <span className="spread__number tabular">{String(index + 1).padStart(2, '0')}</span>
          <span className={`spread__sticker${ready ? ' spread__sticker--ready' : ''}`}>
            {stickerText(recipe)}
          </span>
          {foods.map((kind, i) => {
            const spot = layout[i]
            return spot ? (
              <SpreadFood key={kind} kind={kind} spot={spot} order={i} drift={drift} calm={calm} />
            ) : null
          })}
        </div>
        <SaveButton recipe={recipe} />
      </div>

      <p className="recipe-card__meta kicker">
        <span>
          <Icon icon={Clock} size={16} />
          {recipe.timeMinutes} min
        </span>
        <span>
          <Icon icon={Users} size={16} />
          Serves {recipe.servings}
        </span>
        {recipe.nutrition && (
          <span>
            <Icon icon={Flame} size={16} />
            {recipe.nutrition.calories} kcal
          </span>
        )}
      </p>

      <header className="recipe-card__header">
        <h3>{recipe.title}</h3>
        {recipe.summary !== '' && <p className="recipe-card__summary">{recipe.summary}</p>}
      </header>

      {usesUp.length > 0 && (
        <p className="recipe-card__uses-up">
          <Icon icon={Hourglass} size={16} />
          Uses up {usesUp.join(', ')}
        </p>
      )}

      {ready ? (
        <p className="recipe-card__status recipe-card__status--ready">You have everything</p>
      ) : (
        <p className="recipe-card__status recipe-card__status--missing">
          <Icon icon={ShoppingBasket} size={16} />
          Need {recipe.missingIngredients.join(', ')}
        </p>
      )}
      {!ready && <Swaps missing={recipe.missingIngredients} />}
      {!ready && <AddToListButton names={recipe.missingIngredients} recipeTitle={recipe.title} />}

      {recipe.healthNote !== '' && (
        <p className="recipe-card__health">
          <Icon icon={Leaf} size={16} />
          {recipe.healthNote}
        </p>
      )}

      {recipe.nutrition && <NutritionBar nutrition={recipe.nutrition} />}

      <button
        type="button"
        className="button cook-button"
        onMouseEnter={() => void CookingMode.preload()}
        onFocus={() => void CookingMode.preload()}
        onClick={() => {
          setCooking(true)
        }}
      >
        <Icon icon={ChefHat} size={20} />
        Start cooking
      </button>

      {cooking && (
        <Suspense fallback={null}>
          <CookingMode
            recipe={recipe}
            onClose={() => {
              setCooking(false)
            }}
          />
        </Suspense>
      )}

      <div className="recipe-card__share">
        <ShareButton recipe={recipe} />
        <ShareImageButton recipe={recipe} index={index} />
        {onSwap && (
          <button
            type="button"
            className="button button--ghost share-button"
            disabled={busy}
            aria-busy={swapping}
            onClick={onSwap}
          >
            <Icon
              icon={RefreshCw}
              size={16}
              {...(swapping ? { className: 'swap-button__spin' } : {})}
            />
            {swapping ? 'Finding another…' : 'Something different'}
          </button>
        )}
      </div>

      <details open={defaultOpen}>
        <summary>
          Ingredients and steps
          <Icon icon={ChevronDown} className="recipe-card__chevron" />
        </summary>
        <div className="recipe-card__body">
          <div className="recipe-card__needs">
            <h4>You’ll need</h4>
            <UnitToggle />
          </div>
          <ul>
            {recipe.ingredients.map((line, i) => (
              <li key={i}>{convertLine(line, units)}</li>
            ))}
          </ul>
          <h4>Method</h4>
          <ol>
            {recipe.steps.map((line, i) => (
              <li key={i}>{convertStep(line, units)}</li>
            ))}
          </ol>
        </div>
      </details>
    </article>
  )
}

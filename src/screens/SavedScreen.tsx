import { ChevronLeft } from 'lucide-react'
import { m } from 'motion/react'
import { EmptyState } from '../components/EmptyState'
import { Icon } from '../components/Icon'
import { RecipeCard } from '../components/RecipeCard'
import { RevealText } from '../components/RevealText'
import { useSaved } from '../lib/savedContext'

interface SavedScreenProps {
  onClose: () => void
}

export default function SavedScreen({ onClose }: SavedScreenProps) {
  const { saved } = useSaved()
  return (
    <section className="screen" aria-labelledby="saved-heading">
      <button type="button" className="button button--ghost back-link" onClick={onClose}>
        <Icon icon={ChevronLeft} />
        Back to cooking
      </button>
      <header className="screen__header">
        <h2 id="saved-heading">
          <RevealText text="Your *saved* recipes" />
        </h2>
        {saved.length > 0 && (
          <p className="screen__intro">
            {saved.length} {saved.length === 1 ? 'recipe' : 'recipes'} kept on this device.
          </p>
        )}
      </header>
      {saved.length === 0 ? (
        <EmptyState
          food="egg"
          title="Nothing saved yet"
          description="Tap the heart on any recipe to keep it here for later."
        >
          <button type="button" className="button button--primary" onClick={onClose}>
            Find recipes
          </button>
        </EmptyState>
      ) : (
        <ul className="recipe-list">
          {saved.map((recipe, index) => (
            <m.li key={recipe.id} layout>
              <RecipeCard recipe={recipe} index={index} />
            </m.li>
          ))}
        </ul>
      )}
    </section>
  )
}

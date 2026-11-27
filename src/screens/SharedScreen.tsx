import { motion } from 'motion/react'
import { EmptyState } from '../components/EmptyState'
import { RecipeCard } from '../components/RecipeCard'
import { RevealText } from '../components/RevealText'
import { recipeFromHash } from '../lib/shareLink'

interface SharedScreenProps {
  hash: string
  onClose: () => void
}

/** A recipe opened from a share link. */
export default function SharedScreen({ hash, onClose }: SharedScreenProps) {
  const recipe = recipeFromHash(hash)
  return (
    <section className="screen" aria-labelledby="shared-heading">
      <header className="screen__header">
        <p className="kicker shared__kicker">Shared with you</p>
        <h2 id="shared-heading">
          <RevealText text={recipe ? 'A recipe *for you*' : 'This link is *broken*'} />
        </h2>
        {recipe && (
          <p className="screen__intro">
            Someone sent you this from Fridge Scanner. Save it, cook it, or find your own.
          </p>
        )}
      </header>
      {recipe ? (
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <RecipeCard recipe={recipe} index={0} defaultOpen />
        </motion.div>
      ) : (
        <EmptyState
          food="jar"
          title="We couldn’t read that recipe"
          description="The link may have been cut off when it was copied. Ask for it again, or find your own."
        />
      )}
      <div className="screen__actions">
        <button type="button" className="button button--primary" onClick={onClose}>
          Find recipes from your fridge
        </button>
      </div>
    </section>
  )
}

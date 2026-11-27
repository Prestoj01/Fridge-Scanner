import { Check, ChevronLeft, Copy, Share2, X } from 'lucide-react'
import { AnimatePresence, m, useReducedMotion } from 'motion/react'
import { useEffect, useState, type SyntheticEvent } from 'react'
import { EmptyState } from '../components/EmptyState'
import { Food } from '../components/food/Food'
import { Icon } from '../components/Icon'
import { RevealText } from '../components/RevealText'
import { useScreenFocus } from '../hooks/useScreenFocus'
import { foodKind } from '../lib/foodKind'
import { useShopping } from '../lib/shoppingContext'
import { listAsText } from '../lib/shoppingList'

interface ShoppingScreenProps {
  onClose: () => void
}

export default function ShoppingScreen({ onClose }: ShoppingScreenProps) {
  const headingRef = useScreenFocus<HTMLHeadingElement>()
  const { items, add, toggle, remove, clearChecked } = useShopping()
  const calm = useReducedMotion() ?? false
  const [draft, setDraft] = useState('')
  const [copied, setCopied] = useState(false)
  const open = items.filter((item) => !item.checked).length
  const anyChecked = items.some((item) => item.checked)
  const canShare = typeof navigator.share === 'function'

  useEffect(() => {
    if (!copied) return
    const id = window.setTimeout(() => {
      setCopied(false)
    }, 2000)
    return () => {
      window.clearTimeout(id)
    }
  }, [copied])

  const handleAdd = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()
    add(draft.split(','), null)
    setDraft('')
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(listAsText(items))
      setCopied(true)
    } catch {
      // Clipboard blocked: nothing more we can do quietly.
    }
  }

  const share = async () => {
    try {
      await navigator.share({ title: 'Shopping list', text: listAsText(items) })
    } catch {
      // The user closed the share sheet.
    }
  }

  return (
    <section className="screen" aria-labelledby="list-heading">
      <button type="button" className="button button--ghost back-link" onClick={onClose}>
        <Icon icon={ChevronLeft} />
        Back to cooking
      </button>
      <header className="screen__header">
        <h2 id="list-heading" ref={headingRef} tabIndex={-1}>
          <RevealText text="Your *shopping* list" />
        </h2>
        {items.length > 0 && (
          <p className="screen__intro">
            {open === 0 ? 'All done. Nice shopping.' : `${String(open)} to pick up.`}
          </p>
        )}
      </header>

      <form className="input-group" onSubmit={handleAdd}>
        <input
          type="text"
          value={draft}
          placeholder="olive oil, lemons"
          aria-label="Add to shopping list"
          autoComplete="off"
          maxLength={200}
          onChange={(event) => {
            setDraft(event.target.value)
          }}
        />
        <button type="submit" className="button" disabled={draft.trim() === ''}>
          Add
        </button>
      </form>

      {items.length === 0 ? (
        <EmptyState
          food="milk"
          title="Nothing to buy"
          description="Add missing ingredients from any recipe, or type your own above."
        />
      ) : (
        <ul className="shopping" aria-label="Shopping list">
          <AnimatePresence mode="popLayout" initial={false}>
            {items.map((item) => (
              <m.li
                key={item.id}
                layout
                className={`shopping__item${item.checked ? ' shopping__item--checked' : ''}`}
                initial={calm ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
              >
                <label className="shopping__check">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => {
                      toggle(item.id)
                    }}
                  />
                  <span className="shopping__box" aria-hidden="true">
                    {item.checked && <Icon icon={Check} size={16} />}
                  </span>
                  <Food kind={foodKind(item.name)} size={32} shadow={false} />
                  <span className="shopping__name">
                    {item.name}
                    {item.forRecipe !== null && (
                      <span className="shopping__for kicker">for {item.forRecipe}</span>
                    )}
                  </span>
                </label>
                <button
                  type="button"
                  className="pantry__remove"
                  aria-label={`Remove ${item.name}`}
                  onClick={() => {
                    remove(item.id)
                  }}
                >
                  <Icon icon={X} size={20} />
                </button>
              </m.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      {items.length > 0 && (
        <div className="shopping__actions">
          <button type="button" className="button" onClick={() => void copy()}>
            <Icon icon={copied ? Check : Copy} size={16} />
            {copied ? 'Copied' : 'Copy list'}
          </button>
          {canShare && (
            <button type="button" className="button" onClick={() => void share()}>
              <Icon icon={Share2} size={16} />
              Share
            </button>
          )}
          {anyChecked && (
            <button type="button" className="button button--ghost" onClick={clearChecked}>
              Clear checked
            </button>
          )}
        </div>
      )}
    </section>
  )
}

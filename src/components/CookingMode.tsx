import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useWakeLock } from '../hooks/useWakeLock'
import { recipeFoods } from '../lib/recipeFoods'
import type { Recipe } from '../types'
import { Food } from './food/Food'
import { Icon } from './Icon'

interface CookingModeProps {
  recipe: Recipe
  onClose: () => void
}

const SWIPE_DISTANCE = 80

/**
 * A full-screen, distraction-free view for cooking: an ingredient
 * checklist, then one large step at a time. Arrow keys or swipes move
 * between steps, Escape closes, and the screen stays awake.
 */
export function CookingMode({ recipe, onClose }: CookingModeProps) {
  const calm = useReducedMotion() ?? false
  const steps = recipe.steps
  // Page 0 is the checklist, then one page per step, then the finish.
  const lastPage = steps.length + 1
  const [page, setPage] = useState(0)
  const [direction, setDirection] = useState(1)
  const [checked, setChecked] = useState<ReadonlySet<number>>(new Set())
  const dialogRef = useRef<HTMLDivElement>(null)

  useWakeLock()

  const go = (delta: number) => {
    setDirection(delta)
    setPage((current) => Math.min(Math.max(current + delta, 0), lastPage))
  }

  // Keyboard, focus, and page scroll while open.
  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialogRef.current?.focus()

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.target instanceof HTMLInputElement) return
      if (event.key === 'ArrowRight') {
        setDirection(1)
        setPage((current) => Math.min(current + 1, lastPage))
      }
      if (event.key === 'ArrowLeft') {
        setDirection(-1)
        setPage((current) => Math.max(current - 1, 0))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      previous?.focus()
    }
  }, [lastPage, onClose])

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -SWIPE_DISTANCE) go(1)
    else if (info.offset.x > SWIPE_DISTANCE) go(-1)
  }

  const toggle = (index: number) => {
    setChecked((current) => {
      const next = new Set(current)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  const slide = {
    enter: (dir: number) => (calm ? { opacity: 0 } : { x: dir * 80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => (calm ? { opacity: 0 } : { x: dir * -80, opacity: 0 }),
  }

  const stepIndex = page - 1
  const step = steps[stepIndex]

  return createPortal(
    <motion.div
      ref={dialogRef}
      className="cooking"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cooking-title"
      tabIndex={-1}
      initial={calm ? { opacity: 0 } : { opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <header className="cooking__top">
        <div className="cooking__heading">
          <p className="kicker">Cooking mode</p>
          <h2 id="cooking-title">{recipe.title}</h2>
        </div>
        <button
          type="button"
          className="cooking__close"
          aria-label="Close cooking mode"
          onClick={onClose}
        >
          <Icon icon={X} size={24} />
        </button>
      </header>

      <ol className="cooking__progress" aria-hidden="true">
        {Array.from({ length: lastPage + 1 }, (_, index) => (
          <li key={index} className={index <= page ? 'is-done' : undefined} />
        ))}
      </ol>

      <div className="cooking__stage">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={page}
            className="cooking__page"
            custom={direction}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
            drag={calm ? false : 'x'}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.4}
            onDragEnd={onDragEnd}
          >
            {page === 0 && (
              <>
                <p className="cooking__label kicker">Before you start</p>
                <h3 className="cooking__lead">Get everything out.</h3>
                <ul className="cooking__checklist" aria-label="Ingredients">
                  {recipe.ingredients.map((line, index) => (
                    <li key={index}>
                      <label>
                        <input
                          type="checkbox"
                          checked={checked.has(index)}
                          onChange={() => {
                            toggle(index)
                          }}
                        />
                        <span className="cooking__box" aria-hidden="true" />
                        <span className="cooking__item">{line}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {step !== undefined && (
              <>
                <p className="cooking__label kicker" aria-live="polite">
                  Step {stepIndex + 1} of {steps.length}
                </p>
                <span className="cooking__number" aria-hidden="true">
                  {stepIndex + 1}
                </span>
                <p className="cooking__step">{step}</p>
              </>
            )}

            {page === lastPage && (
              <div className="cooking__done">
                <div className="cooking__foods" aria-hidden="true">
                  {recipeFoods(recipe).map((kind, index) => (
                    <motion.span
                      key={kind}
                      initial={calm ? false : { y: 30, opacity: 0, rotate: -20 }}
                      animate={{ y: 0, opacity: 1, rotate: 0 }}
                      transition={{
                        type: 'spring',
                        stiffness: 220,
                        damping: 12,
                        delay: 0.1 + index * 0.1,
                      }}
                    >
                      <Food kind={kind} size={88} />
                    </motion.span>
                  ))}
                </div>
                <h3 className="cooking__lead">
                  Dinner is <em>served.</em>
                </h3>
                <p className="cooking__sub">Enjoy every bite.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <footer className="cooking__nav">
        <button
          type="button"
          className="cooking__back"
          disabled={page === 0}
          onClick={() => {
            go(-1)
          }}
        >
          <Icon icon={ChevronLeft} />
          Back
        </button>
        {page < lastPage ? (
          <button
            type="button"
            className="cooking__next"
            onClick={() => {
              go(1)
            }}
          >
            {page === 0 ? 'Let’s cook' : page === steps.length ? 'Finish' : 'Next step'}
            <Icon icon={ChevronRight} />
          </button>
        ) : (
          <button type="button" className="cooking__next" onClick={onClose}>
            Done
          </button>
        )}
      </footer>
    </motion.div>,
    document.body,
  )
}

import { Printer } from 'lucide-react'
import type { RefObject } from 'react'
import { Icon } from './Icon'

interface PrintButtonProps {
  /** The recipe card to print on its own. */
  card: RefObject<HTMLElement | null>
}

/**
 * Prints just this recipe as a magazine page. A copy of the card goes into
 * a print-only sheet outside the app, so the card's reveal animation (clip
 * paths and transforms) cannot hide or crop it, and the print styles show
 * only that sheet.
 */
/**
 * Gives every id in the copy a new name and points references at it. SVG
 * gradients are found by id, and the originals are hidden while printing,
 * so references to them would draw nothing.
 */
function renameIds(root: HTMLElement): void {
  const renamed = new Map<string, string>()
  root.querySelectorAll<HTMLElement>('[id]').forEach((element) => {
    const next = `print-${element.id}`
    renamed.set(element.id, next)
    element.id = next
  })
  const pattern = /url\(#([^)]+)\)/g
  root.querySelectorAll('*').forEach((element) => {
    for (const attribute of Array.from(element.attributes)) {
      if (attribute.value.includes('url(#')) {
        element.setAttribute(
          attribute.name,
          attribute.value.replace(pattern, (match, id: string) => {
            const next = renamed.get(id)
            return next === undefined ? match : `url(#${next})`
          }),
        )
      } else if (attribute.name.endsWith('href') && attribute.value.startsWith('#')) {
        const next = renamed.get(attribute.value.slice(1))
        if (next !== undefined) element.setAttribute(attribute.name, `#${next}`)
      }
    }
  })
}

export function PrintButton({ card }: PrintButtonProps) {
  const print = () => {
    const element = card.current
    if (!element) return
    const sheet = document.createElement('div')
    sheet.className = 'print-sheet'
    const copy = element.cloneNode(true) as HTMLElement
    copy.querySelector('details')?.setAttribute('open', '')
    // Freeze each food where the animation left it; the copy has no animation.
    const foods = element.querySelectorAll<HTMLElement>('.spread__food')
    copy.querySelectorAll<HTMLElement>('.spread__food').forEach((food, index) => {
      const original = foods[index]
      if (original) food.style.transform = getComputedStyle(original).transform
    })
    renameIds(copy)
    sheet.append(copy)
    document.body.append(sheet)
    document.body.classList.add('print-one')
    const restore = () => {
      sheet.remove()
      document.body.classList.remove('print-one')
    }
    window.addEventListener('afterprint', restore, { once: true })
    window.print()
  }

  return (
    <button type="button" className="button button--ghost share-button" onClick={print}>
      <Icon icon={Printer} size={16} />
      Print
    </button>
  )
}

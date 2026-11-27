import { Check, Share2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { recipeLink } from '../lib/shareLink'
import type { Recipe } from '../types'
import { Icon } from './Icon'

/** Shares a link to the recipe with the device share sheet, or copies it. */
export function ShareButton({ recipe }: { recipe: Recipe }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const id = window.setTimeout(() => {
      setCopied(false)
    }, 2000)
    return () => {
      window.clearTimeout(id)
    }
  }, [copied])

  const share = async () => {
    const url = recipeLink(recipe)
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: recipe.title, text: recipe.summary, url })
        return
      } catch (error) {
        // The user closed the sheet: do nothing. Otherwise fall back to copying.
        if (error instanceof DOMException && error.name === 'AbortError') return
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
    } catch {
      window.prompt('Copy this link to share the recipe:', url)
    }
  }

  return (
    <button
      type="button"
      className="button button--ghost share-button"
      onClick={() => void share()}
    >
      <Icon icon={copied ? Check : Share2} size={16} />
      {copied ? 'Link copied' : 'Share'}
    </button>
  )
}

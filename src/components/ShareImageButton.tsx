import { ImageDown } from 'lucide-react'
import { useState } from 'react'
import type { Recipe } from '../types'
import { Icon } from './Icon'

/** Makes a recipe-card image and shares it, or downloads it where sharing files is not possible. */
export function ShareImageButton({ recipe, index }: { recipe: Recipe; index: number }) {
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)

  const make = async () => {
    setBusy(true)
    setFailed(false)
    try {
      // The canvas renderer is only needed here, so it loads on first use.
      const { imageFileName, renderRecipeImage } = await import('../lib/shareImage')
      const blob = await renderRecipeImage(recipe, index)
      const file = new File([blob], imageFileName(recipe.title), { type: 'image/png' })
      if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: recipe.title })
          return
        } catch (error) {
          if (error instanceof DOMException && error.name === 'AbortError') return
        }
      }
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = file.name
      link.click()
      window.setTimeout(() => {
        URL.revokeObjectURL(url)
      }, 1000)
    } catch {
      setFailed(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      className="button button--ghost share-button"
      disabled={busy}
      aria-busy={busy}
      onClick={() => void make()}
    >
      <Icon icon={ImageDown} size={16} />
      {busy ? 'Making image…' : failed ? 'Try again' : 'Save as image'}
    </button>
  )
}

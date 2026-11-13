import type { LucideIcon } from 'lucide-react'

interface IconProps {
  icon: LucideIcon
  /** Pixel size. 20 for inline UI, 16 for small text, 32 for empty states. */
  size?: 16 | 20 | 24 | 32
  className?: string
}

/**
 * The only way icons are rendered, so every icon shares one stroke weight
 * and is hidden from screen readers. Pair icons with visible text or an
 * aria-label on the parent.
 */
export function Icon({ icon: Glyph, size = 20, className }: IconProps) {
  return (
    <Glyph
      size={size}
      strokeWidth={2}
      aria-hidden="true"
      focusable="false"
      className={className === undefined ? 'icon' : `icon ${className}`}
    />
  )
}

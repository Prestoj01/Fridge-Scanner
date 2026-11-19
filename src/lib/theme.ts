export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'fridge-scanner-theme'

/** The theme the user chose, or null to follow the device. */
export function storedTheme(): Theme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value === 'light' || value === 'dark' ? value : null
  } catch {
    return null
  }
}

export function systemTheme(): Theme {
  return typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export function resolvedTheme(): Theme {
  return storedTheme() ?? systemTheme()
}

/** Applies and remembers a theme. */
export function setTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // Private mode or storage disabled: the choice lasts for this page only.
  }
}

function prefersReducedMotion(): boolean {
  return (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/**
 * Switches theme with a circular reveal that grows from the given point,
 * where the browser supports view transitions. Otherwise switches instantly.
 */
export function switchTheme(next: Theme, origin?: { x: number; y: number }): void {
  if (typeof document.startViewTransition !== 'function' || prefersReducedMotion() || !origin) {
    setTheme(next)
    return
  }
  const transition = document.startViewTransition(() => {
    setTheme(next)
  })
  const radius = Math.hypot(
    Math.max(origin.x, window.innerWidth - origin.x),
    Math.max(origin.y, window.innerHeight - origin.y),
  )
  void transition.ready.then(() => {
    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${String(origin.x)}px ${String(origin.y)}px)`,
          `circle(${String(radius)}px at ${String(origin.x)}px ${String(origin.y)}px)`,
        ],
      },
      {
        duration: 700,
        easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
        pseudoElement: '::view-transition-new(root)',
      },
    )
  })
}

import { lazy, type ReactNode } from 'react'
import type { CookingModeProps } from '../components/CookingMode'

/**
 * Pages and overlays that are not part of the first screen. Each loads on
 * first use, and all of them are fetched in the background once the app is
 * idle, so opening one later does not wait on the network.
 */
function preloadable<P extends object>(load: () => Promise<{ default: (props: P) => ReactNode }>) {
  return Object.assign(lazy(load), { preload: load })
}

export const SavedScreen = preloadable(() => import('../screens/SavedScreen'))
export const SharedScreen = preloadable(() => import('../screens/SharedScreen'))
export const ShoppingScreen = preloadable(() => import('../screens/ShoppingScreen'))
export const CookingMode = preloadable<CookingModeProps>(() =>
  import('../components/CookingMode').then((module) => ({ default: module.CookingMode })),
)

export function preloadViews(): void {
  for (const view of [SavedScreen, SharedScreen, ShoppingScreen, CookingMode]) {
    void view.preload().catch(() => undefined)
  }
}

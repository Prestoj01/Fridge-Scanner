import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { MotionGlobalConfig } from 'motion/react'
import { afterEach, vi } from 'vitest'

// Animations add nothing to behavior tests and delay exits.
MotionGlobalConfig.skipAnimations = true

afterEach(() => {
  cleanup()
})

// jsdom has no IntersectionObserver. Report every element as in view at once,
// so scroll-triggered reveals behave as if the user scrolled to them.
class InViewObserver implements IntersectionObserver {
  readonly root = null
  readonly rootMargin = '0px'
  readonly scrollMargin = '0px'
  readonly thresholds = [0]
  private readonly callback: IntersectionObserverCallback

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
  }

  observe(target: Element): void {
    const entry = {
      isIntersecting: true,
      intersectionRatio: 1,
      target,
    } as IntersectionObserverEntry
    this.callback([entry], this)
  }

  unobserve(): void {
    // Nothing to stop: entries are reported once, synchronously.
  }

  disconnect(): void {
    // Nothing to stop: entries are reported once, synchronously.
  }
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
}

globalThis.IntersectionObserver = InViewObserver

// jsdom does not implement scrolling.
if (typeof window !== 'undefined') window.scrollTo = vi.fn()

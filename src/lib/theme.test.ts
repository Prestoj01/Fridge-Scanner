import { afterEach, describe, expect, it } from 'vitest'
import { resolvedTheme, setTheme, storedTheme, switchTheme } from './theme'

afterEach(() => {
  localStorage.clear()
  delete document.documentElement.dataset.theme
})

describe('theme', () => {
  it('follows the device until the user chooses', () => {
    expect(storedTheme()).toBeNull()
    expect(resolvedTheme()).toBe('light')
  })

  it('remembers and applies a chosen theme', () => {
    setTheme('dark')
    expect(storedTheme()).toBe('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(resolvedTheme()).toBe('dark')
  })

  it('switches instantly when view transitions are unavailable', () => {
    switchTheme('dark', { x: 10, y: 10 })
    expect(document.documentElement.dataset.theme).toBe('dark')
  })
})

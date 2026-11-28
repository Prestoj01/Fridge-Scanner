import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import type { Recipe } from '../types'
import { CookingMode } from './CookingMode'

const recipe: Recipe = {
  id: 'r1',
  source: 'library',
  title: 'Toast',
  summary: '',
  timeMinutes: 5,
  servings: 1,
  ingredients: ['2 slices bread'],
  usedIngredients: ['bread'],
  missingIngredients: [],
  steps: ['Toast the bread.', 'Butter it.'],
  healthNote: '',
}

const spoken: string[] = []

beforeEach(() => {
  spoken.length = 0
  vi.stubGlobal(
    'SpeechSynthesisUtterance',
    class {
      lang = ''
      rate = 1
      readonly text: string
      constructor(text: string) {
        this.text = text
      }
    },
  )
  Object.defineProperty(window, 'speechSynthesis', {
    configurable: true,
    value: {
      cancel: vi.fn(),
      speak: (utterance: { text: string }) => spoken.push(utterance.text),
    },
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
  Reflect.deleteProperty(window, 'speechSynthesis')
})

it('reads each page aloud once switched on, and remembers the choice', async () => {
  const user = userEvent.setup()
  const { unmount } = render(<CookingMode recipe={recipe} onClose={() => undefined} />)

  expect(spoken).toEqual([])
  const toggle = screen.getByRole('button', { name: 'Read steps aloud' })
  await user.click(toggle)
  expect(toggle).toHaveAttribute('aria-pressed', 'true')
  expect(spoken.at(-1)).toBe("Get everything out. You'll need: 2 slices bread.")

  await user.click(screen.getByRole('button', { name: /Let’s cook/ }))
  expect(spoken.at(-1)).toBe('Step 1. Toast the bread.')
  unmount()

  // Next time, it starts on.
  render(<CookingMode recipe={recipe} onClose={() => undefined} />)
  expect(screen.getByRole('button', { name: 'Read steps aloud' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
})

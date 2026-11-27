import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { expect, it, vi } from 'vitest'
import App from './App'

// Offline mode: no backend URL configured.
vi.mock('./lib/config', () => ({ API_URL: '' }))

/** Runs axe on the whole page. Contrast needs real layout, so a browser check covers it instead. */
async function violations(): Promise<string[]> {
  const result = await axe.run(document.body, {
    rules: { 'color-contrast': { enabled: false } },
    resultTypes: ['violations'],
  })
  return result.violations.map(
    (violation) => `${violation.id}: ${violation.nodes.map((node) => node.html).join(' | ')}`,
  )
}

it('has no detectable accessibility problems across the flow', async () => {
  const user = userEvent.setup()
  render(<App />)

  await screen.findByRole('heading', { name: 'Turn what you have into a healthy meal' })
  expect(await violations()).toEqual([])

  await user.click(screen.getByRole('button', { name: 'Type your ingredients' }))
  await user.type(await screen.findByLabelText('Ingredient name'), 'eggs, spinach, tomato{Enter}')
  expect(await violations()).toEqual([])

  await user.click(screen.getByRole('button', { name: 'Find recipes' }))
  await screen.findByRole('heading', { name: 'Spinach and tomato omelette' })
  expect(await violations()).toEqual([])

  const [cook] = screen.getAllByRole('button', { name: /Start cooking/ })
  if (!cook) throw new Error('No recipe to cook')
  await user.click(cook)
  await screen.findByRole('dialog')
  expect(await violations()).toEqual([])
})

it('moves focus to the new screen heading after a step change', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.click(await screen.findByRole('button', { name: 'Type your ingredients' }))
  await screen.findByText('Your list is empty')
  const heading = document.getElementById('review-heading')
  expect(heading).toHaveFocus()
})

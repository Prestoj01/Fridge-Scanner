import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import App from './App'

// Offline mode: no backend URL configured.
vi.mock('./lib/config', () => ({ API_URL: '' }))

it('starts on the upload step and explains offline mode', async () => {
  render(<App />)

  expect(await screen.findByRole('heading', { name: 'Snap your fridge' })).toBeInTheDocument()
  expect(screen.getByText('No photos yet')).toBeInTheDocument()
  expect(screen.getByText('Offline mode.')).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Detect ingredients' })).not.toBeInTheDocument()
})

it('finds built-in recipes from typed ingredients', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.click(await screen.findByRole('button', { name: 'Type ingredients' }))
  expect(await screen.findByText('No ingredients yet')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Find recipes' })).toBeDisabled()

  await user.type(screen.getByLabelText('Ingredient name'), 'Eggs, spinach, Tomato{Enter}')
  const list = screen.getByRole('list', { name: 'Your ingredients' })
  expect(within(list).getAllByRole('listitem')).toHaveLength(3)

  await user.click(screen.getByRole('button', { name: 'Find recipes' }))
  expect(
    await screen.findByRole('heading', { name: 'Spinach and tomato omelette' }),
  ).toBeInTheDocument()
  expect(screen.getByText('These recipes come from the built-in library.')).toBeInTheDocument()
  expect(screen.getAllByText('✓ You have everything').length).toBeGreaterThan(0)
})

it('shows an empty state when nothing matches, and can start over', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.click(await screen.findByRole('button', { name: 'Type ingredients' }))
  await user.type(await screen.findByLabelText('Ingredient name'), 'ketchup{Enter}')
  await user.click(screen.getByRole('button', { name: 'Find recipes' }))
  expect(await screen.findByText('No recipes found')).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Start over' }))
  expect(await screen.findByText('No photos yet')).toBeInTheDocument()
})

it('removes an ingredient', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.click(await screen.findByRole('button', { name: 'Type ingredients' }))
  await user.type(await screen.findByLabelText('Ingredient name'), 'eggs{Enter}')
  await user.click(screen.getByRole('button', { name: 'Remove eggs' }))
  expect(screen.getByText('No ingredients yet')).toBeInTheDocument()
})

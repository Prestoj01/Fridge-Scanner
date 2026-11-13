import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import App from './App'

// Offline mode: no backend URL configured.
vi.mock('./lib/config', () => ({ API_URL: '' }))

it('leads with typing ingredients when photo scanning is off', async () => {
  render(<App />)

  expect(
    await screen.findByRole('heading', { name: 'Turn what you have into a healthy meal' }),
  ).toBeInTheDocument()
  expect(screen.getByText(/Photo scanning is not connected/)).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Add photos' })).not.toBeInTheDocument()
})

it('finds built-in recipes from typed ingredients', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.click(await screen.findByRole('button', { name: 'Type your ingredients' }))
  expect(await screen.findByText('Your list is empty')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Find recipes' })).toBeDisabled()

  await user.type(screen.getByLabelText('Ingredient name'), 'Eggs, spinach, Tomato{Enter}')
  const list = screen.getByRole('list', { name: 'Your ingredients' })
  expect(within(list).getAllByRole('listitem')).toHaveLength(3)
  expect(screen.getByRole('heading', { name: '3 ingredients on your list' })).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Find recipes' }))
  expect(
    await screen.findByRole('heading', { name: 'Spinach and tomato omelette' }),
  ).toBeInTheDocument()
  expect(screen.getByText(/From the built-in library/)).toBeInTheDocument()
  expect(screen.getAllByText('You have everything').length).toBeGreaterThan(0)
})

it('shows an empty state when nothing matches, and can start over', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.click(await screen.findByRole('button', { name: 'Type your ingredients' }))
  await user.type(await screen.findByLabelText('Ingredient name'), 'ketchup{Enter}')
  await user.click(screen.getByRole('button', { name: 'Find recipes' }))
  expect(await screen.findByText('No recipes match')).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Add ingredients' }))
  expect(await screen.findByText('ketchup')).toBeInTheDocument()
})

it('starts over from the recipes screen', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.click(await screen.findByRole('button', { name: 'Type your ingredients' }))
  await user.type(await screen.findByLabelText('Ingredient name'), 'eggs, bread, avocado{Enter}')
  await user.click(screen.getByRole('button', { name: 'Find recipes' }))
  await user.click(await screen.findByRole('button', { name: 'Start over' }))
  expect(await screen.findByRole('button', { name: 'Type your ingredients' })).toBeInTheDocument()
})

it('removes an ingredient', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.click(await screen.findByRole('button', { name: 'Type your ingredients' }))
  await user.type(await screen.findByLabelText('Ingredient name'), 'eggs{Enter}')
  await user.click(screen.getByRole('button', { name: 'Remove eggs' }))
  expect(screen.getByText('Your list is empty')).toBeInTheDocument()
})

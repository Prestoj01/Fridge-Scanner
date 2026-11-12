import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, it, vi } from 'vitest'
import App from './App'
import { ApiError, detectIngredients, fetchRecipes } from './lib/api'
import type { RecipeContent } from './types'

// AI mode: a backend URL is configured. Network and canvas work are mocked.
vi.mock('./lib/config', () => ({ API_URL: 'https://api.test' }))
vi.mock('./lib/image', () => ({
  prepareImage: vi.fn(() => Promise.resolve({ mimeType: 'image/jpeg', data: 'aGk=' })),
}))
vi.mock('./lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./lib/api')>()),
  detectIngredients: vi.fn(),
  fetchRecipes: vi.fn(),
}))

const stirFry: RecipeContent = {
  title: 'Garlic chicken stir-fry',
  summary: 'Quick weeknight dinner.',
  timeMinutes: 20,
  servings: 2,
  ingredients: ['2 chicken breasts', '2 cups broccoli', '1 tbsp soy sauce'],
  usedIngredients: ['chicken', 'broccoli'],
  missingIngredients: ['soy sauce'],
  steps: ['Cook the chicken for 6 minutes.', 'Add the broccoli and soy sauce.'],
  healthNote: 'Lean protein and greens.',
}

async function uploadPhoto(user: ReturnType<typeof userEvent.setup>) {
  const photo = new File(['x'], 'fridge.png', { type: 'image/png' })
  await user.upload(await screen.findByLabelText('Choose photos'), photo)
  expect(screen.getByAltText('fridge.png')).toBeInTheDocument()
}

beforeEach(() => {
  vi.mocked(detectIngredients).mockReset()
  vi.mocked(fetchRecipes).mockReset()
  // jsdom does not implement object URLs.
  URL.createObjectURL = vi.fn(() => 'blob:preview')
  URL.revokeObjectURL = vi.fn()
})

it('detects ingredients from a photo and shows AI recipes', async () => {
  vi.mocked(detectIngredients).mockResolvedValue(['chicken', 'broccoli'])
  vi.mocked(fetchRecipes).mockResolvedValue([stirFry])
  const user = userEvent.setup()
  render(<App />)

  expect(await screen.findByRole('button', { name: 'Detect ingredients' })).toBeDisabled()
  await uploadPhoto(user)
  await user.click(screen.getByRole('button', { name: 'Detect ingredients' }))

  expect(await screen.findByText(/Found 2 ingredients in your photos/)).toBeInTheDocument()
  expect(screen.getByText('chicken')).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Find recipes' }))
  expect(
    await screen.findByRole('heading', { name: 'Garlic chicken stir-fry' }),
  ).toBeInTheDocument()
  expect(screen.getByText('🛒 1 to buy')).toBeInTheDocument()
  expect(screen.getByText('Cook the chicken for 6 minutes.')).toBeInTheDocument()
  expect(fetchRecipes).toHaveBeenCalledWith(['chicken', 'broccoli'], 'any')
})

it('shows a detection error and lets the user retry', async () => {
  vi.mocked(detectIngredients)
    .mockRejectedValueOnce(new ApiError('rate_limited'))
    .mockResolvedValueOnce([])
  const user = userEvent.setup()
  render(<App />)

  await uploadPhoto(user)
  await user.click(screen.getByRole('button', { name: 'Detect ingredients' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('Too many requests')

  await user.click(screen.getByRole('button', { name: 'Try again' }))
  expect(await screen.findByText(/could not spot any food/)).toBeInTheDocument()
})

it('falls back to built-in recipes when the AI request fails', async () => {
  vi.mocked(fetchRecipes).mockRejectedValue(new ApiError('not_configured'))
  const user = userEvent.setup()
  render(<App />)

  await user.click(await screen.findByRole('button', { name: 'Type ingredients instead' }))
  await user.type(await screen.findByLabelText('Ingredient name'), 'bread, avocado, eggs{Enter}')
  await user.selectOptions(screen.getByLabelText('Diet'), 'vegetarian')
  await user.click(screen.getByRole('button', { name: 'Find recipes' }))

  expect(await screen.findByRole('alert')).toHaveTextContent('not set up yet')
  expect(fetchRecipes).toHaveBeenCalledWith(['bread', 'avocado', 'eggs'], 'vegetarian')

  await user.click(screen.getByRole('button', { name: 'Use built-in recipes' }))
  expect(await screen.findByRole('heading', { name: 'Avocado toast with egg' })).toBeInTheDocument()
})

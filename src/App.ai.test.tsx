import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, it, vi } from 'vitest'
import App from './App'
import { ApiError, detectIngredients, fetchRecipes } from './lib/api'
import { DEFAULT_PREFERENCES, type RecipeContent } from './types'

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
  expect(screen.getByText('1 of 4 photos')).toBeInTheDocument()
}

beforeEach(() => {
  vi.mocked(detectIngredients).mockReset()
  vi.mocked(fetchRecipes).mockReset()
  // jsdom does not implement object URLs.
  URL.createObjectURL = vi.fn(() => 'blob:preview')
  URL.revokeObjectURL = vi.fn()
})

it('adds a photo pasted from the clipboard', async () => {
  render(<App />)
  await screen.findByRole('button', { name: /Add photos/ })
  const screenshot = new File(['x'], 'image.png', { type: 'image/png' })
  const text = { kind: 'string', type: 'text/plain', getAsFile: () => null }
  const image = { kind: 'file', type: 'image/png', getAsFile: () => screenshot }
  const event = new Event('paste', { bubbles: true, cancelable: true })
  Object.defineProperty(event, 'clipboardData', { value: { items: [text, image] } })
  act(() => {
    document.dispatchEvent(event)
  })
  expect(await screen.findByAltText('Pasted photo')).toBeInTheDocument()
  expect(event.defaultPrevented).toBe(true)
})

it('detects ingredients from a photo and shows AI recipes', async () => {
  vi.mocked(detectIngredients).mockResolvedValue(['chicken', 'broccoli'])
  let finish: (recipes: RecipeContent[]) => void = () => undefined
  vi.mocked(fetchRecipes).mockReturnValue(
    new Promise((resolve) => {
      finish = resolve
    }),
  )
  const user = userEvent.setup()
  render(<App />)

  expect(await screen.findByRole('button', { name: /Add photos/ })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Detect ingredients' })).not.toBeInTheDocument()
  await uploadPhoto(user)
  await user.click(screen.getByRole('button', { name: 'Detect ingredients' }))

  expect(
    await screen.findByRole('heading', { name: 'We spotted 2 ingredients' }),
  ).toBeInTheDocument()
  const list = screen.getByRole('list', { name: 'Your ingredients' })
  expect(within(list).getByText('chicken')).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Find recipes' }))
  expect(
    await screen.findByRole('heading', { name: 'Finding healthy recipes…' }),
  ).toBeInTheDocument()

  finish([stirFry])
  expect(
    await screen.findByRole('heading', { name: 'Garlic chicken stir-fry' }),
  ).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: '1 healthy recipe for you' })).toBeInTheDocument()
  expect(screen.getByText('Need soy sauce')).toBeInTheDocument()
  expect(screen.getByText('Cook the chicken for 6 minutes.')).toBeInTheDocument()
  // Default staples (oil, salt, pepper) count as available too.
  expect(fetchRecipes).toHaveBeenCalledWith(
    ['chicken', 'broccoli', 'olive oil', 'salt', 'black pepper'],
    DEFAULT_PREFERENCES,
  )
})

it('shows a busy state while detecting, then an error with retry', async () => {
  let fail: (error: Error) => void = () => undefined
  vi.mocked(detectIngredients)
    .mockReturnValueOnce(
      new Promise((_, reject) => {
        fail = reject
      }),
    )
    .mockResolvedValueOnce([])
  const user = userEvent.setup()
  render(<App />)

  await uploadPhoto(user)
  await user.click(screen.getByRole('button', { name: 'Detect ingredients' }))
  expect(await screen.findByText('Looking for ingredients…')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Remove fridge.png' })).toBeDisabled()

  fail(new ApiError('rate_limited'))
  expect(await screen.findByRole('alert')).toHaveTextContent('Too many requests')

  await user.click(screen.getByRole('button', { name: 'Try again' }))
  expect(await screen.findByText(/could not spot any food/)).toBeInTheDocument()
})

it('switches to built-in recipes on its own when the AI request fails', async () => {
  vi.mocked(fetchRecipes).mockRejectedValue(new ApiError('not_configured'))
  const user = userEvent.setup()
  render(<App />)

  await user.click(await screen.findByRole('button', { name: 'Type ingredients instead' }))
  await user.type(await screen.findByLabelText('Ingredient name'), 'bread, avocado, eggs{Enter}')
  await user.click(screen.getByRole('radio', { name: 'Vegetarian' }))
  await user.click(screen.getByRole('radio', { name: '30 min' }))
  await user.click(screen.getByRole('checkbox', { name: 'Nuts' }))
  await user.click(screen.getByRole('radio', { name: 'Italian' }))
  await user.click(screen.getByRole('button', { name: 'More servings' }))
  await user.click(screen.getByRole('button', { name: 'Find recipes' }))

  expect(await screen.findByRole('heading', { name: 'Avocado toast with egg' })).toBeInTheDocument()
  expect(screen.getByText(/AI kitchen couldn’t answer/)).toBeInTheDocument()
  expect(fetchRecipes).toHaveBeenCalledWith(
    ['bread', 'avocado', 'eggs', 'olive oil', 'salt', 'black pepper'],
    {
      diet: 'vegetarian',
      maxMinutes: 30,
      avoid: ['nuts'],
      cuisine: 'italian',
      servings: 3,
    },
  )

  // Trying the AI again replaces the library picks when it answers.
  vi.mocked(fetchRecipes).mockResolvedValue([stirFry])
  await user.click(screen.getByRole('button', { name: 'Try the AI again' }))
  expect(await screen.findByRole('heading', { name: stirFry.title })).toBeInTheDocument()
  expect(screen.queryByText(/AI kitchen couldn’t answer/)).not.toBeInTheDocument()
})

it('shows the error when the library has nothing either', async () => {
  vi.mocked(fetchRecipes).mockRejectedValue(new ApiError('not_configured'))
  const user = userEvent.setup()
  render(<App />)

  await user.click(await screen.findByRole('button', { name: 'Type ingredients instead' }))
  await user.type(await screen.findByLabelText('Ingredient name'), 'ketchup{Enter}')
  await user.click(screen.getByRole('button', { name: 'Find recipes' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('not set up yet')
  expect(screen.getByRole('button', { name: 'Use built-in recipes' })).toBeInTheDocument()
})

it('skips the network when the browser is offline', async () => {
  const online = vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
  const user = userEvent.setup()
  render(<App />)

  await user.click(await screen.findByRole('button', { name: 'Type ingredients instead' }))
  await user.type(await screen.findByLabelText('Ingredient name'), 'eggs, spinach{Enter}')
  await user.click(screen.getByRole('button', { name: 'Find recipes' }))
  expect(await screen.findByText(/You’re offline/)).toBeInTheDocument()
  expect(fetchRecipes).not.toHaveBeenCalled()
  online.mockRestore()
})

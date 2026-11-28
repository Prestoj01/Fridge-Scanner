import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import App from './App'
import { recipeFromHash, recipeHash } from './lib/shareLink'

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
  const list = await screen.findByRole('list', { name: 'Your ingredients' })
  expect(within(list).getByText('ketchup')).toBeInTheDocument()
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

it('remembers ingredients between visits and offers to continue', async () => {
  const user = userEvent.setup()
  const { unmount } = render(<App />)

  await user.click(await screen.findByRole('button', { name: 'Type your ingredients' }))
  await user.type(await screen.findByLabelText('Ingredient name'), 'eggs, rice{Enter}')
  unmount()

  render(<App />)
  expect(await screen.findByText('From last time')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Continue with these' }))
  const list = await screen.findByRole('list', { name: 'Your ingredients' })
  expect(within(list).getByText('rice')).toBeInTheDocument()
})

it('clears the remembered list', async () => {
  localStorage.setItem(
    'fridge-scanner:pantry',
    JSON.stringify({ ingredients: [{ id: 'a', name: 'eggs', source: 'manual' }] }),
  )
  const user = userEvent.setup()
  render(<App />)
  await user.click(await screen.findByRole('button', { name: 'Clear' }))
  expect(screen.queryByText('From last time')).not.toBeInTheDocument()
  expect(localStorage.getItem('fridge-scanner:pantry')).toBeNull()
})

it('saves a recipe and shows it on the Saved page', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.click(await screen.findByRole('button', { name: 'Type your ingredients' }))
  await user.type(await screen.findByLabelText('Ingredient name'), 'eggs, spinach, tomato{Enter}')
  await user.click(screen.getByRole('button', { name: 'Find recipes' }))

  const save = await screen.findByRole('button', { name: 'Save Spinach and tomato omelette' })
  await user.click(save)
  expect(
    screen.getByRole('button', { name: 'Remove Spinach and tomato omelette from saved' }),
  ).toHaveAttribute('aria-pressed', 'true')

  await user.click(screen.getByRole('link', { name: /Saved/ }))
  expect(await screen.findByRole('heading', { name: 'Your saved recipes' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Spinach and tomato omelette' })).toBeInTheDocument()

  await user.click(
    screen.getByRole('button', { name: 'Remove Spinach and tomato omelette from saved' }),
  )
  expect(await screen.findByText('Nothing saved yet')).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Back to cooking' }))
  expect(
    await screen.findByRole('heading', { name: /healthy recipes for you/ }),
  ).toBeInTheDocument()
})

it('adds missing ingredients to a shopping list and checks them off', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.click(await screen.findByRole('button', { name: 'Type your ingredients' }))
  await user.type(await screen.findByLabelText('Ingredient name'), 'bread, avocado{Enter}')
  await user.click(screen.getByRole('button', { name: 'Find recipes' }))

  await user.click(await screen.findByRole('button', { name: 'Add it to shopping list' }))
  await user.click(screen.getByRole('link', { name: 'On your shopping list' }))

  const list = await screen.findByRole('group', { name: 'Shopping list' })
  expect(within(list).getByRole('heading', { name: 'Dairy and eggs' })).toBeInTheDocument()
  expect(within(list).getByText('eggs')).toBeInTheDocument()
  await user.click(within(list).getByRole('checkbox'))
  expect(within(list).getByRole('checkbox')).toBeChecked()
  expect(screen.getByText('All done. Nice shopping.')).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Clear checked' }))
  expect(await screen.findByText('Nothing to buy')).toBeInTheDocument()
})

it('swaps a recipe for something different and finds more ideas', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.click(await screen.findByRole('button', { name: 'Type your ingredients' }))
  await user.type(
    await screen.findByLabelText('Ingredient name'),
    'eggs, spinach, tomato, bread, avocado, rice, pasta, garlic, chickpeas, cucumber, lemon{Enter}',
  )
  await user.click(screen.getByRole('button', { name: 'Find recipes' }))

  const titles = () => screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)
  await screen.findByRole('heading', { name: /healthy recipes for you/ })
  const before = titles()
  const [firstSwap] = screen.getAllByRole('button', { name: 'Something different' })
  if (!firstSwap) throw new Error('expected a swap button')
  await user.click(firstSwap)
  await waitFor(() => {
    expect(titles()[0]).not.toBe(before[0])
  })
  expect(new Set(titles()).size).toBe(titles().length)

  await user.click(screen.getByRole('button', { name: 'More ideas' }))
  await waitFor(() => {
    expect(titles().length).toBeGreaterThan(before.length)
  })
})

it('walks through a recipe in cooking mode', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.click(await screen.findByRole('button', { name: 'Type your ingredients' }))
  await user.type(await screen.findByLabelText('Ingredient name'), 'eggs, spinach, tomato{Enter}')
  await user.click(screen.getByRole('button', { name: 'Find recipes' }))

  const [start] = await screen.findAllByRole('button', { name: 'Start cooking' })
  if (!start) throw new Error('expected a Start cooking button')
  await user.click(start)

  const dialog = await screen.findByRole('dialog', { name: 'Spinach and tomato omelette' })
  expect(within(dialog).getByText('Before you start')).toBeInTheDocument()
  await user.click(within(dialog).getByRole('checkbox', { name: /eggs/ }))
  expect(within(dialog).getByRole('checkbox', { name: /eggs/ })).toBeChecked()

  await user.click(within(dialog).getByRole('button', { name: 'Let’s cook' }))
  expect(await within(dialog).findByText('Step 1 of 5')).toBeInTheDocument()
  await user.keyboard('{ArrowRight}')
  expect(await within(dialog).findByText('Step 2 of 5')).toBeInTheDocument()

  await user.keyboard('{Escape}')
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

it('opens a recipe from a share link', async () => {
  window.location.hash = recipeHash({
    title: 'Shared lentil soup',
    summary: 'Warming.',
    timeMinutes: 40,
    servings: 4,
    ingredients: ['1 cup lentils'],
    usedIngredients: ['lentils'],
    missingIngredients: [],
    steps: ['Simmer for 25 minutes.'],
    healthNote: 'Fibre.',
  })
  render(<App />)
  expect(await screen.findByRole('heading', { name: 'A recipe for you' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Shared lentil soup' })).toBeInTheDocument()
})

it('explains a broken share link', async () => {
  window.location.hash = '#recipe=broken'
  render(<App />)
  expect(await screen.findByText('We couldn’t read that recipe')).toBeInTheDocument()
})

it('copies a share link when the device has no share sheet', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.click(await screen.findByRole('button', { name: 'Type your ingredients' }))
  await user.type(await screen.findByLabelText('Ingredient name'), 'eggs, spinach, tomato{Enter}')
  await user.click(screen.getByRole('button', { name: 'Find recipes' }))

  const [share] = await screen.findAllByRole('button', { name: 'Share' })
  if (!share) throw new Error('expected a Share button')
  await user.click(share)
  expect(await screen.findByRole('button', { name: 'Link copied' })).toBeInTheDocument()
  const copied = await navigator.clipboard.readText()
  expect(copied).toContain('#recipe=')
  expect(recipeFromHash(copied.slice(copied.indexOf('#')))?.title).toBe(
    'Spinach and tomato omelette',
  )
})

it('never lists ticked kitchen staples as missing', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.click(await screen.findByRole('button', { name: 'Type your ingredients' }))
  await user.type(await screen.findByLabelText('Ingredient name'), 'chicken, broccoli{Enter}')
  await user.click(screen.getByText(/Always in your kitchen/))
  await user.click(screen.getByRole('checkbox', { name: 'Garlic' }))
  await user.click(screen.getByRole('checkbox', { name: 'Soy sauce' }))
  await user.click(screen.getByRole('button', { name: 'Find recipes' }))

  const heading = await screen.findByRole('heading', { name: 'Chicken and broccoli stir-fry' })
  const card = heading.closest('article')
  if (!card) throw new Error('Recipe card not found')
  expect(within(card).getByText('You have everything')).toBeInTheDocument()
})

it('puts recipes that use up marked ingredients first and says so', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.click(await screen.findByRole('button', { name: 'Type your ingredients' }))
  await user.type(
    await screen.findByLabelText('Ingredient name'),
    'eggs, spinach, tomato, oats, banana, milk{Enter}',
  )
  const toggle = screen.getByRole('button', { name: 'Use soon: banana' })
  await user.click(toggle)
  expect(toggle).toHaveAttribute('aria-pressed', 'true')
  await user.click(screen.getByRole('button', { name: 'Find recipes' }))

  const [first] = await screen.findAllByRole('article')
  if (!first) throw new Error('No recipes')
  expect(within(first).getByText('Uses up banana')).toBeInTheDocument()
})

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import type { Recipe } from '../types'
import { RecipeCard } from './RecipeCard'
import { SavedProvider } from './SavedProvider'
import { ShoppingProvider } from './ShoppingProvider'

const recipe: Recipe = {
  id: 'r1',
  source: 'library',
  title: 'Roast vegetables',
  summary: '',
  timeMinutes: 30,
  servings: 2,
  ingredients: ['2 cups chopped vegetables', '1 tbsp olive oil'],
  usedIngredients: ['vegetables'],
  missingIngredients: [],
  steps: ['Heat the oven to 400°F (200°C).', 'Roast for 25 minutes.'],
  healthNote: '',
}

it('switches every amount and oven temperature between US and metric', async () => {
  localStorage.setItem('fridge-scanner:units', JSON.stringify('us'))
  const user = userEvent.setup()
  render(
    <SavedProvider>
      <ShoppingProvider>
        <RecipeCard recipe={recipe} index={0} defaultOpen />
      </ShoppingProvider>
    </SavedProvider>,
  )

  expect(screen.getByText('2 cups chopped vegetables')).toBeInTheDocument()
  expect(screen.getByText('Heat the oven to 400°F.')).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Metric' }))
  expect(screen.getByText('480 ml chopped vegetables')).toBeInTheDocument()
  expect(screen.getByText('1 tbsp olive oil')).toBeInTheDocument()
  expect(screen.getByText('Heat the oven to 200°C.')).toBeInTheDocument()
  expect(localStorage.getItem('fridge-scanner:units')).toBe('"metric"')
})

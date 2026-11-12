import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, expect, it, vi } from 'vitest'
import App from './App'

beforeAll(() => {
  // jsdom does not implement object URLs.
  URL.createObjectURL = vi.fn(() => 'blob:preview')
  URL.revokeObjectURL = vi.fn()
})

it('starts on the upload step with an empty state', async () => {
  render(<App />)

  expect(await screen.findByRole('heading', { name: 'Snap your fridge' })).toBeInTheDocument()
  expect(screen.getByText('No photos yet')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Review ingredients' })).toBeDisabled()
})

it('walks through upload, review, and recipes', async () => {
  const user = userEvent.setup()
  render(<App />)

  const photo = new File(['x'], 'fridge.png', { type: 'image/png' })
  await user.upload(await screen.findByLabelText('Choose photos'), photo)
  expect(screen.getByAltText('fridge.png')).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Review ingredients' }))
  expect(await screen.findByText('No ingredients yet')).toBeInTheDocument()

  await user.type(screen.getByLabelText('Ingredient name'), 'Spinach{Enter}')
  expect(screen.getByText('spinach')).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Find recipes' }))
  expect(await screen.findByText('No recipes yet')).toBeInTheDocument()
})

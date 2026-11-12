import { render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { ErrorBoundary } from './ErrorBoundary'

function Boom(): never {
  throw new Error('boom')
}

it('renders a fallback when a child throws', () => {
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)

  render(
    <ErrorBoundary>
      <Boom />
    </ErrorBoundary>,
  )

  expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong')
  consoleError.mockRestore()
})

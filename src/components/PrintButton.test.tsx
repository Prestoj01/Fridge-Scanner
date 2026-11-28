import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRef } from 'react'
import { expect, it, vi } from 'vitest'
import { PrintButton } from './PrintButton'

function Card() {
  const ref = useRef<HTMLElement>(null)
  return (
    <article ref={ref}>
      <svg>
        <defs>
          <radialGradient id="g1" />
        </defs>
        <circle fill="url(#g1)" />
      </svg>
      <details>
        <summary>Steps</summary>
        <p>Toast the bread.</p>
      </details>
      <PrintButton card={ref} />
    </article>
  )
}

it('prints a copy of the card on its own sheet, then cleans up', async () => {
  let sheet: Element | null = null
  const print = vi.spyOn(window, 'print').mockImplementation(() => {
    sheet = document.querySelector('.print-sheet')
  })
  const user = userEvent.setup()
  render(<Card />)

  await user.click(screen.getByRole('button', { name: 'Print' }))
  expect(print).toHaveBeenCalled()
  expect(document.body).toHaveClass('print-one')
  const copy = sheet as Element | null
  expect(copy?.querySelector('details')).toHaveAttribute('open')
  // The copy's gradient has its own id so it still draws while the original is hidden.
  expect(copy?.querySelector('circle')?.getAttribute('fill')).toBe('url(#print-g1)')
  expect(copy?.querySelector('#print-g1')).not.toBeNull()

  window.dispatchEvent(new Event('afterprint'))
  expect(document.querySelector('.print-sheet')).toBeNull()
  expect(document.body).not.toHaveClass('print-one')
  print.mockRestore()
})

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { splitWords } from '../lib/text'
import { RevealText } from './RevealText'

describe('RevealText', () => {
  it('splits words and marks emphasis', () => {
    expect(splitWords('We spotted *6 ingredients*')).toEqual([
      { word: 'We', emphasis: false },
      { word: 'spotted', emphasis: false },
      { word: '6', emphasis: true },
      { word: 'ingredients', emphasis: true },
    ])
  })

  it('keeps the readable text intact for assistive tech', () => {
    render(
      <h2>
        <RevealText text="Turn what you have into a *healthy meal*" />
      </h2>,
    )
    expect(
      screen.getByRole('heading', { name: 'Turn what you have into a healthy meal' }),
    ).toBeInTheDocument()
    expect(screen.getByText('healthy').tagName).toBe('EM')
  })
})

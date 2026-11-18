import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { useRotatingLine } from './useRotatingLine'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

it('rotates through lines and restarts when the list changes', () => {
  const { result, rerender } = renderHook(({ lines }) => useRotatingLine(lines, 1000), {
    initialProps: { lines: ['a', 'b', 'c'] as [string, ...string[]] },
  })
  expect(result.current).toBe('a')
  act(() => {
    vi.advanceTimersByTime(1000)
  })
  expect(result.current).toBe('b')

  // A fresh array with the same text keeps the position.
  rerender({ lines: ['a', 'b', 'c'] })
  expect(result.current).toBe('b')

  rerender({ lines: ['x'] })
  expect(result.current).toBe('x')
  act(() => {
    vi.advanceTimersByTime(5000)
  })
  expect(result.current).toBe('x')
})

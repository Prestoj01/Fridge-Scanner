import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { playChime } from '../lib/chime'
import { useStepTimers } from './useStepTimers'

vi.mock('../lib/chime', () => ({ playChime: vi.fn() }))

beforeEach(() => {
  vi.useFakeTimers()
  vi.mocked(playChime).mockClear()
})

afterEach(() => {
  vi.useRealTimers()
})

it('counts down, pauses, resumes, and chimes once when done', () => {
  const { result } = renderHook(() => useStepTimers())

  act(() => {
    result.current.start(1, 10)
  })
  act(() => {
    vi.advanceTimersByTime(4000)
  })
  expect(result.current.secondsLeft(1)).toBeCloseTo(6, 0)

  act(() => {
    result.current.pause(1)
  })
  act(() => {
    vi.advanceTimersByTime(5000)
  })
  expect(result.current.secondsLeft(1)).toBeCloseTo(6, 0)

  act(() => {
    result.current.start(1, 10)
  })
  act(() => {
    vi.advanceTimersByTime(6500)
  })
  expect(result.current.timers.get(1)?.done).toBe(true)
  expect(result.current.secondsLeft(1)).toBe(0)
  act(() => {
    vi.advanceTimersByTime(2000)
  })
  expect(playChime).toHaveBeenCalledTimes(1)

  act(() => {
    result.current.reset(1)
  })
  expect(result.current.timers.has(1)).toBe(false)
})

import { describe, expect, it } from 'vitest'
import { findTimer, formatClock, formatDuration } from './timers'

describe('findTimer', () => {
  it('reads minutes, seconds, and hours', () => {
    expect(findTimer('Cook the chicken for 6 minutes.')).toEqual({ seconds: 360, label: '6 min' })
    expect(findTimer('Heat the garlic for 30 seconds.')).toEqual({ seconds: 30, label: '30 sec' })
    expect(findTimer('Braise for 2 hours.')).toEqual({ seconds: 7200, label: '2 hr' })
    expect(findTimer('Bake 45 mins')?.seconds).toBe(2700)
  })

  it('uses the lower bound of a range', () => {
    expect(findTimer('Simmer for 25 to 30 minutes, until tender.')?.seconds).toBe(1500)
    expect(findTimer('Cook for 2-3 minutes')?.seconds).toBe(120)
    expect(findTimer('Roast for 10 to 12 minutes more')?.seconds).toBe(600)
  })

  it('ignores steps without a time and other numbers', () => {
    expect(findTimer('Whisk the eggs with a pinch of salt.')).toBeNull()
    expect(findTimer('Heat the oven to 400°F (200°C).')).toBeNull()
    expect(findTimer('Cut into 1-inch cubes.')).toBeNull()
  })
})

describe('formatting', () => {
  it('formats durations and clocks', () => {
    expect(formatDuration(90 * 60)).toBe('1 hr 30 min')
    expect(formatClock(245)).toBe('4:05')
    expect(formatClock(3725)).toBe('1:02:05')
    expect(formatClock(-3)).toBe('0:00')
  })
})

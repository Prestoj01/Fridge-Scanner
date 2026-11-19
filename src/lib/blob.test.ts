import { describe, expect, it } from 'vitest'
import { blobLoop, blobPath } from './blob'

function commands(path: string): string {
  return path.replace(/[^MCZ]/g, '')
}

describe('blob paths', () => {
  it('draws a closed curve with one Bézier per point', () => {
    const path = blobPath([50, 52, 48, 51, 49, 50, 53, 47])
    expect(commands(path)).toBe(`M${'C'.repeat(8)}Z`)
  })

  it('makes seamless, morphable loops', () => {
    const loop = blobLoop(60, 8, 3)
    expect(loop).toHaveLength(5)
    expect(loop[4]).toBe(loop[0])
    expect(new Set(loop.map(commands)).size).toBe(1)
    expect(blobLoop(60, 8, 3)).toEqual(loop)
  })
})

/**
 * Generates smooth, closed blob outlines. Every path has the same number
 * of points and commands, so any two can be morphed into each other.
 */

const POINTS = 8

function round(value: number): number {
  return Math.round(value * 100) / 100
}

/** A closed Catmull-Rom curve through points around (cx, cy), written as cubic Béziers. */
export function blobPath(radii: readonly number[], cx = 100, cy = 100): string {
  const points = radii.map((radius, index) => {
    const angle = (index / radii.length) * Math.PI * 2 - Math.PI / 2
    return [cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius] as const
  })
  const at = (index: number) => points[(index + points.length) % points.length] ?? [cx, cy]

  const start = at(0)
  let d = `M${String(round(start[0]))} ${String(round(start[1]))}`
  for (let i = 0; i < points.length; i++) {
    const p0 = at(i - 1)
    const p1 = at(i)
    const p2 = at(i + 1)
    const p3 = at(i + 2)
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += ` C${String(round(c1[0] ?? 0))} ${String(round(c1[1] ?? 0))} ${String(round(c2[0] ?? 0))} ${String(round(c2[1] ?? 0))} ${String(round(p2[0]))} ${String(round(p2[1]))}`
  }
  return `${d} Z`
}

/**
 * A loop of blob shapes for morphing. `wobble` is how far each point may
 * stray from the base radius; the last shape repeats the first so loops are seamless.
 */
export function blobLoop(base: number, wobble: number, seed: number, frames = 4): string[] {
  const shapes: string[] = []
  for (let frame = 0; frame < frames; frame++) {
    const radii = Array.from({ length: POINTS }, (_, i) => {
      const phase = Math.sin((seed + 1) * 12.9898 + i * 78.233 + frame * 4.1) * 43758.5453
      const noise = phase - Math.floor(phase)
      return base + (noise * 2 - 1) * wobble
    })
    shapes.push(blobPath(radii))
  }
  const first = shapes[0]
  if (first !== undefined) shapes.push(first)
  return shapes
}

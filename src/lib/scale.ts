/**
 * Scales the leading amount in an ingredient line, e.g. "1 1/2 cups rice"
 * at ×2 becomes "3 cups rice". Lines without a leading amount are kept.
 */

const FRACTIONS: readonly [number, string][] = [
  [0, ''],
  [1 / 8, '⅛'],
  [1 / 4, '¼'],
  [1 / 3, '⅓'],
  [1 / 2, '½'],
  [2 / 3, '⅔'],
  [3 / 4, '¾'],
  [1, ''],
]

const UNICODE: Record<string, number> = {
  '¼': 0.25,
  '½': 0.5,
  '¾': 0.75,
  '⅓': 1 / 3,
  '⅔': 2 / 3,
  '⅛': 0.125,
}

// "1 1/2", "1/2", "1.5", "2", "1½", "½"
const AMOUNT = /^(\d+(?:\.\d+)?)?(?:\s*(\d+)\/(\d+)|\s*([¼½¾⅓⅔⅛]))?(?=\s|$)/

export function parseAmount(line: string): { value: number; length: number } | null {
  const match = AMOUNT.exec(line)
  if (!match || match[0].trim() === '') return null
  const [whole, , num, den, glyph] = [match[1], match[0], match[2], match[3], match[4]]
  let value = whole !== undefined ? Number(whole) : 0
  if (num !== undefined && den !== undefined && Number(den) !== 0)
    value += Number(num) / Number(den)
  if (glyph !== undefined) value += UNICODE[glyph] ?? 0
  return value > 0 ? { value, length: match[0].length } : null
}

/** Formats a quantity with kitchen-friendly fractions: 1.5 -> "1½", 0.33 -> "⅓". */
export function formatAmount(value: number): string {
  if (value >= 10) return String(Math.round(value))
  let whole = Math.floor(value)
  const rest = value - whole
  let best = FRACTIONS[0] ?? [0, '']
  for (const candidate of FRACTIONS) {
    if (Math.abs(candidate[0] - rest) < Math.abs(best[0] - rest)) best = candidate
  }
  if (best[0] === 1) {
    whole += 1
    best = [0, '']
  }
  if (whole === 0 && best[1] === '') return '⅛'
  return `${whole > 0 ? String(whole) : ''}${best[1]}`
}

export function scaleLine(line: string, factor: number): string {
  if (factor === 1) return line
  const amount = parseAmount(line)
  if (!amount) return line
  return formatAmount(amount.value * factor) + line.slice(amount.length)
}

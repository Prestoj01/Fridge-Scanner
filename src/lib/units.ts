import { formatAmount, parseAmount } from './scale'

/**
 * Converts recipe amounts between US kitchen units and metric. Spoons stay
 * as they are, since tablespoons and teaspoons are used everywhere.
 */
export type UnitSystem = 'us' | 'metric'

type Unit = 'cup' | 'oz' | 'lb' | 'g' | 'kg' | 'ml' | 'l'

const UNIT_WORDS: readonly [RegExp, Unit][] = [
  [/^cups?\b/i, 'cup'],
  [/^(?:oz|ounces?)\b/i, 'oz'],
  [/^(?:lbs?|pounds?)\b/i, 'lb'],
  [/^(?:kg|kilograms?)\b/i, 'kg'],
  [/^(?:g|grams?)\b/i, 'g'],
  [/^(?:ml|milliliters?|millilitres?)\b/i, 'ml'],
  [/^(?:l|liters?|litres?)\b/i, 'l'],
]

const US_UNITS = new Set<Unit>(['cup', 'oz', 'lb'])

/** Rounds metric amounts to what a scale or jug can show. */
function roundMetric(value: number): number {
  const step = value < 100 ? 5 : value < 1000 ? 10 : 50
  return Math.max(step, Math.round(value / step) * step)
}

function toMetric(value: number, unit: Unit): string | null {
  if (unit === 'cup') {
    const ml = value * 240
    return ml >= 1000 ? `${String(Math.round(ml / 100) / 10)} l` : `${String(roundMetric(ml))} ml`
  }
  if (unit === 'oz') return `${String(roundMetric(value * 28.35))} g`
  if (unit === 'lb') {
    const grams = value * 453.6
    return grams >= 1000
      ? `${String(Math.round(grams / 100) / 10)} kg`
      : `${String(roundMetric(grams))} g`
  }
  return null
}

/** "1 cup", "1½ cups", "¾ cup": plural only when the shown amount is over one. */
function withUnit(amount: number, word: string): string {
  const text = formatAmount(amount)
  return `${text} ${amount > 1 && text !== '1' ? `${word}s` : word}`
}

function toUs(value: number, unit: Unit): string | null {
  if (unit === 'g' || unit === 'kg') {
    const ounces = unit === 'g' ? value / 28.35 : (value * 1000) / 28.35
    // From about a pound up, pounds read better than "16 oz".
    if (ounces >= 15.5) {
      const pounds = ounces / 16
      return withUnit(pounds, 'lb')
    }
    return `${formatAmount(ounces)} oz`
  }
  if (unit === 'ml' || unit === 'l') {
    const ml = unit === 'ml' ? value : value * 1000
    if (ml >= 60) {
      const cups = ml / 240
      return withUnit(cups, 'cup')
    }
    if (ml >= 15) return `${formatAmount(ml / 15)} tbsp`
    return `${formatAmount(ml / 5)} tsp`
  }
  return null
}

/** Converts the leading amount and unit of an ingredient line, if it has one. */
export function convertLine(line: string, system: UnitSystem): string {
  const amount = parseAmount(line)
  if (!amount) return line
  const afterAmount = line.slice(amount.length)
  const rest = afterAmount.trimStart()
  const found = UNIT_WORDS.find(([pattern]) => pattern.test(rest))
  if (!found) return line
  const [pattern, unit] = found
  const unitText = pattern.exec(rest)?.[0] ?? ''
  let tail = rest.slice(unitText.length)

  const isUs = US_UNITS.has(unit)
  if ((system === 'metric') !== isUs) return line

  // Lines that already give both ("6 oz (170 g) pasta") keep the given conversion.
  const given = /^\s*\(([^)]+)\)/.exec(tail)
  if (given?.[1] !== undefined) {
    tail = tail.slice(given[0].length)
    return `${given[1].trim()}${tail}`
  }
  const converted = system === 'metric' ? toMetric(amount.value, unit) : toUs(amount.value, unit)
  return converted === null ? line : `${converted}${tail}`
}

const BOTH_TEMPS = /(\d+)\s?°F\s*\((\d+)\s?°C\)/g

/** Shows oven temperatures in the chosen system: "400°F (200°C)" becomes "200°C". */
export function convertStep(step: string, system: UnitSystem): string {
  const paired = step.replace(BOTH_TEMPS, (_, f: string, c: string) =>
    system === 'metric' ? `${c}°C` : `${f}°F`,
  )
  if (system === 'metric') {
    return paired.replace(
      /(\d+)\s?°F/g,
      (_, f: string) => `${String(Math.round(((Number(f) - 32) * 5) / 9 / 5) * 5)}°C`,
    )
  }
  return paired.replace(
    /(\d+)\s?°C/g,
    (_, c: string) => `${String(Math.round(((Number(c) * 9) / 5 + 32) / 5) * 5)}°F`,
  )
}

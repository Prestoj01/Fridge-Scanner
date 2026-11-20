import { matchesTerm } from './recipeLibrary'

export type FoodKind =
  'tomato' | 'egg' | 'avocado' | 'lemon' | 'broccoli' | 'carrot' | 'leaf' | 'jar'

/** Checked in order; the first kind with a matching term wins. */
const RULES: readonly (readonly [FoodKind, readonly string[]])[] = [
  ['jar', ['peanut butter', 'almond butter', 'jam', 'sauce', 'ketchup', 'mustard', 'mayo']],
  ['tomato', ['tomato', 'strawberry', 'apple', 'cherry']],
  ['egg', ['egg']],
  ['avocado', ['avocado', 'guacamole']],
  ['lemon', ['lemon', 'lime', 'orange', 'grapefruit', 'citrus']],
  ['broccoli', ['broccoli', 'broccolini', 'cauliflower', 'brussels sprout']],
  ['carrot', ['carrot', 'sweet potato', 'squash', 'pumpkin']],
  [
    'leaf',
    [
      'spinach',
      'lettuce',
      'kale',
      'arugula',
      'chard',
      'cabbage',
      'basil',
      'parsley',
      'cilantro',
      'herb',
      'greens',
      'salad',
    ],
  ],
]

/** Picks the illustration that best represents an ingredient name. */
export function foodKind(name: string): FoodKind {
  for (const [kind, terms] of RULES) {
    if (terms.some((term) => matchesTerm(name, term))) return kind
  }
  return 'jar'
}

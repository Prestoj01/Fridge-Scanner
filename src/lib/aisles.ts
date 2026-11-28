import { matchesTerm } from './recipeLibrary'

/** Store sections, in the order most people walk them. */
export const AISLES = [
  'Produce',
  'Meat and fish',
  'Dairy and eggs',
  'Bakery',
  'Pantry',
  'Spices and sauces',
  'Frozen',
  'Other',
] as const

export type Aisle = (typeof AISLES)[number]

/** Words that place an item in an aisle. Checked in order, so specific words come first. */
const RULES: readonly [Aisle, readonly string[]][] = [
  ['Frozen', ['frozen', 'ice cream']],
  [
    'Spices and sauces',
    [
      'soy sauce',
      'tamari',
      'coconut aminos',
      'hot sauce',
      'sauce',
      'salt',
      'black pepper',
      'pepper flakes',
      'cumin',
      'paprika',
      'oregano',
      'cinnamon',
      'chili powder',
      'curry',
      'spice',
      'vinegar',
      'mustard',
      'ketchup',
      'mayonnaise',
      'honey',
      'maple syrup',
      'oil',
      'vanilla',
    ],
  ],
  [
    'Pantry',
    [
      'canned',
      'rice',
      'pasta',
      'noodle',
      'oat',
      'granola',
      'lentil',
      'chickpea',
      'bean',
      'flour',
      'sugar',
      'broth',
      'stock',
      'peanut butter',
      'nut',
      'almond',
      'seed',
      'quinoa',
      'tuna',
      'cereal',
      'cracker',
      'baking',
    ],
  ],
  [
    'Dairy and eggs',
    ['milk', 'yogurt', 'cheese', 'butter', 'cream', 'egg', 'tofu', 'feta', 'parmesan'],
  ],
  [
    'Meat and fish',
    [
      'chicken',
      'beef',
      'pork',
      'turkey',
      'lamb',
      'bacon',
      'sausage',
      'ham',
      'salmon',
      'fish',
      'shrimp',
      'cod',
      'steak',
      'mince',
    ],
  ],
  ['Bakery', ['bread', 'tortilla', 'bagel', 'bun', 'roll', 'pita', 'wrap', 'croissant']],
  [
    'Produce',
    [
      'apple',
      'banana',
      'berry',
      'berries',
      'lemon',
      'lime',
      'orange',
      'avocado',
      'tomato',
      'potato',
      'sweet potato',
      'onion',
      'garlic',
      'ginger',
      'carrot',
      'celery',
      'cucumber',
      'lettuce',
      'spinach',
      'kale',
      'broccoli',
      'cauliflower',
      'pepper',
      'zucchini',
      'mushroom',
      'corn',
      'pea',
      'herb',
      'basil',
      'cilantro',
      'parsley',
      'scallion',
      'green onion',
      'cabbage',
      'asparagus',
      'squash',
      'fruit',
      'vegetable',
      'grape',
      'mango',
      'melon',
    ],
  ],
]

export function aisleFor(name: string): Aisle {
  const clean = name.toLowerCase()
  for (const [aisle, words] of RULES) {
    if (words.some((word) => matchesTerm(clean, word))) return aisle
  }
  return 'Other'
}

/** Groups items by aisle, in walking order, skipping empty aisles. */
export function groupByAisle<T extends { name: string }>(
  items: readonly T[],
): { aisle: Aisle; items: T[] }[] {
  const groups = new Map<Aisle, T[]>()
  for (const item of items) {
    const aisle = aisleFor(item.name)
    groups.set(aisle, [...(groups.get(aisle) ?? []), item])
  }
  return AISLES.flatMap((aisle) => {
    const found = groups.get(aisle)
    return found ? [{ aisle, items: found }] : []
  })
}

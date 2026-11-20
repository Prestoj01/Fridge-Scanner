import { matchesTerm } from './recipeLibrary'

export type FoodKind =
  | 'tomato'
  | 'egg'
  | 'avocado'
  | 'lemon'
  | 'broccoli'
  | 'carrot'
  | 'leaf'
  | 'pepper'
  | 'mushroom'
  | 'cheese'
  | 'bread'
  | 'milk'
  | 'meat'
  | 'onion'
  | 'grain'
  | 'fish'
  | 'jar'

/** Checked in order; the first kind with a matching term wins. */
const RULES: readonly (readonly [FoodKind, readonly string[]])[] = [
  ['jar', ['peanut butter', 'almond butter', 'jam', 'sauce', 'ketchup', 'mustard', 'mayo']],
  ['cheese', ['cheese', 'cheddar', 'mozzarella', 'parmesan', 'feta', 'halloumi', 'butter', 'tofu']],
  ['milk', ['milk', 'cream', 'yogurt', 'yoghurt', 'kefir']],
  ['fish', ['salmon', 'fish', 'tuna', 'cod', 'shrimp', 'prawn', 'trout', 'sardine', 'tilapia']],
  [
    'meat',
    [
      'chicken',
      'beef',
      'pork',
      'turkey',
      'lamb',
      'sausage',
      'bacon',
      'ham',
      'steak',
      'mince',
      'meat',
    ],
  ],
  [
    'bread',
    ['bread', 'toast', 'bagel', 'tortilla', 'wrap', 'bun', 'pita', 'baguette', 'sourdough'],
  ],
  [
    'grain',
    [
      'rice',
      'pasta',
      'spaghetti',
      'noodle',
      'oat',
      'quinoa',
      'couscous',
      'lentil',
      'bean',
      'chickpea',
      'flour',
      'cereal',
      'granola',
    ],
  ],
  ['tomato', ['tomato', 'strawberry', 'apple', 'cherry']],
  ['pepper', ['bell pepper', 'pepper', 'chili', 'chilli', 'capsicum', 'jalapeño', 'jalapeno']],
  ['mushroom', ['mushroom']],
  ['onion', ['onion', 'garlic', 'shallot', 'leek', 'scallion']],
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

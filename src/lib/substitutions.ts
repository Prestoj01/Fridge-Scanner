import { matchesTerm } from './recipeLibrary'

/**
 * Common stand-ins for ingredients a recipe needs but the cook lacks.
 * Checked in order; the first entry with a matching term wins.
 */
const SWAPS: readonly (readonly [readonly string[], readonly string[]])[] = [
  // Compound names first, so "peanut butter" is not read as "butter".
  [
    ['peanut butter', 'almond butter'],
    ['sunflower seed butter', 'tahini'],
  ],
  [
    ['soy sauce', 'tamari'],
    ['tamari', 'coconut aminos', 'a pinch of salt with a squeeze of lemon'],
  ],
  [['buttermilk'], ['milk with a splash of lemon juice', 'thinned plain yogurt']],
  [['sour cream'], ['plain Greek yogurt']],
  [
    ['heavy cream', 'cream'],
    ['milk with a knob of butter', 'coconut cream'],
  ],
  [
    ['greek yogurt', 'yogurt'],
    ['sour cream', 'cottage cheese, blended'],
  ],
  [['milk'], ['any plant milk', 'water with a little butter']],
  [['butter'], ['olive oil', 'coconut oil']],
  [['egg'], ['1 tbsp ground flax + 3 tbsp water (for baking)', 'mashed banana (for pancakes)']],
  [['parmesan'], ['pecorino', 'nutritional yeast']],
  [['feta'], ['goat cheese', 'ricotta with extra salt']],
  [['cheddar', 'cheese'], ['any melting cheese you have']],
  [['lemon'], ['lime', 'a splash of vinegar']],
  [['lime'], ['lemon', 'a splash of vinegar']],
  [['vinegar'], ['lemon juice']],
  [['garlic'], ['garlic powder (¼ tsp per clove)', 'shallot']],
  [
    ['onion', 'shallot'],
    ['leek', 'onion powder', 'scallions'],
  ],
  [
    ['scallion', 'spring onion'],
    ['chives', 'a little red onion'],
  ],
  [['basil'], ['parsley', 'spinach']],
  [['cilantro', 'coriander'], ['parsley with a squeeze of lime']],
  [['parsley'], ['cilantro', 'basil']],
  [['spinach'], ['kale', 'chard', 'any leafy greens']],
  [['kale'], ['spinach', 'chard']],
  [['broccoli'], ['green beans', 'cauliflower', 'zucchini']],
  [
    ['bell pepper', 'pepper'],
    ['zucchini', 'carrot'],
  ],
  [['zucchini'], ['yellow squash', 'eggplant']],
  [['sweet potato'], ['butternut squash', 'regular potato']],
  [['potato'], ['sweet potato', 'cauliflower']],
  [['chicken'], ['turkey', 'tofu', 'chickpeas']],
  [
    ['ground beef', 'beef'],
    ['ground turkey', 'lentils'],
  ],
  [
    ['ground turkey', 'turkey'],
    ['ground chicken', 'ground beef', 'lentils'],
  ],
  [['salmon'], ['trout', 'any firm white fish']],
  [['tuna'], ['canned salmon', 'chickpeas, mashed']],
  [
    ['shrimp', 'prawn'],
    ['chicken', 'firm tofu'],
  ],
  [['tofu'], ['chickpeas', 'eggs (if not vegan)']],
  [
    ['black bean', 'bean'],
    ['lentils', 'chickpeas'],
  ],
  [['chickpea'], ['white beans', 'lentils']],
  [['lentil'], ['split peas', 'beans']],
  [['rice'], ['quinoa', 'couscous', 'cauliflower rice']],
  [['quinoa'], ['rice', 'couscous']],
  [
    ['pasta', 'spaghetti', 'noodle'],
    ['any pasta shape', 'zucchini noodles'],
  ],
  [
    ['tortilla', 'wrap'],
    ['lettuce leaves', 'pita'],
  ],
  [
    ['bread', 'toast'],
    ['crackers', 'rice cakes'],
  ],
  [['oat'], ['quinoa flakes', 'granola']],
  [['flour'], ['oat flour (blended oats)']],
  [['honey'], ['maple syrup']],
  [['maple syrup'], ['honey', 'a little brown sugar']],
  [['broth', 'stock'], ['water with a pinch of salt and herbs']],
  [
    ['canned tomato', 'tomato'],
    ['tomato paste with water', 'roasted red peppers'],
  ],
  [['avocado'], ['a drizzle of olive oil', 'hummus']],
  [['mayo', 'mayonnaise'], ['Greek yogurt']],
  [['cumin'], ['chili powder', 'smoked paprika']],
  [['paprika'], ['chili powder', 'cayenne (use less)']],
]

/** Suggested stand-ins for an ingredient, or an empty list if none are known. */
export function substitutesFor(ingredient: string): readonly string[] {
  for (const [terms, swaps] of SWAPS) {
    if (terms.some((term) => matchesTerm(ingredient, term))) return swaps
  }
  return []
}

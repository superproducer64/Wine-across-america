import { WineEntry } from '@/types';

interface FoodPairing {
  emoji: string;
  label: string;
}

const ALL_PAIRINGS: Record<string, FoodPairing> = {
  redMeat:      { emoji: '🥩', label: 'Red Meat' },
  game:         { emoji: '🦌', label: 'Game' },
  lamb:         { emoji: '🍖', label: 'Lamb' },
  poultry:      { emoji: '🍗', label: 'Poultry' },
  pork:         { emoji: '🥓', label: 'Pork' },
  seafood:      { emoji: '🦞', label: 'Seafood' },
  fish:         { emoji: '🐟', label: 'Fish' },
  oysters:      { emoji: '🦪', label: 'Oysters' },
  agedCheese:   { emoji: '🧀', label: 'Aged Cheese' },
  softCheese:   { emoji: '🫙', label: 'Soft Cheese' },
  goatCheese:   { emoji: '🐐', label: 'Goat Cheese' },
  mushrooms:    { emoji: '🍄', label: 'Mushrooms' },
  pasta:        { emoji: '🍝', label: 'Pasta' },
  charcuterie:  { emoji: '🫒', label: 'Charcuterie' },
  chocolate:    { emoji: '🍫', label: 'Dark Chocolate' },
  desserts:     { emoji: '🍮', label: 'Desserts' },
  salads:       { emoji: '🥗', label: 'Salads' },
  spicyFood:    { emoji: '🌶️', label: 'Spicy Food' },
  grilled:      { emoji: '🔥', label: 'Grilled Dishes' },
  truffle:      { emoji: '🍄', label: 'Truffle' },
  sushi:        { emoji: '🍣', label: 'Sushi' },
};

export function getFoodPairings(entry: Partial<WineEntry>): FoodPairing[] {
  const {
    tannin = 5,
    acidity = 5,
    body = 5,
    alcohol = 5,
    aromas_l1 = [],
  } = entry;

  const scores: Record<string, number> = {};

  const add = (key: string, pts: number) => {
    scores[key] = (scores[key] ?? 0) + pts;
  };

  // Tannin-based
  if (tannin >= 7) {
    add('redMeat', 3);
    add('game', 2);
    add('agedCheese', 2);
    add('lamb', 2);
    add('grilled', 1);
  } else if (tannin >= 5) {
    add('lamb', 2);
    add('poultry', 2);
    add('pork', 2);
    add('pasta', 1);
    add('charcuterie', 1);
  } else {
    add('fish', 2);
    add('poultry', 2);
    add('softCheese', 2);
    add('salads', 1);
    add('sushi', 1);
  }

  // Acidity-based
  if (acidity >= 7) {
    add('oysters', 2);
    add('seafood', 2);
    add('goatCheese', 2);
    add('salads', 2);
    add('fish', 1);
  } else if (acidity >= 5) {
    add('pasta', 2);
    add('charcuterie', 1);
    add('poultry', 1);
  } else {
    add('desserts', 2);
    add('softCheese', 1);
    add('chocolate', 1);
  }

  // Body-based
  if (body >= 7) {
    add('redMeat', 2);
    add('grilled', 2);
    add('agedCheese', 1);
    add('truffle', 1);
  } else if (body >= 5) {
    add('pasta', 1);
    add('pork', 1);
    add('poultry', 1);
  } else {
    add('salads', 2);
    add('sushi', 2);
    add('fish', 1);
  }

  // Alcohol-based (high alcohol → richer food)
  if (alcohol >= 7) {
    add('redMeat', 1);
    add('grilled', 1);
    add('agedCheese', 1);
  }

  // Aroma-based
  if (aromas_l1.includes('earthy') || aromas_l1.includes('savory')) {
    add('mushrooms', 3);
    add('truffle', 2);
    add('game', 2);
  }
  if (aromas_l1.includes('floral')) {
    add('fish', 2);
    add('salads', 2);
    add('goatCheese', 1);
  }
  if (aromas_l1.includes('dark-fruit')) {
    add('redMeat', 2);
    add('agedCheese', 1);
    add('chocolate', 1);
  }
  if (aromas_l1.includes('red-fruit')) {
    add('lamb', 2);
    add('poultry', 1);
    add('softCheese', 1);
  }
  if (aromas_l1.includes('citrus') || aromas_l1.includes('mineral')) {
    add('oysters', 2);
    add('seafood', 2);
    add('sushi', 1);
  }
  if (aromas_l1.includes('oak-spice')) {
    add('grilled', 2);
    add('agedCheese', 2);
    add('charcuterie', 1);
  }
  if (aromas_l1.includes('sweet-baking')) {
    add('chocolate', 3);
    add('desserts', 2);
    add('agedCheese', 1);
  }
  if (aromas_l1.includes('tropical') || aromas_l1.includes('tree-fruit')) {
    add('poultry', 2);
    add('spicyFood', 2);
    add('softCheese', 1);
  }

  // Sort and pick top 4
  const sorted = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)
    .map(([key]) => ALL_PAIRINGS[key])
    .filter(Boolean);

  return sorted;
}

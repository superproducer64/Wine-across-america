// ─── Cheese Enums & Labels ────────────────────────────────────────────────────

export type MilkType = 'cow' | 'sheep' | 'goat' | 'buffalo' | 'mixed';
export type Pasteurization = 'raw' | 'pasteurized' | 'thermized';
export type CheeseStyle = 'bloomy' | 'washed' | 'alpine' | 'blue' | 'fresh' | 'pressed' | 'hard';

export const MILK_TYPE_LABELS: Record<MilkType, string> = {
  cow: 'Cow',
  sheep: 'Sheep',
  goat: 'Goat',
  buffalo: 'Buffalo',
  mixed: 'Mixed',
};

export const PASTEURIZATION_LABELS: Record<Pasteurization, string> = {
  raw: 'Raw',
  pasteurized: 'Pasteurized',
  thermized: 'Thermized',
};

export const CHEESE_STYLE_LABELS: Record<CheeseStyle, string> = {
  bloomy: 'Bloomy Rind',
  washed: 'Washed Rind',
  alpine: 'Alpine',
  blue: 'Blue',
  fresh: 'Fresh',
  pressed: 'Pressed',
  hard: 'Hard / Aged',
};

export const CHEESE_STYLE_EXAMPLES: Record<CheeseStyle, string> = {
  bloomy: 'Brie, Camembert, Humboldt Fog',
  washed: 'Taleggio, Red Hawk, Winnimere',
  alpine: 'Gruyère, Pleasant Ridge Reserve',
  blue: 'Rogue River Blue, Maytag, Bayley Hazen',
  fresh: 'Chèvre, Ricotta, Fromage Blanc',
  pressed: 'Gouda, Manchego, Tomme',
  hard: 'Aged Cheddar, Pecorino, Parmigiano',
};

export const CHEESE_STYLE_EMOJI: Record<CheeseStyle, string> = {
  bloomy: '🌸',
  washed: '🧡',
  alpine: '⛰️',
  blue: '💙',
  fresh: '🥛',
  pressed: '🧱',
  hard: '🪵',
};

// ─── US Regions ───────────────────────────────────────────────────────────────

export const US_REGIONS = [
  'California', 'Colorado', 'Connecticut', 'Georgia',
  'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts',
  'Michigan', 'Minnesota', 'Missouri', 'Montana',
  'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
  'North Carolina', 'Ohio', 'Oregon', 'Pennsylvania',
  'South Carolina', 'Tennessee', 'Texas', 'Utah',
  'Vermont', 'Virginia', 'Washington', 'Wisconsin', 'Wyoming',
  'Other',
];

// ─── Cheese Entry ─────────────────────────────────────────────────────────────

export interface CheeseEntry {
  id: string;
  user_id: string;
  name: string;
  producer: string;
  milk_type: MilkType;
  pasteurization: Pasteurization;
  style: CheeseStyle;
  region: string;
  tasting_date: string;
  price: number | null;
  notes: string;
  would_buy_again: boolean | null;
  created_at: string;
  updated_at: string;
}

export type CheeseEntryDraft = Omit<CheeseEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

// ─── Structure Wheel ─────────────────────────────────────────────────────────

export interface StructureReference {
  score: number;
  example: string;
}

export interface StructureDimension {
  key: keyof StructureScores;
  label: string;
  chartLabel: string;  // short for radar axis
  description: string;
  tip: string;
  references: StructureReference[];
}

export interface StructureScores {
  aroma: number;
  texture: number;
  flavor_intensity: number;
  complexity: number;
  finish: number;
  typicity: number;
}

export const STRUCTURE_DIMENSIONS: StructureDimension[] = [
  {
    key: 'aroma',
    label: 'Aroma',
    chartLabel: 'Aroma',
    description:
      'How expressive and complex is the cheese on the nose? Consider intensity, variety of scents, and how inviting they are.',
    tip: 'Close your eyes and inhale slowly — how many distinct aromas can you identify?',
    references: [
      { score: 1, example: 'No detectable aroma (vacuum-sealed fresh mozzarella)' },
      { score: 3, example: 'Faint, milky, neutral (mild young gouda)' },
      { score: 5, example: 'Moderate, pleasant dairy notes (mild cheddar)' },
      { score: 7, example: 'Distinct, characteristic aromas (aged gruyère, manchego)' },
      { score: 9, example: 'Complex, layered, memorable (cave-aged washed rind, rogue river blue)' },
      { score: 10, example: 'Extraordinary — perfume-like depth (great Époisses, 5-year aged alpine)' },
    ],
  },
  {
    key: 'texture',
    label: 'Texture / Mouthfeel',
    chartLabel: 'Texture',
    description:
      'How does the cheese feel in the mouth? Consider creaminess, smoothness, grain, paste consistency, and how it melts.',
    tip: 'Press a small piece to the roof of your mouth — does it dissolve, crumble, or coat evenly?',
    references: [
      { score: 1, example: 'Rubbery, squeaky, unpleasant (poor-quality processed)' },
      { score: 3, example: 'Dry, crumbly, or waxy without finesse (dry aged rind remnant)' },
      { score: 5, example: 'Pleasant, appropriate for its style (good young jack, firm tomme)' },
      { score: 7, example: 'Smooth, supple, satisfying (well-made aged cheddar, alpine)' },
      { score: 9, example: 'Luxuriously creamy, silky, or perfectly grainy (great aged parmigiano)' },
      { score: 10, example: 'Transcendent mouthfeel — defines its category (triple-cream brie, aged gouda crystals)' },
    ],
  },
  {
    key: 'flavor_intensity',
    label: 'Flavor Intensity',
    chartLabel: 'Intensity',
    description:
      'How strong and impactful is the overall flavor? Rate the sheer power of the taste experience, separate from its complexity.',
    tip: 'How quickly does the flavor hit you? Does it fill your whole palate or stay quiet?',
    references: [
      { score: 1, example: 'Almost flavorless (very fresh, bland ricotta)' },
      { score: 3, example: 'Mild, background flavor (young brie, mild jack)' },
      { score: 5, example: 'Moderate, present but not assertive (young gouda, semi-soft tomme)' },
      { score: 7, example: 'Bold, assertive, hard to miss (aged cheddar, manchego)' },
      { score: 9, example: 'Powerfully intense (5-year aged cheddar, strong blue)' },
      { score: 10, example: 'Jaw-dropping intensity (cave-aged washed rind, 10-year mimolette)' },
    ],
  },
  {
    key: 'complexity',
    label: 'Complexity',
    chartLabel: 'Complexity',
    description:
      'How many distinct flavor layers does the cheese reveal? Does it evolve on the palate, surprise you, or stay one-dimensional?',
    tip: 'Count the flavor notes — first impression, mid-palate, and after the first few seconds.',
    references: [
      { score: 1, example: 'Single note, nothing to discover (bland processed cheese)' },
      { score: 3, example: 'Simple flavor, one or two notes (young mozzarella)' },
      { score: 5, example: 'A few distinct layers, mildly interesting (good young gouda)' },
      { score: 7, example: 'Multiple evolving flavors (aged gruyère, good blue)' },
      { score: 9, example: 'Complex, layered, surprising (Rogue River Blue, aged alpine)' },
      { score: 10, example: 'Endless discovery — keeps revealing new notes (great Époisses, aged Comté)' },
    ],
  },
  {
    key: 'finish',
    label: 'Finish / Persistence',
    chartLabel: 'Finish',
    description:
      'How long does the flavor linger after swallowing, and how pleasant is that persistence? Long finish = high score.',
    tip: 'Count seconds after swallowing — when does the flavor fully disappear?',
    references: [
      { score: 1, example: 'Disappears instantly (bland fresh cheese)' },
      { score: 3, example: 'Gone within 5 seconds' },
      { score: 5, example: 'Fades after ~15 seconds (average cheese)' },
      { score: 7, example: 'Lingers ~30–45 seconds (aged cheddar, manchego)' },
      { score: 9, example: 'Persists over 1 minute (cave-aged alpine, quality blue)' },
      { score: 10, example: 'Extraordinary finish — 2+ minutes of evolving flavor' },
    ],
  },
  {
    key: 'typicity',
    label: 'Typicity',
    chartLabel: 'Typicity',
    description:
      'Does this cheese clearly express its milk type, style, and origin? A high-typicity cheese is unmistakably itself.',
    tip: 'Ask: could this be mistaken for another style or milk type? The more "inevitable" it feels, the higher the score.',
    references: [
      { score: 1, example: 'Could be anything — no identity (generic processed)' },
      { score: 3, example: 'Vaguely characteristic, easy to confuse with other styles' },
      { score: 5, example: 'Recognizable style but not a definitive example' },
      { score: 7, example: 'Clearly expresses its milk, style, and region (solid artisan)' },
      { score: 9, example: 'Quintessential example of its category (great Humboldt Fog, Époisses)' },
      { score: 10, example: 'This IS the style — defines the category' },
    ],
  },
];

// ─── Technical Score ─────────────────────────────────────────────────────────

export interface TechnicalScores {
  tech_balance: number;
  tech_intensity: number;
  tech_complexity: number;
  tech_finish: number;
  tech_typicity: number;
}

export interface TechnicalCategory {
  key: keyof TechnicalScores;
  label: string;
  description: string;
}

export const TECHNICAL_CATEGORIES: TechnicalCategory[] = [
  {
    key: 'tech_balance',
    label: 'Balance',
    description:
      'Harmony between salt, acid, fat, and flavor elements. Does anything stick out unpleasantly?',
  },
  {
    key: 'tech_intensity',
    label: 'Intensity',
    description:
      'Overall sensory impact from first nose through finish. How much does it command your attention?',
  },
  {
    key: 'tech_complexity',
    label: 'Complexity',
    description:
      'Depth of flavor layers and how much the cheese evolves from first bite to finish.',
  },
  {
    key: 'tech_finish',
    label: 'Finish',
    description:
      'Quality, length, and pleasantness of what remains after swallowing.',
  },
  {
    key: 'tech_typicity',
    label: 'Typicity / Precision',
    description:
      "How precisely does this cheese represent its intended style, milk type, and maker's vision?",
  },
];

export function computeTechnicalScore(scores: Partial<TechnicalScores>): number {
  return (
    (scores.tech_balance    ?? 0) +
    (scores.tech_intensity  ?? 0) +
    (scores.tech_complexity ?? 0) +
    (scores.tech_finish     ?? 0) +
    (scores.tech_typicity   ?? 0)
  );
}

export function technicalScoreTier(total: number): { label: string; color: string } {
  if (total >= 95) return { label: 'Outstanding',  color: '#2E6B45' };
  if (total >= 85) return { label: 'Excellent',    color: '#2E6B45' };
  if (total >= 75) return { label: 'Very Good',    color: '#C9A84C' };
  if (total >= 65) return { label: 'Good',         color: '#C9A84C' };
  if (total >= 50) return { label: 'Fair',         color: '#7A7564' };
  return                   { label: 'Needs Work',  color: '#8B2E2E' };
}

// ─── Cheese Score ─────────────────────────────────────────────────────────────

export interface CheeseScore {
  id: string;
  entry_id: string;
  user_id: string;
  aroma: number;
  texture: number;
  flavor_intensity: number;
  complexity: number;
  finish: number;
  typicity: number;
  tech_balance: number;
  tech_intensity: number;
  tech_complexity: number;
  tech_finish: number;
  tech_typicity: number;
  technical_score: number;
  created_at: string;
  updated_at: string;
}

export type CheeseScoreDraft = Omit<
  CheeseScore,
  'id' | 'entry_id' | 'user_id' | 'technical_score' | 'created_at' | 'updated_at'
>;

export function makeDefaultScoreDraft(): CheeseScoreDraft {
  return {
    aroma: 5,
    texture: 5,
    flavor_intensity: 5,
    complexity: 5,
    finish: 5,
    typicity: 5,
    tech_balance: 10,
    tech_intensity: 10,
    tech_complexity: 10,
    tech_finish: 10,
    tech_typicity: 10,
  };
}

// ─── User / Auth ──────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  is_creator: boolean;
  subscription_tier: 'free' | 'pro';
  created_at: string;
}

// ─── Search Filters ───────────────────────────────────────────────────────────

export interface FilterParams {
  query?: string;
  milkTypes?: string[];
  styles?: string[];
  regions?: string[];
  minScore?: number;
  maxScore?: number;
  minPrice?: number;
  maxPrice?: number;
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface AnalyticsData {
  total: number;
  avgScore: number | null;
  scoreBuckets: Array<{ label: string; count: number; minVal: number }>;
  milkTypeCounts: Array<{ milk_type: string; count: number }>;
  styleCounts: Array<{ style: string; count: number }>;
  topRegions: Array<{ region: string; avg: number; count: number }>;
  buyAgainRate: number | null;
  buyAgainAnswered: number;
}

// ─── Terroir ──────────────────────────────────────────────────────────────────

export type PastureSoil = 'limestone' | 'volcanic' | 'granite' | 'clay_loam' | 'sandy_coastal';
export type Climate     = 'alpine' | 'temperate' | 'maritime' | 'arid';
export type MilkSeason  = 'spring' | 'summer' | 'fall' | 'winter';

export const PASTURE_SOIL_OPTIONS: PastureSoil[] = ['limestone','volcanic','granite','clay_loam','sandy_coastal'];
export const CLIMATE_OPTIONS:      Climate[]     = ['alpine','temperate','maritime','arid'];
export const MILK_SEASON_OPTIONS:  MilkSeason[]  = ['spring','summer','fall','winter'];

export const PASTURE_SOIL_LABELS: Record<PastureSoil, string> = {
  limestone:    'Limestone',
  volcanic:     'Volcanic',
  granite:      'Granite',
  clay_loam:    'Clay / Loam',
  sandy_coastal:'Sandy Coastal',
};
export const PASTURE_SOIL_ICONS: Record<PastureSoil, string> = {
  limestone:    '🪨',
  volcanic:     '🌋',
  granite:      '⛰️',
  clay_loam:    '🌿',
  sandy_coastal:'🏖️',
};
export const CLIMATE_LABELS: Record<Climate, string> = {
  alpine:    'Alpine / High Elev.',
  temperate: 'Temperate',
  maritime:  'Maritime / Coastal',
  arid:      'Arid',
};
export const CLIMATE_ICONS: Record<Climate, string> = {
  alpine:    '🏔️',
  temperate: '🌤️',
  maritime:  '🌊',
  arid:      '☀️',
};
export const MILK_SEASON_LABELS: Record<MilkSeason, string> = {
  spring: 'Spring', summer: 'Summer', fall: 'Fall', winter: 'Winter',
};
export const MILK_SEASON_ICONS: Record<MilkSeason, string> = {
  spring: '🌸', summer: '☀️', fall: '🍂', winter: '❄️',
};

export interface CheeseTerroirDraft {
  pasture_soil: PastureSoil | null;
  climate:      Climate     | null;
  milk_season:  MilkSeason  | null;
}

export interface CheeseTerroirRecord extends CheeseTerroirDraft {
  id:         string;
  entry_id:   string;
  user_id:    string;
  created_at: string;
}

export function makeDefaultTerroirDraft(): CheeseTerroirDraft {
  return { pasture_soil: null, climate: null, milk_season: null };
}

// ─── Creator Layer ────────────────────────────────────────────────────────────

export interface CreatorScore {
  id: string;
  entry_name: string;
  producer: string;
  style: string;
  region: string;
  sense_of_place: number;
  story_authenticity: number;
  farming_practices: number;
  structure_balance: number;
  overall_enjoyment: number;
  signature_score: number;
  editorial_note: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatorScoreDraft {
  entry_name: string;
  producer: string;
  style: string;
  region: string;
  sense_of_place: number;
  story_authenticity: number;
  farming_practices: number;
  structure_balance: number;
  overall_enjoyment: number;
  editorial_note: string;
  is_published: boolean;
}

export function makeDefaultCreatorScoreDraft(): CreatorScoreDraft {
  return {
    entry_name: '',
    producer: '',
    style: 'fresh',
    region: '',
    sense_of_place: 10,
    story_authenticity: 10,
    farming_practices: 10,
    structure_balance: 10,
    overall_enjoyment: 10,
    editorial_note: '',
    is_published: false,
  };
}

export const CREATOR_CATEGORIES: Array<{
  key: keyof Pick<CreatorScoreDraft, 'sense_of_place' | 'story_authenticity' | 'farming_practices' | 'structure_balance' | 'overall_enjoyment'>;
  label: string;
  description: string;
}> = [
  {
    key: 'sense_of_place',
    label: 'Sense of Place',
    description: 'How distinctly does this cheese express its geographic origin?',
  },
  {
    key: 'story_authenticity',
    label: 'Story & Authenticity',
    description: 'How genuine and compelling is the creamery\'s narrative and heritage?',
  },
  {
    key: 'farming_practices',
    label: 'Farming Practices',
    description: 'Animal welfare, land stewardship, and sustainable production methods.',
  },
  {
    key: 'structure_balance',
    label: 'Structure & Balance',
    description: 'Technical execution: texture, moisture, rind development, and flavor harmony.',
  },
  {
    key: 'overall_enjoyment',
    label: 'Overall Enjoyment',
    description: 'Pure hedonistic pleasure — would you seek this cheese out again?',
  },
];

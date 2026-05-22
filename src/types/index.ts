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
  created_at: string;
  updated_at: string;
}

export type CheeseEntryDraft = Omit<CheeseEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

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

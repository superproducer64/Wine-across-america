-- ============================================================
-- Pour Across America — Dev Seed Data
-- Replace <YOUR_USER_ID> with a real Supabase auth user UUID
-- ============================================================

-- Example seed wines for local development
-- Run: psql $DATABASE_URL -f supabase/seed.sql

INSERT INTO wine_entries (
  user_id, name, producer, vintage, country, region, appellation,
  grapes, price, tasting_date, location_name,
  acidity, tannin, body, alcohol, intensity, finish_length,
  score_balance, score_intensity, score_complexity, score_finish, score_typicity,
  free_notes, aromas_l1, aromas_l2, tags,
  want_another_glass, want_to_buy,
  terroir_soil, terroir_climate, terroir_visible
)
VALUES
(
  -- Replace with real user ID for dev testing
  '00000000-0000-0000-0000-000000000001',
  'Chablis Premier Cru Montée de Tonnerre', 'Domaine Raveneau', 2020,
  'France', 'Burgundy', 'Chablis',
  ARRAY['Chardonnay'],
  '[{"amount": 85, "currency": "USD", "date": "2024-02-10", "location": "Wine & Roses, San Francisco"}]',
  '2024-02-10', 'Wine & Roses, San Francisco',
  8, 1, 4, 5, 8, 9,
  18, 17, 18, 17, 19,
  'Pristine minerality, laser-focused acidity, oyster shell and green apple. One of the most precise Chablis I''ve tasted.',
  ARRAY['citrus','mineral','floral'],
  ARRAY['Lemon','Grapefruit','Flint','White flower'],
  ARRAY['mineral','volcanic','value','burgundy'],
  true, true,
  'limestone', 'cool', true
),
(
  '00000000-0000-0000-0000-000000000001',
  'Barolo Brunate', 'Giuseppe Rinaldi', 2018,
  'Italy', 'Piedmont', 'Barolo',
  ARRAY['Nebbiolo'],
  '[{"amount": 145, "currency": "USD", "date": "2024-01-20", "location": "Marea, NYC"}]',
  '2024-01-20', 'Marea, NYC',
  7, 9, 7, 6, 9, 10,
  17, 18, 19, 20, 18,
  'Extraordinary. Tar, roses, dried cherry, dried herbs. Grippy tannins need another decade but the bones are incredible.',
  ARRAY['red-fruit','floral','earthy','savory'],
  ARRAY['Cherry','Violet','Truffle','Tar'],
  ARRAY['nebbiolo','barolo','tannic','age-worthy'],
  true, true,
  'limestone', 'moderate', true
),
(
  '00000000-0000-0000-0000-000000000001',
  'Château Musar Rouge', 'Serge Hochar', 2015,
  'France', 'Rhône Valley', '',
  ARRAY['Cabernet Sauvignon','Cinsault','Carignan'],
  '[{"amount": 55, "currency": "USD", "date": "2024-03-05", "location": "Home"}]',
  '2024-03-05', 'Home',
  6, 6, 6, 7, 9, 8,
  16, 17, 19, 16, 17,
  'Wild, oxidative, fascinating. Leather, tobacco, dark fruit, cedar. A wine unlike any other.',
  ARRAY['dark-fruit','earthy','savory','oak-spice'],
  ARRAY['Cassis','Leather','Tobacco','Cedar'],
  ARRAY['oxidative','unique','lebanese','value'],
  true, false,
  'sand', 'warm', false
),
(
  '00000000-0000-0000-0000-000000000001',
  'Penfolds Grange', 'Penfolds', 2016,
  'Australia', 'South Australia', 'Barossa Valley',
  ARRAY['Shiraz'],
  '[{"amount": 850, "currency": "USD", "date": "2023-12-31", "location": "Restaurant Hubert, Sydney"}]',
  '2023-12-31', 'Restaurant Hubert, Sydney',
  5, 9, 10, 8, 10, 10,
  20, 19, 19, 20, 18,
  'The benchmark. Opaque, voluminous, chocolate, eucalyptus, dark fruit, mocha. Impeccable balance for its weight.',
  ARRAY['dark-fruit','oak-spice','sweet-baking','herbaceous'],
  ARRAY['Blackberry','Chocolate','Mocha','Eucalyptus'],
  ARRAY['iconic','shiraz','australia','cellar'],
  true, true,
  'sand', 'warm', true
),
(
  '00000000-0000-0000-0000-000000000001',
  'Txakoli de Getaria', 'Ameztoi', 2023,
  'Spain', 'Basque Country', 'Getariako Txakolina',
  ARRAY['Hondarrabi Zuri'],
  '[{"amount": 22, "currency": "USD", "date": "2024-03-22", "location": "The Basque Boulangerie"}]',
  '2024-03-22', 'The Basque Boulangerie',
  9, 1, 2, 3, 7, 5,
  14, 13, 11, 12, 15,
  'Electric acidity, slight spritz, green apple, saline, herbs. Perfect with pintxos. Exceptional value.',
  ARRAY['citrus','herbaceous','mineral'],
  ARRAY['Lemon','Lime','Grass','Wet stone'],
  ARRAY['txakoli','value','summer','acid'],
  true, true,
  'sand', 'cool', false
);

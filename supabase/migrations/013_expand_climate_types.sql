-- Migration 013: Expand terroir_climate to support all 14 climate types
-- The original schema had CHECK (terroir_climate IN ('cool','moderate','warm'))
-- which blocks saving any of the 11 new climate values added in the app.

ALTER TABLE wine_entries
  DROP CONSTRAINT IF EXISTS wine_entries_terroir_climate_check;

ALTER TABLE wine_entries
  ADD CONSTRAINT wine_entries_terroir_climate_check
  CHECK (
    terroir_climate IS NULL OR terroir_climate IN (
      'cool',
      'cool-continental',
      'temperate',
      'oceanic',
      'maritime',
      'moderate',
      'continental',
      'mediterranean',
      'warm',
      'hot',
      'semi-arid',
      'alpine-mountain',
      'tropical',
      'desert'
    )
  );

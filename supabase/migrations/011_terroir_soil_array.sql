-- Migration 011: Convert terroir_soil from TEXT to TEXT[]
-- The app now supports multi-select soil types, so we need an array column.

ALTER TABLE wine_entries
  DROP CONSTRAINT IF EXISTS wine_entries_terroir_soil_check;

ALTER TABLE wine_entries
  ALTER COLUMN terroir_soil TYPE TEXT[]
  USING CASE
    WHEN terroir_soil IS NULL THEN NULL
    ELSE ARRAY[terroir_soil]
  END;

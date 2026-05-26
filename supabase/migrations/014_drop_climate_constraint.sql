-- Migration 014: Drop the terroir_climate CHECK constraint entirely.
-- The app UI already restricts the selectable values; the DB-level constraint
-- has caused repeated breakage as new climate types are added (23514 errors).
-- Removing it makes the column a free-text field validated at the app layer only.

ALTER TABLE wine_entries
  DROP CONSTRAINT IF EXISTS wine_entries_terroir_climate_check;

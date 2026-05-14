-- Add columns that exist in the app's data model but were missing from
-- the initial schema migration.  All are nullable / have safe defaults so
-- existing rows are unaffected.

ALTER TABLE wine_entries
  ADD COLUMN IF NOT EXISTS label_photo_url       TEXT    DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS aromas_other_note     TEXT    DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS grape_blends          JSONB   DEFAULT NULL;

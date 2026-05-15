-- Add sweetness as the 7th structure axis (1-10, same range as other structure fields).
-- IF NOT EXISTS guard makes this safe to run multiple times.

ALTER TABLE wine_entries
  ADD COLUMN IF NOT EXISTS sweetness INTEGER DEFAULT NULL;

-- Add custom_aromas text array column for per-wine custom aroma tags.
-- Default is an empty array so existing rows are unaffected.

ALTER TABLE wine_entries
  ADD COLUMN IF NOT EXISTS custom_aromas TEXT[] NOT NULL DEFAULT '{}';

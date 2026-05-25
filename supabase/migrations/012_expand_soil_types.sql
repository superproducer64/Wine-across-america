-- Migration 012: Expand terroir_soil to support all soil types
-- Drops the old 5-value check constraint (if still present on the production
-- database) and ensures the column is TEXT[] for multi-select.

-- Drop old scalar check constraint (no-op if already removed by 011)
ALTER TABLE wine_entries
  DROP CONSTRAINT IF EXISTS wine_entries_terroir_soil_check;

-- Ensure the column is TEXT[] (idempotent — safe to run even if 011 already ran)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wine_entries'
      AND column_name = 'terroir_soil'
      AND data_type = 'text'
      AND udt_name = 'text'
  ) THEN
    ALTER TABLE wine_entries
      ALTER COLUMN terroir_soil TYPE TEXT[]
      USING CASE
        WHEN terroir_soil IS NULL THEN NULL
        ELSE ARRAY[terroir_soil]
      END;
  END IF;
END $$;

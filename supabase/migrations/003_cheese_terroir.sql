-- ============================================================
-- Cheese Across America — Migration 003: Terroir Layer
-- ============================================================

CREATE TABLE cheese_terroir (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entry_id   UUID NOT NULL REFERENCES cheese_entries(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id)    ON DELETE CASCADE,

  pasture_soil TEXT CHECK (pasture_soil IN ('limestone','volcanic','granite','clay_loam','sandy_coastal')),
  climate      TEXT CHECK (climate      IN ('alpine','temperate','maritime','arid')),
  milk_season  TEXT CHECK (milk_season  IN ('spring','summer','fall','winter')),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (entry_id)
);

CREATE INDEX idx_cheese_terroir_entry_id ON cheese_terroir(entry_id);
CREATE INDEX idx_cheese_terroir_user_id  ON cheese_terroir(user_id);

ALTER TABLE cheese_terroir ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cheese_terroir_owner_all"
  ON cheese_terroir FOR ALL
  USING (auth.uid() = user_id);

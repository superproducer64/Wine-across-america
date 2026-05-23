-- ─── Phase 6: AI Intelligence Layer ──────────────────────────────────────────

-- Add AI-generated columns to cheese_entries
ALTER TABLE cheese_entries
  ADD COLUMN IF NOT EXISTS ai_tags         text[]  DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS typicity_description text;

-- Taste fingerprint cache (one per user, regenerated weekly)
CREATE TABLE IF NOT EXISTS taste_fingerprints (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description   text        NOT NULL,
  recommendations jsonb     NOT NULL DEFAULT '[]',
  blind_spot    text        NOT NULL,
  avg_scores    jsonb       NOT NULL DEFAULT '{}',
  entry_count   int         NOT NULL DEFAULT 0,
  generated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE taste_fingerprints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own fingerprint"
  ON taste_fingerprints
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

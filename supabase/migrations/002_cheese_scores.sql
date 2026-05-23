-- ============================================================
-- Cheese Across America — Migration 002: Cheese Scores
-- ============================================================

CREATE TABLE cheese_scores (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entry_id        UUID NOT NULL REFERENCES cheese_entries(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- ── Structure Wheel (1–10 each) ──────────────────────────────────────────────
  aroma            SMALLINT NOT NULL DEFAULT 5
                     CHECK (aroma BETWEEN 1 AND 10),
  texture          SMALLINT NOT NULL DEFAULT 5
                     CHECK (texture BETWEEN 1 AND 10),
  flavor_intensity SMALLINT NOT NULL DEFAULT 5
                     CHECK (flavor_intensity BETWEEN 1 AND 10),
  complexity       SMALLINT NOT NULL DEFAULT 5
                     CHECK (complexity BETWEEN 1 AND 10),
  finish           SMALLINT NOT NULL DEFAULT 5
                     CHECK (finish BETWEEN 1 AND 10),
  typicity         SMALLINT NOT NULL DEFAULT 5
                     CHECK (typicity BETWEEN 1 AND 10),

  -- ── Technical Score (0–20 each, max 100) ─────────────────────────────────────
  tech_balance     SMALLINT NOT NULL DEFAULT 10
                     CHECK (tech_balance BETWEEN 0 AND 20),
  tech_intensity   SMALLINT NOT NULL DEFAULT 10
                     CHECK (tech_intensity BETWEEN 0 AND 20),
  tech_complexity  SMALLINT NOT NULL DEFAULT 10
                     CHECK (tech_complexity BETWEEN 0 AND 20),
  tech_finish      SMALLINT NOT NULL DEFAULT 10
                     CHECK (tech_finish BETWEEN 0 AND 20),
  tech_typicity    SMALLINT NOT NULL DEFAULT 10
                     CHECK (tech_typicity BETWEEN 0 AND 20),

  -- Computed and maintained by trigger
  technical_score  SMALLINT NOT NULL DEFAULT 50
                     CHECK (technical_score BETWEEN 0 AND 100),

  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- One score record per cheese entry
  UNIQUE (entry_id)
);

-- ── Auto-compute technical_score and update timestamp ────────────────────────

CREATE OR REPLACE FUNCTION compute_cheese_technical_score()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.technical_score :=
    NEW.tech_balance + NEW.tech_intensity + NEW.tech_complexity +
    NEW.tech_finish  + NEW.tech_typicity;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER cheese_scores_compute
  BEFORE INSERT OR UPDATE ON cheese_scores
  FOR EACH ROW EXECUTE FUNCTION compute_cheese_technical_score();

-- ── Indexes ───────────────────────────────────────────────────────────────────

CREATE INDEX idx_cheese_scores_entry_id      ON cheese_scores(entry_id);
CREATE INDEX idx_cheese_scores_user_id       ON cheese_scores(user_id);
CREATE INDEX idx_cheese_scores_tech_score    ON cheese_scores(technical_score DESC);

-- ── Row Level Security ────────────────────────────────────────────────────────

ALTER TABLE cheese_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cheese_scores_owner_all"
  ON cheese_scores FOR ALL
  USING (auth.uid() = user_id);

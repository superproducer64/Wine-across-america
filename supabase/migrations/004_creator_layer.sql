-- ============================================================
-- Cheese Across America — Migration 004: Creator Layer
-- ============================================================

-- ── Creator Cheese Scores ─────────────────────────────────────────────────────

CREATE TABLE creator_cheese_scores (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Identification
  entry_name TEXT NOT NULL,
  producer   TEXT NOT NULL DEFAULT '',
  style      TEXT NOT NULL DEFAULT 'fresh',
  region     TEXT NOT NULL DEFAULT '',

  -- Signature Score (5 categories × 20pts = 100 total)
  sense_of_place      SMALLINT NOT NULL DEFAULT 10 CHECK (sense_of_place BETWEEN 0 AND 20),
  story_authenticity  SMALLINT NOT NULL DEFAULT 10 CHECK (story_authenticity BETWEEN 0 AND 20),
  farming_practices   SMALLINT NOT NULL DEFAULT 10 CHECK (farming_practices BETWEEN 0 AND 20),
  structure_balance   SMALLINT NOT NULL DEFAULT 10 CHECK (structure_balance BETWEEN 0 AND 20),
  overall_enjoyment   SMALLINT NOT NULL DEFAULT 10 CHECK (overall_enjoyment BETWEEN 0 AND 20),
  signature_score     SMALLINT NOT NULL DEFAULT 50 CHECK (signature_score BETWEEN 0 AND 100),

  editorial_note TEXT NOT NULL DEFAULT '',
  is_published   BOOLEAN NOT NULL DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION compute_creator_signature_score()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.signature_score :=
    NEW.sense_of_place + NEW.story_authenticity + NEW.farming_practices +
    NEW.structure_balance + NEW.overall_enjoyment;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER creator_scores_compute
  BEFORE INSERT OR UPDATE ON creator_cheese_scores
  FOR EACH ROW EXECUTE FUNCTION compute_creator_signature_score();

CREATE INDEX idx_creator_scores_style       ON creator_cheese_scores(style);
CREATE INDEX idx_creator_scores_region      ON creator_cheese_scores(region);
CREATE INDEX idx_creator_scores_sig_score   ON creator_cheese_scores(signature_score DESC);
CREATE INDEX idx_creator_scores_published   ON creator_cheese_scores(is_published);

-- ── Curated Lists ─────────────────────────────────────────────────────────────

CREATE TABLE curated_lists (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title        TEXT NOT NULL,
  description  TEXT NOT NULL DEFAULT '',
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE curated_list_items (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  list_id          UUID NOT NULL REFERENCES curated_lists(id) ON DELETE CASCADE,
  creator_score_id UUID REFERENCES creator_cheese_scores(id) ON DELETE CASCADE,
  note             TEXT NOT NULL DEFAULT '',
  sort_order       INT  NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_curated_list_items_list ON curated_list_items(list_id);

-- ── Monthly Recommendations ───────────────────────────────────────────────────

CREATE TABLE monthly_recommendations (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  month        DATE    NOT NULL UNIQUE,  -- first day of the month
  title        TEXT    NOT NULL,
  editorial    TEXT    NOT NULL DEFAULT '',
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE monthly_recommendation_items (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recommendation_id UUID NOT NULL REFERENCES monthly_recommendations(id) ON DELETE CASCADE,
  creator_score_id  UUID NOT NULL REFERENCES creator_cheese_scores(id) ON DELETE CASCADE,
  note              TEXT NOT NULL DEFAULT '',
  sort_order        INT  NOT NULL DEFAULT 0
);

CREATE INDEX idx_monthly_rec_items_rec ON monthly_recommendation_items(recommendation_id);

-- ── Row Level Security ────────────────────────────────────────────────────────

ALTER TABLE creator_cheese_scores     ENABLE ROW LEVEL SECURITY;
ALTER TABLE curated_lists             ENABLE ROW LEVEL SECURITY;
ALTER TABLE curated_list_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_recommendations   ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_recommendation_items ENABLE ROW LEVEL SECURITY;

-- creator_cheese_scores: any authenticated user reads; creator writes
CREATE POLICY "creator_scores_select"
  ON creator_cheese_scores FOR SELECT TO authenticated
  USING (is_published = true);

CREATE POLICY "creator_scores_write"
  ON creator_cheese_scores FOR ALL
  USING   (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_creator = true))
  WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_creator = true));

-- curated_lists: pro OR creator reads published; creator writes
CREATE POLICY "curated_lists_select"
  ON curated_lists FOR SELECT
  USING (
    is_published = true AND (
      EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND subscription_tier = 'pro')
      OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_creator = true)
    )
  );

CREATE POLICY "curated_lists_write"
  ON curated_lists FOR ALL
  USING   (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_creator = true))
  WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_creator = true));

-- curated_list_items: pro OR creator; creator writes
CREATE POLICY "curated_list_items_select"
  ON curated_list_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM curated_lists cl WHERE cl.id = list_id AND cl.is_published = true
      AND (
        EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND subscription_tier = 'pro')
        OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_creator = true)
      )
    )
  );

CREATE POLICY "curated_list_items_write"
  ON curated_list_items FOR ALL
  USING   (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_creator = true))
  WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_creator = true));

-- monthly_recommendations: all authenticated read published; creator writes
CREATE POLICY "monthly_recs_select"
  ON monthly_recommendations FOR SELECT TO authenticated
  USING (is_published = true);

CREATE POLICY "monthly_recs_write"
  ON monthly_recommendations FOR ALL
  USING   (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_creator = true))
  WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_creator = true));

-- monthly_recommendation_items: authenticated read via published parent; creator writes
CREATE POLICY "monthly_rec_items_select"
  ON monthly_recommendation_items FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM monthly_recommendations mr
      WHERE mr.id = recommendation_id AND mr.is_published = true
    )
  );

CREATE POLICY "monthly_rec_items_write"
  ON monthly_recommendation_items FOR ALL
  USING   (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_creator = true))
  WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_creator = true));

-- ============================================================
-- Pour Across America — Initial Schema
-- Supabase / PostgreSQL
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── User Profiles ────────────────────────────────────────────────────────────

CREATE TABLE user_profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT NOT NULL,
  display_name    TEXT,
  avatar_url      TEXT,
  is_creator      BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT NOT NULL DEFAULT 'free'
                      CHECK (subscription_tier IN ('free', 'pro')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create profile on user sign-up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, display_name)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'display_name'
  );
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── Wine Entries ──────────────────────────────────────────────────────────────

CREATE TABLE wine_entries (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Identification
  name            TEXT NOT NULL DEFAULT '',
  producer        TEXT NOT NULL DEFAULT '',
  vintage         INTEGER CHECK (vintage IS NULL OR (vintage >= 1800 AND vintage <= 2100)),

  -- Geography
  country         TEXT NOT NULL DEFAULT '',
  region          TEXT NOT NULL DEFAULT '',
  appellation     TEXT NOT NULL DEFAULT '',

  -- Grapes & Price
  grapes          TEXT[] NOT NULL DEFAULT '{}',
  price           JSONB NOT NULL DEFAULT '[]',  -- [{amount, currency, date, location}]

  -- Context
  tasting_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  location_name   TEXT NOT NULL DEFAULT '',
  location_geo    JSONB,  -- {lat, lng}

  -- ── Structure Wheel (1-10 each) ─────────────────────────────────────────────
  acidity         SMALLINT NOT NULL DEFAULT 5 CHECK (acidity BETWEEN 1 AND 10),
  tannin          SMALLINT NOT NULL DEFAULT 5 CHECK (tannin BETWEEN 1 AND 10),
  body            SMALLINT NOT NULL DEFAULT 5 CHECK (body BETWEEN 1 AND 10),
  alcohol         SMALLINT NOT NULL DEFAULT 5 CHECK (alcohol BETWEEN 1 AND 10),
  intensity       SMALLINT NOT NULL DEFAULT 5 CHECK (intensity BETWEEN 1 AND 10),
  finish_length   SMALLINT NOT NULL DEFAULT 5 CHECK (finish_length BETWEEN 1 AND 10),

  -- ── Technical Score (0-20 each, max 100) ───────────────────────────────────
  score_balance   SMALLINT NOT NULL DEFAULT 10 CHECK (score_balance BETWEEN 0 AND 20),
  score_intensity SMALLINT NOT NULL DEFAULT 10 CHECK (score_intensity BETWEEN 0 AND 20),
  score_complexity SMALLINT NOT NULL DEFAULT 10 CHECK (score_complexity BETWEEN 0 AND 20),
  score_finish    SMALLINT NOT NULL DEFAULT 10 CHECK (score_finish BETWEEN 0 AND 20),
  score_typicity  SMALLINT NOT NULL DEFAULT 10 CHECK (score_typicity BETWEEN 0 AND 20),
  -- Computed on insert/update via trigger
  technical_score SMALLINT NOT NULL DEFAULT 50 CHECK (technical_score BETWEEN 0 AND 100),

  -- ── Tasting Notes ───────────────────────────────────────────────────────────
  free_notes      TEXT NOT NULL DEFAULT '',
  aromas_l1       TEXT[] NOT NULL DEFAULT '{}',
  aromas_l2       TEXT[] NOT NULL DEFAULT '{}',
  tags            TEXT[] NOT NULL DEFAULT '{}',
  want_another_glass BOOLEAN NOT NULL DEFAULT false,
  want_to_buy     BOOLEAN NOT NULL DEFAULT false,

  -- ── Terroir Layer ───────────────────────────────────────────────────────────
  terroir_soil    TEXT CHECK (terroir_soil IN ('limestone','volcanic','granite','clay','sand') OR terroir_soil IS NULL),
  terroir_climate TEXT CHECK (terroir_climate IN ('cool','moderate','warm') OR terroir_climate IS NULL),
  terroir_visible BOOLEAN NOT NULL DEFAULT false,

  -- ── Creator / Signature Score (1-20 each, max 100) ─────────────────────────
  sig_sense_of_place SMALLINT CHECK (sig_sense_of_place IS NULL OR sig_sense_of_place BETWEEN 1 AND 20),
  sig_story          SMALLINT CHECK (sig_story IS NULL OR sig_story BETWEEN 1 AND 20),
  sig_viticulture    SMALLINT CHECK (sig_viticulture IS NULL OR sig_viticulture BETWEEN 1 AND 20),
  sig_structure      SMALLINT CHECK (sig_structure IS NULL OR sig_structure BETWEEN 1 AND 20),
  sig_enjoyment      SMALLINT CHECK (sig_enjoyment IS NULL OR sig_enjoyment BETWEEN 1 AND 20),
  -- Computed on insert/update via trigger
  signature_score    SMALLINT CHECK (signature_score IS NULL OR signature_score BETWEEN 5 AND 100),

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Triggers: Compute Scores ──────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION compute_entry_scores()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  -- Technical score = sum of 5 sub-scores
  NEW.technical_score := NEW.score_balance + NEW.score_intensity +
                         NEW.score_complexity + NEW.score_finish + NEW.score_typicity;

  -- Signature score = sum of 5 sig scores (NULL if any is NULL)
  IF NEW.sig_sense_of_place IS NOT NULL AND
     NEW.sig_story IS NOT NULL AND
     NEW.sig_viticulture IS NOT NULL AND
     NEW.sig_structure IS NOT NULL AND
     NEW.sig_enjoyment IS NOT NULL
  THEN
    NEW.signature_score := NEW.sig_sense_of_place + NEW.sig_story +
                           NEW.sig_viticulture + NEW.sig_structure + NEW.sig_enjoyment;
  ELSE
    NEW.signature_score := NULL;
  END IF;

  -- Auto-update updated_at
  NEW.updated_at := now();

  RETURN NEW;
END;
$$;

CREATE TRIGGER wine_entry_scores
  BEFORE INSERT OR UPDATE ON wine_entries
  FOR EACH ROW EXECUTE FUNCTION compute_entry_scores();

-- ── Indexes ───────────────────────────────────────────────────────────────────

CREATE INDEX idx_wine_entries_user_id ON wine_entries(user_id);
CREATE INDEX idx_wine_entries_tasting_date ON wine_entries(tasting_date DESC);
CREATE INDEX idx_wine_entries_technical_score ON wine_entries(technical_score DESC);
CREATE INDEX idx_wine_entries_country ON wine_entries(country);
CREATE INDEX idx_wine_entries_created_at ON wine_entries(created_at DESC);
-- GIN index for array searches (grapes, aromas, tags)
CREATE INDEX idx_wine_entries_grapes ON wine_entries USING GIN(grapes);
CREATE INDEX idx_wine_entries_tags ON wine_entries USING GIN(tags);
-- Full-text search
CREATE INDEX idx_wine_entries_fts ON wine_entries USING GIN(
  to_tsvector('english', coalesce(name,'') || ' ' || coalesce(producer,'') || ' ' || coalesce(free_notes,''))
);

-- ── Row Level Security ────────────────────────────────────────────────────────

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wine_entries ENABLE ROW LEVEL SECURITY;

-- user_profiles: each user sees/edits only their own profile
CREATE POLICY "user_profiles_self_select"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "user_profiles_self_update"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- wine_entries: each user sees/edits only their own entries
-- EXCEPTION: creator-scored entries are visible to all authenticated users (for discovery)
CREATE POLICY "wine_entries_owner_all"
  ON wine_entries FOR ALL
  USING (auth.uid() = user_id);

-- Creators with is_creator=true can update signature scores on any entry
CREATE POLICY "wine_entries_creator_sig_update"
  ON wine_entries FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_creator = true
    )
  );

-- ── Seed Data (dev only) ──────────────────────────────────────────────────────
-- Run seed.sql separately against dev database

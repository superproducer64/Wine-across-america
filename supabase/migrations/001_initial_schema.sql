-- ============================================================
-- Cheese Across America — Initial Schema
-- Supabase / PostgreSQL
-- ============================================================

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

-- Auto-create profile row on sign-up
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

-- ── Cheese Entries ────────────────────────────────────────────────────────────

CREATE TABLE cheese_entries (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Identification
  name            TEXT NOT NULL DEFAULT '',
  producer        TEXT NOT NULL DEFAULT '',

  -- Cheese specifics
  milk_type       TEXT NOT NULL DEFAULT 'cow'
                    CHECK (milk_type IN ('cow', 'sheep', 'goat', 'buffalo', 'mixed')),
  pasteurization  TEXT NOT NULL DEFAULT 'pasteurized'
                    CHECK (pasteurization IN ('raw', 'pasteurized', 'thermized')),
  style           TEXT NOT NULL DEFAULT 'fresh'
                    CHECK (style IN ('bloomy', 'washed', 'alpine', 'blue', 'fresh', 'pressed', 'hard')),

  -- Origin
  region          TEXT NOT NULL DEFAULT '',

  -- Context
  tasting_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  price           NUMERIC(8, 2),          -- optional, per-pound or per-unit

  -- Notes (scoring fields added in future migrations)
  notes           TEXT NOT NULL DEFAULT '',

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-update updated_at on any change
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER cheese_entries_updated_at
  BEFORE UPDATE ON cheese_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Indexes ───────────────────────────────────────────────────────────────────

CREATE INDEX idx_cheese_entries_user_id      ON cheese_entries(user_id);
CREATE INDEX idx_cheese_entries_tasting_date ON cheese_entries(tasting_date DESC);
CREATE INDEX idx_cheese_entries_created_at   ON cheese_entries(created_at DESC);
CREATE INDEX idx_cheese_entries_style        ON cheese_entries(style);
CREATE INDEX idx_cheese_entries_milk_type    ON cheese_entries(milk_type);
CREATE INDEX idx_cheese_entries_region       ON cheese_entries(region);

-- Full-text search across name, producer, notes
CREATE INDEX idx_cheese_entries_fts ON cheese_entries USING GIN(
  to_tsvector('english',
    coalesce(name, '')     || ' ' ||
    coalesce(producer, '') || ' ' ||
    coalesce(notes, '')
  )
);

-- ── Row Level Security ────────────────────────────────────────────────────────

ALTER TABLE user_profiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE cheese_entries ENABLE ROW LEVEL SECURITY;

-- Each user reads/writes only their own profile
CREATE POLICY "user_profiles_self_select"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "user_profiles_self_update"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Each user has full access to their own cheese entries
CREATE POLICY "cheese_entries_owner_all"
  ON cheese_entries FOR ALL
  USING (auth.uid() = user_id);

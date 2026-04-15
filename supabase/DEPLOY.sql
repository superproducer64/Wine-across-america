-- ============================================================
--  Pour Across America — Complete Deployment Script
--  Paste this entire file into the Supabase SQL Editor and run.
--  Works on a BRAND NEW Supabase project.
--  Safe to re-run: all statements use IF NOT EXISTS / ON CONFLICT.
-- ============================================================


-- ═══════════════════════════════════════════════════════════
--  PART 1 — EXTENSIONS
-- ═══════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ═══════════════════════════════════════════════════════════
--  PART 2 — CORE TABLES
-- ═══════════════════════════════════════════════════════════

-- ─── user_profiles ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id                uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email             text        NOT NULL,
  display_name      text,
  avatar_url        text,
  is_creator        boolean     NOT NULL DEFAULT false,
  subscription_tier text        NOT NULL DEFAULT 'free'
                                CHECK (subscription_tier IN ('free', 'pro')),
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- Auto-create profile row when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, display_name)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'display_name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ─── wine_entries ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.wine_entries (
  id              uuid     PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         uuid     NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Identification
  name            text     NOT NULL DEFAULT '',
  producer        text     NOT NULL DEFAULT '',
  vintage         integer  CHECK (vintage IS NULL OR (vintage >= 1800 AND vintage <= 2100)),

  -- Geography
  country         text     NOT NULL DEFAULT '',
  region          text     NOT NULL DEFAULT '',
  appellation     text     NOT NULL DEFAULT '',

  -- Grapes & Price
  grapes          text[]   NOT NULL DEFAULT '{}',
  grape_blends    jsonb             DEFAULT NULL,   -- [{name, percentage}]
  price           jsonb    NOT NULL DEFAULT '[]',   -- [{amount, currency, date, location}]

  -- Context
  tasting_date    date     NOT NULL DEFAULT CURRENT_DATE,
  location_name   text     NOT NULL DEFAULT '',
  location_geo    jsonb,                            -- {lat, lng}

  -- Structure Wheel (1-10)
  acidity         smallint NOT NULL DEFAULT 5 CHECK (acidity BETWEEN 1 AND 10),
  tannin          smallint NOT NULL DEFAULT 5 CHECK (tannin BETWEEN 1 AND 10),
  body            smallint NOT NULL DEFAULT 5 CHECK (body BETWEEN 1 AND 10),
  alcohol         smallint NOT NULL DEFAULT 5 CHECK (alcohol BETWEEN 1 AND 10),
  intensity       smallint NOT NULL DEFAULT 5 CHECK (intensity BETWEEN 1 AND 10),
  finish_length   smallint NOT NULL DEFAULT 5 CHECK (finish_length BETWEEN 1 AND 10),

  -- Technical Score (0-20 each, 0-100 total)
  score_balance    smallint NOT NULL DEFAULT 10 CHECK (score_balance   BETWEEN 0 AND 20),
  score_intensity  smallint NOT NULL DEFAULT 10 CHECK (score_intensity BETWEEN 0 AND 20),
  score_complexity smallint NOT NULL DEFAULT 10 CHECK (score_complexity BETWEEN 0 AND 20),
  score_finish     smallint NOT NULL DEFAULT 10 CHECK (score_finish    BETWEEN 0 AND 20),
  score_typicity   smallint NOT NULL DEFAULT 10 CHECK (score_typicity  BETWEEN 0 AND 20),
  technical_score  smallint NOT NULL DEFAULT 50 CHECK (technical_score BETWEEN 0 AND 100),

  -- Tasting Notes
  free_notes      text     NOT NULL DEFAULT '',
  aromas_l1       text[]   NOT NULL DEFAULT '{}',
  aromas_l2       text[]   NOT NULL DEFAULT '{}',
  tags            text[]   NOT NULL DEFAULT '{}',
  want_another_glass boolean NOT NULL DEFAULT false,
  want_to_buy     boolean  NOT NULL DEFAULT false,

  -- Terroir
  terroir_soil    text     CHECK (terroir_soil    IN ('limestone','volcanic','granite','clay','sand') OR terroir_soil    IS NULL),
  terroir_climate text     CHECK (terroir_climate IN ('cool','moderate','warm')                       OR terroir_climate IS NULL),
  terroir_visible boolean  NOT NULL DEFAULT false,

  -- Signature Score (creator only, 1-20 each)
  sig_sense_of_place smallint CHECK (sig_sense_of_place IS NULL OR sig_sense_of_place BETWEEN 1 AND 20),
  sig_story          smallint CHECK (sig_story          IS NULL OR sig_story          BETWEEN 1 AND 20),
  sig_viticulture    smallint CHECK (sig_viticulture    IS NULL OR sig_viticulture    BETWEEN 1 AND 20),
  sig_structure      smallint CHECK (sig_structure      IS NULL OR sig_structure      BETWEEN 1 AND 20),
  sig_enjoyment      smallint CHECK (sig_enjoyment      IS NULL OR sig_enjoyment      BETWEEN 1 AND 20),
  signature_score    smallint CHECK (signature_score    IS NULL OR signature_score    BETWEEN 5 AND 100),

  -- Label photo
  label_photo_url text     DEFAULT NULL,

  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Add new columns to wine_entries if the table already exists (re-run safety)
ALTER TABLE public.wine_entries ADD COLUMN IF NOT EXISTS grape_blends    jsonb DEFAULT NULL;
ALTER TABLE public.wine_entries ADD COLUMN IF NOT EXISTS label_photo_url text  DEFAULT NULL;

-- Trigger: auto-compute technical_score, signature_score, updated_at
CREATE OR REPLACE FUNCTION public.compute_entry_scores()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.technical_score := NEW.score_balance + NEW.score_intensity +
                         NEW.score_complexity + NEW.score_finish + NEW.score_typicity;

  IF NEW.sig_sense_of_place IS NOT NULL AND NEW.sig_story        IS NOT NULL AND
     NEW.sig_viticulture    IS NOT NULL AND NEW.sig_structure    IS NOT NULL AND
     NEW.sig_enjoyment      IS NOT NULL
  THEN
    NEW.signature_score := NEW.sig_sense_of_place + NEW.sig_story +
                           NEW.sig_viticulture + NEW.sig_structure + NEW.sig_enjoyment;
  ELSE
    NEW.signature_score := NULL;
  END IF;

  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS wine_entry_scores ON public.wine_entries;
CREATE TRIGGER wine_entry_scores
  BEFORE INSERT OR UPDATE ON public.wine_entries
  FOR EACH ROW EXECUTE FUNCTION public.compute_entry_scores();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_wine_entries_user_id       ON public.wine_entries (user_id);
CREATE INDEX IF NOT EXISTS idx_wine_entries_tasting_date  ON public.wine_entries (tasting_date DESC);
CREATE INDEX IF NOT EXISTS idx_wine_entries_tech_score    ON public.wine_entries (technical_score DESC);
CREATE INDEX IF NOT EXISTS idx_wine_entries_country       ON public.wine_entries (country);
CREATE INDEX IF NOT EXISTS idx_wine_entries_created_at    ON public.wine_entries (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wine_entries_grapes        ON public.wine_entries USING GIN (grapes);
CREATE INDEX IF NOT EXISTS idx_wine_entries_tags          ON public.wine_entries USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_wine_entries_fts           ON public.wine_entries USING GIN (
  to_tsvector('english',
    coalesce(name,'') || ' ' || coalesce(producer,'') || ' ' || coalesce(free_notes,'')
  )
);


-- ═══════════════════════════════════════════════════════════
--  PART 3 — ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wine_entries  ENABLE ROW LEVEL SECURITY;

-- user_profiles
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'user_profiles_self_select') THEN
    CREATE POLICY "user_profiles_self_select" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'user_profiles_self_update') THEN
    CREATE POLICY "user_profiles_self_update" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);
  END IF;
END $$;

-- Allow authenticated users to search other profiles (for in-app sharing)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'authenticated users can search profiles') THEN
    CREATE POLICY "authenticated users can search profiles"
      ON public.user_profiles FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

-- wine_entries
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'wine_entries' AND policyname = 'wine_entries_owner_all') THEN
    CREATE POLICY "wine_entries_owner_all" ON public.wine_entries FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'wine_entries' AND policyname = 'wine_entries_creator_sig_update') THEN
    CREATE POLICY "wine_entries_creator_sig_update"
      ON public.wine_entries FOR UPDATE
      USING (EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND is_creator = true));
  END IF;
END $$;


-- ═══════════════════════════════════════════════════════════
--  PART 4 — IN-APP WINE SHARING
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.shared_wines (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id     uuid        NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  sender_name   text        NOT NULL,
  recipient_id  uuid        NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  wine_snapshot jsonb       NOT NULL,
  seen          boolean     NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.shared_wines ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'shared_wines' AND policyname = 'users can view their shares') THEN
    CREATE POLICY "users can view their shares"
      ON public.shared_wines FOR SELECT
      USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'shared_wines' AND policyname = 'users can send shares') THEN
    CREATE POLICY "users can send shares"
      ON public.shared_wines FOR INSERT
      WITH CHECK (auth.uid() = sender_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'shared_wines' AND policyname = 'recipients can mark seen') THEN
    CREATE POLICY "recipients can mark seen"
      ON public.shared_wines FOR UPDATE
      USING (auth.uid() = recipient_id);
  END IF;
END $$;


-- ═══════════════════════════════════════════════════════════
--  PART 5 — WINE LABEL PHOTO STORAGE
-- ═══════════════════════════════════════════════════════════

INSERT INTO storage.buckets (id, name, public)
VALUES ('wine-labels', 'wine-labels', true)
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'users can upload label photos') THEN
    CREATE POLICY "users can upload label photos"
      ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'wine-labels' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'label photos are public') THEN
    CREATE POLICY "label photos are public"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'wine-labels');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'users can delete their label photos') THEN
    CREATE POLICY "users can delete their label photos"
      ON storage.objects FOR DELETE TO authenticated
      USING (bucket_id = 'wine-labels' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;
END $$;


-- ═══════════════════════════════════════════════════════════
--  PART 6 — GRAPE VARIETIES
-- ═══════════════════════════════════════════════════════════

-- Reference table
CREATE TABLE IF NOT EXISTS public.grape_varieties (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  name       text        NOT NULL,
  is_custom  boolean     NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT grape_varieties_name_unique UNIQUE (name)
);

ALTER TABLE public.grape_varieties ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'grape_varieties' AND policyname = 'anyone can read grape varieties') THEN
    CREATE POLICY "anyone can read grape varieties"
      ON public.grape_varieties FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'grape_varieties' AND policyname = 'users can add custom grape varieties') THEN
    CREATE POLICY "users can add custom grape varieties"
      ON public.grape_varieties FOR INSERT TO authenticated
      WITH CHECK (is_custom = true);
  END IF;
END $$;

-- Standard varieties seed
INSERT INTO public.grape_varieties (name, is_custom) VALUES
  ('Agiorgitiko', false), ('Aglianico', false), ('Albariño', false),
  ('Alvarinho', false),   ('Arneis', false),     ('Assyrtiko', false),
  ('Barbera', false),     ('Blaufränkisch', false), ('Bobal', false),
  ('Cabernet Franc', false), ('Cabernet Sauvignon', false), ('Cannonau', false),
  ('Carignan', false),    ('Carménère', false),  ('Catarratto', false),
  ('Chardonnay', false),  ('Chenin Blanc', false), ('Cinsault', false),
  ('Corvina', false),     ('Dolcetto', false),   ('Falanghina', false),
  ('Fiano', false),       ('Frappato', false),   ('Friulano', false),
  ('Gamay', false),       ('Garganega', false),  ('Garnacha', false),
  ('Gavi / Cortese', false), ('Gewürztraminer', false), ('Greco di Tufo', false),
  ('Grenache', false),    ('Grüner Veltliner', false), ('Lagrein', false),
  ('Loureiro', false),    ('Malbec', false),     ('Malvasia', false),
  ('Marsanne', false),    ('Mencía', false),     ('Merlot', false),
  ('Molinara', false),    ('Monastrell', false), ('Montepulciano', false),
  ('Mourvèdre', false),   ('Muscadet', false),   ('Muscat', false),
  ('Nebbiolo', false),    ('Nerello Mascalese', false), ('Nero d''Avola', false),
  ('Palomino', false),    ('Pecorino', false),   ('Petit Verdot', false),
  ('Petite Sirah', false), ('Pinot Blanc', false), ('Pinot Gris', false),
  ('Pinot Grigio', false), ('Pinot Noir', false), ('Pinotage', false),
  ('Primitivo / Zinfandel', false), ('Riesling', false), ('Rondinella', false),
  ('Roussanne', false),   ('Sagrantino', false), ('Sangiovese', false),
  ('Sauvignon Blanc', false), ('Sémillon', false), ('St. Laurent', false),
  ('Syrah / Shiraz', false), ('Tannat', false),  ('Tempranillo', false),
  ('Teroldego', false),   ('Tinta Barroca', false), ('Torrontés', false),
  ('Touriga Nacional', false), ('Trebbiano', false), ('Verdejo', false),
  ('Vermentino', false),  ('Viognier', false),   ('Xinomavro', false),
  ('Zweigelt', false)
ON CONFLICT (name) DO NOTHING;

-- Join table (relational layer, ready for v2)
CREATE TABLE IF NOT EXISTS public.wine_grapes (
  id               uuid     DEFAULT gen_random_uuid() PRIMARY KEY,
  wine_entry_id    uuid     NOT NULL REFERENCES public.wine_entries(id)    ON DELETE CASCADE,
  grape_variety_id uuid     NOT NULL REFERENCES public.grape_varieties(id) ON DELETE RESTRICT,
  percentage       integer  CHECK (percentage >= 1 AND percentage <= 100),
  sort_order       integer  NOT NULL DEFAULT 0,
  created_at       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT wine_grapes_unique UNIQUE (wine_entry_id, grape_variety_id)
);

ALTER TABLE public.wine_grapes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'wine_grapes' AND policyname = 'users can view their wine grapes') THEN
    CREATE POLICY "users can view their wine grapes"
      ON public.wine_grapes FOR SELECT
      USING (EXISTS (SELECT 1 FROM public.wine_entries we WHERE we.id = wine_entry_id AND we.user_id = auth.uid()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'wine_grapes' AND policyname = 'users can insert their wine grapes') THEN
    CREATE POLICY "users can insert their wine grapes"
      ON public.wine_grapes FOR INSERT
      WITH CHECK (EXISTS (SELECT 1 FROM public.wine_entries we WHERE we.id = wine_entry_id AND we.user_id = auth.uid()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'wine_grapes' AND policyname = 'users can delete their wine grapes') THEN
    CREATE POLICY "users can delete their wine grapes"
      ON public.wine_grapes FOR DELETE
      USING (EXISTS (SELECT 1 FROM public.wine_entries we WHERE we.id = wine_entry_id AND we.user_id = auth.uid()));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS wine_grapes_entry_idx     ON public.wine_grapes (wine_entry_id);
CREATE INDEX IF NOT EXISTS grape_varieties_name_idx  ON public.grape_varieties (name);


-- ============================================================
--  DONE.
--  All tables, triggers, indexes, RLS policies, storage bucket,
--  and grape seed data are ready for production.
-- ============================================================

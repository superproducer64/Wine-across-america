-- ============================================================
--  Pour Across America — Grape Varieties Migration
--  Run in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
--  Safe to re-run: uses IF NOT EXISTS / ON CONFLICT.
-- ============================================================


-- ─── 1. grape_blends JSONB column on wine_entries (v1 storage) ───────────────
-- Stores [{name, percentage}] directly on the wine record.
-- Avoids join queries for v1 while keeping the data migration-ready.

ALTER TABLE public.wine_entries
  ADD COLUMN IF NOT EXISTS grape_blends jsonb DEFAULT NULL;


-- ─── 2. grape_varieties reference table ──────────────────────────────────────
-- Canonical list of grape varieties. is_custom = true for user-added names.

CREATE TABLE IF NOT EXISTS public.grape_varieties (
  id         uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  name       text    NOT NULL,
  is_custom  boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT grape_varieties_name_unique UNIQUE (name)
);

ALTER TABLE public.grape_varieties ENABLE ROW LEVEL SECURITY;

-- Everyone (authenticated) can read the reference list
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'grape_varieties'
      AND policyname = 'anyone can read grape varieties'
  ) THEN
    CREATE POLICY "anyone can read grape varieties"
      ON public.grape_varieties FOR SELECT
      TO authenticated USING (true);
  END IF;
END $$;

-- Authenticated users can insert custom varieties
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'grape_varieties'
      AND policyname = 'users can add custom grape varieties'
  ) THEN
    CREATE POLICY "users can add custom grape varieties"
      ON public.grape_varieties FOR INSERT
      TO authenticated WITH CHECK (is_custom = true);
  END IF;
END $$;


-- ─── 3. Seed standard grape varieties ────────────────────────────────────────

INSERT INTO public.grape_varieties (name, is_custom) VALUES
  ('Agiorgitiko', false), ('Aglianico', false), ('Albariño', false),
  ('Alvarinho', false), ('Arneis', false), ('Assyrtiko', false),
  ('Barbera', false), ('Blaufränkisch', false), ('Bobal', false),
  ('Cabernet Franc', false), ('Cabernet Sauvignon', false), ('Cannonau', false),
  ('Carignan', false), ('Carménère', false), ('Catarratto', false),
  ('Chardonnay', false), ('Chenin Blanc', false), ('Cinsault', false),
  ('Corvina', false), ('Dolcetto', false), ('Falanghina', false),
  ('Fiano', false), ('Frappato', false), ('Friulano', false),
  ('Gamay', false), ('Garganega', false), ('Garnacha', false),
  ('Gavi / Cortese', false), ('Gewürztraminer', false), ('Greco di Tufo', false),
  ('Grenache', false), ('Grüner Veltliner', false), ('Lagrein', false),
  ('Loureiro', false), ('Malbec', false), ('Malvasia', false),
  ('Marsanne', false), ('Mencía', false), ('Merlot', false),
  ('Molinara', false), ('Monastrell', false), ('Montepulciano', false),
  ('Mourvèdre', false), ('Muscadet', false), ('Muscat', false),
  ('Nebbiolo', false), ('Nerello Mascalese', false), ("Nero d'Avola", false),
  ('Palomino', false), ('Pecorino', false), ('Petit Verdot', false),
  ('Petite Sirah', false), ('Pinot Blanc', false), ('Pinot Gris', false),
  ('Pinot Grigio', false), ('Pinot Noir', false), ('Pinotage', false),
  ('Primitivo / Zinfandel', false), ('Riesling', false), ('Rondinella', false),
  ('Roussanne', false), ('Sagrantino', false), ('Sangiovese', false),
  ('Sauvignon Blanc', false), ('Sémillon', false), ('St. Laurent', false),
  ('Syrah / Shiraz', false), ('Tannat', false), ('Tempranillo', false),
  ('Teroldego', false), ('Tinta Barroca', false), ('Torrontés', false),
  ('Touriga Nacional', false), ('Trebbiano', false), ('Verdejo', false),
  ('Vermentino', false), ('Viognier', false), ('Xinomavro', false),
  ('Zweigelt', false)
ON CONFLICT (name) DO NOTHING;


-- ─── 4. wine_grapes join table (future relational layer) ─────────────────────
-- Links wine entries to grape varieties with optional blend percentages.
-- Not used by the v1 app (which reads grape_blends JSONB) but ready for v2.

CREATE TABLE IF NOT EXISTS public.wine_grapes (
  id               uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  wine_entry_id    uuid    REFERENCES public.wine_entries(id) ON DELETE CASCADE NOT NULL,
  grape_variety_id uuid    REFERENCES public.grape_varieties(id) ON DELETE RESTRICT NOT NULL,
  percentage       integer CHECK (percentage >= 1 AND percentage <= 100),
  sort_order       integer DEFAULT 0 NOT NULL,
  created_at       timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT wine_grapes_unique UNIQUE (wine_entry_id, grape_variety_id)
);

ALTER TABLE public.wine_grapes ENABLE ROW LEVEL SECURITY;

-- Users can read grape entries for wines they can already see
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'wine_grapes'
      AND policyname = 'users can view their wine grapes'
  ) THEN
    CREATE POLICY "users can view their wine grapes"
      ON public.wine_grapes FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.wine_entries we
          WHERE we.id = wine_entry_id AND we.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'wine_grapes'
      AND policyname = 'users can insert their wine grapes'
  ) THEN
    CREATE POLICY "users can insert their wine grapes"
      ON public.wine_grapes FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.wine_entries we
          WHERE we.id = wine_entry_id AND we.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'wine_grapes'
      AND policyname = 'users can delete their wine grapes'
  ) THEN
    CREATE POLICY "users can delete their wine grapes"
      ON public.wine_grapes FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM public.wine_entries we
          WHERE we.id = wine_entry_id AND we.user_id = auth.uid()
        )
      );
  END IF;
END $$;


-- ─── 5. Index for fast lookups ────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS wine_grapes_entry_idx ON public.wine_grapes (wine_entry_id);
CREATE INDEX IF NOT EXISTS grape_varieties_name_idx ON public.grape_varieties (name);


-- ============================================================
--  Done. grape_blends column, grape_varieties table, and
--  wine_grapes join table are all ready.
-- ============================================================

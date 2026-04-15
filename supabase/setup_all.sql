-- ============================================================
--  Pour Across America — Full Setup Script
--  Paste this entire file into the Supabase SQL Editor and run.
--  Safe to re-run: all statements use IF NOT EXISTS / ON CONFLICT.
-- ============================================================


-- ─── 1. shared_wines table ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.shared_wines (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id     uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  sender_name   text NOT NULL,
  recipient_id  uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  wine_snapshot jsonb NOT NULL,
  seen          boolean DEFAULT false NOT NULL,
  created_at    timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.shared_wines ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'shared_wines' AND policyname = 'users can view their shares'
  ) THEN
    CREATE POLICY "users can view their shares"
      ON public.shared_wines FOR SELECT
      USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'shared_wines' AND policyname = 'users can send shares'
  ) THEN
    CREATE POLICY "users can send shares"
      ON public.shared_wines FOR INSERT
      WITH CHECK (auth.uid() = sender_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'shared_wines' AND policyname = 'recipients can mark seen'
  ) THEN
    CREATE POLICY "recipients can mark seen"
      ON public.shared_wines FOR UPDATE
      USING (auth.uid() = recipient_id);
  END IF;
END $$;


-- ─── 2. Profile search policy (for in-app sharing user lookup) ───────────────

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'user_profiles'
      AND policyname = 'authenticated users can search profiles'
  ) THEN
    CREATE POLICY "authenticated users can search profiles"
      ON public.user_profiles FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;


-- ─── 3. label_photo_url column on wine_entries ───────────────────────────────

ALTER TABLE public.wine_entries
  ADD COLUMN IF NOT EXISTS label_photo_url text DEFAULT NULL;


-- ─── 4. wine-labels storage bucket ───────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public)
VALUES ('wine-labels', 'wine-labels', true)
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects'
      AND policyname = 'users can upload label photos'
  ) THEN
    CREATE POLICY "users can upload label photos"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'wine-labels' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects'
      AND policyname = 'label photos are public'
  ) THEN
    CREATE POLICY "label photos are public"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'wine-labels');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects'
      AND policyname = 'users can delete their label photos'
  ) THEN
    CREATE POLICY "users can delete their label photos"
      ON storage.objects FOR DELETE
      TO authenticated
      USING (bucket_id = 'wine-labels' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;
END $$;


-- ============================================================
--  Done! All tables, policies, columns, and buckets are set up.
-- ============================================================

-- Run this entire script in the Supabase SQL editor
-- (Dashboard → SQL Editor → New Query → Paste → Run)

-- ─── 1. Create shared_wines table ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.shared_wines (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id     uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  sender_name   text NOT NULL,
  recipient_id  uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  wine_snapshot jsonb NOT NULL,
  seen          boolean DEFAULT false NOT NULL,
  created_at    timestamptz DEFAULT now() NOT NULL
);

-- ─── 2. Row-Level Security ────────────────────────────────────────────────────

ALTER TABLE public.shared_wines ENABLE ROW LEVEL SECURITY;

-- Both sender and recipient can read the share
CREATE POLICY "users can view their shares"
  ON public.shared_wines FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Only the sender can insert
CREATE POLICY "users can send shares"
  ON public.shared_wines FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Only the recipient can mark as seen
CREATE POLICY "recipients can mark seen"
  ON public.shared_wines FOR UPDATE
  USING (auth.uid() = recipient_id);

-- ─── 3. Allow profile search by email ────────────────────────────────────────
-- (lets users find other app members to share with)

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'user_profiles'
      AND policyname = 'authenticated users can search profiles'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "authenticated users can search profiles"
        ON public.user_profiles FOR SELECT
        TO authenticated
        USING (true)
    $policy$;
  END IF;
END;
$$;

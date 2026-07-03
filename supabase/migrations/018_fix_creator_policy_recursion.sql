-- Fixes "infinite recursion detected in policy for relation user_profiles"
-- caused by migration 017: a SELECT policy on user_profiles that itself
-- queries user_profiles to check is_creator recurses forever, because the
-- subquery is also subject to RLS (including this same policy).
--
-- Fix: track admin/creator status in a separate, non-recursive table
-- (app_admins) with a trivial self-only policy, and reference THAT table
-- from the creator-read policies instead of querying user_profiles itself.

DROP POLICY IF EXISTS "user_profiles_creator_select" ON user_profiles;
DROP POLICY IF EXISTS "wine_entries_creator_select" ON wine_entries;
DROP POLICY IF EXISTS "shared_wines_creator_select" ON shared_wines;

CREATE TABLE IF NOT EXISTS public.app_admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE public.app_admins ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'app_admins'
      AND policyname = 'app_admins_self_select'
  ) THEN
    CREATE POLICY "app_admins_self_select"
      ON public.app_admins FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Backfill from existing is_creator flags (run as the SQL editor's role,
-- which is not subject to these RLS policies)
INSERT INTO public.app_admins (user_id)
SELECT id FROM public.user_profiles WHERE is_creator = true
ON CONFLICT DO NOTHING;

CREATE POLICY "user_profiles_creator_select"
  ON user_profiles FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.app_admins WHERE user_id = auth.uid())
  );

CREATE POLICY "wine_entries_creator_select"
  ON wine_entries FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.app_admins WHERE user_id = auth.uid())
  );

CREATE POLICY "shared_wines_creator_select"
  ON shared_wines FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.app_admins WHERE user_id = auth.uid())
  );

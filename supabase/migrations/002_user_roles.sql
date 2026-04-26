-- ============================================================
-- Pour Across America — User Roles Migration
-- Adds sommelier role, certification upload, and approval flow
-- ============================================================

-- Add role and sommelier certification columns to user_profiles
-- user_role defaults to 'enthusiast' for all existing and new users.
-- The handle_new_user trigger is NOT modified — it uses the column default.
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS user_role TEXT NOT NULL DEFAULT 'enthusiast'
    CHECK (user_role IN ('enthusiast', 'sommelier')),
  ADD COLUMN IF NOT EXISTS sommelier_cert_url TEXT,
  ADD COLUMN IF NOT EXISTS sommelier_status TEXT
    CHECK (sommelier_status IN ('pending', 'approved', 'rejected') OR sommelier_status IS NULL);

-- ── Trigger fix (run separately in SQL Editor) ────────────────────────────────
-- Running CREATE OR REPLACE FUNCTION in the SQL editor changes the trigger
-- function owner from supabase_admin to postgres, breaking RLS on INSERT.
-- The following restores the function with the correct search_path and adds
-- an open INSERT policy so the trigger succeeds regardless of the calling role.
--
-- CREATE OR REPLACE FUNCTION public.handle_new_user()
-- RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
-- SET search_path = public
-- AS $$
-- BEGIN
--   INSERT INTO public.user_profiles (id, email, display_name)
--   VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'display_name')
--   ON CONFLICT (id) DO NOTHING;
--   RETURN NEW;
-- END;
-- $$;
--
-- DROP POLICY IF EXISTS "user_profiles_trigger_insert" ON public.user_profiles;
-- CREATE POLICY "user_profiles_insert"
--   ON public.user_profiles FOR INSERT WITH CHECK (true);
-- (Safe: id is a FK to auth.users — no phantom profile rows possible)

-- ── Storage bucket setup (Supabase dashboard) ────────────────────────────────
-- 1. Go to Storage → New bucket → name: sommelier-certs → private (not public)
-- 2. Add INSERT policy:
--      USING: auth.uid()::text = (storage.foldername(name))[1]
-- 3. Add SELECT policy for authenticated users
--
-- ── Approving a sommelier application ────────────────────────────────────────
-- In the user_profiles table, set:
--   sommelier_status = 'approved'
-- for the row belonging to the applicant.

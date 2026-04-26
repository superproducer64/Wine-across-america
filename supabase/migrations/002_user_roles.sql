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

-- Allow the handle_new_user trigger (running as 'postgres' role after
-- CREATE OR REPLACE FUNCTION changes ownership) to insert profile rows.
-- Normal app traffic uses anon/authenticated roles and is unaffected.
CREATE POLICY "user_profiles_trigger_insert"
  ON user_profiles
  FOR INSERT
  TO postgres
  WITH CHECK (true);

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

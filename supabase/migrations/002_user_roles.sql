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

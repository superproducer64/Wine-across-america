-- ============================================================
-- Pour Across America — User Roles Migration
-- Adds sommelier role, certification upload, and approval flow
-- ============================================================

-- Add role and sommelier certification columns to user_profiles
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS user_role TEXT NOT NULL DEFAULT 'enthusiast'
    CHECK (user_role IN ('enthusiast', 'sommelier')),
  ADD COLUMN IF NOT EXISTS sommelier_cert_url TEXT,
  ADD COLUMN IF NOT EXISTS sommelier_status TEXT
    CHECK (sommelier_status IN ('pending', 'approved', 'rejected') OR sommelier_status IS NULL);

-- Update the handle_new_user trigger to also set user_role from metadata
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, display_name, user_role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'display_name',
    COALESCE(new.raw_user_meta_data->>'user_role', 'enthusiast')
  );
  RETURN new;
END;
$$;

-- Storage bucket for sommelier certifications
-- Run this in the Supabase dashboard Storage section, or via API:
-- Create a bucket called 'sommelier-certs' (private, not public)
-- RLS: authenticated users can upload their own certs
-- Path convention: {user_id}/{timestamp}.{ext}

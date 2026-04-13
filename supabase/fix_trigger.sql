-- Run this in your Supabase project → SQL Editor
-- It is safe to run multiple times

-- 1. Create the user_profiles table if it doesn't already exist
CREATE TABLE IF NOT EXISTS user_profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT NOT NULL,
  display_name    TEXT,
  avatar_url      TEXT,
  is_creator      BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT NOT NULL DEFAULT 'free'
                      CHECK (subscription_tier IN ('free', 'pro')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create / replace the function that auto-creates the profile on sign-up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, display_name)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'display_name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

-- 3. Drop the trigger if it already exists, then re-create it cleanly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 4. Row-level security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_profiles_self_select" ON user_profiles;
CREATE POLICY "user_profiles_self_select"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "user_profiles_self_update" ON user_profiles;
CREATE POLICY "user_profiles_self_update"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

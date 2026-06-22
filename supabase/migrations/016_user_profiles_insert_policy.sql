-- user_profiles INSERT policy was applied manually and was missing from migrations.
-- This ensures any fresh database setup from migrations includes it.
-- The policy allows the client-side upsert immediately after auth.signUp()
-- (before the auth trigger fires) using the public role with no restrictions.
-- See replit.md for full auth flow explanation.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'user_profiles'
      AND policyname = 'user_profiles_insert'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "user_profiles_insert"
        ON public.user_profiles
        FOR INSERT
        WITH CHECK (true)
    $policy$;
  END IF;
END;
$$;

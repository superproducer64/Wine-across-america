-- Allow creators (is_creator = true) read-only access across all users'
-- profiles and wine entries, so the in-app admin Insights dashboard can
-- surface aggregate, anonymized usage metrics (adoption, engagement,
-- feature reach) without adding any new client-side tracking.
--
-- This is intentionally SELECT-only and additive to the existing
-- owner-scoped policies — it does not change what regular users can see.

CREATE POLICY "user_profiles_creator_select"
  ON user_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles creator
      WHERE creator.id = auth.uid() AND creator.is_creator = true
    )
  );

CREATE POLICY "wine_entries_creator_select"
  ON wine_entries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles creator
      WHERE creator.id = auth.uid() AND creator.is_creator = true
    )
  );

CREATE POLICY "shared_wines_creator_select"
  ON shared_wines FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles creator
      WHERE creator.id = auth.uid() AND creator.is_creator = true
    )
  );

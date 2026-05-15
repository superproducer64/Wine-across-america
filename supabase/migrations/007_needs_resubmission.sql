-- Add 'needs_resubmission' as a valid sommelier_status value.
-- Drops the old CHECK constraint and replaces it with an updated one.

ALTER TABLE user_profiles
  DROP CONSTRAINT IF EXISTS user_profiles_sommelier_status_check;

ALTER TABLE user_profiles
  ADD CONSTRAINT user_profiles_sommelier_status_check
  CHECK (
    sommelier_status IN ('pending', 'approved', 'rejected', 'needs_resubmission')
    OR sommelier_status IS NULL
  );

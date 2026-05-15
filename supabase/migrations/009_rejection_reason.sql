-- Add sommelier_rejection_reason column to user_profiles.
-- Stores the admin-written reason for rejection or resubmission request.
-- Visible to the applicant on their Settings screen.

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS sommelier_rejection_reason TEXT DEFAULT NULL;

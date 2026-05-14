-- Add back_label_photo_url column to wine_entries
-- Stores the URL of the back label photo captured during entry
ALTER TABLE wine_entries
  ADD COLUMN IF NOT EXISTS back_label_photo_url TEXT DEFAULT NULL;

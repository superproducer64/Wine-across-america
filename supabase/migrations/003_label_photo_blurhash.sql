-- Add label_photo_blurhash column to wine_entries
-- Stores a tiny base64 JPEG thumbnail (data URI) used as a per-wine
-- image placeholder while the full label photo loads in expo-image.
ALTER TABLE wine_entries
  ADD COLUMN IF NOT EXISTS label_photo_blurhash TEXT DEFAULT NULL;

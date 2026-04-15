-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- ─── 1. Add label_photo_url column to wine_entries ───────────────────────────

ALTER TABLE public.wine_entries
  ADD COLUMN IF NOT EXISTS label_photo_url text DEFAULT NULL;

-- ─── 2. Create the storage bucket ────────────────────────────────────────────
-- Option A: Run this SQL (requires Supabase >= 2024)

INSERT INTO storage.buckets (id, name, public)
VALUES ('wine-labels', 'wine-labels', true)
ON CONFLICT (id) DO NOTHING;

-- ─── 3. Storage RLS policies ─────────────────────────────────────────────────

-- Allow authenticated users to upload to their own folder
CREATE POLICY "users can upload label photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'wine-labels' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow anyone to read (public bucket)
CREATE POLICY "label photos are public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'wine-labels');

-- Allow users to delete their own photos
CREATE POLICY "users can delete their label photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'wine-labels' AND (storage.foldername(name))[1] = auth.uid()::text);

-- wine-cards: storage bucket for generated shareable wine card images
INSERT INTO storage.buckets (id, name, public)
VALUES ('wine-cards', 'wine-cards', true)
ON CONFLICT (id) DO NOTHING;

-- owner can upload into their own folder (first path segment = auth.uid())
CREATE POLICY "wine_cards_owner_insert"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'wine-cards' AND (storage.foldername(name))[1] = auth.uid()::text);

-- owner can delete their own uploads
CREATE POLICY "wine_cards_owner_delete"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'wine-cards' AND (storage.foldername(name))[1] = auth.uid()::text);

-- card images are readable by anyone with the URL (needed for external share / message attachments)
CREATE POLICY "wine_cards_public_read"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'wine-cards');

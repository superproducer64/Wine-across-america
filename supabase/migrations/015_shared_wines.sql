-- shared_wines: stores wine cards shared between users
CREATE TABLE IF NOT EXISTS public.shared_wines (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_name   TEXT NOT NULL DEFAULT '',
  recipient_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wine_snapshot JSONB NOT NULL DEFAULT '{}',
  seen          BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.shared_wines ENABLE ROW LEVEL SECURITY;

-- sender can insert their own shares
CREATE POLICY "shared_wines_insert"
  ON public.shared_wines
  FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- recipient can view wines shared with them
CREATE POLICY "shared_wines_select_recipient"
  ON public.shared_wines
  FOR SELECT
  USING (auth.uid() = recipient_id);

-- sender can view wines they have sent
CREATE POLICY "shared_wines_select_sender"
  ON public.shared_wines
  FOR SELECT
  USING (auth.uid() = sender_id);

-- recipient can mark a share as seen
CREATE POLICY "shared_wines_update_seen"
  ON public.shared_wines
  FOR UPDATE
  USING (auth.uid() = recipient_id)
  WITH CHECK (auth.uid() = recipient_id);

-- index for fast inbox queries
CREATE INDEX IF NOT EXISTS shared_wines_recipient_idx ON public.shared_wines(recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS shared_wines_sender_idx ON public.shared_wines(sender_id, created_at DESC);

-- messages: optional attachment (e.g. a generated wine share card image)
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS attachment_url TEXT;

-- Create instagram_accounts mapping table (Instagram Professional account id -> connected Facebook Page)
CREATE TABLE IF NOT EXISTS public.instagram_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  facebook_page_id TEXT NOT NULL,
  instagram_id TEXT NOT NULL,
  instagram_username TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, instagram_id),
  UNIQUE (user_id, facebook_page_id)
);

ALTER TABLE public.instagram_accounts ENABLE ROW LEVEL SECURITY;

-- RLS policies (idempotent via catalog checks)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'instagram_accounts'
      AND policyname = 'Users can view their own instagram accounts'
  ) THEN
    CREATE POLICY "Users can view their own instagram accounts"
    ON public.instagram_accounts
    FOR SELECT
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'instagram_accounts'
      AND policyname = 'Users can insert their own instagram accounts'
  ) THEN
    CREATE POLICY "Users can insert their own instagram accounts"
    ON public.instagram_accounts
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'instagram_accounts'
      AND policyname = 'Users can update their own instagram accounts'
  ) THEN
    CREATE POLICY "Users can update their own instagram accounts"
    ON public.instagram_accounts
    FOR UPDATE
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'instagram_accounts'
      AND policyname = 'Users can delete their own instagram accounts'
  ) THEN
    CREATE POLICY "Users can delete their own instagram accounts"
    ON public.instagram_accounts
    FOR DELETE
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- updated_at trigger function exists: public.update_updated_at_column()
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_instagram_accounts_updated_at'
  ) THEN
    CREATE TRIGGER update_instagram_accounts_updated_at
    BEFORE UPDATE ON public.instagram_accounts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Helpful index for webhook lookups
CREATE INDEX IF NOT EXISTS idx_instagram_accounts_instagram_id
ON public.instagram_accounts (instagram_id);

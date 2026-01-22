-- Add instagram_scoped_id column to store the ID used in webhooks
ALTER TABLE public.instagram_accounts
ADD COLUMN IF NOT EXISTS instagram_scoped_id text;

-- Create index for webhook lookups
CREATE INDEX IF NOT EXISTS idx_instagram_accounts_scoped_id ON public.instagram_accounts(instagram_scoped_id);
-- Add token expiration tracking to facebook_pages
ALTER TABLE public.facebook_pages 
ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS token_type TEXT DEFAULT 'long_lived';
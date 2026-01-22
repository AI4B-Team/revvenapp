-- Add profile_picture_url column to instagram_accounts
ALTER TABLE public.instagram_accounts 
ADD COLUMN profile_picture_url TEXT NULL;

-- Add access_token column to store the token for API calls
ALTER TABLE public.instagram_accounts 
ADD COLUMN access_token TEXT NULL;

-- Add token_expires_at column
ALTER TABLE public.instagram_accounts 
ADD COLUMN token_expires_at TIMESTAMP WITH TIME ZONE NULL;
-- Add original_url column to store the original YouTube/Vimeo/etc URL for transcriptions
ALTER TABLE public.user_voices
ADD COLUMN IF NOT EXISTS original_url TEXT;
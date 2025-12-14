-- Add status column to user_voices table for tracking generation progress
ALTER TABLE public.user_voices 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'completed';

-- Add prompt column to store the original text
ALTER TABLE public.user_voices 
ADD COLUMN IF NOT EXISTS prompt TEXT;

-- Enable realtime for user_voices
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_voices;
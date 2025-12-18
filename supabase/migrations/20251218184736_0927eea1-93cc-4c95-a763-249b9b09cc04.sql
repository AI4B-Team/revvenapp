-- Add source column to user_voices table to track transcription source type
ALTER TABLE public.user_voices 
ADD COLUMN source text DEFAULT 'upload';

-- Add comment for documentation
COMMENT ON COLUMN public.user_voices.source IS 'Source of the audio: upload, link, or recording';
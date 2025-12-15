-- Add elevenlabs_voice_id column to user_voices table
-- This stores the ElevenLabs voice ID for cloned voices so they can be used for TTS generation
ALTER TABLE public.user_voices 
ADD COLUMN IF NOT EXISTS elevenlabs_voice_id TEXT;
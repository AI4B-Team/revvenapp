-- Add media URL columns to store generated content
ALTER TABLE public.aiva_chat_messages 
ADD COLUMN image_url TEXT,
ADD COLUMN video_url TEXT,
ADD COLUMN audio_url TEXT;
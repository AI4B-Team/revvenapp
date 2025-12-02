-- Make character_id nullable in ai_videos table since Veo video generation doesn't always require a character
ALTER TABLE ai_videos ALTER COLUMN character_id DROP NOT NULL;
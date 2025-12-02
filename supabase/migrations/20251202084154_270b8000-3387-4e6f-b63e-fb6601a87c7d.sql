-- Add error_message column to ai_videos table
ALTER TABLE ai_videos ADD COLUMN IF NOT EXISTS error_message text;
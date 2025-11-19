-- Add video generation model column to ai_videos table
ALTER TABLE ai_videos 
ADD COLUMN video_generation_model TEXT NOT NULL DEFAULT 'Seedance 1.0';
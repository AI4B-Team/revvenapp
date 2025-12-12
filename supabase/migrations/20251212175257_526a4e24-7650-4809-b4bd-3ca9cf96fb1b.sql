-- Add scenes column to ai_videos table for Story mode scene-by-scene prompts
ALTER TABLE public.ai_videos 
ADD COLUMN scenes JSONB DEFAULT NULL;

-- Add comment explaining the column structure
COMMENT ON COLUMN public.ai_videos.scenes IS 'JSON array of scene objects: [{scene: string, duration: number}, ...]';
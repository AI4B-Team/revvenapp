-- Create ai_videos table for storing generated videos
CREATE TABLE public.ai_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  character_id UUID NOT NULL REFERENCES public.ai_characters(id) ON DELETE CASCADE,
  character_name TEXT NOT NULL,
  character_bio TEXT NOT NULL,
  character_image_url TEXT NOT NULL,
  video_topic TEXT NOT NULL,
  video_script TEXT,
  video_style TEXT NOT NULL,
  video_url TEXT,
  status TEXT NOT NULL DEFAULT 'processing',
  webhook_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.ai_videos ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own videos"
  ON public.ai_videos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own videos"
  ON public.ai_videos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own videos"
  ON public.ai_videos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own videos"
  ON public.ai_videos FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_ai_videos_user_id ON public.ai_videos(user_id);
CREATE INDEX idx_ai_videos_status ON public.ai_videos(status);
CREATE INDEX idx_ai_videos_created_at ON public.ai_videos(created_at DESC);

-- Enable realtime for ai_videos
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_videos;
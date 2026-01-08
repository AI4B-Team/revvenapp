-- Create table for YouTube channel connections
CREATE TABLE public.youtube_channels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  channel_id TEXT NOT NULL,
  channel_title TEXT NOT NULL,
  channel_thumbnail TEXT,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, channel_id)
);

-- Create table for AutoYT video jobs
CREATE TABLE public.autoyt_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  channel_id UUID REFERENCES public.youtube_channels(id) ON DELETE SET NULL,
  prompt TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'text', -- 'text' or 'image'
  source_image_url TEXT,
  video_url TEXT,
  thumbnail_url TEXT,
  title TEXT,
  description TEXT,
  tags TEXT[],
  category TEXT,
  visibility TEXT DEFAULT 'private', -- 'public', 'private', 'unlisted'
  youtube_video_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'generating', 'ready', 'queued', 'publishing', 'published', 'failed'
  scheduled_at TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.youtube_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.autoyt_videos ENABLE ROW LEVEL SECURITY;

-- RLS policies for youtube_channels
CREATE POLICY "Users can view their own channels"
ON public.youtube_channels FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own channels"
ON public.youtube_channels FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own channels"
ON public.youtube_channels FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own channels"
ON public.youtube_channels FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for autoyt_videos
CREATE POLICY "Users can view their own videos"
ON public.autoyt_videos FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own videos"
ON public.autoyt_videos FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own videos"
ON public.autoyt_videos FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own videos"
ON public.autoyt_videos FOR DELETE
USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_youtube_channels_updated_at
BEFORE UPDATE ON public.youtube_channels
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_autoyt_videos_updated_at
BEFORE UPDATE ON public.autoyt_videos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
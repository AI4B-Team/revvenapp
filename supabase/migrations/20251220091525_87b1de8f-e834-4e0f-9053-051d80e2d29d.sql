-- Create function to update timestamps (if not exists)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create explainer_videos table for storing explainer video history
CREATE TABLE public.explainer_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT,
  source_type TEXT NOT NULL CHECK (source_type IN ('upload', 'link')),
  source_url TEXT,
  video_url TEXT,
  audio_url TEXT,
  transcript TEXT,
  explanation TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'downloading', 'transcribing', 'explaining', 'completed', 'failed')),
  error_message TEXT,
  duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.explainer_videos ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own explainer videos" 
ON public.explainer_videos 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own explainer videos" 
ON public.explainer_videos 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own explainer videos" 
ON public.explainer_videos 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own explainer videos" 
ON public.explainer_videos 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_explainer_videos_updated_at
BEFORE UPDATE ON public.explainer_videos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
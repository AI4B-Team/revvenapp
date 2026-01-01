-- Create table for AI Story video generation jobs
CREATE TABLE public.ai_story_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  prompt TEXT NOT NULL,
  voice_id TEXT,
  voice_speed DECIMAL DEFAULT 1.0,
  status TEXT NOT NULL DEFAULT 'pending',
  video_url TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.ai_story_jobs ENABLE ROW LEVEL SECURITY;

-- Users can view their own jobs
CREATE POLICY "Users can view their own story jobs"
ON public.ai_story_jobs
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own jobs
CREATE POLICY "Users can create their own story jobs"
ON public.ai_story_jobs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow service role to update jobs (for webhook callback)
CREATE POLICY "Service role can update story jobs"
ON public.ai_story_jobs
FOR UPDATE
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_ai_story_jobs_updated_at
BEFORE UPDATE ON public.ai_story_jobs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for polling
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_story_jobs;
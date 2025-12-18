-- Create table for tracking audio app usage
CREATE TABLE public.audio_app_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  app_name TEXT NOT NULL,
  input_text TEXT,
  input_audio_url TEXT,
  output_audio_url TEXT,
  output_text TEXT,
  settings JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.audio_app_usage ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own audio app usage"
ON public.audio_app_usage
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own audio app usage"
ON public.audio_app_usage
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own audio app usage"
ON public.audio_app_usage
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own audio app usage"
ON public.audio_app_usage
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_audio_app_usage_user_id ON public.audio_app_usage(user_id);
CREATE INDEX idx_audio_app_usage_app_name ON public.audio_app_usage(app_name);
CREATE INDEX idx_audio_app_usage_created_at ON public.audio_app_usage(created_at DESC);
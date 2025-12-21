-- Create a table for user video exports
CREATE TABLE public.user_exports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  project_title TEXT NOT NULL,
  video_url TEXT NOT NULL,
  format TEXT DEFAULT 'mp4',
  resolution TEXT DEFAULT '1920 × 1080',
  file_size BIGINT,
  duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_exports ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own exports" 
ON public.user_exports 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own exports" 
ON public.user_exports 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exports" 
ON public.user_exports 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_user_exports_user_id ON public.user_exports(user_id);
CREATE INDEX idx_user_exports_created_at ON public.user_exports(created_at DESC);
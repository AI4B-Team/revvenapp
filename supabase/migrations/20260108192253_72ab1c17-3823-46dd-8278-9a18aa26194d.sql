-- Create facebook_pages table to store connected Facebook pages
CREATE TABLE public.facebook_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  page_id TEXT NOT NULL,
  page_name TEXT NOT NULL,
  page_access_token TEXT NOT NULL,
  page_picture TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, page_id)
);

-- Enable RLS
ALTER TABLE public.facebook_pages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own Facebook pages" 
ON public.facebook_pages 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Facebook pages" 
ON public.facebook_pages 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Facebook pages" 
ON public.facebook_pages 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Facebook pages" 
ON public.facebook_pages 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_facebook_pages_updated_at
BEFORE UPDATE ON public.facebook_pages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add facebook columns to autoyt_videos
ALTER TABLE public.autoyt_videos 
ADD COLUMN IF NOT EXISTS facebook_page_id UUID REFERENCES public.facebook_pages(id),
ADD COLUMN IF NOT EXISTS facebook_post_id TEXT,
ADD COLUMN IF NOT EXISTS post_to_facebook BOOLEAN DEFAULT false;
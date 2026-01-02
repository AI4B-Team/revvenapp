-- Create table to store lead generation history
CREATE TABLE public.lead_generation_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  location TEXT NOT NULL,
  platform TEXT NOT NULL,
  keywords TEXT,
  num_leads INTEGER NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lead_generation_history ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since no auth is required for this feature)
CREATE POLICY "Anyone can view lead generation history" 
ON public.lead_generation_history 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert lead generation history" 
ON public.lead_generation_history 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can delete lead generation history" 
ON public.lead_generation_history 
FOR DELETE 
USING (true);

-- Create storage bucket for lead generation files
INSERT INTO storage.buckets (id, name, public) VALUES ('lead-files', 'lead-files', true);

-- Create storage policies
CREATE POLICY "Anyone can view lead files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'lead-files');

CREATE POLICY "Anyone can upload lead files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'lead-files');

CREATE POLICY "Anyone can delete lead files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'lead-files');
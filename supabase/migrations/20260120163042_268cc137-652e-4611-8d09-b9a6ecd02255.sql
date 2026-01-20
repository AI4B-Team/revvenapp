-- Create case_studies table
CREATE TABLE public.case_studies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  prompt TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for case_studies
ALTER TABLE public.case_studies ENABLE ROW LEVEL SECURITY;

-- RLS policies for case_studies
CREATE POLICY "Users can view their own case studies" 
ON public.case_studies 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own case studies" 
ON public.case_studies 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own case studies" 
ON public.case_studies 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own case studies" 
ON public.case_studies 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_case_studies_updated_at
BEFORE UPDATE ON public.case_studies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for case_studies
ALTER PUBLICATION supabase_realtime ADD TABLE public.case_studies;

-- Create cover_letters table
CREATE TABLE public.cover_letters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  prompt TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for cover_letters
ALTER TABLE public.cover_letters ENABLE ROW LEVEL SECURITY;

-- RLS policies for cover_letters
CREATE POLICY "Users can view their own cover letters" 
ON public.cover_letters 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own cover letters" 
ON public.cover_letters 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cover letters" 
ON public.cover_letters 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cover letters" 
ON public.cover_letters 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_cover_letters_updated_at
BEFORE UPDATE ON public.cover_letters
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for cover_letters
ALTER PUBLICATION supabase_realtime ADD TABLE public.cover_letters;
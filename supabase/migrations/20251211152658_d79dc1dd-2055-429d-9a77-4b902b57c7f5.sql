-- Create a table for storing user voice recordings
CREATE TABLE public.user_voices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  duration NUMERIC NOT NULL DEFAULT 0,
  url TEXT NOT NULL,
  cloudinary_public_id TEXT,
  type TEXT NOT NULL DEFAULT 'recorded',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_voices ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own voices" 
ON public.user_voices 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own voices" 
ON public.user_voices 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own voices" 
ON public.user_voices 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own voices" 
ON public.user_voices 
FOR UPDATE 
USING (auth.uid() = user_id);
-- Create posting_schedules table to store user's preferred posting times
CREATE TABLE public.posting_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  day TEXT NOT NULL,
  time TEXT NOT NULL,
  engagement TEXT NOT NULL DEFAULT 'medium',
  account_id TEXT DEFAULT 'all',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_day CHECK (day IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
  CONSTRAINT valid_engagement CHECK (engagement IN ('high', 'medium', 'low'))
);

-- Enable Row Level Security
ALTER TABLE public.posting_schedules ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own posting schedules" 
ON public.posting_schedules 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own posting schedules" 
ON public.posting_schedules 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posting schedules" 
ON public.posting_schedules 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posting schedules" 
ON public.posting_schedules 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_posting_schedules_user_id ON public.posting_schedules(user_id);
CREATE INDEX idx_posting_schedules_day ON public.posting_schedules(day);

-- Create trigger for updated_at
CREATE TRIGGER update_posting_schedules_updated_at
BEFORE UPDATE ON public.posting_schedules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
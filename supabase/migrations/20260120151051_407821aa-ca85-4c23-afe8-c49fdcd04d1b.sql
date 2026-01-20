-- Create proposals table for storing generated proposals
CREATE TABLE public.proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  prompt TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'processing',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own proposals" 
ON public.proposals 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own proposals" 
ON public.proposals 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own proposals" 
ON public.proposals 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own proposals" 
ON public.proposals 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_proposals_updated_at
BEFORE UPDATE ON public.proposals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for proposals table
ALTER PUBLICATION supabase_realtime ADD TABLE public.proposals;
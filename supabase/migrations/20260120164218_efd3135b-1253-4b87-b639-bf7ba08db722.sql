-- Create handbooks table
CREATE TABLE public.handbooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'processing',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.handbooks ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own handbooks" 
ON public.handbooks 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own handbooks" 
ON public.handbooks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own handbooks" 
ON public.handbooks 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own handbooks" 
ON public.handbooks 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_handbooks_updated_at
BEFORE UPDATE ON public.handbooks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for handbooks table
ALTER PUBLICATION supabase_realtime ADD TABLE public.handbooks;
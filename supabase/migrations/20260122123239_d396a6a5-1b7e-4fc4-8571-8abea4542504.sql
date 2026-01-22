-- Create keyword_replies table for keyword-based auto replies
CREATE TABLE public.keyword_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  response_message TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  response_count INTEGER NOT NULL DEFAULT 0,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ai_auto_replies table for AI-based auto replies
CREATE TABLE public.ai_auto_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  system_prompt TEXT NOT NULL,
  knowledge_base TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  response_count INTEGER NOT NULL DEFAULT 0,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create knowledge_files table for uploaded files
CREATE TABLE public.knowledge_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  ai_auto_reply_id UUID REFERENCES public.ai_auto_replies(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_content TEXT NOT NULL,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.keyword_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_auto_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_files ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for keyword_replies
CREATE POLICY "Users can view their own keyword replies" 
ON public.keyword_replies FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own keyword replies" 
ON public.keyword_replies FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own keyword replies" 
ON public.keyword_replies FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own keyword replies" 
ON public.keyword_replies FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for ai_auto_replies
CREATE POLICY "Users can view their own AI auto replies" 
ON public.ai_auto_replies FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI auto replies" 
ON public.ai_auto_replies FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI auto replies" 
ON public.ai_auto_replies FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI auto replies" 
ON public.ai_auto_replies FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for knowledge_files
CREATE POLICY "Users can view their own knowledge files" 
ON public.knowledge_files FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own knowledge files" 
ON public.knowledge_files FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own knowledge files" 
ON public.knowledge_files FOR DELETE 
USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_keyword_replies_updated_at
BEFORE UPDATE ON public.keyword_replies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_auto_replies_updated_at
BEFORE UPDATE ON public.ai_auto_replies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
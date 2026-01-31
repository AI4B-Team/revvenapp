
-- Create feedback_submissions table for general feedback
CREATE TABLE public.feedback_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL DEFAULT 'general' CHECK (type IN ('general', 'bug', 'feature')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  attachments TEXT[] DEFAULT '{}',
  screen_recording_url TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  severity TEXT CHECK (severity IN ('low', 'medium', 'high')),
  parent_id UUID REFERENCES public.feedback_submissions(id),
  votes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create feedback_votes table
CREATE TABLE public.feedback_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  feedback_id UUID NOT NULL REFERENCES public.feedback_submissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, feedback_id)
);

-- Create feedback_comments table
CREATE TABLE public.feedback_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  feedback_id UUID NOT NULL REFERENCES public.feedback_submissions(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_name TEXT NOT NULL DEFAULT 'Anonymous',
  author_avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.feedback_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_comments ENABLE ROW LEVEL SECURITY;

-- RLS policies for feedback_submissions
CREATE POLICY "Anyone can view feedback" ON public.feedback_submissions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create feedback" ON public.feedback_submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feedback" ON public.feedback_submissions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own feedback" ON public.feedback_submissions
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for feedback_votes
CREATE POLICY "Anyone can view votes" ON public.feedback_votes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vote" ON public.feedback_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own votes" ON public.feedback_votes
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for feedback_comments
CREATE POLICY "Anyone can view comments" ON public.feedback_comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can comment" ON public.feedback_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON public.feedback_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON public.feedback_comments
  FOR DELETE USING (auth.uid() = user_id);

-- Function to update votes count
CREATE OR REPLACE FUNCTION public.update_feedback_votes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.feedback_submissions SET votes_count = votes_count + 1, updated_at = now() WHERE id = NEW.feedback_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.feedback_submissions SET votes_count = votes_count - 1, updated_at = now() WHERE id = OLD.feedback_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Function to update comments count
CREATE OR REPLACE FUNCTION public.update_feedback_comments_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.feedback_submissions SET comments_count = comments_count + 1, updated_at = now() WHERE id = NEW.feedback_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.feedback_submissions SET comments_count = comments_count - 1, updated_at = now() WHERE id = OLD.feedback_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Triggers
CREATE TRIGGER on_feedback_vote_change
  AFTER INSERT OR DELETE ON public.feedback_votes
  FOR EACH ROW EXECUTE FUNCTION public.update_feedback_votes_count();

CREATE TRIGGER on_feedback_comment_change
  AFTER INSERT OR DELETE ON public.feedback_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_feedback_comments_count();

-- Create storage bucket for feedback attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('feedback-attachments', 'feedback-attachments', true);

-- Storage policies
CREATE POLICY "Anyone can view feedback attachments" ON storage.objects
  FOR SELECT USING (bucket_id = 'feedback-attachments');

CREATE POLICY "Authenticated users can upload feedback attachments" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'feedback-attachments' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own feedback attachments" ON storage.objects
  FOR DELETE USING (bucket_id = 'feedback-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

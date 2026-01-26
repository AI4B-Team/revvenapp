-- Create community_posts table for shared creations
CREATE TABLE public.community_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  original_item_id TEXT NOT NULL,
  original_item_type TEXT NOT NULL CHECK (original_item_type IN ('image', 'video', 'audio', 'document')),
  title TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  content_url TEXT,
  prompt TEXT,
  model TEXT,
  aspect_ratio TEXT,
  resolution TEXT,
  likes_count INTEGER DEFAULT 0,
  creator_name TEXT NOT NULL,
  creator_avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

-- Everyone can view community posts (public gallery)
CREATE POLICY "Community posts are viewable by everyone" 
ON public.community_posts 
FOR SELECT 
USING (true);

-- Users can create their own community posts
CREATE POLICY "Users can create their own community posts" 
ON public.community_posts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own community posts
CREATE POLICY "Users can update their own community posts" 
ON public.community_posts 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can delete their own community posts
CREATE POLICY "Users can delete their own community posts" 
ON public.community_posts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create community_likes table for tracking likes
CREATE TABLE public.community_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- Enable Row Level Security
ALTER TABLE public.community_likes ENABLE ROW LEVEL SECURITY;

-- Everyone can view likes
CREATE POLICY "Community likes are viewable by everyone" 
ON public.community_likes 
FOR SELECT 
USING (true);

-- Authenticated users can like posts
CREATE POLICY "Authenticated users can like posts" 
ON public.community_likes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can remove their own likes
CREATE POLICY "Users can remove their own likes" 
ON public.community_likes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update likes count
CREATE OR REPLACE FUNCTION public.update_community_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts SET likes_count = likes_count + 1, updated_at = now() WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts SET likes_count = likes_count - 1, updated_at = now() WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for automatic likes count updates
CREATE TRIGGER update_community_likes_count_trigger
AFTER INSERT OR DELETE ON public.community_likes
FOR EACH ROW
EXECUTE FUNCTION public.update_community_likes_count();

-- Create trigger for updated_at timestamp
CREATE TRIGGER update_community_posts_updated_at
BEFORE UPDATE ON public.community_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for community posts
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_posts;
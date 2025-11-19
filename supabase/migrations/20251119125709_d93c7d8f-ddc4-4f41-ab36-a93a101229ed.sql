-- Create table for generated images
CREATE TABLE public.generated_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  prompt TEXT NOT NULL,
  model TEXT DEFAULT 'google/gemini-2.5-flash-image-preview',
  image_url TEXT NOT NULL,
  cloudinary_public_id TEXT,
  aspect_ratio TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.generated_images ENABLE ROW LEVEL SECURITY;

-- Users can view their own generated images
CREATE POLICY "Users can view own generated images"
  ON public.generated_images
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own generated images
CREATE POLICY "Users can insert own generated images"
  ON public.generated_images
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own generated images
CREATE POLICY "Users can delete own generated images"
  ON public.generated_images
  FOR DELETE
  USING (auth.uid() = user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.generated_images;
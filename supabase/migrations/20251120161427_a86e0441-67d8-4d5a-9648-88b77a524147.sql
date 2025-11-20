-- Create reference_images table
CREATE TABLE IF NOT EXISTS public.reference_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  cloudinary_public_id TEXT,
  thumbnail_url TEXT,
  original_filename TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reference_images ENABLE ROW LEVEL SECURITY;

-- Create policies for reference_images
CREATE POLICY "Users can view their own reference images"
  ON public.reference_images
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reference images"
  ON public.reference_images
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reference images"
  ON public.reference_images
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_reference_images_user_id ON public.reference_images(user_id);
CREATE INDEX idx_reference_images_created_at ON public.reference_images(created_at DESC);
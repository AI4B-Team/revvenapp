-- Add category column to track creations, edited, and upscaled images
ALTER TABLE public.generated_images 
ADD COLUMN IF NOT EXISTS category text DEFAULT 'creation';

-- Add comment for clarity
COMMENT ON COLUMN public.generated_images.category IS 'Type of image: creation, edited, or upscaled';
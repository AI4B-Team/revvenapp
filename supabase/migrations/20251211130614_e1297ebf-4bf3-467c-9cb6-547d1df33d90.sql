-- Add column to store multiple reference image URLs as a JSON array
ALTER TABLE public.generated_images 
ADD COLUMN reference_image_urls text[] DEFAULT NULL;

-- Migrate existing single reference_image_url to the new array column
UPDATE public.generated_images 
SET reference_image_urls = ARRAY[reference_image_url] 
WHERE reference_image_url IS NOT NULL;
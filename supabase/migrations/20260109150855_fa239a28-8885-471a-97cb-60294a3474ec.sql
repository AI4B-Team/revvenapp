-- Drop the existing foreign key constraint
ALTER TABLE public.autoyt_videos 
DROP CONSTRAINT IF EXISTS autoyt_videos_facebook_page_id_fkey;

-- Re-add the constraint with ON DELETE SET NULL
ALTER TABLE public.autoyt_videos 
ADD CONSTRAINT autoyt_videos_facebook_page_id_fkey 
FOREIGN KEY (facebook_page_id) 
REFERENCES public.facebook_pages(id) 
ON DELETE SET NULL;
-- Create storage bucket for project thumbnails
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-thumbnails', 'project-thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload thumbnails
CREATE POLICY "Users can upload project thumbnails"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'project-thumbnails');

-- Allow public read access to thumbnails
CREATE POLICY "Public can view project thumbnails"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'project-thumbnails');

-- Allow users to update their own thumbnails
CREATE POLICY "Users can update their thumbnails"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'project-thumbnails');

-- Allow users to delete their thumbnails
CREATE POLICY "Users can delete their thumbnails"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'project-thumbnails');
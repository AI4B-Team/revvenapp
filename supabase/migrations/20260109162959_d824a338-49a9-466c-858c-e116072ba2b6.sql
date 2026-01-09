-- Fix lead-files storage bucket security
-- Make bucket private and add user-scoped RLS policies

-- Make the bucket private
UPDATE storage.buckets SET public = false WHERE id = 'lead-files';

-- Drop overly permissive public policies
DROP POLICY IF EXISTS "Anyone can view lead files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload lead files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete lead files" ON storage.objects;

-- Create user-scoped policies for authenticated users
-- Users can only view files in their own folder (user_id/*)
CREATE POLICY "Users can view their own lead files" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'lead-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can only upload files to their own folder
CREATE POLICY "Users can upload to their own lead folder" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'lead-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can only delete their own files
CREATE POLICY "Users can delete their own lead files" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'lead-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow admins to view all lead files
CREATE POLICY "Admins can view all lead files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'lead-files'
  AND public.has_role(auth.uid(), 'admin')
);
-- Add used_by_email column to track who signed up with the code
ALTER TABLE public.invite_codes 
ADD COLUMN used_by_email TEXT;
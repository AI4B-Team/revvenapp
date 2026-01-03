-- Add used_by_name column to track the name of who signed up with the code
ALTER TABLE public.invite_codes 
ADD COLUMN used_by_name TEXT;
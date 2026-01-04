-- Add invite_code_validated column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS invite_code_validated boolean DEFAULT false;
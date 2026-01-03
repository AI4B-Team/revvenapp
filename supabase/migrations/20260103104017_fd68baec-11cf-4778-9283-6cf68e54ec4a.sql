-- Create invite_codes table for tracking one-time use invite codes
CREATE TABLE public.invite_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  creator_user_id UUID NOT NULL,
  used_by_user_id UUID,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_used BOOLEAN NOT NULL DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;

-- Allow anyone to check if a code is valid (for signup validation)
CREATE POLICY "Anyone can check invite codes"
ON public.invite_codes
FOR SELECT
USING (true);

-- Allow authenticated users to create invite codes
CREATE POLICY "Authenticated users can create invite codes"
ON public.invite_codes
FOR INSERT
WITH CHECK (auth.uid() = creator_user_id);

-- Allow authenticated users to update their own codes (for marking as used)
CREATE POLICY "Users can update their own invite codes"
ON public.invite_codes
FOR UPDATE
USING (auth.uid() = creator_user_id);

-- Allow service role to update any invite code (for marking as used during signup)
CREATE POLICY "Service can update invite codes"
ON public.invite_codes
FOR UPDATE
USING (true);

-- Allow users to delete their own invite codes
CREATE POLICY "Users can delete their own invite codes"
ON public.invite_codes
FOR DELETE
USING (auth.uid() = creator_user_id);

-- Create index on code for fast lookups
CREATE INDEX idx_invite_codes_code ON public.invite_codes(code);
CREATE INDEX idx_invite_codes_creator ON public.invite_codes(creator_user_id);
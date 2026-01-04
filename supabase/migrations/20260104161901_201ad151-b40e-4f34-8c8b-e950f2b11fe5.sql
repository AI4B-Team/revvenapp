-- Add account_status column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN account_status text NOT NULL DEFAULT 'active' 
CHECK (account_status IN ('active', 'suspended', 'disabled'));

-- Add index for faster lookups
CREATE INDEX idx_profiles_account_status ON public.profiles(account_status);
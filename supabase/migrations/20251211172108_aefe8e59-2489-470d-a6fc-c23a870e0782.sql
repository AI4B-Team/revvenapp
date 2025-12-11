-- Create table for user product images
CREATE TABLE public.user_products (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  url text NOT NULL,
  cloudinary_public_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_products ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own products" 
ON public.user_products 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own products" 
ON public.user_products 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products" 
ON public.user_products 
FOR DELETE 
USING (auth.uid() = user_id);
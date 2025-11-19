-- Add columns to generated_images table for async callback pattern
ALTER TABLE generated_images 
ADD COLUMN IF NOT EXISTS kie_task_id TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS error_message TEXT;

-- Add index for faster lookups by task_id
CREATE INDEX IF NOT EXISTS idx_generated_images_kie_task_id ON generated_images(kie_task_id);
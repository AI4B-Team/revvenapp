-- Allow image_url to be NULL while generation is pending
ALTER TABLE generated_images
ALTER COLUMN image_url DROP NOT NULL;
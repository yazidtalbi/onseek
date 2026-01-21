-- Add image_url column to submissions table for personal item images
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS image_url text;


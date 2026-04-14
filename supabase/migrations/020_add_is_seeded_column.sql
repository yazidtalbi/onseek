-- Add is_seeded column to requests and submissions tables
ALTER TABLE requests ADD COLUMN IF NOT EXISTS is_seeded BOOLEAN DEFAULT FALSE;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS is_seeded BOOLEAN DEFAULT FALSE;
ALTER TABLE saved_personal_items ADD COLUMN IF NOT EXISTS is_seeded BOOLEAN DEFAULT FALSE;

-- Optionally, and for completeness, add it to profiles too if needed, 
-- but we'll stick to requests and submissions as requested.

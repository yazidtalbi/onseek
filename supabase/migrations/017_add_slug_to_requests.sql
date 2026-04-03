-- Add slug column to requests table
ALTER TABLE requests ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Backfill existing requests with a slug generated from their UUID short-id and title
UPDATE requests 
SET slug = substr(replace(id::text, '-', ''), 1, 8) || '-' || lower(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g')) 
WHERE slug IS NULL;

-- Alter column to be NOT NULL now that it is backfilled
ALTER TABLE requests ALTER COLUMN slug SET NOT NULL;

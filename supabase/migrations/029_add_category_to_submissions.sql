-- Add category and price_suffix to submissions
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS price_suffix text;

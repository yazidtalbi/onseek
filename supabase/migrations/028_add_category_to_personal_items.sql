-- Add category to saved_personal_items
ALTER TABLE saved_personal_items ADD COLUMN IF NOT EXISTS category text;

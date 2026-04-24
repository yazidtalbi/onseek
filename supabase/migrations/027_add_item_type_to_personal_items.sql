-- Add item_type and price_suffix to saved_personal_items
ALTER TABLE saved_personal_items ADD COLUMN IF NOT EXISTS item_type text DEFAULT 'product';
ALTER TABLE saved_personal_items ADD COLUMN IF NOT EXISTS price_suffix text;

-- Add icon column to requests table
ALTER TABLE requests ADD COLUMN IF NOT EXISTS icon TEXT;

-- Update existing requests with icons based on title keywords (initial batch)
UPDATE requests SET icon = 'computer' WHERE title ILIKE '%macbook%' OR title ILIKE '%laptop%' OR title ILIKE '%pc%';
UPDATE requests SET icon = 'smartphone' WHERE title ILIKE '%iphone%' OR title ILIKE '%phone%' OR title ILIKE '%pixel%';
UPDATE requests SET icon = 'headphones' WHERE title ILIKE '%headphones%' OR title ILIKE '%airpods%';
UPDATE requests SET icon = 'gamepad-2' WHERE title ILIKE '%ps5%' OR title ILIKE '%xbox%' OR title ILIKE '%nintendo%' OR title ILIKE '%gaming%';
UPDATE requests SET icon = 'camera' WHERE title ILIKE '%camera%' OR title ILIKE '%canon%' OR title ILIKE '%nikon%';
UPDATE requests SET icon = 'tv' WHERE title ILIKE '%tv%' OR title ILIKE '%television%';
UPDATE requests SET icon = 'watch' WHERE title ILIKE '%watch%';
UPDATE requests SET icon = 'footprints' WHERE title ILIKE '%sneakers%' OR title ILIKE '%shoes%';
UPDATE requests SET icon = 'shopping-bag' WHERE title ILIKE '%bag%' OR title ILIKE '%jacket%' OR title ILIKE '%clothing%';
UPDATE requests SET icon = 'car' WHERE title ILIKE '%car%' OR title ILIKE '%tesla%';
UPDATE requests SET icon = 'apple' WHERE title ILIKE '%food%' OR title ILIKE '%grocery%';
UPDATE requests SET icon = 'sparkles' WHERE title ILIKE '%beauty%' OR title ILIKE '%makeup%';

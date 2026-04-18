-- Seed avatars for profiles that don't have one
UPDATE profiles
SET avatar_url = 'https://i.pravatar.cc/150?u=' || id::text
WHERE avatar_url IS NULL OR avatar_url = '';

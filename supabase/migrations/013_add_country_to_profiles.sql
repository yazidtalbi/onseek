-- Add country to profiles table
alter table profiles add column if not exists country text;

-- Seed "Morocco" for user "kage"
update profiles set country = 'Morocco' where username = 'kage';

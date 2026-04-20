-- Add first_name and last_name to profiles table
alter table public.profiles 
add column if not exists first_name text,
add column if not exists last_name text;

-- Optional: try to populate from display_name if possible (e.g. split by space)
-- This is a best-effort simple split for "First Last"
do $$
begin
  update public.profiles
  set 
    first_name = split_part(display_name, ' ', 1),
    last_name = trim(substring(display_name from position(' ' in display_name)))
  where (first_name is null or last_name is null) 
    and display_name is not null 
    and display_name like '% %';
end $$;

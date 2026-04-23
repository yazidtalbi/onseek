-- Add email column to profiles to store primary account email
alter table public.profiles 
add column if not exists email text;

-- Update handle_new_user function to sync email from auth.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do update
  set email = excluded.email;
  return new;
end;
$$ language plpgsql security definer;

-- Backfill existing profiles with emails from auth.users
-- This requires running as a superuser/service role, which migrations do.
do $$
begin
  update public.profiles p
  set email = u.email
  from auth.users u
  where p.id = u.id and p.email is null;
end $$;

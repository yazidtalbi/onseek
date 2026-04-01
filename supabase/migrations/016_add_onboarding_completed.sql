alter table public.profiles add column if not exists country text;
alter table public.profiles add column if not exists onboarding_completed boolean default false;

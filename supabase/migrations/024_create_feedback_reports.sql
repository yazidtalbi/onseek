create table if not exists public.feedback_reports (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete set null,
  type text not null check (type in ('bug', 'feedback')),
  title text not null,
  description text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table public.feedback_reports enable row level security;

create policy "Anyone can insert feedback reports"
  on public.feedback_reports for insert
  with check (true);

create policy "Admins can view feedback reports"
  on public.feedback_reports for select
  using (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and is_admin = true
    )
  );

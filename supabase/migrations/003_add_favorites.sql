-- Migration to add favorites/saves functionality
-- Users can save/favorite requests

create table if not exists favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  request_id uuid not null references requests(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, request_id)
);

create index if not exists favorites_user_idx
  on favorites (user_id);
create index if not exists favorites_request_idx
  on favorites (request_id);

alter table favorites enable row level security;

create policy "Users can view own favorites"
  on favorites for select
  using (auth.uid() = user_id);
create policy "Users can create own favorites"
  on favorites for insert
  with check (auth.uid() = user_id);
create policy "Users can delete own favorites"
  on favorites for delete
  using (auth.uid() = user_id);


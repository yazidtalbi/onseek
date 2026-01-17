create extension if not exists "pgcrypto";

do $$ begin
  create type request_status as enum ('open', 'closed', 'solved');
exception
  when duplicate_object then null;
end $$;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text,
  avatar_url text,
  bio text,
  reputation integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  description text not null,
  category text not null,
  budget_min numeric,
  budget_max numeric,
  country text,
  condition text,
  urgency text,
  status request_status not null default 'open',
  winner_submission_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists request_links (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references requests(id) on delete cascade,
  url text not null,
  created_at timestamptz not null default now()
);

create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references requests(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  url text not null,
  store_name text,
  price numeric,
  shipping_cost numeric,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists votes (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references submissions(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  vote integer not null check (vote in (-1, 1)),
  created_at timestamptz not null default now(),
  unique (submission_id, user_id)
);

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references profiles(id) on delete cascade,
  type text not null check (type in ('request', 'submission')),
  target_id uuid not null,
  reason text not null,
  created_at timestamptz not null default now()
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  type text not null,
  payload jsonb not null default '{}'::jsonb,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_requests_updated_at on requests;
create trigger set_requests_updated_at
before update on requests
for each row
execute function set_updated_at();

drop trigger if exists set_submissions_updated_at on submissions;
create trigger set_submissions_updated_at
before update on submissions
for each row
execute function set_updated_at();

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function handle_new_user();

create index if not exists requests_status_created_idx
  on requests (status, created_at desc);
create index if not exists requests_category_status_created_idx
  on requests (category, status, created_at desc);
create index if not exists submissions_request_created_idx
  on submissions (request_id, created_at desc);
create index if not exists votes_submission_idx
  on votes (submission_id);
create index if not exists profiles_username_idx
  on profiles (username);
create index if not exists requests_search_idx
  on requests using gin (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '')));

alter table profiles enable row level security;
alter table requests enable row level security;
alter table request_links enable row level security;
alter table submissions enable row level security;
alter table votes enable row level security;
alter table reports enable row level security;
alter table notifications enable row level security;

create policy "Profiles are viewable by everyone"
  on profiles for select
  using (true);
create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);
create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Requests are viewable by everyone"
  on requests for select
  using (true);
create policy "Users can create requests"
  on requests for insert
  with check (auth.uid() = user_id);
create policy "Users can update own requests"
  on requests for update
  using (auth.uid() = user_id);
create policy "Users can delete own requests"
  on requests for delete
  using (auth.uid() = user_id);

create policy "Request links are viewable by everyone"
  on request_links for select
  using (true);
create policy "Owners can add request links"
  on request_links for insert
  with check (
    exists (
      select 1 from requests r
      where r.id = request_id and r.user_id = auth.uid()
    )
  );

create policy "Submissions are viewable by everyone"
  on submissions for select
  using (true);
create policy "Users can submit to open requests"
  on submissions for insert
  with check (
    auth.uid() = user_id and exists (
      select 1 from requests r
      where r.id = request_id and r.status = 'open'
    )
  );
create policy "Users can update own submissions when open"
  on submissions for update
  using (
    auth.uid() = user_id and exists (
      select 1 from requests r
      where r.id = request_id and r.status = 'open'
    )
  );
create policy "Users can delete own submissions when open"
  on submissions for delete
  using (
    auth.uid() = user_id and exists (
      select 1 from requests r
      where r.id = request_id and r.status = 'open'
    )
  );

create policy "Votes are viewable by everyone"
  on votes for select
  using (true);
create policy "Users can manage own votes"
  on votes for insert
  with check (auth.uid() = user_id);
create policy "Users can update own votes"
  on votes for update
  using (auth.uid() = user_id);
create policy "Users can delete own votes"
  on votes for delete
  using (auth.uid() = user_id);

create policy "Users can report content"
  on reports for insert
  with check (auth.uid() = reporter_id);
create policy "Reports are private"
  on reports for select
  using (false);

create policy "Notifications are readable by owner"
  on notifications for select
  using (auth.uid() = user_id);
create policy "Notifications are updatable by owner"
  on notifications for update
  using (auth.uid() = user_id);
create policy "Notifications can be inserted by owner"
  on notifications for insert
  with check (auth.uid() = user_id);


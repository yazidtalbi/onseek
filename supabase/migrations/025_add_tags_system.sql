-- Automated Tag Generation System
-- Adds support for categorization, SEO clusters, and seller matching via tags

-- 1. Create tag type enum
do $$ begin
  create type tag_type as enum ('system', 'dynamic', 'urgency');
exception
  when duplicate_object then null;
end $$;

-- 2. Create tags table
create table if not exists tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  type tag_type not null default 'dynamic',
  created_at timestamptz not null default now()
);

-- 3. Create request_tags join table
create table if not exists request_tags (
  request_id uuid not null references requests(id) on delete cascade,
  tag_id uuid not null references tags(id) on delete cascade,
  primary key (request_id, tag_id),
  created_at timestamptz not null default now()
);

-- 4. Create indexes for performance
create index if not exists tags_slug_idx on tags(slug);
create index if not exists tags_type_idx on tags(type);
create index if not exists request_tags_request_idx on request_tags(request_id);
create index if not exists request_tags_tag_idx on request_tags(tag_id);

-- 5. Enable RLS
alter table tags enable row level security;
alter table request_tags enable row level security;

-- 6. RLS Policies
do $$ begin
  create policy "Tags are viewable by everyone" on tags for select using (true);
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create policy "Authenticated users can create tags" on tags for insert with check (auth.role() = 'authenticated');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create policy "Request tags are viewable by everyone" on request_tags for select using (true);
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create policy "Request owners can manage request tags"
    on request_tags for all
    using (
      exists (
        select 1 from requests r
        where r.id = request_id and r.user_id = auth.uid()
      )
    );
exception
  when duplicate_object then null;
end $$;

-- 7. Seed some initial System Tags
insert into tags (name, slug, type) values
  ('UI/UX', 'ui-ux', 'system'),
  ('Dev', 'dev', 'system'),
  ('Luxury', 'luxury', 'system'),
  ('Vintage', 'vintage', 'system'),
  ('Sustainable', 'sustainable', 'system'),
  ('Collectibles', 'collectibles', 'system')
on conflict (name) do nothing;

-- 8. Seed some initial Urgency Tags
insert into tags (name, slug, type) values
  ('Urgent', 'urgent', 'urgency'),
  ('High Budget', 'high-budget', 'urgency'),
  ('Flexible', 'flexible', 'urgency'),
  ('Time Sensitive', 'time-sensitive', 'urgency')
on conflict (name) do nothing;

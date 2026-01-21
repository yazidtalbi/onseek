-- Create table for saving personal items for later use
create table if not exists saved_personal_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  article_name text not null,
  description text,
  price numeric,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists saved_personal_items_user_created_idx
  on saved_personal_items (user_id, created_at desc);

drop trigger if exists set_saved_personal_items_updated_at on saved_personal_items;
create trigger set_saved_personal_items_updated_at
before update on saved_personal_items
for each row
execute function set_updated_at();


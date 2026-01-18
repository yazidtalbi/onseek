-- Migration to add image support for requests
-- Users can upload up to 5 images per request

create table if not exists request_images (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references requests(id) on delete cascade,
  image_url text not null,
  image_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists request_images_request_idx
  on request_images (request_id, image_order);

alter table request_images enable row level security;

create policy "Request images are viewable by everyone"
  on request_images for select
  using (true);
create policy "Request owners can add images"
  on request_images for insert
  with check (
    exists (
      select 1 from requests r
      where r.id = request_id and r.user_id = auth.uid()
    )
  );
create policy "Request owners can delete images"
  on request_images for delete
  using (
    exists (
      select 1 from requests r
      where r.id = request_id and r.user_id = auth.uid()
    )
  );


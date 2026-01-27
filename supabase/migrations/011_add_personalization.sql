-- Personalization system: Categories, preferences, and ranking
-- This migration adds support for multi-category requests and user preferences

-- 1. Categories table
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  icon text,
  parent_id uuid references categories(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- 2. Request-Category join table (many-to-many)
create table if not exists request_categories (
  request_id uuid not null references requests(id) on delete cascade,
  category_id uuid not null references categories(id) on delete cascade,
  primary key (request_id, category_id),
  created_at timestamptz not null default now()
);

-- 3. User preferences table
create table if not exists user_preferences (
  user_id uuid not null references profiles(id) on delete cascade,
  category_id uuid not null references categories(id) on delete cascade,
  weight numeric not null default 1.0,
  updated_at timestamptz not null default now(),
  primary key (user_id, category_id)
);

-- 4. User hidden categories table
create table if not exists user_hidden_categories (
  user_id uuid not null references profiles(id) on delete cascade,
  category_id uuid not null references categories(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, category_id)
);

-- Indexes for performance
create index if not exists categories_slug_idx on categories(slug);
create index if not exists categories_parent_idx on categories(parent_id);
create index if not exists request_categories_request_idx on request_categories(request_id);
create index if not exists request_categories_category_idx on request_categories(category_id);
create index if not exists user_preferences_user_idx on user_preferences(user_id);
create index if not exists user_preferences_category_idx on user_preferences(category_id);
create index if not exists user_hidden_categories_user_idx on user_hidden_categories(user_id);
create index if not exists user_hidden_categories_category_idx on user_hidden_categories(category_id);

-- Update trigger for user_preferences
drop trigger if exists set_user_preferences_updated_at on user_preferences;
create trigger set_user_preferences_updated_at
before update on user_preferences
for each row
execute function set_updated_at();

-- Enable RLS
alter table categories enable row level security;
alter table request_categories enable row level security;
alter table user_preferences enable row level security;
alter table user_hidden_categories enable row level security;

-- RLS Policies

-- Categories: viewable by everyone
create policy "Categories are viewable by everyone"
  on categories for select
  using (true);

-- Request categories: viewable by everyone
create policy "Request categories are viewable by everyone"
  on request_categories for select
  using (true);

-- Request categories: only request owners can add/remove
create policy "Request owners can manage request categories"
  on request_categories for all
  using (
    exists (
      select 1 from requests r
      where r.id = request_id and r.user_id = auth.uid()
    )
  );

-- User preferences: users can only see/edit their own
create policy "Users can view own preferences"
  on user_preferences for select
  using (auth.uid() = user_id);

create policy "Users can manage own preferences"
  on user_preferences for all
  using (auth.uid() = user_id);

-- User hidden categories: users can only see/edit their own
create policy "Users can view own hidden categories"
  on user_hidden_categories for select
  using (auth.uid() = user_id);

create policy "Users can manage own hidden categories"
  on user_hidden_categories for all
  using (auth.uid() = user_id);

-- Seed categories from existing structure
-- Main categories
insert into categories (name, slug) values
  ('Tech', 'tech'),
  ('Gaming', 'gaming'),
  ('Fashion', 'fashion'),
  ('Health & Cosmetics', 'health-cosmetics'),
  ('Family & Children', 'family-children'),
  ('Home & Living', 'home-living'),
  ('Garden & DIY', 'garden-diy'),
  ('Auto', 'auto'),
  ('Grocery', 'grocery')
on conflict (name) do nothing;

-- Subcategories for Tech
insert into categories (name, slug, parent_id)
select 'Telephony', 'tech-telephony', id from categories where slug = 'tech'
union all
select 'Photography', 'tech-photography', id from categories where slug = 'tech'
union all
select 'Computing', 'tech-computing', id from categories where slug = 'tech'
union all
select 'Home Automation', 'tech-home-automation', id from categories where slug = 'tech'
union all
select 'Wearables', 'tech-wearables', id from categories where slug = 'tech'
union all
select 'Connected Objects', 'tech-connected-objects', id from categories where slug = 'tech'
union all
select 'Audio & Hi-fi', 'tech-audio-hifi', id from categories where slug = 'tech'
union all
select 'Electronic Accessories', 'tech-electronic-accessories', id from categories where slug = 'tech'
union all
select 'Apps & Software', 'tech-apps-software', id from categories where slug = 'tech'
union all
select 'TV & Video', 'tech-tv-video', id from categories where slug = 'tech'
on conflict (name) do nothing;

-- Subcategories for Gaming
insert into categories (name, slug, parent_id)
select 'PC Gaming', 'gaming-pc', id from categories where slug = 'gaming'
union all
select 'Video Games', 'gaming-video-games', id from categories where slug = 'gaming'
union all
select 'Consoles', 'gaming-consoles', id from categories where slug = 'gaming'
union all
select 'Gaming Accessories', 'gaming-accessories', id from categories where slug = 'gaming'
on conflict (name) do nothing;

-- Subcategories for Fashion
insert into categories (name, slug, parent_id)
select 'Shoes', 'fashion-shoes', id from categories where slug = 'fashion'
union all
select 'Clothing & Apparel', 'fashion-clothing', id from categories where slug = 'fashion'
union all
select 'Sportswear', 'fashion-sportswear', id from categories where slug = 'fashion'
union all
select 'Fashion Accessories', 'fashion-accessories', id from categories where slug = 'fashion'
on conflict (name) do nothing;

-- Subcategories for Health & Cosmetics
insert into categories (name, slug, parent_id)
select 'Perfumes', 'health-perfumes', id from categories where slug = 'health-cosmetics'
union all
select 'Beauty', 'health-beauty', id from categories where slug = 'health-cosmetics'
union all
select 'Pharmacy & Parapharmacy', 'health-pharmacy', id from categories where slug = 'health-cosmetics'
union all
select 'Hygiene & Care', 'health-hygiene', id from categories where slug = 'health-cosmetics'
on conflict (name) do nothing;

-- Subcategories for Family & Children
insert into categories (name, slug, parent_id)
select 'Childcare', 'family-childcare', id from categories where slug = 'family-children'
union all
select 'School Supplies', 'family-school-supplies', id from categories where slug = 'family-children'
union all
select 'Games & Toys', 'family-games-toys', id from categories where slug = 'family-children'
union all
select 'Pregnancy & Maternity', 'family-pregnancy', id from categories where slug = 'family-children'
on conflict (name) do nothing;

-- Subcategories for Home & Living
insert into categories (name, slug, parent_id)
select 'Lighting', 'home-lighting', id from categories where slug = 'home-living'
union all
select 'Decoration', 'home-decoration', id from categories where slug = 'home-living'
union all
select 'Home Appliances', 'home-appliances', id from categories where slug = 'home-living'
union all
select 'Furniture', 'home-furniture', id from categories where slug = 'home-living'
union all
select 'Stationery & Office', 'home-stationery', id from categories where slug = 'home-living'
union all
select 'Culinary Arts', 'home-culinary', id from categories where slug = 'home-living'
union all
select 'Kitchen & Maintenance', 'home-kitchen', id from categories where slug = 'home-living'
on conflict (name) do nothing;

-- Subcategories for Garden & DIY
insert into categories (name, slug, parent_id)
select 'Garden', 'garden-garden', id from categories where slug = 'garden-diy'
union all
select 'Tools', 'garden-tools', id from categories where slug = 'garden-diy'
union all
select 'Works & Materials', 'garden-works', id from categories where slug = 'garden-diy'
on conflict (name) do nothing;

-- Subcategories for Auto
insert into categories (name, slug, parent_id)
select 'Fuel', 'auto-fuel', id from categories where slug = 'auto'
union all
select 'Tires', 'auto-tires', id from categories where slug = 'auto'
union all
select 'Car Parts', 'auto-car-parts', id from categories where slug = 'auto'
union all
select 'Car Leasing', 'auto-leasing', id from categories where slug = 'auto'
union all
select 'Motorcycle Accessories', 'auto-motorcycle', id from categories where slug = 'auto'
union all
select 'Car Accessories', 'auto-accessories', id from categories where slug = 'auto'
union all
select 'Cars & Motorcycles', 'auto-cars', id from categories where slug = 'auto'
union all
select 'Car Service & Repair', 'auto-service', id from categories where slug = 'auto'
on conflict (name) do nothing;

-- Subcategories for Grocery
insert into categories (name, slug, parent_id)
select 'Food', 'grocery-food', id from categories where slug = 'grocery'
union all
select 'Animals', 'grocery-animals', id from categories where slug = 'grocery'
union all
select 'Drinks', 'grocery-drinks', id from categories where slug = 'grocery'
union all
select 'Home Hygiene', 'grocery-hygiene', id from categories where slug = 'grocery'
on conflict (name) do nothing;

-- Migrate existing requests: link them to categories based on their category field
-- This creates a mapping from old category text to new category slugs
insert into request_categories (request_id, category_id)
select 
  r.id as request_id,
  c.id as category_id
from requests r
join categories c on 
  case 
    when r.category = 'Tech' then c.slug = 'tech'
    when r.category = 'Gaming' then c.slug = 'gaming'
    when r.category = 'Fashion' then c.slug = 'fashion'
    when r.category = 'Health & Cosmetics' then c.slug = 'health-cosmetics'
    when r.category = 'Family & Children' then c.slug = 'family-children'
    when r.category = 'Home & Living' then c.slug = 'home-living'
    when r.category = 'Garden & DIY' then c.slug = 'garden-diy'
    when r.category = 'Auto' then c.slug = 'auto'
    when r.category = 'Grocery' then c.slug = 'grocery'
    else false
  end
where not exists (
  select 1 from request_categories rc 
  where rc.request_id = r.id and rc.category_id = c.id
)
on conflict do nothing;


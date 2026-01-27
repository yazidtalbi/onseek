-- Add RLS policies for saved_personal_items table

alter table saved_personal_items enable row level security;

-- Users can view their own personal items
create policy "Users can view own personal items"
  on saved_personal_items for select
  using (auth.uid() = user_id);

-- Users can insert their own personal items
create policy "Users can insert own personal items"
  on saved_personal_items for insert
  with check (auth.uid() = user_id);

-- Users can update their own personal items
create policy "Users can update own personal items"
  on saved_personal_items for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Users can delete their own personal items
create policy "Users can delete own personal items"
  on saved_personal_items for delete
  using (auth.uid() = user_id);


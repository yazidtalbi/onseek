-- Part 1: Run these lines first and click "Run"
-- PostgreSQL has a rule that new enum values must be committed 
-- before they can be used in the same connection.
ALTER TYPE request_status ADD VALUE IF NOT EXISTS 'pending' BEFORE 'open';
ALTER TYPE request_status ADD VALUE IF NOT EXISTS 'rejected' AFTER 'open';
ALTER TYPE request_status ADD VALUE IF NOT EXISTS 'archived';

-- Part 2: Run the rest of these lines after Part 1 has completed successfully
-- 1. Add is_admin to profiles
alter table profiles add column if not exists is_admin boolean not null default false;

-- 3. Update defaults and existing data
alter table requests alter column status set default 'pending';

-- Map 'closed' to 'archived' if any exist
update requests set status = 'archived' where status = 'closed';

-- 4. Update RLS policies for visibility
drop policy if exists "Requests are viewable by everyone" on requests;
create policy "Requests are viewable by everyone"
  on requests for select
  using (
    status = 'open' 
    or status = 'solved'
    or auth.uid() = user_id
    or (select is_admin from profiles where id = auth.uid()) = true
  );

-- Submissions should only be allowed on 'open' requests
drop policy if exists "Users can submit to open requests" on submissions;
create policy "Users can submit to open requests"
  on submissions for insert
  with check (
    auth.uid() = user_id and exists (
      select 1 from requests r
      where r.id = request_id and r.status = 'open'
    )
  );

-- Fix RLS policy to allow trigger function to insert notifications
-- The issue: The original policy requires auth.uid() = user_id, but when
-- the trigger function inserts a notification for the request owner,
-- auth.uid() is the submitter's ID, not the request owner's ID.

-- Drop the restrictive insert policy
drop policy if exists "Notifications can be inserted by owner" on notifications;

-- Create a policy that allows:
-- 1. Users to insert their own notifications (auth.uid() = user_id)
-- 2. The trigger function to insert notifications for any valid user
--    (by checking that user_id exists in profiles)
create policy "Notifications can be inserted for valid users"
  on notifications for insert
  with check (
    -- Allow if the current user is inserting for themselves
    auth.uid() = user_id OR
    -- Allow if user_id exists in profiles (valid user)
    -- This allows the trigger function (security definer) to insert
    -- notifications for any valid user, even if auth.uid() doesn't match
    exists (select 1 from profiles where id = user_id)
  );


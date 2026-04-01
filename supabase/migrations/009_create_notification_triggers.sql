-- Create function to notify request owner when a submission is created
create or replace function notify_request_owner_on_submission()
returns trigger as $$
declare
  request_owner_id uuid;
  req_title text;
  sender_name text;
  sender_avatar text;
begin
  -- Get the request owner's user_id and request title
  select user_id, title into request_owner_id, req_title
  from requests
  where id = new.request_id;

  -- Get the submitter's profile details
  select display_name, avatar_url into sender_name, sender_avatar
  from profiles
  where id = new.user_id;

  -- Fallback to username if display_name is null
  if sender_name is null then
    select username into sender_name
    from profiles
    where id = new.user_id;
  end if;

  -- Only create notification if owner exists and is not the submitter
  if request_owner_id is not null and request_owner_id != new.user_id then
    -- Use security definer to bypass RLS and insert notification
    -- The function runs with the privileges of the function owner (postgres)
    insert into notifications (user_id, type, payload)
    values (
      request_owner_id,
      'new_submission',
      jsonb_build_object(
        'request_id', new.request_id,
        'request_title', req_title,
        'submission_id', new.id,
        'submission_title', coalesce(new.article_name, 'New submission'),
        'sender_id', new.user_id,
        'sender_name', coalesce(sender_name, 'Someone'),
        'sender_avatar', sender_avatar
      )
    );
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- Grant necessary permissions to the function
grant execute on function notify_request_owner_on_submission() to authenticated;
grant execute on function notify_request_owner_on_submission() to anon;

-- Create trigger to fire on submission insert
drop trigger if exists on_submission_created on submissions;
create trigger on_submission_created
after insert on submissions
for each row
execute function notify_request_owner_on_submission();

-- Create index for efficient notification queries
create index if not exists notifications_user_read_created_idx
  on notifications (user_id, read, created_at desc);

-- Create index for efficient request owner lookups
create index if not exists requests_user_id_idx
  on requests (user_id);


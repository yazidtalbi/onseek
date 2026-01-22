-- Create function to notify request owner when a submission is created
create or replace function notify_request_owner_on_submission()
returns trigger as $$
declare
  request_owner_id uuid;
begin
  -- Get the request owner's user_id
  select user_id into request_owner_id
  from requests
  where id = new.request_id;

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
        'submission_id', new.id,
        'submission_title', coalesce(new.article_name, 'New submission')
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


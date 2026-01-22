-- Add contact info fields to profiles table
alter table profiles
add column if not exists contact_email text,
add column if not exists contact_phone text,
add column if not exists contact_whatsapp text,
add column if not exists contact_telegram text,
add column if not exists contact_preferred text check (contact_preferred in ('email', 'phone', 'whatsapp', 'telegram'));

-- Add comment for documentation
comment on column profiles.contact_email is 'Contact email for personal item sales (visible only to request owners)';
comment on column profiles.contact_phone is 'Contact phone number for personal item sales';
comment on column profiles.contact_whatsapp is 'WhatsApp contact for personal item sales';
comment on column profiles.contact_telegram is 'Telegram contact for personal item sales';
comment on column profiles.contact_preferred is 'Preferred contact method';


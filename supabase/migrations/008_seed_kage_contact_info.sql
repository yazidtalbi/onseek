-- Seed contact information for user "kage"
update profiles
set 
  contact_email = 'kage@example.com',
  contact_phone = '+1234567890',
  contact_whatsapp = '+1234567890',
  contact_telegram = '@kage',
  contact_preferred = 'email'
where username = 'kage';


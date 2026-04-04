-- Run this in your Supabase SQL Editor to make yourself an admin
-- Replace 'YOUR_USERNAME' with your actual username

update profiles 
set is_admin = true 
where username = 'YOUR_USERNAME';

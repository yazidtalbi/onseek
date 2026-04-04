-- Wipe all requests and related data
-- This is a destructive operation to allow for a fresh start with new categories.

TRUNCATE TABLE public.requests CASCADE;

-- Also reset any sequences if they exist (though typically UUIDs are used)
-- ALTER SEQUENCE requests_id_seq RESTART WITH 1; 

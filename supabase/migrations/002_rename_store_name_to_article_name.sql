-- Migration to rename store_name to article_name in submissions table
-- This aligns the database schema with the application code

ALTER TABLE submissions RENAME COLUMN store_name TO article_name;


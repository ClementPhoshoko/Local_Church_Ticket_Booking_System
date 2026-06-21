-- ============================================================
-- SET ADMIN USER SCRIPT
-- ============================================================
-- Run this in the Supabase SQL Editor to set a user as admin.
-- Replace 'admin@example.com' with your admin user's email.
-- ============================================================

-- Set a user as admin by updating their raw_user_meta_data
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'admin@example.com';

-- Verify the change (optional)
SELECT id, email, raw_user_meta_data
FROM auth.users
WHERE email = 'admin@example.com';

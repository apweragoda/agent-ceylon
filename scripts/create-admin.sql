-- Create Admin User Script for AgentCeylon
-- Run this in your Supabase SQL Editor

-- First, create the admin user in Supabase Auth (you'll need to do this via Supabase Dashboard)
-- Then update the user record to make them admin

-- Step 1: After creating user via Supabase Auth, update their user_type to 'admin'
-- Replace 'your-user-email@example.com' with the actual email you used
UPDATE users 
SET user_type = 'admin' 
WHERE email = 'admin@agentceylon.com';

-- Step 2: Verify the admin user was created
SELECT id, email, full_name, user_type, created_at 
FROM users 
WHERE user_type = 'admin';

-- Alternative: If you want to create a complete admin record
-- (Only use this if you already have the user in auth.users)
/*
INSERT INTO users (
    id, 
    email, 
    full_name, 
    user_type, 
    created_at, 
    updated_at
) VALUES (
    'replace-with-auth-user-id', -- Get this from auth.users table
    'admin@agentceylon.com',
    'Admin User',
    'admin',
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET 
    user_type = 'admin',
    updated_at = NOW();
*/
# Admin User Setup Guide

## Method 1: Using the Setup Page (Recommended)

1. **Go to**: `http://localhost:3000/setup`
2. **Fill the form** with your admin details
3. **Submit** - this will create a user and set them as admin
4. **Login** at `/login` with the credentials you created

## Method 2: Manual Setup via Supabase Dashboard

If the setup page doesn't work due to permissions, follow these steps:

### Step 1: Create User in Supabase Dashboard

1. **Go to your Supabase Dashboard**
2. **Navigate to**: Authentication > Users
3. **Click**: "Add user"
4. **Fill in**:
   - Email: `admin@agentceylon.com` (or your preferred email)
   - Password: `admin123` (or your secure password)
   - Auto Confirm User: ✅ (check this box)
5. **Click**: "Create user"

### Step 2: Make User Admin via SQL

1. **Go to**: Database > SQL Editor in Supabase Dashboard
2. **Run this SQL**:

```sql
-- Insert admin user into users table
INSERT INTO users (
    id, 
    email, 
    full_name, 
    user_type, 
    created_at, 
    updated_at
) 
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', 'Admin User') as full_name,
    'admin' as user_type,
    au.created_at,
    NOW() as updated_at
FROM auth.users au 
WHERE au.email = 'admin@agentceylon.com'  -- Replace with your admin email
ON CONFLICT (id) 
DO UPDATE SET 
    user_type = 'admin',
    updated_at = NOW();

-- Verify the admin user was created
SELECT id, email, full_name, user_type, created_at 
FROM users 
WHERE user_type = 'admin';
```

### Step 3: Login and Access Admin Panel

1. **Go to**: `http://localhost:3000/login`
2. **Login** with your admin credentials
3. **Access**: `http://localhost:3000/admin`

## Method 3: Quick SQL Setup (All-in-One)

If you want to create everything via SQL:

```sql
-- Create admin user in auth.users (requires service role)
-- This only works if you're running this with service role key

-- First, insert into auth.users
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'admin@agentceylon.com',
    crypt('admin123', gen_salt('bf')),  -- Password: admin123
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Admin User"}',
    false,
    'authenticated'
);

-- Then insert into users table
INSERT INTO users (
    id, 
    email, 
    full_name, 
    user_type, 
    created_at, 
    updated_at
) 
SELECT 
    au.id,
    'admin@agentceylon.com',
    'Admin User',
    'admin',
    NOW(),
    NOW()
FROM auth.users au 
WHERE au.email = 'admin@agentceylon.com'
ON CONFLICT (id) 
DO UPDATE SET 
    user_type = 'admin',
    updated_at = NOW();
```

## Recommended Credentials

For testing:
- **Email**: `admin@agentceylon.com`
- **Password**: `admin123`
- **Full Name**: `AgentCeylon Admin`

## Troubleshooting

1. **Email confirmation**: If email confirmation is enabled in Supabase, you might need to verify the email
2. **Permissions**: The setup API uses regular signup, not admin API, so it should work with standard permissions
3. **Database access**: Make sure your database is properly configured with the schema we created
4. **Environment variables**: Ensure your `.env.local` has the correct Supabase credentials

## After Setup

Once your admin user is created:

1. **Login** at `/login`
2. **Access admin panel** at `/admin` 
3. **Seed sample data** at `/admin/seed`
4. **Create additional users** as needed

The admin user has full access to:
- Tour management
- User management  
- Provider management
- Analytics and reports
- System settings
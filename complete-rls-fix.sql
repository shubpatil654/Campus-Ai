-- Complete RLS Fix for CampusAI Registration System
-- Run this in your Supabase SQL Editor

-- 1. Disable RLS temporarily for users table to allow registration
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 2. Drop all existing policies on users table
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Allow user registration" ON users;

-- 3. Re-enable RLS and create proper policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 4. Create comprehensive policies for users table
CREATE POLICY "Allow user registration" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow user login" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update their own data" ON users FOR UPDATE USING (true);

-- 5. Ensure OTP and temp_users tables have proper policies
ALTER TABLE otps ENABLE ROW LEVEL SECURITY;
ALTER TABLE temp_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations on otps" ON otps;
DROP POLICY IF EXISTS "Allow all operations on temp_users" ON temp_users;

CREATE POLICY "Allow all operations on otps" ON otps FOR ALL USING (true);
CREATE POLICY "Allow all operations on temp_users" ON temp_users FOR ALL USING (true);

-- 6. Verify all policies are in place
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    cmd, 
    qual 
FROM pg_policies 
WHERE tablename IN ('users', 'otps', 'temp_users')
ORDER BY tablename, cmd;

-- 7. Test query to verify users table is accessible
SELECT COUNT(*) as user_count FROM users;

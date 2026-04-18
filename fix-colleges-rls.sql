-- Fix RLS policies for colleges table
-- Run this in your Supabase SQL Editor

-- 1. Drop existing policies on colleges table if any
DROP POLICY IF EXISTS "Allow all operations on colleges" ON colleges;
DROP POLICY IF EXISTS "Allow public read access to colleges" ON colleges;
DROP POLICY IF EXISTS "Allow admin operations on colleges" ON colleges;

-- 2. Create comprehensive policies for colleges table
-- Allow public read access to active and verified colleges
CREATE POLICY "Allow public read access to colleges" ON colleges 
FOR SELECT USING (is_active = true AND is_verified = true);

-- Allow all operations for super_admin role (for admin operations)
CREATE POLICY "Allow admin operations on colleges" ON colleges 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'super_admin'
  )
);

-- Allow college_admin to update their own college
CREATE POLICY "Allow college admin to update their college" ON colleges 
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'college_admin'
    AND users.id = colleges.admin_id
  )
);

-- Allow college_admin to read their own college
CREATE POLICY "Allow college admin to read their college" ON colleges 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'college_admin'
    AND users.id = colleges.admin_id
  )
);

-- 3. Also fix policies for related tables
-- User favorites policies
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own favorites" ON user_favorites;
CREATE POLICY "Users can manage their own favorites" ON user_favorites 
FOR ALL USING (user_id = auth.uid());

-- Chat messages policies
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own chat messages" ON chat_messages;
CREATE POLICY "Users can manage their own chat messages" ON chat_messages 
FOR ALL USING (user_id = auth.uid());

-- College reviews policies
ALTER TABLE college_reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own reviews" ON college_reviews;
CREATE POLICY "Users can manage their own reviews" ON college_reviews 
FOR ALL USING (user_id = auth.uid());

-- Allow public read access to reviews
CREATE POLICY "Allow public read access to reviews" ON college_reviews 
FOR SELECT USING (true);

-- 4. Verify policies are in place
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    cmd, 
    qual 
FROM pg_policies 
WHERE tablename IN ('colleges', 'user_favorites', 'chat_messages', 'college_reviews')
ORDER BY tablename, cmd;

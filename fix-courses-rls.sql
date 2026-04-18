-- Fix RLS policies for courses table
-- Drop existing policies on courses table if any
DROP POLICY IF EXISTS "Allow all operations on courses" ON courses;
DROP POLICY IF EXISTS "Allow public read access to courses" ON courses;
DROP POLICY IF EXISTS "Allow admin operations on courses" ON courses;
DROP POLICY IF EXISTS "Allow college admin to manage their courses" ON courses;
DROP POLICY IF EXISTS "Allow college admin to read their courses" ON courses;

-- Create comprehensive policies for courses table
-- Allow public read access to active courses
CREATE POLICY "Allow public read access to courses" ON courses
FOR SELECT USING (is_active = true);

-- Allow all operations for super_admin role (for admin operations)
CREATE POLICY "Allow admin operations on courses" ON courses
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'super_admin'
  )
);

-- Allow college_admin to manage their own college's courses
CREATE POLICY "Allow college admin to manage their courses" ON courses
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'college_admin'
    AND users.id = (
      SELECT admin_id FROM colleges 
      WHERE colleges.id = courses.college_id
    )
  )
);

-- Allow college_admin to read their own college's courses
CREATE POLICY "Allow college admin to read their courses" ON courses
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'college_admin'
    AND users.id = (
      SELECT admin_id FROM colleges 
      WHERE colleges.id = courses.college_id
    )
  )
);

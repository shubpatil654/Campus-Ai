-- Add missing RLS policy for college updates
-- Run this in your Supabase SQL Editor

-- Add the missing UPDATE policy for colleges table
CREATE POLICY "College admins can update their own colleges" ON colleges FOR UPDATE USING (auth.uid() = admin_id);

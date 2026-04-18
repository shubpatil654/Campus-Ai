-- Add only the profile_picture column (if it doesn't exist)
-- Run this in your Supabase SQL Editor

ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture TEXT;

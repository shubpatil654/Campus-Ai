-- Add profile fields to users table
-- Run this in your Supabase SQL Editor

-- Add all the profile fields to the users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS state VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS pincode VARCHAR(10);
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_school VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_class VARCHAR(10);
ALTER TABLE users ADD COLUMN IF NOT EXISTS board_of_study VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS expected_marks DECIMAL(5,2);
ALTER TABLE users ADD COLUMN IF NOT EXISTS subjects TEXT[]; -- Array of subjects
ALTER TABLE users ADD COLUMN IF NOT EXISTS interested_streams TEXT[]; -- Array of streams
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_location VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS budget_range VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS parent_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS parent_phone VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS parent_occupation VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS goals TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS hobbies TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS achievements TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture TEXT;

-- Add constraints (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_gender') THEN
        ALTER TABLE users ADD CONSTRAINT check_gender CHECK (gender IN ('Male', 'Female', 'Other'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_current_class') THEN
        ALTER TABLE users ADD CONSTRAINT check_current_class CHECK (current_class IN ('8th', '9th', '10th', '11th', '12th'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_expected_marks') THEN
        ALTER TABLE users ADD CONSTRAINT check_expected_marks CHECK (expected_marks >= 0 AND expected_marks <= 100);
    END IF;
END $$;

-- Update the updated_at timestamp when any field is modified
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

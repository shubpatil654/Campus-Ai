-- Simple script to create just the admin user
-- Run this in your Supabase SQL Editor

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(50) DEFAULT 'student',
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Delete existing admin user if any
DELETE FROM users WHERE email = 'admin@campusai.com';

-- Insert new admin user
INSERT INTO users (name, email, password, phone, role, is_verified) 
VALUES (
  'Admin User',
  'admin@campusai.com',
  '$2b$10$J.9fcJJN5C1bd1qPAU9yqOnlML8o6XMjB7TpGaQWTuIwo4MKCHi4G',
  '1234567892',
  'super_admin',
  true
);

-- Verify admin user was created
SELECT id, name, email, role, is_verified, created_at 
FROM users 
WHERE email = 'admin@campusai.com';
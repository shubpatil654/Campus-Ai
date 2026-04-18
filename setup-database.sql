-- CampusAI Database Setup Script
-- Run this in your Supabase SQL Editor

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(50) DEFAULT 'student' CHECK (role IN ('student', 'parent', 'college_admin', 'super_admin')),
  is_verified BOOLEAN DEFAULT false,
  profile_picture TEXT,
  date_of_birth DATE,
  gender VARCHAR(10),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create colleges table
CREATE TABLE IF NOT EXISTS colleges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  website VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  established_year INTEGER,
  rating DECIMAL(3, 2) DEFAULT 0,
  total_ratings INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert admin user
INSERT INTO users (name, email, password, phone, role, is_verified) 
VALUES (
  'Admin User',
  'admin@campusai.com',
  '$2b$10$J.9fcJJN5C1bd1qPAU9yqOnlML8o6XMjB7TpGaQWTuIwo4MKCHi4G',
  '1234567892',
  'super_admin',
  true
) ON CONFLICT (email) DO UPDATE SET
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  is_verified = EXCLUDED.is_verified;

-- Insert sample colleges
INSERT INTO colleges (name, description, location, address, latitude, longitude, website, phone, email, established_year, rating, total_ratings, is_verified, is_active) VALUES
('RLS Institute of Technology', 'Premier engineering college in Belagavi offering quality education in various engineering streams.', 'Belagavi, Karnataka', 'NH-4, Belagavi, Karnataka 590018', 15.8497, 74.4977, 'https://rlsit.edu.in', '0831-1234567', 'info@rlsit.edu.in', 2001, 4.5, 150, true, true),
('GSS Institute of Technology', 'Leading technical institute providing excellent education and placement opportunities.', 'Belagavi, Karnataka', 'NH-4, Belagavi, Karnataka 590018', 15.8497, 74.4977, 'https://gssit.edu.in', '0831-1234568', 'info@gssit.edu.in', 2002, 4.3, 120, true, true)
ON CONFLICT DO NOTHING;

-- Verify admin user creation
SELECT id, name, email, role, is_verified, created_at 
FROM users 
WHERE email = 'admin@campusai.com';
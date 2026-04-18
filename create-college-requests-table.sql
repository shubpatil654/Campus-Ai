-- Create college_requests table for admin dashboard
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS college_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  college_name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  website VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),
  established_year INTEGER,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert some sample college requests for testing
INSERT INTO college_requests (
  college_name, 
  contact_person, 
  email, 
  phone, 
  website, 
  address, 
  city, 
  state, 
  established_year, 
  description, 
  status
) VALUES 
(
  'New Engineering College',
  'Dr. John Smith',
  'admin@newengcollege.edu',
  '9876543210',
  'https://newengcollege.edu',
  '123 Education Street',
  'Bangalore',
  'Karnataka',
  2020,
  'A new engineering college focusing on modern technology and innovation.',
  'pending'
),
(
  'Tech Institute of Excellence',
  'Prof. Sarah Johnson',
  'contact@techexcellence.edu',
  '9876543211',
  'https://techexcellence.edu',
  '456 Tech Avenue',
  'Pune',
  'Maharashtra',
  2019,
  'Institute specializing in computer science and information technology.',
  'pending'
);

-- Verify the table was created
SELECT COUNT(*) as total_requests FROM college_requests;
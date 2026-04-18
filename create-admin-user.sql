-- Create admin user for CampusAI
-- Email: admin@campusai.com
-- Password: admin123

-- First, delete any existing admin users to avoid conflicts
DELETE FROM users WHERE email = 'admin@campusai.com' OR email = 'admin@demo.com';

-- Insert the new admin user
INSERT INTO users (name, email, password, phone, role, is_verified, created_at, updated_at) 
VALUES (
  'Admin User',
  'admin@campusai.com',
  '$2b$10$J.9fcJJN5C1bd1qPAU9yqOnlML8o6XMjB7TpGaQWTuIwo4MKCHi4G',
  '1234567892',
  'super_admin',
  true,
  NOW(),
  NOW()
);

-- Verify the admin user was created
SELECT id, name, email, role, is_verified, created_at 
FROM users 
WHERE email = 'admin@campusai.com';
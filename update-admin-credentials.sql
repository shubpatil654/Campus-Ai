-- Update admin user credentials
-- Email: admin@campusai.com
-- Password: admin123 (hashed with bcrypt)

UPDATE users 
SET 
  email = 'admin@campusai.com',
  password = '$2b$10$J.9fcJJN5C1bd1qPAU9yqOnlML8o6XMjB7TpGaQWTuIwo4MKCHi4G'
WHERE 
  role = 'super_admin' 
  AND (email = 'admin@demo.com' OR email LIKE '%admin%');

-- Verify the update
SELECT id, name, email, role, is_verified 
FROM users 
WHERE role = 'super_admin';

-- Create OTP and Temporary Users tables for CampusAI
-- Run this in your Supabase SQL Editor

-- OTPs table for email verification
CREATE TABLE IF NOT EXISTS otps (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    otp VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Temporary Users table for registration process
CREATE TABLE IF NOT EXISTS temp_users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    user_data JSONB NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_otps_email ON otps(email);
CREATE INDEX IF NOT EXISTS idx_otps_expires_at ON otps(expires_at);
CREATE INDEX IF NOT EXISTS idx_temp_users_email ON temp_users(email);
CREATE INDEX IF NOT EXISTS idx_temp_users_expires_at ON temp_users(expires_at);

-- Enable Row Level Security
ALTER TABLE otps ENABLE ROW LEVEL SECURITY;
ALTER TABLE temp_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations on otps" ON otps;
DROP POLICY IF EXISTS "Allow all operations on temp_users" ON temp_users;

-- RLS policies for OTP and temp_users tables (no auth required for these operations)
CREATE POLICY "Allow all operations on otps" ON otps FOR ALL USING (true);
CREATE POLICY "Allow all operations on temp_users" ON temp_users FOR ALL USING (true);

-- Verify tables were created
SELECT 'otps table created successfully' as status WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'otps');
SELECT 'temp_users table created successfully' as status WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'temp_users');

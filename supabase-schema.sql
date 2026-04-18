-- CampusAI Database Schema
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'parent', 'college_admin', 'super_admin')),
    is_verified BOOLEAN DEFAULT false,
    avatar_url TEXT,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Colleges table
CREATE TABLE colleges (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255) NOT NULL,
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    website VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    established_year INTEGER,
    accreditation VARCHAR(255),
    rating DECIMAL(3, 2) DEFAULT 0,
    total_ratings INTEGER DEFAULT 0,
    logo_url TEXT,
    banner_url TEXT,
    gallery TEXT[], -- Array of image URLs
    facilities JSONB DEFAULT '[]',
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    admin_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courses table
CREATE TABLE courses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    stream VARCHAR(100) NOT NULL,
    duration VARCHAR(50),
    fees DECIMAL(10, 2),
    seats_available INTEGER,
    eligibility_criteria TEXT,
    syllabus TEXT,
    placement_stats JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hostels table
CREATE TABLE hostels (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) CHECK (type IN ('boys', 'girls', 'unisex')),
    capacity INTEGER,
    available_seats INTEGER,
    fees_per_month DECIMAL(10, 2),
    facilities JSONB DEFAULT '[]',
    address TEXT,
    contact_person VARCHAR(255),
    contact_phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scholarships table
CREATE TABLE scholarships (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    amount DECIMAL(10, 2),
    percentage DECIMAL(5, 2),
    eligibility_criteria TEXT,
    application_deadline DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Favorites table
CREATE TABLE user_favorites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, college_id)
);

-- Chat Messages table
CREATE TABLE chat_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    response TEXT,
    is_ai_response BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- College Reviews table
CREATE TABLE college_reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan_type VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Activity Log table
CREATE TABLE user_activity_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(100) NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- OTPs table for email verification
CREATE TABLE otps (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    otp VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Temporary Users table for registration process
CREATE TABLE temp_users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    user_data JSONB NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_colleges_location ON colleges(location);
CREATE INDEX idx_colleges_rating ON colleges(rating);
CREATE INDEX idx_courses_college_id ON courses(college_id);
CREATE INDEX idx_courses_stream ON courses(stream);
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX idx_college_reviews_college_id ON college_reviews(college_id);
CREATE INDEX idx_otps_email ON otps(email);
CREATE INDEX idx_otps_expires_at ON otps(expires_at);
CREATE INDEX idx_temp_users_email ON temp_users(email);
CREATE INDEX idx_temp_users_expires_at ON temp_users(expires_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_colleges_updated_at BEFORE UPDATE ON colleges FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hostels_updated_at BEFORE UPDATE ON hostels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_scholarships_updated_at BEFORE UPDATE ON scholarships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_college_reviews_updated_at BEFORE UPDATE ON college_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO users (name, email, password, phone, role, is_verified) VALUES
('John Doe', 'student@demo.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '1234567890', 'student', true),
('Jane Smith', 'parent@demo.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '1234567891', 'parent', true),
('Admin User', 'admin@campusai.com', '$2b$10$J.9fcJJN5C1bd1qPAU9yqOnlML8o6XMjB7TpGaQWTuIwo4MKCHi4G', '1234567892', 'super_admin', true);

-- Insert sample colleges
INSERT INTO colleges (name, description, location, address, latitude, longitude, website, phone, email, established_year, rating, total_ratings, is_verified, is_active) VALUES
('RLS Institute of Technology', 'Premier engineering college in Belagavi offering quality education in various engineering streams.', 'Belagavi, Karnataka', 'NH-4, Belagavi, Karnataka 590018', 15.8497, 74.4977, 'https://rlsit.edu.in', '0831-1234567', 'info@rlsit.edu.in', 2001, 4.5, 150, true, true),
('GSS Institute of Technology', 'Leading technical institute providing excellent education and placement opportunities.', 'Belagavi, Karnataka', 'NH-4, Belagavi, Karnataka 590018', 15.8497, 74.4977, 'https://gssit.edu.in', '0831-1234568', 'info@gssit.edu.in', 2002, 4.3, 120, true, true),
('Jain Institute of Technology', 'Modern engineering college with state-of-the-art facilities and industry connections.', 'Belagavi, Karnataka', 'NH-4, Belagavi, Karnataka 590018', 15.8497, 74.4977, 'https://jainit.edu.in', '0831-1234569', 'info@jainit.edu.in', 2003, 4.4, 100, true, true);

-- Insert sample courses
INSERT INTO courses (college_id, name, stream, duration, fees, seats_available, eligibility_criteria, is_active) VALUES
((SELECT id FROM colleges WHERE name = 'RLS Institute of Technology'), 'Computer Science Engineering', 'Computer Science', '4 years', 85000.00, 60, '10+2 with PCM and 50% marks', true),
((SELECT id FROM colleges WHERE name = 'RLS Institute of Technology'), 'Information Science Engineering', 'Information Science', '4 years', 80000.00, 60, '10+2 with PCM and 50% marks', true),
((SELECT id FROM colleges WHERE name = 'GSS Institute of Technology'), 'Electronics & Communication', 'Electronics', '4 years', 75000.00, 60, '10+2 with PCM and 50% marks', true),
((SELECT id FROM colleges WHERE name = 'Jain Institute of Technology'), 'Mechanical Engineering', 'Mechanical', '4 years', 70000.00, 60, '10+2 with PCM and 50% marks', true);

-- Insert sample hostels
INSERT INTO hostels (college_id, name, type, capacity, available_seats, fees_per_month, facilities, is_active) VALUES
((SELECT id FROM colleges WHERE name = 'RLS Institute of Technology'), 'RLS Boys Hostel', 'boys', 200, 50, 8000.00, '["WiFi", "AC", "Food", "Laundry"]', true),
((SELECT id FROM colleges WHERE name = 'RLS Institute of Technology'), 'RLS Girls Hostel', 'girls', 150, 30, 8500.00, '["WiFi", "AC", "Food", "Laundry", "Security"]', true);

-- Insert sample scholarships
INSERT INTO scholarships (college_id, name, description, amount, percentage, eligibility_criteria, is_active) VALUES
((SELECT id FROM colleges WHERE name = 'RLS Institute of Technology'), 'Merit Scholarship', 'Scholarship for top performers', 50000.00, 25.00, 'First class in 10+2', true),
((SELECT id FROM colleges WHERE name = 'GSS Institute of Technology'), 'Sports Scholarship', 'Scholarship for sports achievers', 30000.00, 15.00, 'State level sports achievement', true);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE hostels ENABLE ROW LEVEL SECURITY;
ALTER TABLE scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE college_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE otps ENABLE ROW LEVEL SECURITY;
ALTER TABLE temp_users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic policies - you can customize these)
CREATE POLICY "Users can view their own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own data" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Anyone can view colleges" ON colleges FOR SELECT USING (true);
CREATE POLICY "College admins can update their own colleges" ON colleges FOR UPDATE USING (auth.uid() = admin_id);
CREATE POLICY "Anyone can view courses" ON courses FOR SELECT USING (true);
CREATE POLICY "Anyone can view hostels" ON hostels FOR SELECT USING (true);
CREATE POLICY "Anyone can view scholarships" ON scholarships FOR SELECT USING (true);
CREATE POLICY "Users can view their own favorites" ON user_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own favorites" ON user_favorites FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own chat messages" ON chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own chat messages" ON chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Anyone can view college reviews" ON college_reviews FOR SELECT USING (true);
CREATE POLICY "Users can insert their own reviews" ON college_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS policies for OTP and temp_users tables (no auth required for these operations)
CREATE POLICY "Allow all operations on otps" ON otps FOR ALL USING (true);
CREATE POLICY "Allow all operations on temp_users" ON temp_users FOR ALL USING (true);

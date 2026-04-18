-- Create college_media table for storing media files
-- Run this in your Supabase SQL Editor

-- Create college_media table
CREATE TABLE college_media (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('image', 'document')),
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_path TEXT NOT NULL,
    url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_college_media_college_id ON college_media(college_id);
CREATE INDEX idx_college_media_type ON college_media(type);
CREATE INDEX idx_college_media_category ON college_media(category);
CREATE INDEX idx_college_media_active ON college_media(is_active);

-- Enable RLS
ALTER TABLE college_media ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for college_media table
-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public read access to active media" ON college_media;
DROP POLICY IF EXISTS "Allow admin operations on media" ON college_media;
DROP POLICY IF EXISTS "Allow college admin to manage their media" ON college_media;

-- Allow public read access to active media items
CREATE POLICY "Allow public read access to active media" ON college_media
FOR SELECT USING (is_active = true);

-- Allow all operations for super_admin role
CREATE POLICY "Allow admin operations on media" ON college_media
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'super_admin'
  )
);

-- Allow college_admin to manage their own college's media
CREATE POLICY "Allow college admin to manage their media" ON college_media
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'college_admin'
    AND users.id = (
      SELECT admin_id FROM colleges 
      WHERE colleges.id = college_media.college_id
    )
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_college_media_updated_at 
BEFORE UPDATE ON college_media 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Create applications table for student course applications
-- Run this in your Supabase SQL Editor

-- Create applications table
CREATE TABLE applications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    application_number VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES users(id),
    review_notes TEXT,
    documents JSONB DEFAULT '[]', -- Array of document URLs
    academic_info JSONB DEFAULT '{}', -- Academic details like marks, percentage
    personal_info JSONB DEFAULT '{}', -- Personal details like address, phone
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_applications_student_id ON applications(student_id);
CREATE INDEX idx_applications_college_id ON applications(college_id);
CREATE INDEX idx_applications_course_id ON applications(course_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_applied_at ON applications(applied_at);

-- Enable RLS
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for applications table
-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public read access to applications" ON applications;
DROP POLICY IF EXISTS "Allow admin operations on applications" ON applications;
DROP POLICY IF EXISTS "Allow students to view their own applications" ON applications;
DROP POLICY IF EXISTS "Allow college admin to manage their college applications" ON applications;

-- Allow students to view their own applications
CREATE POLICY "Allow students to view their own applications" ON applications
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.id = applications.student_id
  )
);

-- Allow college admin to manage applications for their college
CREATE POLICY "Allow college admin to manage their college applications" ON applications
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'college_admin'
    AND users.id = (
      SELECT admin_id FROM colleges 
      WHERE colleges.id = applications.college_id
    )
  )
);

-- Allow all operations for super_admin role
CREATE POLICY "Allow admin operations on applications" ON applications
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'super_admin'
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_applications_updated_at 
BEFORE UPDATE ON applications 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Create function to generate application number
CREATE OR REPLACE FUNCTION generate_application_number()
RETURNS TEXT AS $$
DECLARE
    app_number TEXT;
    year_part TEXT;
    sequence_num INTEGER;
BEGIN
    -- Get current year
    year_part := EXTRACT(YEAR FROM NOW())::TEXT;
    
    -- Get next sequence number for this year
    SELECT COALESCE(MAX(CAST(SUBSTRING(application_number FROM 8) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM applications
    WHERE application_number LIKE 'APP' || year_part || '%';
    
    -- Format: APP2024001, APP2024002, etc.
    app_number := 'APP' || year_part || LPAD(sequence_num::TEXT, 3, '0');
    
    RETURN app_number;
END;
$$ LANGUAGE plpgsql;

-- Insert sample applications for testing
INSERT INTO applications (student_id, college_id, course_id, application_number, status, academic_info, personal_info) VALUES
(
    (SELECT id FROM users WHERE email = 'student@demo.com'),
    (SELECT id FROM colleges WHERE name = 'RLS Institute of Technology'),
    (SELECT id FROM courses WHERE name = 'Computer Science Engineering' AND college_id = (SELECT id FROM colleges WHERE name = 'RLS Institute of Technology')),
    generate_application_number(),
    'pending',
    '{"percentage": 85.5, "board": "Karnataka State Board", "year_of_passing": 2023}',
    '{"address": "123 Main St, Belagavi", "phone": "9876543210", "father_name": "John Doe Sr", "mother_name": "Jane Doe"}'
),
(
    (SELECT id FROM users WHERE email = 'student@demo.com'),
    (SELECT id FROM colleges WHERE name = 'GSS Institute of Technology'),
    (SELECT id FROM courses WHERE name = 'Electronics & Communication' AND college_id = (SELECT id FROM colleges WHERE name = 'GSS Institute of Technology')),
    generate_application_number(),
    'pending',
    '{"percentage": 82.0, "board": "Karnataka State Board", "year_of_passing": 2023}',
    '{"address": "456 Park Ave, Belagavi", "phone": "9876543211", "father_name": "John Doe Sr", "mother_name": "Jane Doe"}'
);

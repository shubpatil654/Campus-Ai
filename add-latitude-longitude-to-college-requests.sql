-- Add latitude and longitude columns to college_requests table
-- This allows college admins to specify precise location coordinates

-- Add latitude column
ALTER TABLE college_requests 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);

-- Add longitude column  
ALTER TABLE college_requests 
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Add comments for documentation
COMMENT ON COLUMN college_requests.latitude IS 'Latitude coordinate for college location (decimal degrees, -90 to 90)';
COMMENT ON COLUMN college_requests.longitude IS 'Longitude coordinate for college location (decimal degrees, -180 to 180)';

-- Add check constraints for valid coordinate ranges
ALTER TABLE college_requests 
ADD CONSTRAINT chk_latitude_range CHECK (latitude IS NULL OR (latitude >= -90 AND latitude <= 90));

ALTER TABLE college_requests 
ADD CONSTRAINT chk_longitude_range CHECK (longitude IS NULL OR (longitude >= -180 AND longitude <= 180));

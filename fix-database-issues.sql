-- Fix database issues for CampusAI
-- Run this in your Supabase SQL Editor

-- 1. Add latitude and longitude columns to college_requests table
ALTER TABLE college_requests 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);

ALTER TABLE college_requests 
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Add comments for documentation
COMMENT ON COLUMN college_requests.latitude IS 'Latitude coordinate for college location (decimal degrees, -90 to 90)';
COMMENT ON COLUMN college_requests.longitude IS 'Longitude coordinate for college location (decimal degrees, -180 to 180)';

-- Add check constraints for valid coordinate ranges (drop first if they exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_latitude_range') THEN
        ALTER TABLE college_requests DROP CONSTRAINT chk_latitude_range;
    END IF;
END $$;

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_longitude_range') THEN
        ALTER TABLE college_requests DROP CONSTRAINT chk_longitude_range;
    END IF;
END $$;

ALTER TABLE college_requests 
ADD CONSTRAINT chk_latitude_range CHECK (latitude IS NULL OR (latitude >= -90 AND latitude <= 90));

ALTER TABLE college_requests 
ADD CONSTRAINT chk_longitude_range CHECK (longitude IS NULL OR (longitude >= -180 AND longitude <= 180));

-- 2. Create subscription plans table for admin management
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    plan_type VARCHAR(50) NOT NULL UNIQUE CHECK (plan_type IN ('trial', 'basic', 'pro')),
    plan_name VARCHAR(100) NOT NULL,
    description TEXT,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    duration_days INTEGER NOT NULL DEFAULT 30,
    features JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default plans
INSERT INTO subscription_plans (plan_type, plan_name, description, amount, duration_days, features) VALUES
('trial', 'Trial Plan', 'Free trial with limited features', 0.00, 7, '["College profile listing", "Basic course management", "Limited media uploads"]'),
('basic', 'Basic Plan', 'Essential features for college listing', 999.00, 30, '["College profile listing", "Course management", "Media gallery", "Basic analytics", "Email support"]'),
('pro', 'Pro Plan', 'Advanced features with priority support', 1999.00, 30, '["All Basic features", "Advanced analytics", "Priority support", "Custom branding", "API access", "Phone support"]')
ON CONFLICT (plan_type) DO NOTHING;

-- 3. Create subscriptions table for college admin payments
CREATE TABLE IF NOT EXISTS college_subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
    admin_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan_type VARCHAR(50) NOT NULL DEFAULT 'basic' CHECK (plan_type IN ('trial', 'basic', 'pro')),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    razorpay_payment_id VARCHAR(255),
    razorpay_order_id VARCHAR(255),
    razorpay_signature VARCHAR(255),
    subscription_start_date TIMESTAMP WITH TIME ZONE,
    subscription_end_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Add subscription status to users table for college admins
ALTER TABLE users ADD COLUMN IF NOT EXISTS has_paid_subscription BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_login BOOLEAN DEFAULT true;

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_college_subscriptions_college_id ON college_subscriptions(college_id);
CREATE INDEX IF NOT EXISTS idx_college_subscriptions_admin_id ON college_subscriptions(admin_id);
CREATE INDEX IF NOT EXISTS idx_college_subscriptions_payment_status ON college_subscriptions(payment_status);
CREATE INDEX IF NOT EXISTS idx_college_subscriptions_is_active ON college_subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_users_has_paid_subscription ON users(has_paid_subscription);
CREATE INDEX IF NOT EXISTS idx_users_first_login ON users(first_login);

-- 6. Create updated_at trigger for college_subscriptions
CREATE OR REPLACE FUNCTION update_subscription_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_college_subscriptions_updated_at ON college_subscriptions;
CREATE TRIGGER update_college_subscriptions_updated_at 
    BEFORE UPDATE ON college_subscriptions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_subscription_updated_at_column();

-- 7. Enable RLS on college_subscriptions table
ALTER TABLE college_subscriptions ENABLE ROW LEVEL SECURITY;

-- 8. Drop existing policies if they exist
DROP POLICY IF EXISTS "College admins can view their own subscriptions" ON college_subscriptions;
DROP POLICY IF EXISTS "College admins can create their own subscriptions" ON college_subscriptions;
DROP POLICY IF EXISTS "College admins can update their own subscriptions" ON college_subscriptions;
DROP POLICY IF EXISTS "Super admins can do everything on subscriptions" ON college_subscriptions;

-- 9. RLS Policies for college_subscriptions
-- College admins can only see their own subscriptions
CREATE POLICY "College admins can view their own subscriptions" ON college_subscriptions
    FOR SELECT USING (
        admin_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'super_admin'
        )
    );

-- College admins can insert their own subscriptions
CREATE POLICY "College admins can create their own subscriptions" ON college_subscriptions
    FOR INSERT WITH CHECK (
        admin_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'super_admin'
        )
    );

-- College admins can update their own subscriptions
CREATE POLICY "College admins can update their own subscriptions" ON college_subscriptions
    FOR UPDATE USING (
        admin_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'super_admin'
        )
    );

-- Super admins can do everything
CREATE POLICY "Super admins can do everything on subscriptions" ON college_subscriptions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'super_admin'
        )
    );

-- 10. Create indexes for subscription_plans
CREATE INDEX IF NOT EXISTS idx_subscription_plans_plan_type ON subscription_plans(plan_type);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_is_active ON subscription_plans(is_active);

-- 11. Create updated_at trigger for subscription_plans
CREATE OR REPLACE FUNCTION update_subscription_plans_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_subscription_plans_updated_at ON subscription_plans;
CREATE TRIGGER update_subscription_plans_updated_at 
    BEFORE UPDATE ON subscription_plans 
    FOR EACH ROW 
    EXECUTE FUNCTION update_subscription_plans_updated_at_column();

-- 12. Enable RLS on subscription_plans
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- 13. RLS Policies for subscription_plans
-- Super admins can manage subscription plans
CREATE POLICY "Super admins can manage subscription plans" ON subscription_plans
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'super_admin'
        )
    );

-- Allow public read access to active plans
CREATE POLICY "Public can view active subscription plans" ON subscription_plans
    FOR SELECT USING (is_active = true);

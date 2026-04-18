-- Create subscription plans table for admin management
-- Run this in your Supabase SQL Editor

-- Subscription plans configuration table
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    plan_type VARCHAR(50) NOT NULL UNIQUE CHECK (plan_type IN ('basic', 'premium', 'enterprise')),
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
('basic', 'Basic Plan', 'Essential features for college listing', 999.00, 30, '["College profile listing", "Course management", "Media gallery", "Basic analytics"]'),
('premium', 'Premium Plan', 'Advanced features with priority support', 1999.00, 30, '["All Basic features", "Advanced analytics", "Priority support", "Custom branding", "API access"]'),
('enterprise', 'Enterprise Plan', 'Full-featured solution for large institutions', 4999.00, 30, '["All Premium features", "White-label solution", "Dedicated support", "Custom integrations", "Advanced reporting"]')
ON CONFLICT (plan_type) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subscription_plans_plan_type ON subscription_plans(plan_type);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_is_active ON subscription_plans(is_active);

-- Create updated_at trigger
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

-- Enable RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_plans
-- Super admins can do everything
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

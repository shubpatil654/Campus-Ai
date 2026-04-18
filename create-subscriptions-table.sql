-- Create subscriptions table for college admin payments
-- Run this in your Supabase SQL Editor

-- College subscriptions table
CREATE TABLE college_subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
    admin_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan_type VARCHAR(50) NOT NULL DEFAULT 'basic' CHECK (plan_type IN ('basic', 'premium', 'enterprise')),
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

-- Add subscription status to users table for college admins
ALTER TABLE users ADD COLUMN IF NOT EXISTS has_paid_subscription BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_login BOOLEAN DEFAULT true;

-- Create indexes for better performance
CREATE INDEX idx_college_subscriptions_college_id ON college_subscriptions(college_id);
CREATE INDEX idx_college_subscriptions_admin_id ON college_subscriptions(admin_id);
CREATE INDEX idx_college_subscriptions_payment_status ON college_subscriptions(payment_status);
CREATE INDEX idx_college_subscriptions_is_active ON college_subscriptions(is_active);
CREATE INDEX idx_users_has_paid_subscription ON users(has_paid_subscription);
CREATE INDEX idx_users_first_login ON users(first_login);

-- Create updated_at trigger for college_subscriptions
CREATE OR REPLACE FUNCTION update_subscription_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_college_subscriptions_updated_at 
    BEFORE UPDATE ON college_subscriptions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_subscription_updated_at_column();

-- Enable RLS on college_subscriptions table
ALTER TABLE college_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for college_subscriptions
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

-- Update plan types to new structure: trial, basic, pro
-- Run this in your Supabase SQL Editor

-- First, drop the existing check constraint
ALTER TABLE subscription_plans DROP CONSTRAINT IF EXISTS subscription_plans_plan_type_check;

-- Add new check constraint with updated plan types
ALTER TABLE subscription_plans ADD CONSTRAINT subscription_plans_plan_type_check 
CHECK (plan_type IN ('trial', 'basic', 'pro'));

-- Update existing plans to new structure
UPDATE subscription_plans SET 
  plan_type = 'trial',
  plan_name = 'Trial Plan',
  description = 'Free trial with limited features',
  amount = 0.00,
  duration_days = 7,
  features = '["College profile listing", "Basic course management", "Limited media uploads"]'
WHERE plan_type = 'basic' AND amount = 0;

UPDATE subscription_plans SET 
  plan_type = 'basic',
  plan_name = 'Basic Plan',
  description = 'Essential features for college listing',
  amount = 999.00,
  duration_days = 30,
  features = '["College profile listing", "Course management", "Media gallery", "Basic analytics", "Email support"]'
WHERE plan_type = 'basic' AND amount > 0;

UPDATE subscription_plans SET 
  plan_type = 'pro',
  plan_name = 'Pro Plan',
  description = 'Advanced features with priority support',
  amount = 1999.00,
  duration_days = 30,
  features = '["All Basic features", "Advanced analytics", "Priority support", "Custom branding", "API access", "Phone support"]'
WHERE plan_type IN ('premium', 'enterprise');

-- Insert new plans if they don't exist
INSERT INTO subscription_plans (plan_type, plan_name, description, amount, duration_days, features) VALUES
('trial', 'Trial Plan', 'Free trial with limited features', 0.00, 7, '["College profile listing", "Basic course management", "Limited media uploads"]'),
('basic', 'Basic Plan', 'Essential features for college listing', 999.00, 30, '["College profile listing", "Course management", "Media gallery", "Basic analytics", "Email support"]'),
('pro', 'Pro Plan', 'Advanced features with priority support', 1999.00, 30, '["All Basic features", "Advanced analytics", "Priority support", "Custom branding", "API access", "Phone support"]')
ON CONFLICT (plan_type) DO NOTHING;

-- Update college_subscriptions table constraint
ALTER TABLE college_subscriptions DROP CONSTRAINT IF EXISTS college_subscriptions_plan_type_check;
ALTER TABLE college_subscriptions ADD CONSTRAINT college_subscriptions_plan_type_check 
CHECK (plan_type IN ('trial', 'basic', 'pro'));

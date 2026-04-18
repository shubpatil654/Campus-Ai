const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { supabase } = require('../config/database');

// Create a Supabase client with service role key for admin operations
const { createClient } = require('@supabase/supabase-js');
const adminSupabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// @desc    Get all subscriptions with college and admin details
// @route   GET /api/admin/subscriptions
// @access  Private/Super Admin
router.get('/subscriptions', protect, authorize('super_admin'), async (req, res) => {
  try {
    const { data: subscriptions, error } = await adminSupabase
      .from('college_subscriptions')
      .select(`
        *,
        colleges:college_id (
          id,
          name,
          location,
          email
        ),
        users:admin_id (
          id,
          name,
          email,
          phone
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: subscriptions || []
    });

  } catch (error) {
    console.error('Admin subscriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscriptions'
    });
  }
});

// @desc    Get subscription statistics
// @route   GET /api/admin/subscriptions/stats
// @access  Private/Super Admin
router.get('/subscriptions/stats', protect, authorize('super_admin'), async (req, res) => {
  try {
    // Get total subscriptions
    const { count: totalSubscriptions, error: totalError } = await adminSupabase
      .from('college_subscriptions')
      .select('*', { count: 'exact', head: true });

    if (totalError) throw totalError;

    // Get active subscriptions
    const { count: activeSubscriptions, error: activeError } = await adminSupabase
      .from('college_subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    if (activeError) throw activeError;

    // Get expired subscriptions
    const { count: expiredSubscriptions, error: expiredError } = await adminSupabase
      .from('college_subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', false)
      .lt('subscription_end_date', new Date().toISOString());

    if (expiredError) throw expiredError;

    // Get total revenue
    const { data: revenueData, error: revenueError } = await adminSupabase
      .from('college_subscriptions')
      .select('amount')
      .eq('payment_status', 'completed');

    if (revenueError) throw revenueError;

    const totalRevenue = revenueData?.reduce((sum, sub) => sum + parseFloat(sub.amount || 0), 0) || 0;

    // Get monthly revenue (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: monthlyRevenueData, error: monthlyError } = await adminSupabase
      .from('college_subscriptions')
      .select('amount')
      .eq('payment_status', 'completed')
      .gte('created_at', thirtyDaysAgo.toISOString());

    if (monthlyError) throw monthlyError;

    const monthlyRevenue = monthlyRevenueData?.reduce((sum, sub) => sum + parseFloat(sub.amount || 0), 0) || 0;

    // Get plan distribution
    const { data: planData, error: planError } = await adminSupabase
      .from('college_subscriptions')
      .select('plan_type')
      .eq('payment_status', 'completed');

    if (planError) throw planError;

    const planDistribution = planData?.reduce((acc, sub) => {
      acc[sub.plan_type] = (acc[sub.plan_type] || 0) + 1;
      return acc;
    }, {}) || {};

    res.json({
      success: true,
      data: {
        totalSubscriptions: totalSubscriptions || 0,
        activeSubscriptions: activeSubscriptions || 0,
        expiredSubscriptions: expiredSubscriptions || 0,
        totalRevenue,
        monthlyRevenue,
        planDistribution
      }
    });

  } catch (error) {
    console.error('Admin subscription stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription statistics'
    });
  }
});

// @desc    Create new subscription plan
// @route   POST /api/admin/subscriptions/plans
// @access  Private/Super Admin
router.post('/subscriptions/plans', protect, authorize('super_admin'), async (req, res) => {
  try {
    const { planType, planName, description, amount, currency, duration, features, isActive } = req.body;

    // Validate input
    if (!planType || !amount || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Plan type, amount, and duration are required'
      });
    }

    // Check if plan type already exists
    const { data: existingPlan, error: checkError } = await adminSupabase
      .from('subscription_plans')
      .select('*')
      .eq('plan_type', planType)
      .single();

    if (existingPlan) {
      return res.status(400).json({
        success: false,
        message: 'Plan type already exists'
      });
    }

    // Create new plan
    const planData = {
      plan_type: planType,
      plan_name: planName || planType.charAt(0).toUpperCase() + planType.slice(1) + ' Plan',
      description: description || '',
      amount: parseFloat(amount),
      currency: currency || 'INR',
      duration_days: parseInt(duration),
      features: features || [],
      is_active: isActive !== undefined ? isActive : true
    };

    const { data: newPlan, error } = await adminSupabase
      .from('subscription_plans')
      .insert(planData)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: 'Plan created successfully',
      data: newPlan
    });

  } catch (error) {
    console.error('Create subscription plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create subscription plan'
    });
  }
});

// @desc    Update subscription plan details
// @route   PUT /api/admin/subscriptions/plans
// @access  Private/Super Admin
router.put('/subscriptions/plans', protect, authorize('super_admin'), async (req, res) => {
  try {
    const { planType, planName, description, amount, currency, duration, features, isActive } = req.body;

    // Validate input
    if (!planType || !amount || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Plan type, amount, and duration are required'
      });
    }

    // Update or create plan configuration
    const planData = {
      plan_type: planType,
      plan_name: planName || planType.charAt(0).toUpperCase() + planType.slice(1) + ' Plan',
      description: description || '',
      amount: parseFloat(amount),
      currency: currency || 'INR',
      duration_days: parseInt(duration),
      features: features || [],
      is_active: isActive !== undefined ? isActive : true,
      updated_at: new Date().toISOString()
    };

    // For now, we'll store plan configurations in a simple way
    // In a production system, you might want a separate plans table
    const { data: existingPlan, error: checkError } = await adminSupabase
      .from('subscription_plans')
      .select('*')
      .eq('plan_type', planType)
      .single();

    let result;
    if (existingPlan) {
      // Update existing plan
      const { data, error } = await adminSupabase
        .from('subscription_plans')
        .update(planData)
        .eq('plan_type', planType)
        .select()
        .single();

      result = data;
      if (error) throw error;
    } else {
      // Create new plan
      const { data, error } = await adminSupabase
        .from('subscription_plans')
        .insert(planData)
        .select()
        .single();

      result = data;
      if (error) throw error;
    }

    res.json({
      success: true,
      message: 'Plan updated successfully',
      data: result
    });

  } catch (error) {
    console.error('Update subscription plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update subscription plan'
    });
  }
});

// @desc    Get subscription plan configurations
// @route   GET /api/admin/subscriptions/plans
// @access  Private/Super Admin
router.get('/subscriptions/plans', protect, authorize('super_admin'), async (req, res) => {
  try {
    const { data: plans, error } = await adminSupabase
      .from('subscription_plans')
      .select('*')
      .order('amount', { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      data: plans || []
    });

  } catch (error) {
    console.error('Get subscription plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription plans'
    });
  }
});

// @desc    Update individual subscription
// @route   PUT /api/admin/subscriptions/:id
// @access  Private/Super Admin
router.put('/subscriptions/:id', protect, authorize('super_admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      plan_type, 
      amount, 
      payment_status, 
      subscription_start_date, 
      subscription_end_date, 
      is_active 
    } = req.body;

    const updateData = {};
    if (plan_type) updateData.plan_type = plan_type;
    if (amount) updateData.amount = parseFloat(amount);
    if (payment_status) updateData.payment_status = payment_status;
    if (subscription_start_date) updateData.subscription_start_date = subscription_start_date;
    if (subscription_end_date) updateData.subscription_end_date = subscription_end_date;
    if (typeof is_active === 'boolean') updateData.is_active = is_active;

    updateData.updated_at = new Date().toISOString();

    const { data: subscription, error } = await adminSupabase
      .from('college_subscriptions')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        colleges:college_id (
          id,
          name,
          location
        ),
        users:admin_id (
          id,
          name,
          email
        )
      `)
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: 'Subscription updated successfully',
      data: subscription
    });

  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update subscription'
    });
  }
});

// @desc    Delete subscription
// @route   DELETE /api/admin/subscriptions/:id
// @access  Private/Super Admin
router.delete('/subscriptions/:id', protect, authorize('super_admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await adminSupabase
      .from('college_subscriptions')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Subscription deleted successfully'
    });

  } catch (error) {
    console.error('Delete subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete subscription'
    });
  }
});

// @desc    Extend subscription
// @route   POST /api/admin/subscriptions/:id/extend
// @access  Private/Super Admin
router.post('/subscriptions/:id/extend', protect, authorize('super_admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { days } = req.body;

    if (!days || days <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid number of days is required'
      });
    }

    // Get current subscription
    const { data: subscription, error: fetchError } = await adminSupabase
      .from('college_subscriptions')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // Calculate new end date
    const currentEndDate = new Date(subscription.subscription_end_date);
    const newEndDate = new Date(currentEndDate.getTime() + (days * 24 * 60 * 60 * 1000));

    // Update subscription
    const { data: updatedSubscription, error: updateError } = await adminSupabase
      .from('college_subscriptions')
      .update({
        subscription_end_date: newEndDate.toISOString(),
        is_active: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        colleges:college_id (
          id,
          name,
          location
        ),
        users:admin_id (
          id,
          name,
          email
        )
      `)
      .single();

    if (updateError) throw updateError;

    res.json({
      success: true,
      message: `Subscription extended by ${days} days`,
      data: updatedSubscription
    });

  } catch (error) {
    console.error('Extend subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to extend subscription'
    });
  }
});

module.exports = router;

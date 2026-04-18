const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { protect } = require('../middleware/auth');
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

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create Razorpay order for college subscription
// @route   POST /api/payments/create-order
// @access  Private/College Admin
router.post('/create-order', protect, async (req, res) => {
  try {
    const { amount, currency = 'INR' } = req.body;
    const userId = req.user.id;

    // Validate amount
    if (!amount || amount < 100) {
      return res.status(400).json({
        success: false,
        message: 'Minimum amount is ₹100'
      });
    }

    // Check if user is college admin
    if (req.user.role !== 'college_admin') {
      return res.status(403).json({
        success: false,
        message: 'Only college admins can make payments'
      });
    }

    // Check if user already has an active subscription
    const { data: existingSubscription } = await adminSupabase
      .from('college_subscriptions')
      .select('*')
      .eq('admin_id', userId)
      .eq('is_active', true)
      .single();

    if (existingSubscription) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active subscription'
      });
    }

    // Create Razorpay order
    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: currency,
      receipt: `sub_${userId.slice(-8)}_${Date.now().toString().slice(-8)}`, // Shortened receipt ID
      notes: {
        college_admin_id: userId,
        subscription_type: 'basic'
      }
    };

    const order = await razorpay.orders.create(options);

    // Store order details in database using admin client
    const { data: subscription, error } = await adminSupabase
      .from('college_subscriptions')
      .insert({
        admin_id: userId,
        plan_type: 'basic',
        amount: amount,
        currency: currency,
        payment_status: 'pending',
        razorpay_order_id: order.id,
        subscription_start_date: null,
        subscription_end_date: null,
        is_active: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating subscription record:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create subscription record'
      });
    }

    res.json({
      success: true,
      message: 'Order created successfully',
      data: {
        order: order,
        subscription: subscription
      }
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order'
    });
  }
});

// @desc    Verify payment and update subscription
// @route   POST /api/payments/verify-payment
// @access  Private/College Admin
router.post('/verify-payment', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const userId = req.user.id;

    // Check if user is college admin
    if (req.user.role !== 'college_admin') {
      return res.status(403).json({
        success: false,
        message: 'Only college admins can verify payments'
      });
    }

    // Get subscription record
    const { data: subscription, error: subscriptionError } = await adminSupabase
      .from('college_subscriptions')
      .select('*')
      .eq('admin_id', userId)
      .eq('razorpay_order_id', razorpay_order_id)
      .eq('payment_status', 'pending')
      .single();

    if (subscriptionError || !subscription) {
      return res.status(400).json({
        success: false,
        message: 'Subscription record not found'
      });
    }

    // Verify payment signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Calculate subscription dates (30 days from now)
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    // Update subscription record
    const { data: updatedSubscription, error: updateError } = await adminSupabase
      .from('college_subscriptions')
      .update({
        payment_status: 'completed',
        razorpay_payment_id: razorpay_payment_id,
        razorpay_signature: razorpay_signature,
        subscription_start_date: startDate.toISOString(),
        subscription_end_date: endDate.toISOString(),
        is_active: true
      })
      .eq('id', subscription.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating subscription:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Failed to update subscription'
      });
    }

    // Update user's payment status
    const { error: userUpdateError } = await adminSupabase
      .from('users')
      .update({
        has_paid_subscription: true,
        first_login: false
      })
      .eq('id', userId);

    if (userUpdateError) {
      console.error('Error updating user payment status:', userUpdateError);
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        subscription: updatedSubscription
      }
    });

  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment'
    });
  }
});

// @desc    Get subscription status for college admin
// @route   GET /api/payments/subscription-status
// @access  Private/College Admin
router.get('/subscription-status', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if user is college admin
    if (req.user.role !== 'college_admin') {
      return res.status(403).json({
        success: false,
        message: 'Only college admins can view subscription status'
      });
    }

    // Get active subscription
    const { data: subscription, error } = await adminSupabase
      .from('college_subscriptions')
      .select('*')
      .eq('admin_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Error fetching subscription:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch subscription status'
      });
    }

    // Calculate days remaining
    let daysRemaining = 0;
    let isExpired = false;
    
    if (subscription && subscription.subscription_end_date) {
      const endDate = new Date(subscription.subscription_end_date);
      const now = new Date();
      const diffTime = endDate - now;
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      isExpired = daysRemaining <= 0;
    }

    res.json({
      success: true,
      data: {
        hasActiveSubscription: !!subscription && !isExpired,
        subscription: subscription,
        daysRemaining: Math.max(0, daysRemaining),
        isExpired: isExpired
      }
    });

  } catch (error) {
    console.error('Get subscription status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subscription status'
    });
  }
});

// @desc    Get payment history for college admin
// @route   GET /api/payments/payment-history
// @access  Private/College Admin
router.get('/payment-history', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if user is college admin
    if (req.user.role !== 'college_admin') {
      return res.status(403).json({
        success: false,
        message: 'Only college admins can view payment history'
      });
    }

    // Get all subscriptions for this admin
    const { data: subscriptions, error } = await adminSupabase
      .from('college_subscriptions')
      .select('*')
      .eq('admin_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching payment history:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch payment history'
      });
    }

    res.json({
      success: true,
      data: subscriptions || []
    });

  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment history'
    });
  }
});

module.exports = router;
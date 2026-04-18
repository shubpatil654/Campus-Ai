const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');
const { supabase } = require('../config/database');

// @desc    Get users count (excluding admins)
// @route   GET /api/users/count
// @access  Public
router.get('/count', async (req, res) => {
  try {
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .neq('role', 'super_admin')
      .neq('role', 'college_admin');

    if (error) {
      console.error('Supabase count error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to get users count' 
      });
    }

    res.json({ 
      success: true, 
      count: count || 0 
    });
  } catch (error) {
    console.error('Get users count error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Get profile error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch profile'
      });
    }

    res.json({
      success: true,
      profile: profile || {}
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', protect, [
  body('name').optional().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('phone').optional().isMobilePhone('en-IN').withMessage('Please provide a valid phone number'),
  body('expectedMarks').optional().isInt({ min: 0, max: 100 }).withMessage('Expected marks must be between 0 and 100'),
  body('pincode').optional().isLength({ min: 6, max: 6 }).withMessage('Pincode must be 6 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const {
      name, phone, dateOfBirth, gender, address, city, state, pincode,
      currentSchool, boardOfStudy, expectedMarks, subjects, interestedStreams,
      preferredLocation, budgetRange, parentName, parentPhone, parentOccupation,
      goals, hobbies, achievements
    } = req.body;

    // First check if profile exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', req.user.id)
      .single();

    const profileData = {
      user_id: req.user.id,
      date_of_birth: dateOfBirth,
      gender,
      address,
      city,
      state,
      pincode,
      current_school: currentSchool,
      board_of_study: boardOfStudy,
      expected_marks: expectedMarks,
      subjects: subjects || [],
      interested_streams: interestedStreams || [],
      preferred_location: preferredLocation,
      budget_range: budgetRange,
      parent_name: parentName,
      parent_phone: parentPhone,
      parent_occupation: parentOccupation,
      goals,
      hobbies,
      achievements,
      updated_at: new Date().toISOString()
    };

    let result;
    if (existingProfile) {
      // Update existing profile
      result = await supabase
        .from('user_profiles')
        .update(profileData)
        .eq('user_id', req.user.id)
        .select()
        .single();
    } else {
      // Create new profile
      profileData.created_at = new Date().toISOString();
      result = await supabase
        .from('user_profiles')
        .insert([profileData])
        .select()
        .single();
    }

    if (result.error) {
      console.error('Profile update error:', result.error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update profile'
      });
    }

    // Also update basic user info if provided
    if (name || phone) {
      const userUpdateData = {};
      if (name) userUpdateData.name = name;
      if (phone) userUpdateData.phone = phone;

      const { error: userError } = await supabase
        .from('users')
        .update(userUpdateData)
        .eq('id', req.user.id);

      if (userError) {
        console.error('User update error:', userError);
      }
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile: result.data
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;

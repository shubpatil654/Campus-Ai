const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const collegeService = require('../services/collegeService');
const { supabase, supabaseAdmin } = require('../config/database');
const { body, validationResult } = require('express-validator');

// @desc    Get colleges count
// @route   GET /api/colleges/count
// @access  Public
router.get('/count', async (req, res) => {
  try {
    const { count, error } = await supabase
      .from('colleges')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Supabase count error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to get colleges count' 
      });
    }

    res.json({ 
      success: true, 
      count: count || 0 
    });
  } catch (error) {
    console.error('Get colleges count error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// @desc    Get top rated colleges
// @route   GET /api/colleges/top-rated
// @access  Public
router.get('/top-rated', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const colleges = await collegeService.getTopRatedColleges(limit);
    
    res.json({
      success: true,
      data: colleges,
      count: colleges.length
    });
  } catch (error) {
    console.error('Get top rated colleges error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch top rated colleges'
    });
  }
});

// @desc    Get all colleges with optional filtering
// @route   GET /api/colleges
// @access  Public
router.get('/', async (req, res) => {
  try {
    const filters = {
      location: req.query.location,
      stream: req.query.stream,
      minRating: req.query.minRating ? parseFloat(req.query.minRating) : null,
      maxFees: req.query.maxFees ? parseFloat(req.query.maxFees) : null,
      minFees: req.query.minFees ? parseFloat(req.query.minFees) : null,
      collegeType: req.query.collegeType,
      accreditation: req.query.accreditation,
      facilities: req.query.facilities,
      hasHostel: req.query.hasHostel === 'true',
      hasScholarship: req.query.hasScholarship === 'true',
      sortBy: req.query.sortBy || 'rating',
      sortOrder: req.query.sortOrder || 'desc'
    };

    const colleges = await collegeService.getAllColleges(filters);
    
    res.json({
      success: true,
      data: colleges,
      count: colleges.length
    });
  } catch (error) {
    console.error('Get colleges error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch colleges'
    });
  }
});

// @desc    Search colleges
// @route   GET /api/colleges/search/:term
// @access  Public
router.get('/search/:term', async (req, res) => {
  try {
    const colleges = await collegeService.searchColleges(req.params.term);
    
    res.json({
      success: true,
      data: colleges,
      count: colleges.length
    });
  } catch (error) {
    console.error('Search colleges error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to search colleges'
    });
  }
});

// @desc    Get colleges by stream
// @route   GET /api/colleges/stream/:stream
// @access  Public
router.get('/stream/:stream', async (req, res) => {
  try {
    const colleges = await collegeService.getCollegesByStream(req.params.stream);
    
    res.json({
      success: true,
      data: colleges,
      count: colleges.length
    });
  } catch (error) {
    console.error('Get colleges by stream error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch colleges by stream'
    });
  }
});

// @desc    Get college profile for admin
// @route   GET /api/colleges/profile
// @access  Private (College Admin)
router.get('/profile', protect, async (req, res) => {
  try {
    // Check if user is college admin
    if (req.user.role !== 'college_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. College admin privileges required.'
      });
    }

    // Find the college associated with this admin
    console.log('GET profile - Looking for college with admin_id:', req.user.id);
    const { data: college, error: collegeError } = await supabase
      .from('colleges')
      .select(`
        *,
        courses (*),
        hostels (*),
        scholarships (*)
      `)
      .eq('admin_id', req.user.id)
      .eq('is_active', true)
      .single();

    if (collegeError) {
      console.error('College lookup error:', collegeError);
      if (collegeError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'No college found for this admin. Please contact support to associate your account with a college.'
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Error finding college record'
      });
    }

    if (!college) {
      return res.status(404).json({
        success: false,
        message: 'College not found or not associated with this admin'
      });
    }

    res.json({
      success: true,
      data: college
    });
  } catch (error) {
    console.error('Get college profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @desc    Get single college by ID
// @route   GET /api/colleges/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const college = await collegeService.getCollegeById(req.params.id);
    
    res.json({
      success: true,
      data: college
    });
  } catch (error) {
    console.error('Get college error:', error);
    res.status(404).json({
      success: false,
      message: error.message || 'College not found'
    });
  }
});

// @desc    Update college profile
// @route   PUT /api/colleges/profile
// @access  Private (College Admin)
router.put('/profile', protect, [
  body('name').optional().isLength({ min: 2 }).withMessage('College name must be at least 2 characters'),
  body('description').optional().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('location').optional().isLength({ min: 2 }).withMessage('Location must be at least 2 characters'),
  body('address').optional().isLength({ min: 10 }).withMessage('Address must be at least 10 characters'),
  body('latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
  body('longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),
  body('website').optional().isURL().withMessage('Please provide a valid website URL'),
  body('phone').optional().isMobilePhone('en-IN').withMessage('Please provide a valid phone number'),
  body('email').optional().isEmail().withMessage('Please provide a valid email address'),
  body('established_year').optional().isInt({ min: 1800, max: new Date().getFullYear() }).withMessage('Please provide a valid establishment year')
], async (req, res) => {
  try {
    // Check if user is college admin
    if (req.user.role !== 'college_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. College admin privileges required.'
      });
    }

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => error.msg);
      return res.status(400).json({
        success: false,
        message: errorMessages.join(', ')
      });
    }

    const {
      name, description, location, address,
      latitude, longitude, website, phone, email, established_year,
      accreditation, facilities
    } = req.body;

    console.log('=== UPDATE REQUEST DEBUG ===');
    console.log('Admin ID:', req.user.id);
    console.log('Request body:', req.body);
    console.log('Extracted fields:', { name, description, location, address, latitude, longitude, website, phone, email, established_year, accreditation, facilities });
    console.log('===========================');

    // Find the college associated with this admin
    console.log('Looking for college with admin_id:', req.user.id);
    const { data: college, error: collegeError } = await supabaseAdmin
      .from('colleges')
      .select('id')
      .eq('admin_id', req.user.id)
      .eq('is_active', true)
      .single();

    if (collegeError) {
      console.error('College lookup error:', collegeError);
      if (collegeError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'No college found for this admin. Please contact support to associate your account with a college.'
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Error finding college record'
      });
    }

    if (!college) {
      return res.status(404).json({
        success: false,
        message: 'College not found or not associated with this admin'
      });
    }

    console.log('Found college with ID:', college.id);
    console.log('Update data being sent:', req.body);

    // Prepare update data - include all provided fields
    const updateData = {};
    
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (location !== undefined) updateData.location = location;
    if (address !== undefined) updateData.address = address;
    if (latitude !== undefined) updateData.latitude = latitude ? parseFloat(latitude) : null;
    if (longitude !== undefined) updateData.longitude = longitude ? parseFloat(longitude) : null;
    if (website !== undefined) updateData.website = website;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (established_year !== undefined) updateData.established_year = parseInt(established_year);
    if (accreditation !== undefined) updateData.accreditation = accreditation || null;
    if (facilities !== undefined) updateData.facilities = facilities;
    
    updateData.updated_at = new Date().toISOString();

    console.log('Prepared update data:', updateData);
    console.log('Updating college with ID:', college.id);

    // Update the college - use simple update first
    console.log('About to update with data:', updateData);
    console.log('College ID to update:', college.id);
    
    // Use admin client to bypass RLS policies
    const { error: updateError } = await supabaseAdmin
      .from('colleges')
      .update(updateData)
      .eq('id', college.id);

    console.log('Update error:', updateError);

    if (updateError) {
      console.error('College update error:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Failed to update college profile: ' + updateError.message
      });
    }

    // Now fetch the updated data to verify and return
    const { data: updatedCollege, error: fetchError } = await supabaseAdmin
      .from('colleges')
      .select('*')
      .eq('id', college.id)
      .single();

    console.log('Fetch after update result:', { updatedCollege, fetchError });

    if (fetchError) {
      console.error('Error fetching updated college:', fetchError);
      return res.status(500).json({
        success: false,
        message: 'Update successful but failed to fetch updated data: ' + fetchError.message
      });
    }

    if (!updatedCollege) {
      console.error('No college found after update');
      return res.status(404).json({
        success: false,
        message: 'College not found after update'
      });
    }

    console.log('Successfully updated college:', updatedCollege.name);
    res.json({
      success: true,
      message: 'College profile updated successfully',
      data: updatedCollege
    });
  } catch (error) {
    console.error('Update college profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @desc    Add college review
// @route   POST /api/colleges/:id/review
// @access  Private
router.post('/:id/review', protect, async (req, res) => {
  try {
    const { rating, reviewText } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const review = await collegeService.addReview(req.user.id, req.params.id, rating, reviewText);
    
    res.json({
      success: true,
      message: 'Review added successfully',
      data: review
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to add review'
    });
  }
});

// @desc    Get colleges count
// @route   GET /api/colleges/count
// @access  Public
router.get('/count', async (req, res) => {
  try {
    const { count, error } = await supabase
      .from('colleges')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Supabase count error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to get colleges count' 
      });
    }

    res.json({ 
      success: true, 
      count: count || 0 
    });
  } catch (error) {
    console.error('Get colleges count error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// @desc    Submit college registration request
// @route   POST /api/colleges/request
// @access  Public
router.post('/request', [
  body('collegeName').notEmpty().withMessage('College name is required'),
  body('contactPerson').notEmpty().withMessage('Contact person is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').matches(/^[6-9]\d{9}$/).withMessage('Valid 10-digit phone number is required'),
  body('address').notEmpty().withMessage('Address is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('state').notEmpty().withMessage('State is required'),
  body('pincode').matches(/^\d{6}$/).withMessage('Valid 6-digit pincode is required'),
  body('website').optional().isURL().withMessage('Valid website URL is required'),
  body('establishedYear').optional().isInt({ min: 1800, max: new Date().getFullYear() }).withMessage('Valid establishment year is required'),
  body('totalStudents').optional().isInt({ min: 0 }).withMessage('Total students must be a positive number'),
  body('facultyCount').optional().isInt({ min: 0 }).withMessage('Faculty count must be a positive number')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      collegeName,
      contactPerson,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      latitude,
      longitude,
      website,
      establishedYear,
      collegeType,
      courses,
      facilities,
      description,
      accreditation,
      totalStudents,
      facultyCount
    } = req.body;

    // Check if college with same email already exists in requests
    const { data: existingRequest, error: checkError } = await supabase
      .from('college_requests')
      .select('id')
      .eq('email', email)
      .eq('status', 'pending')
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking existing request:', checkError);
      return res.status(500).json({
        success: false,
        message: 'Failed to check existing requests'
      });
    }

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'A request with this email is already pending review'
      });
    }

    // Insert the college request
    const { data: newRequest, error: insertError } = await supabase
      .from('college_requests')
      .insert({
        college_name: collegeName,
        contact_person: contactPerson,
        email,
        phone,
        address,
        city,
        state,
        pincode,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        website: website || null,
        established_year: establishedYear ? parseInt(establishedYear) : null,
        college_type: collegeType || null,
        courses: courses || null,
        facilities: facilities || null,
        description: description || null,
        accreditation: accreditation || null,
        total_students: totalStudents ? parseInt(totalStudents) : null,
        faculty_count: facultyCount ? parseInt(facultyCount) : null,
        status: 'pending'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting college request:', insertError);
      return res.status(500).json({
        success: false,
        message: 'Failed to submit college request'
      });
    }

    res.status(201).json({
      success: true,
      message: 'College request submitted successfully',
      requestId: newRequest.id
    });

  } catch (error) {
    console.error('Submit college request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @desc    Get all college requests (Admin only)
// @route   GET /api/colleges/requests
// @access  Private (Admin)
router.get('/requests', protect, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { data: requests, error } = await supabase
      .from('college_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching college requests:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch college requests'
      });
    }

    res.json({
      success: true,
      requests
    });

  } catch (error) {
    console.error('Get college requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @desc    Update college request status (Admin only)
// @route   PUT /api/colleges/requests/:id
// @access  Private (Admin)
router.put('/requests/:id', protect, [
  body('status').isIn(['pending', 'approved', 'rejected', 'under_review']).withMessage('Invalid status'),
  body('adminNotes').optional().isString()
], async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { status, adminNotes } = req.body;
    const requestId = req.params.id;

    const { data: updatedRequest, error } = await supabase
      .from('college_requests')
      .update({
        status,
        admin_notes: adminNotes || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) {
      console.error('Error updating college request:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update college request'
      });
    }

    if (!updatedRequest) {
      return res.status(404).json({
        success: false,
        message: 'College request not found'
      });
    }

    res.json({
      success: true,
      message: 'College request updated successfully',
      request: updatedRequest
    });

  } catch (error) {
    console.error('Update college request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @desc    Get top rated colleges
// @route   GET /api/colleges/top-rated
// @access  Public
router.get('/top-rated', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    const { data: colleges, error } = await supabase
      .from('colleges')
      .select('id, name, location, rating, total_ratings, logo_url')
      .eq('is_active', true)
      .eq('is_verified', true)
      .order('rating', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Top rated colleges error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch top rated colleges'
      });
    }

    const formattedColleges = colleges?.map(college => ({
      id: college.id,
      name: college.name,
      location: college.location,
      rating: college.rating || 0,
      totalRatings: college.total_ratings || 0,
      logoUrl: college.logo_url
    })) || [];

    res.json({
      success: true,
      data: formattedColleges
    });

  } catch (error) {
    console.error('Top rated colleges error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top rated colleges'
    });
  }
});

module.exports = router;

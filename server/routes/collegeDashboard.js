const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { supabase } = require('../config/database');

// @desc    Get college dashboard statistics
// @route   GET /api/college/dashboard/stats
// @access  Private (College Admin only)
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get college information for the logged-in admin
    const { data: college, error: collegeError } = await supabase
      .from('colleges')
      .select('id, name, totalStudents, facultyCount')
      .eq('admin_id', userId)
      .single();

    if (collegeError || !college) {
      return res.status(404).json({
        success: false,
        message: 'College not found for this admin'
      });
    }

    const collegeId = college.id;

    // Get total courses count
    const { count: totalCourses, error: coursesError } = await supabase
      .from('courses')
      .select('*', { count: 'exact', head: true })
      .eq('college_id', collegeId)
      .eq('is_active', true);

    if (coursesError) {
      console.error('Error fetching courses count:', coursesError);
    }

    // Get total applications count (using college_reviews as proxy for applications)
    const { count: totalApplications, error: applicationsError } = await supabase
      .from('college_reviews')
      .select('*', { count: 'exact', head: true })
      .eq('college_id', collegeId);

    if (applicationsError) {
      console.error('Error fetching applications count:', applicationsError);
    }


    const stats = {
      totalCourses: totalCourses || 0,
      totalApplications: totalApplications || 0
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get college dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
});

// @desc    Get college information for dashboard
// @route   GET /api/college/dashboard/info
// @access  Private (College Admin only)
router.get('/info', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get college information for the logged-in admin
    const { data: college, error: collegeError } = await supabase
      .from('colleges')
      .select(`
        id, 
        name, 
        description, 
        location, 
        address, 
        city, 
        state, 
        pincode,
        website, 
        phone, 
        email, 
        established_year, 
        collegeType,
        accreditation,
        rating, 
        total_ratings, 
        logo_url, 
        banner_url,
        is_active,
        created_at
      `)
      .eq('admin_id', userId)
      .single();

    if (collegeError || !college) {
      return res.status(404).json({
        success: false,
        message: 'College not found for this admin'
      });
    }

    res.json({
      success: true,
      data: college
    });

  } catch (error) {
    console.error('Get college dashboard info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch college information'
    });
  }
});

// @desc    Get recent applications/reviews for college
// @route   GET /api/college/dashboard/recent-applications
// @access  Private (College Admin only)
router.get('/recent-applications', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = req.query.limit ? parseInt(req.query.limit) : 5;
    
    // Get college information for the logged-in admin
    const { data: college, error: collegeError } = await supabase
      .from('colleges')
      .select('id')
      .eq('admin_id', userId)
      .single();

    if (collegeError || !college) {
      return res.status(404).json({
        success: false,
        message: 'College not found for this admin'
      });
    }

    const collegeId = college.id;

    // Get recent reviews (using as proxy for applications)
    const { data: recentReviews, error: reviewsError } = await supabase
      .from('college_reviews')
      .select(`
        id,
        rating,
        review_text,
        created_at,
        users!inner(name, email)
      `)
      .eq('college_id', collegeId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (reviewsError) {
      console.error('Error fetching recent reviews:', reviewsError);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch recent applications'
      });
    }

    // Transform the data to match the expected format
    const applications = recentReviews.map(review => ({
      id: review.id,
      studentName: review.users.name,
      studentEmail: review.users.email,
      course: 'General Review', // Since we don't have course-specific applications yet
      rating: review.rating,
      review: review.review_text,
      appliedAt: review.created_at
    }));

    res.json({
      success: true,
      data: applications
    });

  } catch (error) {
    console.error('Get recent applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent applications'
    });
  }
});

module.exports = router;

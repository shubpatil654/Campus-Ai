const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { supabase } = require('../config/database');
const { createClient } = require('@supabase/supabase-js');

// Create admin client with service role key to bypass RLS
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

// @desc    Get all applications for a college
// @route   GET /api/applications
// @access  Private (College Admin only)
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    
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

    // Get all applications for this college with related data
    const { data: applications, error: applicationsError } = await supabase
      .from('applications')
      .select(`
        *,
        student:users!applications_student_id_fkey (
          id,
          name,
          email,
          phone,
          avatar_url
        ),
        course:courses!applications_course_id_fkey (
          id,
          name,
          stream,
          duration,
          fees
        ),
        reviewer:users!applications_reviewed_by_fkey (
          id,
          name
        )
      `)
      .eq('college_id', collegeId)
      .order('applied_at', { ascending: false });

    if (applicationsError) {
      console.error('Error fetching applications:', applicationsError);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch applications'
      });
    }

    res.json({
      success: true,
      data: applications || []
    });

  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications'
    });
  }
});

// @desc    Update application status (accept/reject)
// @route   PUT /api/applications/:id/status
// @access  Private (College Admin only)
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, review_notes } = req.body;
    const userId = req.user.id;

    // Validate status
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "accepted" or "rejected"'
      });
    }

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

    // Check if application exists and belongs to this college
    const { data: existingApplication, error: applicationError } = await supabase
      .from('applications')
      .select('id, status')
      .eq('id', id)
      .eq('college_id', collegeId)
      .single();

    if (applicationError || !existingApplication) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if application is already processed
    if (existingApplication.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Application has already been processed'
      });
    }

    // Update the application status using admin client to bypass RLS
    const { data: updatedApplication, error: updateError } = await adminSupabase
      .from('applications')
      .update({
        status: status,
        review_notes: review_notes || '',
        reviewed_at: new Date().toISOString(),
        reviewed_by: userId,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        student:users!applications_student_id_fkey (
          id,
          name,
          email,
          phone
        ),
        course:courses!applications_course_id_fkey (
          id,
          name,
          stream
        )
      `)
      .single();

    if (updateError) {
      console.error('Error updating application status:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Failed to update application status'
      });
    }

    res.json({
      success: true,
      message: `Application ${status} successfully`,
      data: updatedApplication
    });

  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application status'
    });
  }
});

// @desc    Get application statistics
// @route   GET /api/applications/stats
// @access  Private (College Admin only)
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    
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

    // Get application statistics
    const { data: stats, error: statsError } = await supabase
      .from('applications')
      .select('status')
      .eq('college_id', collegeId);

    if (statsError) {
      console.error('Error fetching application stats:', statsError);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch application statistics'
      });
    }

    // Calculate statistics
    const totalApplications = stats.length;
    const pendingApplications = stats.filter(app => app.status === 'pending').length;
    const acceptedApplications = stats.filter(app => app.status === 'accepted').length;
    const rejectedApplications = stats.filter(app => app.status === 'rejected').length;

    res.json({
      success: true,
      data: {
        total: totalApplications,
        pending: pendingApplications,
        accepted: acceptedApplications,
        rejected: rejectedApplications
      }
    });

  } catch (error) {
    console.error('Get application stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application statistics'
    });
  }
});

// @desc    Get single application details
// @route   GET /api/applications/:id
// @access  Private (College Admin only)
router.get('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
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

    // Get application details with related data
    const { data: application, error: applicationError } = await supabase
      .from('applications')
      .select(`
        *,
        student:users!applications_student_id_fkey (
          id,
          name,
          email,
          phone,
          avatar_url,
          created_at
        ),
        course:courses!applications_course_id_fkey (
          id,
          name,
          stream,
          duration,
          fees,
          eligibility_criteria
        ),
        reviewer:users!applications_reviewed_by_fkey (
          id,
          name
        )
      `)
      .eq('id', id)
      .eq('college_id', collegeId)
      .single();

    if (applicationError || !application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.json({
      success: true,
      data: application
    });

  } catch (error) {
    console.error('Get application details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application details'
    });
  }
});

module.exports = router;

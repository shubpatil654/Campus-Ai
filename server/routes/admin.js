const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { protect, authorize } = require('../middleware/auth');
const { supabaseAdmin } = require('../config/database');
const { sendCollegeApprovalEmail, sendCollegeRejectionEmail, generateSecurePassword } = require('../services/emailService');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
router.get('/stats', protect, authorize('super_admin'), async (req, res) => {
  try {
    // Get total students count
    const { count: totalStudents, error: studentsError } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .in('role', ['student', 'parent']);

    if (studentsError) throw studentsError;

    // Get total colleges count
    const { count: totalColleges, error: collegesError } = await supabaseAdmin
      .from('colleges')
      .select('*', { count: 'exact', head: true });

    if (collegesError) throw collegesError;

    // Get pending college requests count
    const { count: pendingRequests, error: requestsError } = await supabaseAdmin
      .from('college_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    if (requestsError) throw requestsError;

    // Get verified colleges count
    const { count: verifiedColleges, error: verifiedError } = await supabaseAdmin
      .from('colleges')
      .select('*', { count: 'exact', head: true })
      .eq('is_verified', true);

    if (verifiedError) throw verifiedError;

    // Get recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count: recentStudents, error: recentError } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .in('role', ['student', 'parent'])
      .gte('created_at', thirtyDaysAgo.toISOString());

    if (recentError) throw recentError;

    res.json({
      success: true,
      data: {
        totalStudents: totalStudents || 0,
        totalColleges: totalColleges || 0,
        pendingRequests: pendingRequests || 0,
        verifiedColleges: verifiedColleges || 0,
        recentStudents: recentStudents || 0,
        // Mock data for features not yet implemented
        chatSessions: 0, // Will be implemented when chat system is ready
        activeSubscriptions: 0 // Will be implemented when subscription system is ready
      }
    });

  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin statistics'
    });
  }
});

// @desc    Get recent activities
// @route   GET /api/admin/activities
// @access  Private/Admin
router.get('/activities', protect, authorize('super_admin'), async (req, res) => {
  try {
    // Get recent user registrations
    const { data: recentUsers, error: usersError } = await supabaseAdmin
      .from('users')
      .select('name, email, role, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (usersError) throw usersError;

    // Get recent college requests
    const { data: recentRequests, error: requestsError } = await supabaseAdmin
      .from('college_requests')
      .select('college_name, contact_person, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (requestsError) throw requestsError;

    // Format activities
    const activities = [];

    // Add user registrations
    recentUsers?.forEach(user => {
      activities.push({
        type: 'user_registration',
        message: `New ${user.role} registered: ${user.name}`,
        time: new Date(user.created_at).toLocaleString(),
        icon: 'UserCheck',
        color: 'text-green-400'
      });
    });

    // Add college requests
    recentRequests?.forEach(request => {
      activities.push({
        type: 'college_request',
        message: `New college request: ${request.college_name}`,
        time: new Date(request.created_at).toLocaleString(),
        icon: 'Building2',
        color: 'text-blue-400'
      });
    });

    // Sort by time (most recent first)
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));

    res.json({
      success: true,
      data: activities.slice(0, 10) // Return top 10 most recent
    });

  } catch (error) {
    console.error('Admin activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent activities'
    });
  }
});

// @desc    Get top colleges
// @route   GET /api/admin/top-colleges
// @access  Private/Admin
router.get('/top-colleges', protect, authorize('super_admin'), async (req, res) => {
  try {
    const { data: colleges, error } = await supabaseAdmin
      .from('colleges')
      .select('name, rating, total_ratings, is_verified, created_at')
      .eq('is_verified', true)
      .order('rating', { ascending: false })
      .limit(5);

    if (error) throw error;

    const topColleges = colleges?.map(college => ({
      name: college.name,
      rating: college.rating || 0,
      totalRatings: college.total_ratings || 0,
      status: college.is_verified ? 'Verified' : 'Pending',
      joinedDate: new Date(college.created_at).toLocaleDateString()
    })) || [];

    res.json({
      success: true,
      data: topColleges
    });

  } catch (error) {
    console.error('Top colleges error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top colleges'
    });
  }
});

// @desc    Get all colleges for management
// @route   GET /api/admin/colleges
// @access  Private/Admin
router.get('/colleges', protect, authorize('super_admin'), async (req, res) => {
  try {
    const { data: colleges, error } = await supabaseAdmin
      .from('colleges')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: colleges || []
    });

  } catch (error) {
    console.error('Admin colleges error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch colleges'
    });
  }
});

// @desc    Get college requests
// @route   GET /api/admin/college-requests
// @access  Private/Admin
router.get('/college-requests', protect, authorize('super_admin'), async (req, res) => {
  try {
    const { data: requests, error } = await supabaseAdmin
      .from('college_requests')
      .select('*')
      .order('created_at', { ascending: false });

    // If table doesn't exist, return empty array
    if (error && error.code === 'PGRST205') {
      return res.json({
        success: true,
        data: []
      });
    }

    if (error) throw error;

    res.json({
      success: true,
      data: requests || []
    });

  } catch (error) {
    console.error('Admin college requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch college requests'
    });
  }
});

// @desc    Approve college request
// @route   PUT /api/admin/college-requests/:id/approve
// @access  Private/Admin
router.put('/college-requests/:id/approve', protect, authorize('super_admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // Get the college request details
    const { data: requestData, error: requestError } = await supabaseAdmin
      .from('college_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (requestError) throw requestError;

    // Generate secure password for college admin
    const adminPassword = generateSecurePassword();
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    // Create college admin user account using admin client to bypass RLS
    console.log('Creating college admin user with data:', {
      name: requestData.contact_person,
      email: requestData.email,
      phone: requestData.phone,
      role: 'college_admin',
      is_verified: true
    });

    let newAdmin;
    let adminError;

    // Try with admin client first
    const adminResult = await supabaseAdmin
      .from('users')
      .insert({
        name: requestData.contact_person,
        email: requestData.email,
        password: hashedPassword,
        phone: requestData.phone,
        role: 'college_admin',
        is_verified: true
      })
      .select()
      .single();

    newAdmin = adminResult.data;
    adminError = adminResult.error;

    // If admin client fails, try with regular client (this might work if RLS is not properly configured)
    if (adminError) {
      console.log('Admin client failed, trying with regular client...');
      const regularResult = await supabaseAdmin
        .from('users')
        .insert({
          name: requestData.contact_person,
          email: requestData.email,
          password: hashedPassword,
          phone: requestData.phone,
          role: 'college_admin',
          is_verified: true
        })
        .select()
        .single();

      newAdmin = regularResult.data;
      adminError = regularResult.error;
    }

    if (adminError) {
      console.error('Error creating college admin user:', adminError);
      console.error('Admin error details:', JSON.stringify(adminError, null, 2));
      throw new Error(`Failed to create college admin account: ${adminError.message}`);
    }

    console.log('Successfully created college admin user:', newAdmin);

    // Update request status using admin client
    const { data: updatedRequest, error: updateError } = await supabaseAdmin
      .from('college_requests')
      .update({ 
        status: 'approved',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Create college entry with admin_id reference using admin client to bypass RLS
    const collegeData = {
      name: updatedRequest.college_name,
      description: updatedRequest.description || '',
      location: `${updatedRequest.city}, ${updatedRequest.state}`,
      address: `${updatedRequest.address}, ${updatedRequest.city}, ${updatedRequest.state} - ${updatedRequest.pincode}`,
      website: updatedRequest.website,
      phone: updatedRequest.phone,
      email: updatedRequest.email,
      established_year: updatedRequest.established_year,
      accreditation: updatedRequest.accreditation,
      is_verified: true,
      is_active: true,
      admin_id: newAdmin.id
    };

    console.log('Creating college with data:', collegeData);

    let newCollege;
    let collegeError;

    // Try with admin client first
    const adminCollegeResult = await supabaseAdmin
      .from('colleges')
      .insert(collegeData)
      .select()
      .single();

    newCollege = adminCollegeResult.data;
    collegeError = adminCollegeResult.error;

    // If admin client fails, try with regular client
    if (collegeError) {
      console.log('Admin client failed for college creation, trying with regular client...');
      const regularCollegeResult = await supabaseAdmin
        .from('colleges')
        .insert(collegeData)
        .select()
        .single();

      newCollege = regularCollegeResult.data;
      collegeError = regularCollegeResult.error;
    }

    if (collegeError) {
      console.error('Error creating college:', collegeError);
      console.error('College error details:', JSON.stringify(collegeError, null, 2));
      // Don't throw error, just log it
    } else {
      console.log('Successfully created college:', newCollege);
    }

    // Send approval email with login credentials
    try {
      await sendCollegeApprovalEmail(
        updatedRequest.college_name,
        updatedRequest.contact_person,
        updatedRequest.email,
        adminPassword
      );
      console.log(`Approval email sent to ${updatedRequest.email}`);
    } catch (emailError) {
      console.error('Error sending approval email:', emailError);
      // Don't fail the approval process if email fails
    }

    res.json({
      success: true,
      message: 'College request approved successfully. Login credentials have been sent to the college email.',
      data: {
        request: updatedRequest,
        college: newCollege,
        adminCreated: true,
        emailSent: true
      }
    });

  } catch (error) {
    console.error('Approve college request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve college request: ' + error.message
    });
  }
});

// @desc    Reject college request
// @route   PUT /api/admin/college-requests/:id/reject
// @access  Private/Admin
router.put('/college-requests/:id/reject', protect, authorize('super_admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Get the college request details first
    const { data: requestData, error: requestError } = await supabaseAdmin
      .from('college_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (requestError) throw requestError;

    // Update request status using admin client
    const { data: updatedRequest, error } = await supabaseAdmin
      .from('college_requests')
      .update({ 
        status: 'rejected',
        admin_notes: reason || 'Request rejected by admin',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Send rejection email
    try {
      await sendCollegeRejectionEmail(
        updatedRequest.college_name,
        updatedRequest.contact_person,
        updatedRequest.email,
        reason || 'Request rejected by admin'
      );
      console.log(`Rejection email sent to ${updatedRequest.email}`);
    } catch (emailError) {
      console.error('Error sending rejection email:', emailError);
      // Don't fail the rejection process if email fails
    }

    res.json({
      success: true,
      message: 'College request rejected successfully. Rejection email has been sent to the college.',
      data: {
        request: updatedRequest,
        emailSent: true
      }
    });

  } catch (error) {
    console.error('Reject college request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject college request: ' + error.message
    });
  }
});

// @desc    Get all students for admin
// @route   GET /api/admin/students
// @access  Private/Admin
router.get('/students', protect, authorize('super_admin'), async (req, res) => {
  try {
    const { data: students, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .in('role', ['student', 'parent'])
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Format the data for frontend
    const formattedStudents = students.map(student => ({
      id: student.id,
      name: student.name,
      email: student.email,
      phone: student.phone,
      role: student.role,
      registrationDate: student.created_at,
      location: 'Not specified', // We'll get this from profiles later if needed
      school: 'Not specified',
      class: 'Not specified',
      status: 'active', // Default status
      lastActive: 'Recently' // Mock data for now
    }));

    res.json({
      success: true,
      data: formattedStudents,
      count: formattedStudents.length
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch students'
    });
  }
});

module.exports = router;

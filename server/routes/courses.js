const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { supabase } = require('../config/database');
const { createClient } = require('@supabase/supabase-js');
const { body, validationResult } = require('express-validator');

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

// @desc    Get all courses for a college
// @route   GET /api/courses
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

    // Get all courses for this college
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('*')
      .eq('college_id', collegeId)
      .order('created_at', { ascending: false });

    if (coursesError) {
      console.error('Error fetching courses:', coursesError);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch courses'
      });
    }

    res.json({
      success: true,
      data: courses || []
    });

  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courses'
    });
  }
});

// @desc    Get a single course
// @route   GET /api/courses/:id
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

    // Get the specific course
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .eq('college_id', collegeId)
      .single();

    if (courseError || !course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      data: course
    });

  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course'
    });
  }
});

// @desc    Add a new course
// @route   POST /api/courses
// @access  Private (College Admin only)
router.post('/', protect, [
  body('name').notEmpty().withMessage('Course name is required'),
  body('stream').notEmpty().withMessage('Stream is required'),
  body('duration').notEmpty().withMessage('Duration is required'),
  body('fees').isFloat({ min: 0 }).withMessage('Fees must be a valid positive number'),
  body('seats_available').isInt({ min: 1 }).withMessage('Seats available must be a positive integer'),
  body('eligibility_criteria').notEmpty().withMessage('Eligibility criteria is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

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

    // Prepare course data
    const courseData = {
      college_id: collegeId,
      name: req.body.name,
      stream: req.body.stream,
      duration: req.body.duration,
      fees: parseInt(req.body.fees),
      seats_available: parseInt(req.body.seats_available),
      eligibility_criteria: req.body.eligibility_criteria,
      syllabus: req.body.syllabus || '',
      placement_stats: req.body.placement_stats || {},
      is_active: true
    };

    // Insert the new course using admin client to bypass RLS
    const { data: newCourse, error: insertError } = await adminSupabase
      .from('courses')
      .insert(courseData)
      .select()
      .single();

    if (insertError) {
      console.error('Error creating course:', insertError);
      return res.status(500).json({
        success: false,
        message: 'Failed to create course'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: newCourse
    });

  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create course'
    });
  }
});

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private (College Admin only)
router.put('/:id', protect, [
  body('name').notEmpty().withMessage('Course name is required'),
  body('stream').notEmpty().withMessage('Stream is required'),
  body('duration').notEmpty().withMessage('Duration is required'),
  body('fees').isFloat({ min: 0 }).withMessage('Fees must be a valid positive number'),
  body('seats_available').isInt({ min: 1 }).withMessage('Seats available must be a positive integer'),
  body('eligibility_criteria').notEmpty().withMessage('Eligibility criteria is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

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

    // Check if course exists and belongs to this college
    const { data: existingCourse, error: courseError } = await supabase
      .from('courses')
      .select('id')
      .eq('id', id)
      .eq('college_id', collegeId)
      .single();

    if (courseError || !existingCourse) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Prepare updated course data
    const updateData = {
      name: req.body.name,
      stream: req.body.stream,
      duration: req.body.duration,
      fees: parseInt(req.body.fees),
      seats_available: parseInt(req.body.seats_available),
      eligibility_criteria: req.body.eligibility_criteria,
      syllabus: req.body.syllabus || '',
      placement_stats: req.body.placement_stats || {},
      updated_at: new Date().toISOString()
    };

    // Update the course using admin client to bypass RLS
    const { data: updatedCourse, error: updateError } = await adminSupabase
      .from('courses')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating course:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Failed to update course'
      });
    }

    res.json({
      success: true,
      message: 'Course updated successfully',
      data: updatedCourse
    });

  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update course'
    });
  }
});

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private (College Admin only)
router.delete('/:id', protect, async (req, res) => {
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

    // Check if course exists and belongs to this college
    const { data: existingCourse, error: courseError } = await supabase
      .from('courses')
      .select('id')
      .eq('id', id)
      .eq('college_id', collegeId)
      .single();

    if (courseError || !existingCourse) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Delete the course using admin client to bypass RLS
    const { error: deleteError } = await adminSupabase
      .from('courses')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting course:', deleteError);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete course'
      });
    }

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });

  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete course'
    });
  }
});

// @desc    Toggle course active status
// @route   PATCH /api/courses/:id/toggle
// @access  Private (College Admin only)
router.patch('/:id/toggle', protect, async (req, res) => {
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

    // Get current course status
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('is_active')
      .eq('id', id)
      .eq('college_id', collegeId)
      .single();

    if (courseError || !course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Toggle the active status using admin client to bypass RLS
    const { data: updatedCourse, error: updateError } = await adminSupabase
      .from('courses')
      .update({ 
        is_active: !course.is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error toggling course status:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Failed to update course status'
      });
    }

    res.json({
      success: true,
      message: `Course ${updatedCourse.is_active ? 'activated' : 'deactivated'} successfully`,
      data: updatedCourse
    });

  } catch (error) {
    console.error('Toggle course status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update course status'
    });
  }
});

module.exports = router;

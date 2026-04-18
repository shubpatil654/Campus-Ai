const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { supabase } = require('../config/database');
const { createClient } = require('@supabase/supabase-js');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/media';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const allowedDocumentTypes = [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-word.document.macroEnabled.12',
      'text/plain',
      'application/octet-stream' // Sometimes DOC files are detected as this
    ];
    
    // Allow both image and document types
    const allAllowedTypes = [...allowedImageTypes, ...allowedDocumentTypes];
    
    if (allAllowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Only images (${allowedImageTypes.join(', ')}) and documents (${allowedDocumentTypes.join(', ')}) are allowed.`), false);
    }
  }
});

// @desc    Get media items for a specific college (public)
// @route   GET /api/media/college/:collegeId
// @access  Public
router.get('/college/:collegeId', async (req, res) => {
  try {
    const { collegeId } = req.params;

    // Get all media items for this college
    const { data: mediaItems, error: mediaError } = await supabase
      .from('college_media')
      .select('*')
      .eq('college_id', collegeId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (mediaError) {
      console.error('Error fetching college media:', mediaError);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch college media'
      });
    }

    res.json({
      success: true,
      data: mediaItems || []
    });

  } catch (error) {
    console.error('Get college media error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch college media'
    });
  }
});

// @desc    Get all media items for a college
// @route   GET /api/media
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

    // Get all media items for this college
    const { data: mediaItems, error: mediaError } = await supabase
      .from('college_media')
      .select('*')
      .eq('college_id', collegeId)
      .order('created_at', { ascending: false });

    if (mediaError) {
      console.error('Error fetching media items:', mediaError);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch media items'
      });
    }

    res.json({
      success: true,
      data: mediaItems || []
    });

  } catch (error) {
    console.error('Get media items error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch media items'
    });
  }
});

// @desc    Upload media item
// @route   POST /api/media/upload
// @access  Private (College Admin only)
router.post('/upload', protect, upload.single('file'), async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
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

    // Prepare media data
    const mediaData = {
      college_id: collegeId,
      title: req.body.title,
      description: req.body.description || '',
      category: req.body.category,
      type: req.body.type,
      file_name: req.file.filename,
      original_name: req.file.originalname,
      file_size: req.file.size,
      mime_type: req.file.mimetype,
      file_path: req.file.path,
      url: `${req.protocol}://${req.get('host')}/uploads/media/${req.file.filename}`,
      is_active: true
    };

    // Insert the new media item using admin client to bypass RLS
    const { data: newMedia, error: insertError } = await adminSupabase
      .from('college_media')
      .insert(mediaData)
      .select()
      .single();

    if (insertError) {
      console.error('Error creating media item:', insertError);
      // Clean up uploaded file if database insert fails
      fs.unlinkSync(req.file.path);
      return res.status(500).json({
        success: false,
        message: 'Failed to create media item'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Media uploaded successfully',
      data: newMedia
    });

  } catch (error) {
    console.error('Upload media error:', error);
    // Clean up uploaded file if error occurs
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: 'Failed to upload media'
    });
  }
});

// @desc    Update media item
// @route   PUT /api/media/:id
// @access  Private (College Admin only)
router.put('/:id', protect, async (req, res) => {
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

    // Check if media item exists and belongs to this college
    const { data: existingMedia, error: mediaError } = await supabase
      .from('college_media')
      .select('id')
      .eq('id', id)
      .eq('college_id', collegeId)
      .single();

    if (mediaError || !existingMedia) {
      return res.status(404).json({
        success: false,
        message: 'Media item not found'
      });
    }

    // Prepare updated media data
    const updateData = {
      title: req.body.title,
      description: req.body.description || '',
      category: req.body.category,
      updated_at: new Date().toISOString()
    };

    // Update the media item using admin client to bypass RLS
    const { data: updatedMedia, error: updateError } = await adminSupabase
      .from('college_media')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating media item:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Failed to update media item'
      });
    }

    res.json({
      success: true,
      message: 'Media item updated successfully',
      data: updatedMedia
    });

  } catch (error) {
    console.error('Update media error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update media item'
    });
  }
});

// @desc    Delete media item
// @route   DELETE /api/media/:id
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

    // Get media item details before deletion
    const { data: mediaItem, error: mediaError } = await supabase
      .from('college_media')
      .select('*')
      .eq('id', id)
      .eq('college_id', collegeId)
      .single();

    if (mediaError || !mediaItem) {
      return res.status(404).json({
        success: false,
        message: 'Media item not found'
      });
    }

    // Delete the media item using admin client to bypass RLS
    const { error: deleteError } = await adminSupabase
      .from('college_media')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting media item:', deleteError);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete media item'
      });
    }

    // Delete the physical file
    if (mediaItem.file_path && fs.existsSync(mediaItem.file_path)) {
      fs.unlinkSync(mediaItem.file_path);
    }

    res.json({
      success: true,
      message: 'Media item deleted successfully'
    });

  } catch (error) {
    console.error('Delete media error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete media item'
    });
  }
});

// @desc    Toggle media item active status
// @route   PATCH /api/media/:id/toggle
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

    // Get current media status
    const { data: mediaItem, error: mediaError } = await supabase
      .from('college_media')
      .select('is_active')
      .eq('id', id)
      .eq('college_id', collegeId)
      .single();

    if (mediaError || !mediaItem) {
      return res.status(404).json({
        success: false,
        message: 'Media item not found'
      });
    }

    // Toggle the active status using admin client to bypass RLS
    const { data: updatedMedia, error: updateError } = await adminSupabase
      .from('college_media')
      .update({ 
        is_active: !mediaItem.is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error toggling media status:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Failed to update media status'
      });
    }

    res.json({
      success: true,
      message: `Media item ${updatedMedia.is_active ? 'activated' : 'deactivated'} successfully`,
      data: updatedMedia
    });

  } catch (error) {
    console.error('Toggle media status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update media status'
    });
  }
});

module.exports = router;


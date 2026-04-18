const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { supabase } = require('../config/database');

// @desc    Get student dashboard stats
// @route   GET /api/students/dashboard/stats
// @access  Private
router.get('/dashboard/stats', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's favorites count
    const { count: favoritesCount, error: favoritesError } = await supabase
      .from('user_favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (favoritesError) {
      console.error('Favorites count error:', favoritesError);
    }

    // Get user's chat messages count
    const { count: chatCount, error: chatError } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (chatError) {
      console.error('Chat count error:', chatError);
    }

    // Get user's profile completion percentage
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    let profileCompletion = 0;
    if (profile && !profileError) {
      const totalFields = 15; // Total number of profile fields
      let completedFields = 0;
      
      const fields = [
        'date_of_birth', 'gender', 'address', 'city', 'state', 'pincode',
        'current_school', 'board_of_study', 'expected_marks', 'subjects',
        'interested_streams', 'preferred_location', 'budget_range',
        'parent_name', 'parent_phone'
      ];
      
      fields.forEach(field => {
        if (profile[field] && profile[field] !== null && profile[field] !== '') {
          completedFields++;
        }
      });
      
      profileCompletion = Math.round((completedFields / totalFields) * 100);
    }

    // Get total colleges count
    const { count: totalColleges, error: collegesError } = await supabase
      .from('colleges')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    if (collegesError) {
      console.error('Colleges count error:', collegesError);
    }

    // Get total courses count
    const { count: totalCourses, error: coursesError } = await supabase
      .from('courses')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    if (coursesError) {
      console.error('Courses count error:', coursesError);
    }

    res.json({
      success: true,
      data: {
        favoritesCount: favoritesCount || 0,
        chatCount: chatCount || 0,
        profileCompletion: profileCompletion,
        totalColleges: totalColleges || 0,
        totalCourses: totalCourses || 0
      }
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats'
    });
  }
});

// @desc    Get student recent activity
// @route   GET /api/students/activity
// @access  Private
router.get('/activity', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get recent chat messages
    const { data: recentChats, error: chatError } = await supabase
      .from('chat_messages')
      .select('message, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (chatError) {
      console.error('Recent chats error:', chatError);
    }

    // Get recent favorites
    const { data: recentFavorites, error: favoritesError } = await supabase
      .from('user_favorites')
      .select(`
        created_at,
        colleges (
          name,
          location
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (favoritesError) {
      console.error('Recent favorites error:', favoritesError);
    }

    // Format activity data
    const activities = [];

    // Add chat activities
    recentChats?.forEach(chat => {
      activities.push({
        type: 'chat',
        action: 'Had AI conversation',
        time: new Date(chat.created_at).toLocaleString(),
        icon: 'MessageSquare'
      });
    });

    // Add favorite activities
    recentFavorites?.forEach(favorite => {
      if (favorite.colleges) {
        activities.push({
          type: 'favorite',
          action: `Added ${favorite.colleges.name} to favorites`,
          time: new Date(favorite.created_at).toLocaleString(),
          icon: 'Heart'
        });
      }
    });

    // Sort by time (most recent first)
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));

    res.json({
      success: true,
      data: activities.slice(0, 10) // Return top 10 most recent
    });

  } catch (error) {
    console.error('Recent activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent activity'
    });
  }
});

// @desc    Get student favorites
// @route   GET /api/students/favorites
// @access  Private
router.get('/favorites', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: favorites, error } = await supabase
      .from('user_favorites')
      .select(`
        created_at,
        colleges (
          id,
          name,
          location,
          rating,
          logo_url
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Favorites error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch favorites'
      });
    }

    const formattedFavorites = favorites?.map(fav => ({
      id: fav.colleges?.id,
      name: fav.colleges?.name,
      location: fav.colleges?.location,
      rating: fav.colleges?.rating || 0,
      logoUrl: fav.colleges?.logo_url,
      addedAt: fav.created_at
    })) || [];

    res.json({
      success: true,
      data: formattedFavorites
    });

  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch favorites'
    });
  }
});

// @desc    Get profile completion percentage
// @route   GET /api/students/profile/completion
// @access  Private
router.get('/profile/completion', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Profile completion error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch profile completion'
      });
    }

    let completion = 0;
    if (profile) {
      const totalFields = 15;
      let completedFields = 0;
      
      const fields = [
        'date_of_birth', 'gender', 'address', 'city', 'state', 'pincode',
        'current_school', 'board_of_study', 'expected_marks', 'subjects',
        'interested_streams', 'preferred_location', 'budget_range',
        'parent_name', 'parent_phone'
      ];
      
      fields.forEach(field => {
        if (profile[field] && profile[field] !== null && profile[field] !== '') {
          completedFields++;
        }
      });
      
      completion = Math.round((completedFields / totalFields) * 100);
    }

    res.json({
      success: true,
      data: { completion }
    });

  } catch (error) {
    console.error('Profile completion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile completion'
    });
  }
});

// @desc    Get chat history count
// @route   GET /api/students/chat/count
// @access  Private
router.get('/chat/count', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const { count, error } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      console.error('Chat count error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch chat count'
      });
    }

    res.json({
      success: true,
      data: { count: count || 0 }
    });

  } catch (error) {
    console.error('Chat count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat count'
    });
  }
});

// @desc    Get college views count (mock for now)
// @route   GET /api/students/college-views/count
// @access  Private
router.get('/college-views/count', protect, async (req, res) => {
  try {
    // For now, return a mock count based on favorites
    // In the future, you can implement a college_views table
    const userId = req.user.id;

    const { count: favoritesCount, error } = await supabase
      .from('user_favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      console.error('College views count error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch college views count'
      });
    }

    // Mock: assume user viewed 3x more colleges than they favorited
    const estimatedViews = (favoritesCount || 0) * 3;

    res.json({
      success: true,
      data: { count: estimatedViews }
    });

  } catch (error) {
    console.error('College views count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch college views count'
    });
  }
});

module.exports = router;
